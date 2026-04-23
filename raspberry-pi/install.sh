#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/install.conf" ]; then
  # shellcheck source=/dev/null
  source "$SCRIPT_DIR/install.conf"
fi

BOOTH_USER="${BOOTH_USER:-pi}"
PRINT_INSTALL_DIR="${PRINT_INSTALL_DIR:-/home/$BOOTH_USER/print-agent}"

echo "=== Photo Booth Print Agent Installer ==="
echo "  User: $BOOTH_USER"
echo "  Dir:  $PRINT_INSTALL_DIR"
echo ""

echo "[1/5] Installing system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
    python3 python3-venv python3-pip \
    cups libcups2-dev \
    printer-driver-gutenprint \
    usbutils \
    libjpeg-dev libpng-dev \
    libpango-1.0-0 libpangoft2-1.0-0 libcairo2 libgdk-pixbuf-2.0-0 \
    libffi-dev shared-mime-info fonts-dejavu

echo "[2/5] Configuring CUPS (Canon Selphy CP1300: add via http://localhost:631, USB, Gutenprint)..."
sudo systemctl enable cups
sudo systemctl start cups
sudo usermod -a -G lpadmin "$BOOTH_USER" 2>/dev/null || true
sudo usermod -a -G lp "$BOOTH_USER" 2>/dev/null || true

echo "[3/5] Setting up application..."
mkdir -p "$PRINT_INSTALL_DIR"
cp "$SCRIPT_DIR/print_agent.py" "$PRINT_INSTALL_DIR/"
cp "$SCRIPT_DIR/requirements.txt" "$PRINT_INSTALL_DIR/"

if [ ! -f "$PRINT_INSTALL_DIR/.env" ]; then
    cp "$SCRIPT_DIR/.env.example" "$PRINT_INSTALL_DIR/.env"
    echo "  -> Created .env file - EDIT IT with your n8n URL and API key!"
else
    echo "  -> .env already exists, keeping current config"
fi

echo "[4/5] Installing Python dependencies..."
python3 -m venv "$PRINT_INSTALL_DIR/venv"
"$PRINT_INSTALL_DIR/venv/bin/pip" install --quiet --upgrade pip
"$PRINT_INSTALL_DIR/venv/bin/pip" install --quiet -r "$PRINT_INSTALL_DIR/requirements.txt"

echo "[5/5] Installing systemd service..."
SERVICE_TMP=$(mktemp)
sed \
  -e "s|^User=.*|User=$BOOTH_USER|" \
  -e "s|^WorkingDirectory=.*|WorkingDirectory=$PRINT_INSTALL_DIR|" \
  -e "s|^ExecStart=.*|ExecStart=$PRINT_INSTALL_DIR/venv/bin/python3 print_agent.py|" \
  "$SCRIPT_DIR/print-agent.service" >"$SERVICE_TMP"
sudo cp "$SERVICE_TMP" /etc/systemd/system/print-agent.service
rm -f "$SERVICE_TMP"
sudo systemctl daemon-reload
sudo systemctl enable print-agent

echo ""
echo "=== Installation complete ==="
echo ""
echo "Canon SELPHY CP1300 (USB): open http://localhost:631 → Administration → Add Printer"
echo "  → USB → choose Gutenprint driver for Canon SELPHY CP1300 (or closest CP model)."
echo "  → Set as server default if PRINTER_NAME=auto in .env."
echo ""
echo "Next steps:"
echo "  1. Edit $PRINT_INSTALL_DIR/.env"
echo "  2. Verify printer: lpstat -p"
echo "  3. sudo systemctl start print-agent"
echo "  4. sudo systemctl status print-agent"
echo "     tail -f $PRINT_INSTALL_DIR/print_agent.log"
echo ""
echo "Optional WiFi captive portal (no connection): from this folder on the Pi, run:"
echo "  sudo ./install-wifi-connect.sh"
