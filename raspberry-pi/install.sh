#!/bin/bash
set -e

echo "=== Photo Booth Print Agent Installer ==="
echo ""

INSTALL_DIR="/home/pi/print-agent"

# Install system dependencies
echo "[1/5] Installing system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
    python3 python3-venv python3-pip \
    cups libcups2-dev \
    libjpeg-dev libpng-dev

# Ensure CUPS is running
echo "[2/5] Configuring CUPS..."
sudo systemctl enable cups
sudo systemctl start cups
sudo usermod -a -G lpadmin pi 2>/dev/null || true

# Set up application directory
echo "[3/5] Setting up application..."
mkdir -p "$INSTALL_DIR"
cp print_agent.py "$INSTALL_DIR/"
cp requirements.txt "$INSTALL_DIR/"

if [ ! -f "$INSTALL_DIR/.env" ]; then
    cp .env.example "$INSTALL_DIR/.env"
    echo "  -> Created .env file - EDIT IT with your n8n URL and API key!"
else
    echo "  -> .env already exists, keeping current config"
fi

# Create virtual environment and install deps
echo "[4/5] Installing Python dependencies..."
python3 -m venv "$INSTALL_DIR/venv"
"$INSTALL_DIR/venv/bin/pip" install --quiet --upgrade pip
"$INSTALL_DIR/venv/bin/pip" install --quiet -r "$INSTALL_DIR/requirements.txt"

# Install systemd service
echo "[5/5] Installing systemd service..."
sudo cp print-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable print-agent

echo ""
echo "=== Installation complete ==="
echo ""
echo "Next steps:"
echo "  1. Edit /home/pi/print-agent/.env with your settings"
echo "  2. Connect and configure your photo printer via CUPS:"
echo "     http://localhost:631"
echo "  3. Start the service:"
echo "     sudo systemctl start print-agent"
echo "  4. Check status:"
echo "     sudo systemctl status print-agent"
echo "     tail -f /home/pi/print-agent/print_agent.log"
