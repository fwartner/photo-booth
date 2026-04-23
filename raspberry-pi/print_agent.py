#!/usr/bin/env python3
"""
Photo Booth Print Agent for Raspberry Pi

Polls the n8n print job queue for pending jobs, downloads images,
and prints them via CUPS on the connected photo printer.

Output is always postcard size: 4×6 in (Canon SELPHY postcard), rendered from
an HTML template via WeasyPrint — reserved logo band on the top 1/4, photo
on the bottom 3/4. CUPS media defaults to Postcard unless overridden.

Usage:
    python3 print_agent.py

Configuration via environment variables or .env file.
"""

import base64
import json
import os
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

from dotenv import load_dotenv

# Load .env file from script directory
load_dotenv(Path(__file__).parent / ".env")

# Postcard photo print (4×6 in) — fixed; not configurable via env
POSTCARD_WIDTH_IN = 4
POSTCARD_HEIGHT_IN = 6

# --- Configuration ---
N8N_URL = os.getenv("N8N_URL", "http://localhost:5678")
API_KEY = os.getenv("API_KEY", "changeme-print-secret")
PRINTER_NAME = os.getenv("PRINTER_NAME", "auto")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "5"))
DRY_RUN = os.getenv("DRY_RUN", "false").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
CUPS_PRINT_QUALITY = os.getenv("CUPS_PRINT_QUALITY", "5")
CUPS_COLOR_MODE = os.getenv("CUPS_COLOR_MODE", "color")
CUPS_OPTIONS_JSON = os.getenv("CUPS_OPTIONS_JSON", "").strip()
CUPS_OPTIONS = os.getenv("CUPS_OPTIONS", "").strip()

# Endpoints
POLL_URL = f"{N8N_URL}/webhook/photo-booth/print-jobs"
DONE_URL = f"{N8N_URL}/webhook/photo-booth/print-done"

# Photo occupies the bottom of the postcard; the top strip is reserved for logos.
PHOTO_HEIGHT_FRACTION = 0.82

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
    """
    Build option dict for pycups printFile. Defaults target postcard / 4×6.

    CUPS_MEDIA: if unset, use \"Postcard\". If set to empty string, omit
    \"media\" so only JSON/kv options apply. Override via CUPS_OPTIONS_JSON
    or CUPS_OPTIONS (e.g. PageSize for some PPDs).
    """
    opts = {}

    if "CUPS_MEDIA" in os.environ:
        media = os.environ["CUPS_MEDIA"].strip()
        if media:
            opts["media"] = media
    else:
        opts["media"] = "Postcard"

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
    .logos {{
      width: 100%;
      height: {logos_pct}%;
      box-sizing: border-box;
      /* Reserved for logos — content added later. */
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
    <div class="logos"></div>
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
        html_content = PRINT_HTML_TEMPLATE.format(
            w=POSTCARD_WIDTH_IN,
            h=POSTCARD_HEIGHT_IN,
            photo_pct=photo_pct,
            logos_pct=100 - photo_pct,
            img_src=img_src,
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
