# Append kernel cmdline hook for photo-booth auto-install (Windows).
# Can live next to cmdline.txt (boot partition root) OR inside photo-booth-deploy/
# (with cmdline-append-this.txt beside this file).
# Run: right-click -> Run with PowerShell, or:
#   powershell -ExecutionPolicy Bypass -File .\append-cmdline.ps1
#
# Idempotent: skips if hook already present.

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

# cmdline.txt is always on the boot partition root (parent if we are in photo-booth-deploy)
$cmdPath = $null
$bootRoot = $null
foreach ($dir in @(
        $here,
        (Join-Path $here '..' | Resolve-Path).Path
    )) {
    $c = Join-Path $dir 'cmdline.txt'
    if (Test-Path -LiteralPath $c) {
        $cmdPath = $c
        $bootRoot = $dir
        break
    }
}
if (-not $cmdPath) {
    Write-Error "cmdline.txt not found. Place this script on the SD boot partition (or in photo-booth-deploy/) and try again."
}

$fragPath = Join-Path $here 'cmdline-append-this.txt'
if (-not (Test-Path -LiteralPath $fragPath)) {
    $fragPath = Join-Path $bootRoot 'cmdline-append-this.txt'
}
if (-not (Test-Path -LiteralPath $fragPath)) {
    Write-Error "cmdline-append-this.txt not found next to this script or on the boot partition root."
}

$mark = 'photo-booth-deploy/pi-sd-early-provision'
$existing = Get-Content -Raw -LiteralPath $cmdPath
if ($existing -like "*$mark*") {
    Write-Host "cmdline.txt already contains the photo-booth hook. Nothing to do."
    exit 0
}

$frag = (Get-Content -Raw -LiteralPath $fragPath).TrimEnd("`r", "`n")
if ([string]::IsNullOrWhiteSpace($frag)) {
    Write-Error "Fragment file is empty."
}
if (-not $frag.StartsWith(' ')) {
    $frag = ' ' + $frag.TrimStart()
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::AppendAllText($cmdPath, $frag, $utf8NoBom)

Write-Host "Appended hook to: $cmdPath"
Write-Host "Eject the SD card safely, then boot the Pi."
