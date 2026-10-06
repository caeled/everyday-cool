# Saves model forecasts as dated snapshots. Requires internet, not an API key.
$ErrorActionPreference = 'Stop'
$workshopRoot = Split-Path -Parent $PSScriptRoot
# places.js is intentionally JavaScript; use an explicit portable coordinate list here.
$locations = @(
@{id='rothera';lat=-67.57;lon=-68.13}, @{id='pole';lat=-89.98;lon=0},
@{id='nyc';lat=40.71;lon=-74.01}, @{id='london';lat=51.51;lon=-0.13},
@{id='reykjavik';lat=64.15;lon=-21.94}, @{id='singapore';lat=1.35;lon=103.82},
@{id='sydney';lat=-33.87;lon=151.21}, @{id='cairo';lat=30.04;lon=31.24},
@{id='nairobi';lat=-1.29;lon=36.82}, @{id='tokyo';lat=35.68;lon=139.69},
@{id='ushuaia';lat=-54.8;lon=-68.3}, @{id='tromso';lat=69.65;lon=18.96},
@{id='winnipeg';lat=49.9;lon=-97.14}, @{id='honolulu';lat=21.31;lon=-157.86},
@{id='delhi';lat=28.61;lon=77.21}, @{id='hobart';lat=-42.88;lon=147.33})
$snapshots = @{}
$snapshotPath = Join-Path $workshopRoot 'assets/snapshots.js'
# Preserve existing dated snapshots if a later download fails.
if (Test-Path -LiteralPath $snapshotPath) {
    try {
        $existing = (Get-Content -LiteralPath $snapshotPath -Raw) -replace '^window.WEATHER_SNAPSHOTS\s*=\s*', '' -replace ';\s*$', '' | ConvertFrom-Json
        foreach ($property in $existing.PSObject.Properties) { $snapshots[$property.Name] = $property.Value }
    } catch { Write-Warning 'Existing snapshot file could not be read.' }
}
$downloaded = 0
foreach ($place in $locations) {
    $latText = ([double]$place.lat).ToString([Globalization.CultureInfo]::InvariantCulture)
    $lonText = ([double]$place.lon).ToString([Globalization.CultureInfo]::InvariantCulture)
    $url = "https://api.open-meteo.com/v1/forecast?latitude=$latText&longitude=$lonText&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=UTC&forecast_days=7"
    try {
        $data = Invoke-RestMethod -Uri $url -TimeoutSec 20
        if ($null -eq $data.current.temperature_2m -or $null -eq $data.daily.time) { throw 'Incomplete forecast' }
        $snapshots[$place.id] = @{fetched=[DateTime]::UtcNow.ToString('o');data=$data}
        $downloaded++
        Write-Host "Saved $($place.id)"
    } catch { Write-Warning "Could not update $($place.id): $($_.Exception.Message)" }
}
if ($downloaded -gt 0) {
    $json = ConvertTo-Json -InputObject $snapshots -Depth 30 -Compress
    [IO.File]::WriteAllText($snapshotPath, "window.WEATHER_SNAPSHOTS = $json;", [Text.UTF8Encoding]::new($false))
    Write-Host "$downloaded forecasts updated. Snapshots retain their actual dates; they are not live offline."
} else { Write-Host 'No downloads succeeded. The existing snapshot file was preserved.' }
