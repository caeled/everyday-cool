# Copyright (c) 2026 Steven Powell. Application code: MIT License.
param([ValidateSet('Videos','All','Starter','Reading')][string]$Selection)
$ErrorActionPreference = 'Stop'
function Get-Sha256([string]$Path) {
    $stream = [IO.File]::OpenRead($Path)
    $sha = [Security.Cryptography.SHA256]::Create()
    try {return ([BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-', '').ToLowerInvariant()}
    finally {$stream.Dispose(); $sha.Dispose()}
}
function Read-CaptionCues([string]$Path) {
    $cues = New-Object 'System.Collections.Generic.List[object]'
    $text = [IO.File]::ReadAllText($Path)
    foreach ($block in [Regex]::Split($text.Trim(), '\r?\n\s*\r?\n')) {
        $lines = $block -split '\r?\n'
        for ($n = 0; $n -lt $lines.Length; $n++) {
            if ($lines[$n] -match '^(\d{2}:\d{2}:\d{2}[,.]\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}[,.]\d{3})') {
                $a = [TimeSpan]::Parse($Matches[1].Replace(',', '.'), [Globalization.CultureInfo]::InvariantCulture).TotalSeconds
                $b = [TimeSpan]::Parse($Matches[2].Replace(',', '.'), [Globalization.CultureInfo]::InvariantCulture).TotalSeconds
                $words = ($lines[($n + 1)..($lines.Length - 1)] -join "`n")
                $cues.Add(@($a, $b, $words))
                break
            }
        }
    }
    return ,($cues.ToArray())
}
function Update-LocalCaptions([string]$Directory) {
    $encoding = New-Object Text.UTF8Encoding($false)
    $mit = Join-Path $Directory '03-mit-neural-nets.srt'
    if (Test-Path -LiteralPath $mit) {
        $json = ConvertTo-Json -InputObject (Read-CaptionCues $mit) -Depth 5 -Compress
        [IO.File]::WriteAllText((Join-Path $Directory 'captions.js'), ('window.MIT_CAPTIONS=' + $json + ';'), $encoding)
    }
    $eso = Join-Path $Directory '14-europe-to-the-stars.srt'
    if (Test-Path -LiteralPath $eso) {
        $json = ConvertTo-Json -InputObject @{'14-europe-to-the-stars.m4v' = (Read-CaptionCues $eso)} -Depth 6 -Compress
        [IO.File]::WriteAllText((Join-Path $Directory 'library-captions.js'), ('window.LIBRARY_CAPTIONS=' + $json + ';'), $encoding)
    }
}
try {
    $root = $PSScriptRoot
    $manifest = Get-Content -LiteralPath (Join-Path $root 'offline-media-sources.json') -Raw | ConvertFrom-Json
    $media = Join-Path $root 'discovery\media'
    New-Item -ItemType Directory -Path $media -Force | Out-Null
    $template = Join-Path $root 'Offline-Recordings.template.html'
    if (Test-Path -LiteralPath $template) {Copy-Item -LiteralPath $template -Destination (Join-Path $root 'discovery\index.html') -Force}
    foreach ($name in @('captions.js', 'library-captions.js')) {
        $placeholder = Join-Path $media $name
        if (!(Test-Path -LiteralPath $placeholder)) {
            $empty = 'window.MIT_CAPTIONS=[];'
            if ($name -eq 'library-captions.js') {$empty = 'window.LIBRARY_CAPTIONS={};'}
            [IO.File]::WriteAllText($placeholder, $empty, (New-Object Text.UTF8Encoding($false)))
        }
    }
    Write-Host "Nerd Heaven - recordings for your USB" -ForegroundColor Cyan
    Write-Host "Downloads stay beside this course. Internet is needed only while downloading."
    if (!$Selection) {
        Write-Host "1. Four videos, with reading/captions (about 3.3 GB)"
        Write-Host "2. All fourteen recordings, with reading/captions (about 3.7 GB)"
        Write-Host "3. Two-hour starting route (about 195 MB)"
        Write-Host "4. Transcripts and captions only (less than 1 MB)"
        Write-Host "Q. Quit"
        $choice = Read-Host 'Choose 1, 2, 3 or 4 [1]'
        switch ($choice.Trim().ToUpperInvariant()) {
            '' {$Selection = 'Videos'}
            '1' {$Selection = 'Videos'}
            '2' {$Selection = 'All'}
            '3' {$Selection = 'Starter'}
            '4' {$Selection = 'Reading'}
            'Q' {exit 0}
            default {throw 'Please run again and choose 1, 2, 3, 4 or Q.'}
        }
    }
    $items = @($manifest.items | Where-Object {
        $entry = $_
        switch ($Selection) {
            'All' {$true}
            'Videos' {$entry.kind -ne 'audio'}
            'Starter' {$entry.file -match '^0[123]-'}
            'Reading' {$entry.kind -in @('captions','transcript')}
        }
    })
    if (!$items.Count) {throw 'No files were found for this choice. Keep the supplied media list beside the helper.'}
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if (!$curl) {throw 'This helper needs curl.exe, included with current Windows 10/11. Use the official links in the Discovery Room if it is unavailable.'}
    foreach ($item in $items) {
        if ([IO.Path]::GetFileName($item.file) -ne $item.file -or $item.file -match '[/\\]') {throw 'Invalid filename in the media list.'}
        if (([Uri]$item.url).Scheme -ne 'https') {throw 'The media list must use HTTPS publisher downloads.'}
    }
    $needed = [long]0
    foreach ($item in $items) {
        $target = Join-Path $media $item.file
        if (!(Test-Path -LiteralPath $target)) {
            $partial = $target + '.part'
            $partialSize = 0
            if (Test-Path -LiteralPath $partial) {$partialSize = (Get-Item -LiteralPath $partial).Length}
            $needed += [Math]::Max(0, [long]$item.bytes - $partialSize)
        }
    }
    $driveRoot = [IO.Path]::GetPathRoot($media)
    $drive = New-Object IO.DriveInfo($driveRoot)
    if ($drive.AvailableFreeSpace -lt ($needed + 50MB)) {throw "Not enough free space. Allow about $([Math]::Round($needed / 1GB, 2)) GiB plus some spare room on this drive."}
    $failures = 0
    foreach ($item in $items) {
        $target = Join-Path $media $item.file
        $part = $target + '.part'
        Write-Host "`n$($item.title)" -ForegroundColor Cyan
        try {
            if (Test-Path -LiteralPath $target) {
                $hash = Get-Sha256 $target
                if ($hash -eq $item.sha256 -or ($item.kind -eq 'audio' -and (Get-Item -LiteralPath $target).Length -gt 100000)) {
                    Write-Host 'Already downloaded. Keeping the existing file.'
                    continue
                }
                throw 'The existing file does not match the saved publisher copy. Move it aside before downloading again.'
            }
            if ((Test-Path -LiteralPath $part) -and (Get-Item -LiteralPath $part).Length -eq [long]$item.bytes -and (Get-Sha256 $part) -eq $item.sha256) {
                Move-Item -LiteralPath $part -Destination $target
                Write-Host 'Recovered a complete, verified download.' -ForegroundColor Green
                continue
            }
            # Curl resumes an interrupted .part file and streams to disk.
            & $curl.Source --location --fail --retry 3 --connect-timeout 30 --continue-at - --output $part -- $item.url
            if ($LASTEXITCODE -ne 0) {throw "Download interrupted (curl code $LASTEXITCODE). Run this helper again to resume. If the publisher does not support resume, move aside this file: $part"}
            if (!(Test-Path -LiteralPath $part) -or (Get-Item -LiteralPath $part).Length -lt 100) {throw 'The publisher returned an empty file.'}
            $hash = Get-Sha256 $part
            if ($hash -ne $item.sha256) {
                if ($item.kind -eq 'audio') {
                    # Podcast advertisements can change the bytes of the publisher's MP3.
                    $stream = [IO.File]::OpenRead($part)
                    try {$head = New-Object byte[] 3; $null = $stream.Read($head,0,3)} finally {$stream.Dispose()}
                    if (!(([Text.Encoding]::ASCII.GetString($head) -eq 'ID3') -or ($head[0] -eq 255 -and ($head[1] -band 224) -eq 224))) {throw 'The response is not an MP3 recording.'}
                    Write-Host 'Publisher MP3 differs from the original collection, possibly due to updated podcast advertisements.' -ForegroundColor Yellow
                } else {throw 'This file differs from the verified publisher copy. It has been left as .part; use the official source link to check for an updated version.'}
            }
            Move-Item -LiteralPath $part -Destination $target
            Write-Host 'Saved and checked.' -ForegroundColor Green
        } catch {
            $failures++
            Write-Host $_.Exception.Message -ForegroundColor Yellow
        }
    }
    Update-LocalCaptions $media
    Write-Host "`nOpen index.html, then Discovery room -> Offline recordings."
    Write-Host 'Downloaded files also open directly in a media player.'
    if ($failures) {Write-Host "$failures download(s) need attention. Successful downloads were kept."; exit 1}
    Write-Host 'Done. You can disconnect and use the saved recordings.' -ForegroundColor Green
    exit 0
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
