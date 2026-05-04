#!/bin/bash
# One-time: register boot-time sync so dropping files on the SD card boot partition
# and rebooting applies updates automatically. Run as root on the Pi (or from chroot).
#
#   sudo ./install-bootstrap-to-system.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo $0"
  exit 1
fi

install -d /usr/local/share/doc/photo-booth-bootstrap
install -m 755 "${SCRIPT_DIR}/photo-booth-bootstrap.sh" /usr/local/sbin/photo-booth-bootstrap.sh
install -m 644 "${SCRIPT_DIR}/photo-booth-bootstrap.service" /etc/systemd/system/photo-booth-bootstrap.service
if [[ -f "${SCRIPT_DIR}/README-SD-CARD.md" ]]; then
  install -m 644 "${SCRIPT_DIR}/README-SD-CARD.md" /usr/local/share/doc/photo-booth-bootstrap/README-SD-CARD.md
fi

systemctl daemon-reload
systemctl enable photo-booth-bootstrap.service
systemctl start photo-booth-bootstrap.service

echo ""
echo "Installed photo-booth-bootstrap.service."
echo "  Logs: journalctl -u photo-booth-bootstrap.service -b"
echo "       tail -f /var/log/photo-booth-bootstrap.log"
echo ""
echo "Put updates on the SD card under:  photo-booth-deploy/  (see README-SD-CARD.md)"
echo ""
