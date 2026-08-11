$ErrorActionPreference = "Continue"

$wd = (Get-Location).Path
$dir = Join-Path $wd "shots"
$log = Join-Path $dir "shot-home.txt"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Set-Content -LiteralPath $log -Value "START" -Encoding UTF8

$job = Start-Job -ScriptBlock {
  param($d)
  Set-Location $d
  npm.cmd run start -- -p 3100
} -ArgumentList $wd

try {
  Start-Sleep -Seconds 7
  $edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
  $out = Join-Path $dir "home.png"
  if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -Force }
  $prof = Join-Path $env:TEMP ("edge-home-" + [guid]::NewGuid().ToString("N"))
  & $edge --headless=new --disable-gpu --hide-scrollbars --no-first-run `
    --disable-extensions --disable-sync `
    "--user-data-dir=$prof" --window-size=1280,900 --virtual-time-budget=10000 `
    "--screenshot=$out" "http://localhost:3100/" 2>$null
  $waited = 0
  while (-not (Test-Path -LiteralPath $out) -and $waited -lt 30) {
    Start-Sleep -Milliseconds 500
    $waited++
  }
  Add-Content -LiteralPath $log -Value ("home " + (Test-Path -LiteralPath $out)) -Encoding UTF8
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue
  Remove-Job $job -Force -ErrorAction SilentlyContinue
  Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess |
    Sort-Object -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  Add-Content -LiteralPath $log -Value "END" -Encoding UTF8
}
