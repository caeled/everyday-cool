$ErrorActionPreference = 'Stop'
$workshopRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$destination = Join-Path (Split-Path -Parent $workshopRoot) 'weather-everywhere.zip'
# Exclude Git history. Package only the explicitly named workshop content.
$names = @('index.html','assets','tools','tests','README.md','SCIENCE.md','LICENSE','LICENSE-CONTENT.md','Launch.cmd','Serve.cmd','.gitignore')
$paths = $names | ForEach-Object { Join-Path $workshopRoot $_ } | Where-Object { Test-Path -LiteralPath $_ }
Compress-Archive -LiteralPath $paths -DestinationPath $destination -Force
Write-Host "Portable package: $destination"
