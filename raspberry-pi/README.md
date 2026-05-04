# Photo booth Raspberry Pi print agent

Single systemd service: **print-agent** polls **n8n** for jobs and prints via **CUPS** (e.g. Canon SELPHY CP1300 USB).

Images are always prepared as **postcard 4×6 in** via WeasyPrint. CUPS uses **media=Postcard** (fixed in `print_agent.py`); use `lpoptions -p QUEUE -l` and edit `CUPS_OPTIONS_JSON` / `CUPS_OPTIONS` in that file if your PPD needs different option names.

## Updates via SD card (automatic on boot, **no SSH**)

Operators only need the **physical SD card** and a PC — see **[README-SD-CARD.md](README-SD-CARD.md)** (Windows **`append-cmdline.ps1`**, manual paste, or Mac/Linux **`append-cmdline.sh`**). After a one-time **`cmdline.txt`** patch, updates are: refresh **`photo-booth-deploy/`** on the boot partition → reboot.

If you **do** have shell access on the Pi, **`install.sh`** registers bootstrap on step **[6/6]** when the unit is missing.

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
3. Set as server default if `PRINTER_NAME = "auto"` in `print_agent.py`.

```bash
lpstat -p
lpoptions -p YOUR_QUEUE_NAME -l
```

## Configuration

All runtime settings live as **constants at the top of `print_agent.py`**: `N8N_URL`, `API_KEY` (must match the n8n “Print Job Queue” workflow auth), `PRINTER_NAME`, `POLL_INTERVAL`, `DRY_RUN`, CUPS option strings, and on-screen display toggles. After changing them, redeploy the script (re-run `install.sh` or copy the file into `$PRINT_INSTALL_DIR`) and `sudo systemctl restart print-agent`.

### On-screen preview after print

After each successful print, the booth photo is shown **fullscreen on the Pi’s display** (same image that was sent to the printer), for about **45 seconds** by default (`SCREEN_DISPLAY_SECONDS` in code).

- **Packages:** `install.sh` installs **`feh`**. The systemd unit sets **`DISPLAY=:0`** and **`XAUTHORITY=/home/<booth user>/.Xauthority`** so the service can open a window on the logged-in desktop.
- **Tunables (in code):** `SHOW_PRINT_ON_SCREEN`, `SCREEN_DISPLAY_SECONDS`, `SCREEN_REPLACE_PREVIOUS` (when `True`, runs `pkill feh` before the next photo so only one fullscreen image is shown).
- **Headless / no X11:** set `SHOW_PRINT_ON_SCREEN = False` in `print_agent.py` or omit a graphical session; printing is unchanged.

If the image does not appear, log in on the Pi desktop as the same user as the service, open a terminal, and run `echo $DISPLAY` / `ls ~/.Xauthority` — match those values in the unit or export them for testing.

## Verification

```bash
lpstat -p
# Set DRY_RUN = True in print_agent.py for a no-print smoke test
sudo systemctl start print-agent
tail -f ~/print-agent/print_agent.log
```

## Service

```bash
sudo systemctl start print-agent
sudo systemctl status print-agent
```

Print agent **Requires=cups.service**.
