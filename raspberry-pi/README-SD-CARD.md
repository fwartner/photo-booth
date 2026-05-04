# SD card deploy — automatic boot sync

The print agent can pull updates from the **FAT32 boot partition** of the SD card (the one visible as `bootfs` when you plug the card into a laptop). After a **one-time** setup on the Pi, every reboot applies whatever you copied there.

## Folder layout on the boot partition

Create this directory **next to** `config.txt` (Raspberry Pi OS Bookworm: `/boot/firmware/` on the running Pi; on Windows/macOS the volume is often named **bootfs**):

```text
photo-booth-deploy/
  install.sh
  print_agent.py
  requirements.txt
  print-agent.service
  assets/
  … (entire contents of the repo `raspberry-pi/` folder)
```

Copy the whole [`raspberry-pi/`](../) directory contents into `photo-booth-deploy/` — not the parent `pb2/` folder, only the files that belong to the Pi installer.

## One-time setup (pick one)

The systemd unit that runs on every boot must exist on the Linux root filesystem once.

### A. On the Pi (SSH or keyboard)

With the deploy folder already copied under `/boot/firmware/photo-booth-deploy/`:

```bash
sudo /boot/firmware/photo-booth-deploy/install-bootstrap-to-system.sh
```

### B. Raspberry Pi Imager — “Run script on first boot”

Paste a script that only runs the installer if the folder exists:

```bash
#!/bin/bash
set -e
if [ -x /boot/firmware/photo-booth-deploy/install-bootstrap-to-system.sh ]; then
  /boot/firmware/photo-booth-deploy/install-bootstrap-to-system.sh
fi
```

Flash the card, boot once; afterwards only refreshing `photo-booth-deploy/` on the FAT partition and rebooting is enough.

### C. Golden image

Include `/etc/systemd/system/photo-booth-bootstrap.service` and `/usr/local/sbin/photo-booth-bootstrap.sh` in your prebuilt image (same as running option A once).

## Day-to-day workflow (your colleague)

1. Copy the latest `raspberry-pi/` files into `photo-booth-deploy/` on the **boot** partition (replace existing files).
2. Safely eject, put the SD card in the Pi, power on.
3. On boot, `photo-booth-bootstrap.service` rsyncs that folder to `/var/lib/photo-booth-deploy/current`, runs `install.sh`, and restarts `print-agent`.

Check logs if something fails:

```bash
journalctl -u photo-booth-bootstrap.service -b --no-pager
sudo tail -100 /var/log/photo-booth-bootstrap.log
sudo systemctl status print-agent
```

## Requirements

- **Network** on first install (or whenever `install.sh` must run `apt-get`). Later boots are faster if packages are already installed.
- Linux user `pi` (or set `BOOTH_USER` in `install.conf` inside the deploy folder — user must exist).
- Path detection: `/boot/firmware/photo-booth-deploy` first, then `/boot/photo-booth-deploy`.

## Optional `install.conf`

You can place `install.conf` beside `install.sh` in `photo-booth-deploy/` (see `install.conf.example`). It is read by both `install.sh` and the bootstrap script before `chown`.
