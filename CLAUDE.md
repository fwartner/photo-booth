# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

Interactive photo-booth web app for **IFAT 2026 "Helden der Kreislaufwirtschaft"** under the RecyclingMonitor brand. A kiosk attendee picks a "Heldentyp" (superpower/archetype) and industry category, takes a selfie in-browser, and an n8n workflow runs AI stylization and (optionally) triggers a print via a Raspberry Pi print agent. UI is **German**.

## Commands

```bash
npm run dev     # next dev on :3000
npm run build   # next build (output: "standalone" for Docker)
npm run start   # next start
npm run lint    # eslint (flat config; eslint.config.mjs)
```

There is no test suite.

## Architecture

### Frontend flow (`src/app/page.tsx`)

The entire app is a single client component — a state machine over `AppStep` (`start → form → camera → processing → preview → contact → confirmed`) rendered inside `<AnimatePresence>`. A single `SessionData` object (see `src/lib/types.ts`) threads state across steps; `session_id` is generated client-side as `pb-<ts>-<rand>`.

When modifying the flow, update both `AppStep` in `src/lib/types.ts` and the step renderer in `page.tsx`. Components under `src/components/` are screen-level (`StartScreen`, `RegistrationForm`, `CameraView`, `ProcessingView`, `PhotoPreview`, `ContactForm`, `ConfirmedView`) — each owns its own local state and receives callbacks.

### n8n webhook contract (`src/lib/webhook.ts`)

Two endpoints, both POSTed as `FormData` (not JSON — the photo is a `Blob`):

- `POST /webhook/photo-booth/process` — fired after capture. Fields: `heldentyp, kategorie, mode, personenanzahl, session_id, email?, privacy_accepted, firmenname?, photo`. Response JSON may include `processed_photo` (base64 data URL) which replaces the original for preview. If the call fails, the UI falls back to the original photo and surfaces the error as a toast on the preview screen — this fallback is load-bearing for the kiosk, don't remove it.
- `POST /webhook/photo-booth/confirm` — fired on contact-form submit with `action=confirm|retake` and `print_photo` bool. Fire-and-forget from the UI.

Webhook URLs are **hardcoded** in `src/lib/webhook.ts` (no `NEXT_PUBLIC_*` overrides): `https://n8n.pixelandprocess.de/webhook/photo-booth/process` and `.../confirm`. The Docker image does not pass n8n build-args.

### Raspberry Pi print agent (`raspberry-pi/`)

Separate Python service (`print_agent.py`), installed via `install.sh` as the `print-agent` systemd unit. **n8n base URL, print-queue API key, poll interval, CUPS extras, and on-screen display flags** are constants at the top of `print_agent.py` (no `.env` / `python-dotenv`). Polls `GET https://n8n.pixelandprocess.de/webhook/photo-booth/print-jobs` with `api_key`, downloads the image when `image_url` is present, and renders a **4×6 in postcard PDF** from an HTML template via WeasyPrint: reserved logo band on top and the photo on the bottom (`PHOTO_HEIGHT_FRACTION = 0.81`). Submits the PDF to CUPS (Canon SELPHY CP1300 via Gutenprint) and reports back to `POST .../webhook/photo-booth/print-done`. After a successful print, the downloaded booth image is shown fullscreen on the Pi display via **feh** (X11; `DISPLAY` / `XAUTHORITY` on the systemd unit; tune `SHOW_PRINT_ON_SCREEN`, `SCREEN_DISPLAY_SECONDS` in code).

The HTML template (`PRINT_HTML_TEMPLATE`) is the place to wire logos, footer text, or QR codes — edit the `.logos` band rather than going back to PIL. WeasyPrint requires cairo/pango system libs (installed by `install.sh`). Postcard dimensions and CUPS `media=Postcard` are fixed in code; optional `CUPS_OPTIONS_JSON` / `CUPS_OPTIONS` strings in the same file apply if non-empty. `install-wifi-connect.sh` installs a Balena wifi-connect captive portal for field setup.

**SD card field updates (no SSH):** patch **`cmdline.txt`** once from the PC using **`append-cmdline.ps1` / `cmdline-append-this.txt`** / **`append-cmdline.sh`** (see `README-SD-CARD.md`). Then only refresh **`photo-booth-deploy/`** on the FAT volume. Early **`systemd.run`** runs **`pi-sd-early-provision.sh`**; each boot **`photo-booth-bootstrap`** syncs from FAT, runs `install.sh`, restarts `print-agent`. **`install.sh`** [6/6] registers bootstrap if someone ran install from a shell and the unit was missing.

### Deployment

- `Dockerfile` is a three-stage Next.js standalone build (`output: "standalone"` in `next.config.ts`).
- `.github/workflows/build.yml` publishes to `ghcr.io/fwartner/photo-booth:latest` on push to `main`.
- `chart/` is a Helm chart (deployment + service + ingress) targeting `photo-booth.preview.remon-infra.de`.

## Design system

`STYLEGUIDE.md` documents the **RecyclingMonitor** palette (Teal `#18A092` → Dark Blue `#034C80` gradient is the primary brand mark). The Tailwind v4 theme in `src/app/globals.css` exposes these as `--color-pb-*` custom properties and `.pb-*` component classes (`.pb-btn-primary`, `.pb-card`, `.pb-input`, `.pb-display-xl`, etc.). **Use these tokens rather than hardcoding colors** — adding a new accent means extending the `@theme` block, not inlining hex values.

Fonts are **Source Sans 3** (display + body) and **DM Mono**, loaded from `fonts.bunny.net` in `layout.tsx`. Inputs force `font-size: 16px` on mobile to prevent iOS zoom-on-focus.

## Terminology

Types use the German domain terms (`Heldentyp`, `Kategorie`, `Stilmodus`, `firmenname`). `src/lib/types.ts` keeps legacy English aliases (`Superpower`, `Industry`, `SUPERPOWERS`, `INDUSTRIES`) for backward compat — prefer the German canonical names in new code.

The current `Heldentyp` values are `transparenz_scout | effizienz_architekt | impact_maker | smarter_entscheider`; `Stilmodus` is `comic | extreme` (the old "professional" mode was replaced by "comic" — see commit `998b1d9`).
