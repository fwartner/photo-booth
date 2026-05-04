#!/usr/bin/env bash
# Append Raspberry Pi kernel cmdline hook so SD-card deploy self-installs on boot (no ssh).
# After copying raspberry-pi/* into photo-booth-deploy/ on the boot partition, run on laptop:
#
#   ./append-cmdline.sh /Volumes/bootfs
#   ./append-cmdline.sh /media/$USER/bootfs
#
set -euo pipefail

BOOT="${1:?Usage: $0 /path/to/mounted/boot_partition}"
CMD="$BOOT/cmdline.txt"
MARK="photo-booth-deploy/pi-sd-early-provision"

if [[ ! -f "$CMD" ]]; then
  echo "ERROR: $CMD not found. Mount the SD card boot partition and pass its root path." >&2
  exit 1
fi

if grep -qF "$MARK" "$CMD" 2>/dev/null; then
  echo "Cmdline already contains photo booth auto-provision (marker: $MARK). Nothing to do."
  exit 0
fi

# cmdline.txt is one line; fragment must stay on that line (leading space before systemd.run).
LINE=' systemd.run=/bin/bash /boot/firmware/photo-booth-deploy/pi-sd-early-provision.sh'
printf '%s' "$LINE" >>"$CMD"
echo "Updated $CMD — first Pi boot will register systemd hooks from photo-booth-deploy/."
