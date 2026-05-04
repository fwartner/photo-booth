# Photo booth Raspberry Pi print agent

Single systemd service: **print-agent** polls **n8n** for jobs and prints via **CUPS** (e.g. Canon SELPHY CP1300 USB).

Images are always prepared as **postcard 4×6 in** at `PRINT_DPI` (default 300). CUPS defaults to **media=Postcard**; use `lpoptions -p QUEUE -l` and `.env` overrides if your PPD needs different option names.

## Install

```bash
./install.sh
```

Optional: copy [`install.conf.example`](install.conf.example) to `install.conf` and set `BOOTH_USER` or `PRINT_INSTALL_DIR`.

Run as the booth Linux user (venv owner), with `sudo` for packages and systemd.

## WiFi setup web UI (no connection)

When the Pi has **no working network**, you can install **[Balena wifi-connect](https://github.com/balena-os/wifi-connect)** so it starts a **temporary access point** and a **captive portal** to pick an SSID and passphrase.

**Requirements:** Raspberry Pi OS / Debian with **NetworkManager** (the installer enables it and disables **dhcpcd** if it was managing interfaces—typical on Pi OS Lite before NM).

```bash
sudo ./install-wifi-connect.sh
```

This installs a **pinned** release (`v4.11.84` by default; override with `WFC_VERSION=` when invoking the script), places `wifi-connect` in `/usr/local/sbin`, the UI in `/usr/local/share/wifi-connect/ui`, and enables **`wifi-connect.service`**.

### Using the portal

1. Boot (or reboot) **without** a saved Wi‑Fi connection (or out of range).
2. On your phone/laptop, join the AP **SSID** (default **`PhotoBooth-Setup`** — change `PORTAL_SSID` in `/etc/default/wifi-connect`).
3. Open **`http://192.168.42.1`** (default **portal gateway**; phones often open the captive page automatically).
4. Choose the target Wi‑Fi network and enter the password. The AP stops and NetworkManager connects and saves credentials.

**Ethernet:** If Ethernet is up and provides connectivity, wifi-connect usually **does not** start the AP and exits.

**Security:** The setup AP is **open** by default (or WPA2 if you set `PORTAL_PASSPHRASE` in `/etc/default/wifi-connect`). Use only in a **trusted physical** environment.

**Boot / timeout:** `ACTIVITY_TIMEOUT` in `/etc/default/wifi-connect` is **`0`** by default (wait until someone configures or connects). Set e.g. **`600`** (seconds) if you want the service to stop after idle time so boot is not blocked indefinitely when nobody opens the portal.

**Logs:** `journalctl -u wifi-connect.service -b`

**Ordering:** The unit is ordered **before** `network-online.target` and **`NetworkManager-wait-online.service`** so the portal can run before systemd waits forever for a network that does not exist yet.

## Canon SELPHY CP1300 (USB)

1. Connect USB; check `lsusb` for Canon.
2. **http://localhost:631** → Add Printer → USB → **Gutenprint** driver for SELPHY CP1300.
3. Set as server default if `PRINTER_NAME=auto`.

```bash
lpstat -p
lpoptions -p YOUR_QUEUE_NAME -l
```

## Configuration

Set `N8N_URL`, `API_KEY`, and printer name in `$PRINT_INSTALL_DIR/.env` (create it from your deploy template if the repo has no `.env.example`).

### On-screen preview after print

After each successful print, the booth photo is shown **fullscreen on the Pi’s display** (same image that was sent to the printer), for about **45 seconds** by default.

- **Packages:** `install.sh` installs **`feh`**. The systemd unit sets **`DISPLAY=:0`** and **`XAUTHORITY=/home/<booth user>/.Xauthority`** so the service can open a window on the logged-in desktop.
- **Env (optional):** `SHOW_PRINT_ON_SCREEN` (default `true`), `SCREEN_DISPLAY_SECONDS` (default `45`), `SCREEN_REPLACE_PREVIOUS` (default `true`, runs `pkill feh` before the next photo so only one fullscreen image is shown).
- **Headless / no X11:** set `SHOW_PRINT_ON_SCREEN=false` in `.env` or omit a graphical session; printing is unchanged.

If the image does not appear, log in on the Pi desktop as the same user as the service, open a terminal, and run `echo $DISPLAY` / `ls ~/.Xauthority` — match those values in the unit or export them for testing.

## Verification

```bash
lpstat -p
# DRY_RUN=true in .env
sudo systemctl start print-agent
tail -f ~/print-agent/print_agent.log
```

## Service

```bash
sudo systemctl start print-agent
sudo systemctl status print-agent
```

Print agent **Requires=cups.service**.
