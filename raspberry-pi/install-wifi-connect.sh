#!/bin/bash
# Install Balena wifi-connect (pinned) + NetworkManager for captive WiFi setup when offline.
# Run on the Raspberry Pi (Debian/Raspberry Pi OS). Requires sudo.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Pinned release — update intentionally when testing new wifi-connect builds.
WFC_VERSION="${WFC_VERSION:-v4.11.84}"
WFC_REPO="balena-os/wifi-connect"
INSTALL_ROOT="${WFC_INSTALL_ROOT:-/usr/local}"
BIN_DIR="$INSTALL_ROOT/sbin"
UI_DIR="$INSTALL_ROOT/share/wifi-connect/ui"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "error: need '$1'"; exit 1; }
}

service_active_state() {
  systemctl -p ActiveState --value show "$1" 2>/dev/null || echo "unknown"
}

service_load_state() {
  systemctl -p LoadState --value show "$1" 2>/dev/null || echo "not-found"
}

disable_dhcpcd_if_active() {
  if [ "$(service_active_state dhcpcd)" = "active" ]; then
    echo "[wifi-connect] Stopping and disabling dhcpcd (NetworkManager will manage links)..."
    sudo systemctl stop dhcpcd
    sudo systemctl disable dhcpcd
  fi
}

ensure_network_manager() {
  if [ "$(service_load_state NetworkManager)" = "not-found" ]; then
    echo "[wifi-connect] Installing NetworkManager..."
    sudo apt-get update -qq
    disable_dhcpcd_if_active
    sudo apt-get install -y -qq network-manager
  else
    echo "[wifi-connect] NetworkManager is installed"
    if [ "$(service_active_state NetworkManager)" != "active" ]; then
      disable_dhcpcd_if_active
      sudo systemctl enable NetworkManager
      sudo systemctl start NetworkManager
    fi
  fi
  if [ "$(service_active_state NetworkManager)" != "active" ]; then
    echo "error: NetworkManager is not active. This image may use a different network stack."
    echo "wifi-connect requires NetworkManager per https://github.com/balena-os/wifi-connect"
    exit 1
  fi
}

wfc_tarball_for_arch() {
  local m
  m="$(uname -m)"
  case "$m" in
    aarch64) echo "wifi-connect-aarch64-unknown-linux-gnu.tar.gz" ;;
    armv7l)  echo "wifi-connect-armv7-unknown-linux-gnueabihf.tar.gz" ;;
    x86_64)  echo "wifi-connect-x86_64-unknown-linux-gnu.tar.gz" ;;
    *)
      echo "error: unsupported machine '$m' (need aarch64, armv7l, or x86_64)" >&2
      exit 1
      ;;
  esac
}

install_wifi_connect_binaries() {
  local tarball ui_url bin_url tmpd
  tarball="$(wfc_tarball_for_arch)"
  bin_url="https://github.com/$WFC_REPO/releases/download/$WFC_VERSION/$tarball"
  ui_url="https://github.com/$WFC_REPO/releases/download/$WFC_VERSION/wifi-connect-ui.tar.gz"

  need_cmd curl
  tmpd="$(mktemp -d)"
  trap 'rm -rf "$tmpd"' EXIT

  echo "[wifi-connect] Downloading $WFC_VERSION ($tarball)..."
  curl -fsSL "$bin_url" -o "$tmpd/wfc-bin.tar.gz"
  tar -xzf "$tmpd/wfc-bin.tar.gz" -C "$tmpd"

  echo "[wifi-connect] Downloading UI bundle..."
  mkdir -p "$tmpd/ui-extract"
  curl -fsSL "$ui_url" -o "$tmpd/wfc-ui.tar.gz"
  tar -xzf "$tmpd/wfc-ui.tar.gz" -C "$tmpd/ui-extract"

  sudo mkdir -p "$UI_DIR"
  sudo rm -rf "$UI_DIR"
  sudo mkdir -p "$UI_DIR"
  sudo cp -a "$tmpd/ui-extract"/. "$UI_DIR/"

  sudo mkdir -p "$BIN_DIR"
  sudo install -m 755 "$tmpd/wifi-connect" "$BIN_DIR/wifi-connect"

  rm -rf "$tmpd"
  trap - EXIT

  echo "[wifi-connect] Installed $($BIN_DIR/wifi-connect --version 2>/dev/null || echo wifi-connect) -> $BIN_DIR/wifi-connect"
}

install_systemd_unit() {
  local def=/etc/default/wifi-connect
  if [ ! -f "$def" ]; then
    sudo cp "$SCRIPT_DIR/wifi-connect.default" "$def"
    echo "[wifi-connect] Created $def (edit PORTAL_SSID / timeouts if needed)"
  else
    echo "[wifi-connect] Keeping existing $def"
  fi

  sudo cp "$SCRIPT_DIR/wifi-connect.service" /etc/systemd/system/wifi-connect.service
  sudo systemctl daemon-reload
  sudo systemctl enable wifi-connect.service
  echo "[wifi-connect] Enabled wifi-connect.service (runs at boot before network-online)"
}

need_cmd systemctl
need_cmd apt-get

echo "=== WiFi Connect installer (Balena $WFC_VERSION) ==="
ensure_network_manager
install_wifi_connect_binaries
install_systemd_unit

echo ""
echo "=== Done ==="
echo "  Portal SSID and options: /etc/default/wifi-connect"
echo "  After reboot (no Wi‑Fi): join the AP, open http://192.168.42.1 (default gateway)"
echo "  Logs: journalctl -u wifi-connect.service -b"
