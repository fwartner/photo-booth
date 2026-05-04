#!/bin/bash
# Sync deploy bundle from the FAT boot partition into /var/lib and run install.sh.
# Installed as /usr/local/sbin/photo-booth-bootstrap.sh by install-bootstrap-to-system.sh

set -euo pipefail

LOG=/var/log/photo-booth-bootstrap.log

log() {
  echo "[$(date -Iseconds)] $*"
}

{
  log "===== photo-booth-bootstrap start ====="

  DEPLOY=""
  for candidate in /boot/firmware/photo-booth-deploy /boot/photo-booth-deploy; do
    if [[ -d "$candidate" ]] && [[ -f "$candidate/install.sh" ]] && [[ -f "$candidate/print_agent.py" ]]; then
      DEPLOY="$candidate"
      log "Using deploy source: $DEPLOY"
      break
    fi
  done

  if [[ -z "${DEPLOY}" ]]; then
    log "No deploy directory found (expected /boot/firmware/photo-booth-deploy with install.sh + print_agent.py). Skipping."
    log "===== photo-booth-bootstrap end (nothing to do) ====="
    exit 0
  fi

  # Refresh units from the SD card so updates to these scripts apply without manual ssh.
  if [[ -f "$DEPLOY/photo-booth-bootstrap.sh" ]]; then
    install -m 755 "$DEPLOY/photo-booth-bootstrap.sh" /usr/local/sbin/photo-booth-bootstrap.sh
  fi
  if [[ -f "$DEPLOY/photo-booth-bootstrap.service" ]]; then
    install -m 644 "$DEPLOY/photo-booth-bootstrap.service" /etc/systemd/system/photo-booth-bootstrap.service
  fi
  systemctl daemon-reload 2>/dev/null || true

  STAGING=/var/lib/photo-booth-deploy/current
  mkdir -p "$STAGING"

  rsync -a --delete "${DEPLOY}/" "${STAGING}/"
  chmod +x "$STAGING/install.sh" 2>/dev/null || true
  chmod +x "$STAGING/install-bootstrap-to-system.sh" 2>/dev/null || true
  chmod +x "$STAGING/pi-sd-early-provision.sh" 2>/dev/null || true

  BOOTH_USER=pi
  if [[ -f "$STAGING/install.conf" ]]; then
    # shellcheck source=/dev/null
    source "$STAGING/install.conf"
  fi
  BOOTH_USER="${BOOTH_USER:-pi}"

  if ! id -u "$BOOTH_USER" &>/dev/null; then
    log "ERROR: Linux user '$BOOTH_USER' does not exist."
    exit 1
  fi

  chown -R "${BOOTH_USER}:${BOOTH_USER}" "$STAGING"

  log "Running install.sh as $BOOTH_USER ..."
  sudo -u "$BOOTH_USER" -H bash -c "cd '$STAGING' && ./install.sh"

  log "Reloading systemd and (re)starting print-agent ..."
  systemctl daemon-reload
  systemctl enable print-agent 2>/dev/null || true
  systemctl restart print-agent || systemctl start print-agent

  log "===== photo-booth-bootstrap end OK ====="
} >>"$LOG" 2>&1
