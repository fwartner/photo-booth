# SD card only — **no SSH**

The field operator has **physical access to the SD card** and a **PC** (Windows / Mac / Linux). They **do not** log into the Pi over the network. Everything is prepared by **editing the FAT32 boot partition** while the card is in a USB reader, then booting the Pi.

You only need:

- **Network on the Pi** (Ethernet or Wi‑Fi already configured on that OS image), so `apt` / `pip` can run on first boot.
- The **`photo-booth-deploy/`** folder on the boot partition kept in sync with the latest `raspberry-pi/` tree from this repo.

---

## One-time setup per SD card (before the Pi is useful)

Do this **on the laptop** with the SD card inserted (boot partition visible — on Windows often named **bootfs**).

### 1) Copy the deploy bundle

Copy **everything** from this repo’s [`raspberry-pi/`](../) folder into a directory on the **boot** partition:

```text
photo-booth-deploy/
  install.sh
  print_agent.py
  requirements.txt
  print-agent.service
  photo-booth-bootstrap.sh
  photo-booth-bootstrap.service
  install-bootstrap-to-system.sh
  pi-sd-early-provision.sh
  append-cmdline.sh
  append-cmdline.ps1
  cmdline-append-this.txt
  assets/
  …
```

(You can copy the whole `raspberry-pi` tree into `photo-booth-deploy/`; extra files are harmless.)

### 2) Register the boot hook in `cmdline.txt` (pick one)

The Pi only auto-installs from the SD if **one** extra kernel parameter is present. It must be added **on the same line** as the rest of the kernel command line (Raspberry Pi OS uses a **single-line** `cmdline.txt`).

**Option A — Windows (easiest)**  

The **`append-cmdline.ps1`** script is included inside **`photo-booth-deploy/`** when you copy the full `raspberry-pi/` tree — you do **not** need SSH or the repo checkout on the PC.

1. Open **`photo-booth-deploy`** on the boot partition in Explorer.  
2. Right-click **`append-cmdline.ps1`** → **Run with PowerShell**.  
   The script finds **`cmdline.txt`** on the partition (one folder up) and appends **`cmdline-append-this.txt`**.  
   If Windows blocks execution: open PowerShell **in `photo-booth-deploy`**:  
   `powershell -ExecutionPolicy Bypass -File .\append-cmdline.ps1`  
3. Idempotent: safe to run twice.

**Option B — Manual (any OS, no scripts)**  

1. Open **`cmdline.txt`** in a text editor. It is **one long line**.  
2. Open **`cmdline-append-this.txt`**, select **all** text, copy.  
3. In **`cmdline.txt`**, move the cursor to the **very end** of that same line (do **not** create a new line).  
4. Paste. Save.  
5. The pasted text must start with a **space** and must include `pi-sd-early-provision`.

**Option C — Mac / Linux (terminal)**  

From a clone of this repo:

```bash
./append-cmdline.sh /Volumes/bootfs
# or e.g. /run/media/$USER/bootfs
```

### 3) Eject and boot

First boot can take **several minutes** (`apt`, `pip`, WeasyPrint stack). The Pi must reach the network for that first install.

---

## Later updates (operator workflow — still **no SSH**)

1. Mount the SD card on the PC.  
2. Overwrite **`photo-booth-deploy/`** with the new `raspberry-pi/` files.  
3. **Do not** change `cmdline.txt` again unless we document a new kernel parameter.  
4. Eject, boot the Pi. **`photo-booth-bootstrap`** runs on boot, syncs, runs **`install.sh`**, restarts **`print-agent`**.

---

## How it works (short)

- **`systemd.run=…pi-sd-early-provision.sh`** (from the cmdline patch) runs very early and installs **`photo-booth-bootstrap.service`** from `photo-booth-deploy/` so **no** manual step on the Pi.  
- Each boot, **`photo-booth-bootstrap`** rsyncs from `/boot/firmware/photo-booth-deploy/`, runs **`install.sh`**, and refreshes the bootstrap scripts from the SD card.

---

## If something fails (no SSH)

- **HDMI + USB keyboard** on the Pi: local console login (if enabled on the image).  
- **Fix the SD on the PC:** re-copy `photo-booth-deploy/`, verify **`cmdline.txt`** still contains `pi-sd-early-provision`, fix **`cmdline-append-this`** paste if someone broke the line.  
- **Serial cable** (advanced): bootloader / systemd logs.

Journal commands (`journalctl`, …) only apply when you **do** have shell access.

---

## Requirements

- **Network** on first install (`apt` / `pip`).  
- User **`pi`** present on the image (default Raspberry Pi OS), or **`install.conf`** in `photo-booth-deploy/` with an existing **`BOOTH_USER`**.
