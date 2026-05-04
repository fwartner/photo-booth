#!/usr/bin/env python3
"""
Photo Booth Print Agent for Raspberry Pi

Polls the n8n print job queue for pending jobs, downloads images,
and prints them via CUPS on the connected photo printer.

Output is always postcard size: 4×6 in (Canon SELPHY postcard), rendered from
an HTML template via WeasyPrint — reserved logo band on the top 1/4, photo
on the bottom 3/4. CUPS media is fixed to Postcard.

Usage:
    python3 print_agent.py

Configuration is hardcoded in this file (n8n URL, API key, tunables).
"""

import base64
import html
import json
import os
import shutil
import subprocess
import sys
import time
import logging
import tempfile
from pathlib import Path

import requests
from weasyprint import HTML

# Optional: CUPS (only required when actually printing)
try:
    import cups
    CUPS_AVAILABLE = True
except ImportError:
    CUPS_AVAILABLE = False

# Postcard photo print (4×6 in) — fixed
POSTCARD_WIDTH_IN = 4
POSTCARD_HEIGHT_IN = 6

# --- Configuration (hardcoded; edit here to tune the booth) ---
N8N_URL = "https://n8n.pixelandprocess.de"
API_KEY = "jMVxMDFg-uuGodGeOvyiKgIuCt3_1vQi87OY_LK9IKs"
PRINTER_NAME = "auto"
POLL_INTERVAL = 5
DRY_RUN = False
LOG_LEVEL = "INFO"
CUPS_PRINT_QUALITY = "5"
CUPS_COLOR_MODE = "color"
CUPS_OPTIONS_JSON = ""
CUPS_OPTIONS = ""

# After a successful print, show the booth photo fullscreen on the Pi’s display (X11; needs feh).
SHOW_PRINT_ON_SCREEN = True
SCREEN_DISPLAY_SECONDS = 45
SCREEN_REPLACE_PREVIOUS = True

# Endpoints
POLL_URL = f"{N8N_URL}/webhook/photo-booth/print-jobs"
DONE_URL = f"{N8N_URL}/webhook/photo-booth/print-done"

# Postcard vertical layout: logo band + small header text + photo. Fractions sum to 1.
PHOTO_HEIGHT_FRACTION = 0.81
HEADER_HEIGHT_FRACTION = 0.04

# Small headline text printed above the logo band.
POSTCARD_HEADER_TEXT = "Deine Superkräfte für Kreislaufwirtschaft"

# Logos shown in the top band of the postcard. Shipped alongside this script.
ASSETS_DIR = Path(__file__).parent / "assets"
LOGO_LEFT_PATH = ASSETS_DIR / "recyclingmonitor_logo.png"
LOGO_RIGHT_PATH = ASSETS_DIR / "ifat_munich_logo.png"


def _logo_data_url(path):
    try:
        with open(path, "rb") as f:
            return "data:image/png;base64," + base64.b64encode(f.read()).decode()
    except FileNotFoundError:
        return ""


LOGO_LEFT_DATA_URL = _logo_data_url(LOGO_LEFT_PATH)
LOGO_RIGHT_DATA_URL = _logo_data_url(LOGO_RIGHT_PATH)

# --- Logging ---
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(Path(__file__).parent / "print_agent.log"),
    ],
)
log = logging.getLogger("print_agent")


def build_cups_job_options():
    """Build option dict for pycups printFile. Postcard / 4×6; extras from CUPS_* constants."""
    opts = {"media": "Postcard"}

    if CUPS_PRINT_QUALITY:
        opts["print-quality"] = CUPS_PRINT_QUALITY
    if CUPS_COLOR_MODE:
        opts["print-color-mode"] = CUPS_COLOR_MODE

    if CUPS_OPTIONS_JSON:
        try:
            extra = json.loads(CUPS_OPTIONS_JSON)
            if not isinstance(extra, dict):
                log.error("CUPS_OPTIONS_JSON must be a JSON object")
            else:
                opts.update({str(k): str(v) for k, v in extra.items()})
        except json.JSONDecodeError as e:
            log.error(f"CUPS_OPTIONS_JSON parse error: {e}")

    if CUPS_OPTIONS:
        for part in CUPS_OPTIONS.split(","):
            part = part.strip()
            if not part or "=" not in part:
                continue
            key, _, val = part.partition("=")
            key = key.strip()
            val = val.strip()
            if key:
                opts[key] = val

    return opts


