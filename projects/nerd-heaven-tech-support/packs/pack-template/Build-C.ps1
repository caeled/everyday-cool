<#
.SYNOPSIS
    Build-C.ps1 - the "C" Builder for DOS Workbench lesson packs.

.DESCRIPTION
    Pick a template, add your files and folders to it, and export a
    pack: a .zip whose contents ARE a C: drive (files at the zip's
    root), ready to mount on the DOS Workbench or the DOS Console -
    or to expand anywhere and mount as a folder.

    A template is a folder containing a drive\ subfolder. The
    template that ships with this script is pack-template; copy it
    to make your own templates (a bootable classroom drive, a
    troubleshooting bench, whatever a lesson needs).

    Run it with no parameters and it asks, one question at a time.
    Or drive it from the command line:

.EXAMPLE
    .\Build-C.ps1
    (interactive: pick a template, add files, name the pack)

.EXAMPLE
    .\Build-C.ps1 -Template pack-template -Name pack-002-my-lesson -Add C:\lesson\AUTOEXEC.BAT, C:\lesson\TOOLS

.NOTES
    Plain Windows PowerShell 5.1+ - no modules, nothing to install.
    By Muse at Steven Powell's direction, for Nerd Heaven.
#>
param(
    [string]$Template,
    [string]$Name,
    [string[]]$Add,
    [string]$TemplateRoot = $PSScriptRoot,
    [string]$Out = (Join-Path $PSScriptRoot 'built')
)

$ErrorActionPreference = 'Stop'

function Read-Default([string]$Prompt, [string]$Default) {
    $v = Read-Host "$Prompt [$Default]"
    if ([string]::IsNullOrWhiteSpace($v)) { return $Default }
    return $v.Trim()
}

# --- 1. pick a template -------------------------------------------------
$templates = Get-ChildItem -Path $TemplateRoot -Directory |
    Where-Object { Test-Path (Join-Path $_.FullName 'drive') }

if (-not $templates) {
    Write-Host "No templates found under $TemplateRoot (a template is a folder with a drive\ inside it)."
    exit 1
}

if (-not $Template) {
    Write-Host ''
    Write-Host 'Templates:'
    for ($i = 0; $i -lt $templates.Count; $i++) {
        Write-Host ("  {0}. {1}" -f ($i + 1), $templates[$i].Name)
    }
    $pick = Read-Host 'Pick a template number'
    $n = 0
    if (-not [int]::TryParse($pick, [ref]$n) -or $n -lt 1 -or $n -gt $templates.Count) {
        Write-Host "That is not one of the numbers. Nothing built."
        exit 1
    }
    $Template = $templates[$n - 1].Name
}

$templatePath = Join-Path $TemplateRoot $Template
$driveSource  = Join-Path $templatePath 'drive'
if (-not (Test-Path $driveSource)) {
    Write-Host "Template '$Template' has no drive\ folder under $TemplateRoot."
    exit 1
}
Write-Host "Template: $Template"

# --- 2. name the pack ----------------------------------------------------
if (-not $Name) {
    $stamp = Get-Date -Format 'yyyyMMdd'
    $Name = Read-Default 'Pack name' "$Template-$stamp"
}
$Name = $Name.Trim() -replace '\.zip$', ''

# --- 3. stage the drive --------------------------------------------------
New-Item -ItemType Directory -Force -Path $Out | Out-Null
$stage = Join-Path $Out "$Name.drive"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
Copy-Item $driveSource $stage -Recurse
Write-Host "Staged the template drive at $stage"

# --- 4. add files and folders --------------------------------------------
function Add-ToDrive([string]$Path) {
    $Path = $Path.Trim().Trim('"')
    if (-not $Path) { return }
    if (-not (Test-Path $Path)) {
        Write-Host "  (skipped - not found: $Path)"
        return
    }
    $item = Get-Item $Path
    if ($item.PSIsContainer) {
        Copy-Item $item.FullName (Join-Path $stage $item.Name) -Recurse -Force
        Write-Host "  added folder $($item.Name)\ (as a folder on the drive)"
    } else {
        $sub = Read-Default "  $($item.Name): subfolder on the drive (blank = drive root)" ''
        $dest = $stage
        if ($sub) {
            $dest = Join-Path $stage $sub
            New-Item -ItemType Directory -Force -Path $dest | Out-Null
        }
        Copy-Item $item.FullName $dest -Force
        Write-Host "  added file $($item.Name)"
    }
}

if ($Add) {
    foreach ($p in $Add) { Add-ToDrive $p }
} else {
    Write-Host ''
    Write-Host 'Add files or folders to the drive. Paste or drag a path,'
    Write-Host 'press Enter after each one, and leave it blank when done.'
    while ($true) {
        $p = Read-Host 'Add (blank to finish)'
        if ([string]::IsNullOrWhiteSpace($p)) { break }
        Add-ToDrive $p
    }
}

# --- 5. export the zip ----------------------------------------------------
$zipPath = Join-Path $Out "$Name.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
# The zip's CONTENTS are the drive - files at the root, not in a wrapper.
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipPath

$zip = Get-Item $zipPath
Write-Host ''
Write-Host "Built: $($zip.FullName) ($($zip.Length) bytes)"
Write-Host "Staged drive kept at: $stage"
Write-Host ''
Write-Host 'Mount the zip on the DOS Workbench (door one, zip key), or'
Write-Host 'expand it anywhere and mount the folder. The drive is the pack.'
