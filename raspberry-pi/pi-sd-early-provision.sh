#!/bin/bash
# Early-boot hook: install systemd units from the FAT deploy folder so nothing has to be
# run manually on the Pi. Invoked by kernel cmdline (see cmdline.fragment).
# Requires root. Safe to run every boot (idempotent).

set -euo pipefail

for DEPLOY in /boot/firmware/photo-booth-deploy /boot/photo-booth-deploy; do
  if [[ -f "$DEPLOY/install-bootstrap-to-system.sh" ]] && [[ -f "$DEPLOY/photo-booth-bootstrap.sh" ]]; then
    export PHOTO_BOOTH_SKIP_START=1
    exec /bin/bash "$DEPLOY/install-bootstrap-to-system.sh"
  fi
done

exit 0