def get_printer():
    """Connect to CUPS and return the printer name to use."""
    if DRY_RUN or not CUPS_AVAILABLE:
        log.info("Dry run mode or CUPS not available - skipping printer setup")
        return None

    conn = cups.Connection()
    printers = conn.getPrinters()

    if not printers:
        log.error("No printers found! Install and configure a printer via CUPS.")
        sys.exit(1)

    if PRINTER_NAME == "auto":
        default = conn.getDefault()
        if default:
            log.info(f"Using default printer: {default}")
            return default
        # Use first available printer
        name = list(printers.keys())[0]
        log.info(f"No default printer set, using: {name}")
        return name

    if PRINTER_NAME in printers:
        log.info(f"Using configured printer: {PRINTER_NAME}")
        return PRINTER_NAME

    log.error(f"Printer '{PRINTER_NAME}' not found. Available: {list(printers.keys())}")
    sys.exit(1)


def poll_for_job():
    """Poll n8n for a pending print job."""
    try:
        resp = requests.get(
            POLL_URL,
            params={"api_key": API_KEY},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        if data.get("has_job"):
            job = data["job"]
            log.info(
                f"Job received: session={job['session_id']} "
                f"superpower={job.get('superpower', '?')} "
                f"pending={data.get('pending_count', 0)}"
            )
            return job
        return None

    except requests.exceptions.ConnectionError:
        log.warning(f"Cannot reach n8n at {N8N_URL} - retrying...")
        return None
    except requests.exceptions.Timeout:
        log.warning("Poll request timed out")
        return None
    except Exception as e:
        log.error(f"Poll error: {e}")
        return None


def download_image(image_url):
    """Download image from URL and return path to temp file."""
    try:
        log.info(f"Downloading image: {image_url[:80]}...")
        resp = requests.get(image_url, timeout=30)
        resp.raise_for_status()

        suffix = ".png"
        if "jpeg" in resp.headers.get("content-type", ""):
            suffix = ".jpg"

        tmp = tempfile.NamedTemporaryFile(
            suffix=suffix, prefix="print_", delete=False
        )
        tmp.write(resp.content)
        tmp.close()

        log.info(f"Downloaded {len(resp.content)} bytes to {tmp.name}")
        return tmp.name

    except Exception as e:
        log.error(f"Download failed: {e}")
        return None


PRINT_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <style>
    @page {{ size: {w}in {h}in; margin: 0; }}
    html, body {{
      margin: 0; padding: 0;
      width: {w}in; height: {h}in;
      background: #ffffff;
    }}
    .postcard {{
      display: flex;
      flex-direction: column;
      width: 100%; height: 100%;
    }}
    .header {{
      width: 100%;
      height: {header_pct}%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 0.15in;
      font-family: "Lato", "DejaVu Sans", sans-serif;
      font-weight: 700;
      font-size: 8.5pt;
      letter-spacing: 0.13em;
      white-space: nowrap;
      text-transform: uppercase;
      color: #034C80;
    }}
    .logos {{
      width: 100%;
      height: {logos_pct}%;
      box-sizing: border-box;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 0.2in;
      padding: 0.22in 0.15in 0.04in;
    }}
    .logos .slot {{
      height: 100%;
      display: flex;
    }}
    .logos .slot.left {{
      flex: 1 1 0;
      align-items: center;
      justify-content: flex-start;
    }}
    .logos .slot.right {{
      flex: 0 0 auto;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      gap: 0.04in;
    }}
    .logos img {{
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
    }}
    .logos .slot.left img {{ height: 0.56in; width: auto; }}
    .logos .slot.right img {{ width: 0.36in; height: auto; }}
    .qr {{
      width: 0.36in;
      height: 0.36in;
      flex: 0 0 auto;
      border: 1.2pt dashed #94a3b8;
      border-radius: 4pt;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "DejaVu Sans", sans-serif;
      font-size: 7pt;
      letter-spacing: 0.1em;
      color: #64748b;
      background: #f8fafc;
    }}
    .photo {{
      width: 100%;
      height: {photo_pct}%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.15in;
      box-sizing: border-box;
    }}
    .photo img {{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }}
  </style>
</head>
<body>
  <div class="postcard">
    <div class="logos">
      <div class="slot left"><img src="{logo_left_src}" alt="RecyclingMonitor" /></div>
      <div class="slot right">
        <img src="{logo_right_src}" alt="IFAT Munich" />
        <div class="qr">QR</div>
      </div>
    </div>
    <div class="header">{header_text}</div>
    <div class="photo"><img src="{img_src}" /></div>
  </div>
</body>
</html>"""


def prepare_for_print(image_path):
    """Render an HTML postcard (white frame, logo strip top 1/4, photo bottom 3/4) to PDF."""
    try:
        with open(image_path, "rb") as f:
            img_bytes = f.read()

        mime = "image/jpeg" if image_path.lower().endswith((".jpg", ".jpeg")) else "image/png"
        img_src = f"data:{mime};base64,{base64.b64encode(img_bytes).decode()}"

        photo_pct = PHOTO_HEIGHT_FRACTION * 100
        header_pct = HEADER_HEIGHT_FRACTION * 100
        logos_pct = 100 - photo_pct - header_pct
        html_content = PRINT_HTML_TEMPLATE.format(
            w=POSTCARD_WIDTH_IN,
            h=POSTCARD_HEIGHT_IN,
            photo_pct=photo_pct,
            logos_pct=logos_pct,
            header_pct=header_pct,
            header_text=html.escape(POSTCARD_HEADER_TEXT),
            img_src=img_src,
            logo_left_src=LOGO_LEFT_DATA_URL,
            logo_right_src=LOGO_RIGHT_DATA_URL,
        )

        print_path = image_path.rsplit(".", 1)[0] + "_print.pdf"
        HTML(string=html_content).write_pdf(print_path)

        log.info(
            f"Prepared print PDF: {POSTCARD_WIDTH_IN}x{POSTCARD_HEIGHT_IN} in, "
            f"logos {int(100 - photo_pct)}% top / photo {int(photo_pct)}% bottom"
        )
        return print_path

    except Exception as e:
        log.error(f"Image preparation failed: {e}")
        return None


def send_to_printer(image_path, printer_name):
    """Send image to CUPS printer."""
    if DRY_RUN or not CUPS_AVAILABLE:
        log.info(
            f"[DRY RUN] Would print: {image_path} on {printer_name} "
            f"options={build_cups_job_options()}"
        )
        return True

    try:
        conn = cups.Connection()
        cup_opts = build_cups_job_options()
        log.info(f"CUPS job options: {cup_opts}")
        job_id = conn.printFile(
            printer_name,
            image_path,
            "Photo Booth Print",
            cup_opts,
        )
        log.info(f"Print job submitted: CUPS job #{job_id}")
        return True

    except Exception as e:
        log.error(f"Print failed: {e}")
        return False


def report_completion(session_id, status="done", message=""):
    """Report job completion back to n8n."""
    try:
        resp = requests.post(
            DONE_URL,
            json={
                "api_key": API_KEY,
                "session_id": session_id,
                "status": status,
                "message": message,
            },
            timeout=10,
        )
        resp.raise_for_status()
        log.info(f"Reported {status} for session {session_id}")
        return True

    except Exception as e:
        log.error(f"Failed to report completion: {e}")
        return False


def display_env_for_screen():
    """Environment for spawning a GUI viewer on the logged-in desktop session."""
    env = os.environ.copy()
    env.setdefault("DISPLAY", ":0")
    if not env.get("XAUTHORITY"):
        xa = Path.home() / ".Xauthority"
        if xa.is_file():
            env["XAUTHORITY"] = str(xa)
    return env


def show_image_on_display(source_path):
    """
    Show the downloaded booth image fullscreen on the local display, then exit after
    SCREEN_DISPLAY_SECONDS. Copies to a stable path so temp files can be deleted safely.

    Requires: X11 session, feh (`apt install feh`), DISPLAY (default :0) and usually
    XAUTHORITY for the booth user — set on the systemd unit when running as a service.
    """
    if not SHOW_PRINT_ON_SCREEN:
        return
    if not source_path or not os.path.isfile(source_path):
        return

    ext = Path(source_path).suffix.lower()
    if ext not in (".png", ".jpg", ".jpeg", ".webp", ".gif"):
        ext = ".png"
    cache = Path(__file__).parent / f".last_booth_display{ext}"

    try:
        shutil.copy2(source_path, cache)
    except OSError as e:
        log.warning(f"Could not copy image for on-screen display: {e}")
        return

    env = display_env_for_screen()
    if SCREEN_REPLACE_PREVIOUS:
        try:
            subprocess.run(
                ["pkill", "-x", "feh"],
                env=env,
                capture_output=True,
                timeout=5,
            )
        except (OSError, subprocess.TimeoutExpired):
            pass

    cmd = [
        "timeout",
        str(SCREEN_DISPLAY_SECONDS),
        "feh",
        "--fullscreen",
        "--borderless",
        "--hide-pointer",
        "--auto-zoom",
        "--no-menus",
        str(cache),
    ]
    try:
        subprocess.Popen(
            cmd,
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
        log.info(
            f"On-screen display started ({SCREEN_DISPLAY_SECONDS}s, DISPLAY={env.get('DISPLAY')})"
        )
    except FileNotFoundError:
        log.warning(
            "feh not found — install on the Pi: sudo apt install feh "
            "(or set SHOW_PRINT_ON_SCREEN = False in this script to disable)"
        )


def cleanup(*paths):
    """Remove temporary files."""
    for path in paths:
        if path and os.path.exists(path):
            try:
                os.unlink(path)
            except OSError:
                pass


def process_job(job, printer_name):
    """Process a single print job end-to-end."""
    session_id = job["session_id"]
    image_url = job.get("image_url")

    if not image_url:
        log.error(f"Job {session_id} has no image_url")
        report_completion(session_id, "error", "No image URL provided")
        return

    # Download
    image_path = download_image(image_url)
    if not image_path:
        report_completion(session_id, "error", "Failed to download image")
        return

    # Prepare for print
    print_path = prepare_for_print(image_path)
    if not print_path:
        cleanup(image_path)
        report_completion(session_id, "error", "Failed to prepare image")
        return

    # Print (with retry)
    max_retries = 3
    for attempt in range(1, max_retries + 1):
        if send_to_printer(print_path, printer_name):
            report_completion(session_id, "done", f"Printed successfully (attempt {attempt})")
            show_image_on_display(image_path)
            cleanup(image_path, print_path)
            return

        if attempt < max_retries:
            log.warning(f"Print attempt {attempt} failed, retrying in 5s...")
            time.sleep(5)

    # All retries failed
    report_completion(session_id, "error", f"Print failed after {max_retries} attempts")
    cleanup(image_path, print_path)


def main():
    """Main polling loop."""
    log.info("=" * 60)
    log.info("Photo Booth Print Agent starting...")
    log.info(f"  n8n URL:      {N8N_URL}")
    log.info(f"  Poll interval: {POLL_INTERVAL}s")
    log.info(
        f"  Postcard:      {POSTCARD_WIDTH_IN}x{POSTCARD_HEIGHT_IN} in "
        f"(logos {int((1 - PHOTO_HEIGHT_FRACTION) * 100)}% top / photo {int(PHOTO_HEIGHT_FRACTION * 100)}% bottom)"
    )
    log.info(f"  CUPS media:    {build_cups_job_options().get('media', '(none)')}")
    log.info(f"  Dry run:       {DRY_RUN}")
    log.info(
        f"  On-screen:     {SHOW_PRINT_ON_SCREEN} "
        f"({SCREEN_DISPLAY_SECONDS}s, replace prev={SCREEN_REPLACE_PREVIOUS})"
    )
    log.info("=" * 60)

    printer_name = get_printer()

    log.info("Polling for print jobs...")

    while True:
        try:
            job = poll_for_job()
            if job:
                process_job(job, printer_name)
            else:
                time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            log.info("Shutting down...")
            break
        except Exception as e:
            log.error(f"Unexpected error: {e}")
            time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
