#!/usr/bin/env python3
"""
Photo Booth Print Agent for Raspberry Pi

Polls the n8n print job queue for pending jobs, downloads images,
and prints them via CUPS on the connected photo printer.

Usage:
    python3 print_agent.py

Configuration via environment variables or .env file.
"""

import os
import sys
import time
import logging
import tempfile
from pathlib import Path

import requests
from PIL import Image

# Optional: CUPS (only required when actually printing)
try:
    import cups
    CUPS_AVAILABLE = True
except ImportError:
    CUPS_AVAILABLE = False

from dotenv import load_dotenv

# Load .env file from script directory
load_dotenv(Path(__file__).parent / ".env")

# --- Configuration ---
N8N_URL = os.getenv("N8N_URL", "http://localhost:5678")
API_KEY = os.getenv("API_KEY", "changeme-print-secret")
PRINTER_NAME = os.getenv("PRINTER_NAME", "auto")
PRINT_SIZE = os.getenv("PRINT_SIZE", "4x6")  # inches
PRINT_DPI = int(os.getenv("PRINT_DPI", "300"))
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "5"))
DRY_RUN = os.getenv("DRY_RUN", "false").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# Endpoints
POLL_URL = f"{N8N_URL}/webhook/photo-booth/print-jobs"
DONE_URL = f"{N8N_URL}/webhook/photo-booth/print-done"

# Parse print size
PRINT_WIDTH_IN, PRINT_HEIGHT_IN = map(int, PRINT_SIZE.split("x"))
PRINT_WIDTH_PX = PRINT_WIDTH_IN * PRINT_DPI
PRINT_HEIGHT_PX = PRINT_HEIGHT_IN * PRINT_DPI

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


def prepare_for_print(image_path):
    """Resize and format image for photo printing."""
    try:
        img = Image.open(image_path)
        log.info(f"Original image: {img.size[0]}x{img.size[1]} {img.mode}")

        # Convert to RGB if needed (e.g., RGBA PNGs)
        if img.mode in ("RGBA", "P"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "RGBA":
                background.paste(img, mask=img.split()[3])
            else:
                background.paste(img)
            img = background

        # Resize to fit print dimensions while maintaining aspect ratio
        img.thumbnail((PRINT_WIDTH_PX, PRINT_HEIGHT_PX), Image.LANCZOS)

        # Create a white canvas at exact print size and center the image
        canvas = Image.new("RGB", (PRINT_WIDTH_PX, PRINT_HEIGHT_PX), (255, 255, 255))
        x_offset = (PRINT_WIDTH_PX - img.size[0]) // 2
        y_offset = (PRINT_HEIGHT_PX - img.size[1]) // 2
        canvas.paste(img, (x_offset, y_offset))

        # Save as high-quality JPEG for printing
        print_path = image_path.rsplit(".", 1)[0] + "_print.jpg"
        canvas.save(print_path, "JPEG", quality=95, dpi=(PRINT_DPI, PRINT_DPI))

        log.info(f"Prepared print image: {PRINT_WIDTH_PX}x{PRINT_HEIGHT_PX} @ {PRINT_DPI}dpi")
        return print_path

    except Exception as e:
        log.error(f"Image preparation failed: {e}")
        return None


def send_to_printer(image_path, printer_name):
    """Send image to CUPS printer."""
    if DRY_RUN or not CUPS_AVAILABLE:
        log.info(f"[DRY RUN] Would print: {image_path} on {printer_name}")
        return True

    try:
        conn = cups.Connection()
        job_id = conn.printFile(
            printer_name,
            image_path,
            "Photo Booth Print",
            {
                "media": "4x6",
                "print-quality": "5",  # High quality
                "print-color-mode": "color",
            },
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
    log.info(f"  Print size:    {PRINT_SIZE} @ {PRINT_DPI}dpi")
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
