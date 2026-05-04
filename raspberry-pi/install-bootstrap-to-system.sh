#!/bin/bash
# Register boot-time sync from the FAT deploy folder. Run as root.
# Called by: install.sh (automatic), pi-sd-early-provision.sh (cmdline), or manually:
#   sudo ./install-bootstrap-to-system.sh
#
# PHOTO_BOOTH_SKIP_START=1 — only enable units; let multi-user.target start the oneshot
# (used when invoked very early via systemd.run).

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

if [[ "${PHOTO_BOOTH_SKIP_START:-0}" != "1" ]]; then
  systemctl start photo-booth-bootstrap.service
  echo ""
  echo "Installed photo-booth-bootstrap.service and started a deploy run."
else
  echo ""
  echo "Installed/refresh photo-booth-bootstrap.service (start deferred to normal boot)."
fi

echo ""
echo "  Logs: journalctl -u photo-booth-bootstrap.service -b"
echo "        tail -f /var/log/photo-booth-bootstrap.log"
echo ""
echo "SD updates: copy files to boot partition photo-booth-deploy/ then reboot."
echo ""
