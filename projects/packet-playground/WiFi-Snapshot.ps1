# Read-only local Wi-Fi snapshots. No identifiers are written to the JSON file.
$ErrorActionPreference = 'Stop'
$snapshotPath = Join-Path $PSScriptRoot 'wifi-snapshot.json'
Write-Host 'Wi-Fi snapshot helper: reads Windows signal percentages; changes no settings.'
Write-Host 'No data is sent. Close this window or enter Q to stop.'
do {
    try {
        $wlanLines = @(& netsh.exe wlan show interfaces 2>&1)
        $signalValues = @()
        foreach ($wlanLine in $wlanLines) {
            if ([string]$wlanLine -match ':\s*(\d{1,3})\s*%\s*$') {
                $signalValue = [int]$Matches[1]
                if ($signalValue -ge 0 -and $signalValue -le 100) { $signalValues += $signalValue }
            }
        }
        $snapshot = [ordered]@{ schema = 'everyday-cool-wifi-v1'; capturedAt = (Get-Date).ToUniversalTime().ToString('o'); signals = @($signalValues) }
        $snapshot | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $snapshotPath -Encoding ASCII
        if ($signalValues.Count -gt 0) { Write-Host ('Signal readings: ' + ($signalValues -join '%, ') + '%') }
        else { Write-Host 'No percentage available. Check Wi-Fi connection, permissions, driver, or WLAN service. Read netsh output manually if needed.' }
        Write-Host ('Saved: ' + $snapshotPath)
        Write-Host 'Reload that local file in the workshop after each capture. A snapshot is not live.'
    } catch { Write-Host ('Could not capture: ' + $_.Exception.Message) }
    $snapshotChoice = Read-Host 'Enter for another capture, or Q to quit'
} while ($snapshotChoice -ne 'q')
