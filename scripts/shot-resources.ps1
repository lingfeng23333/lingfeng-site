$ErrorActionPreference = "Continue"

$wd = (Get-Location).Path
$dir = Join-Path $wd "shots"
$log = Join-Path $dir "shot-resources.txt"
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
  $targets = @(
    @{ Path = "/resources"; Name = "resources"; Height = 1000 },
    @{ Path = "/resources/rem-if"; Name = "resource-overview"; Height = 1700 },
    @{ Path = "/resources/rem-if/ex01"; Name = "resource-chapter"; Height = 2600 },
    @{ Path = "/resources/hakomari"; Name = "hakomari-overview"; Height = 5200 },
    @{ Path = "/resources/hakomari/12"; Name = "hakomari-chapter"; Height = 2400 }
  )
  foreach ($t in $targets) {
    $out = Join-Path $dir ($t.Name + ".png")
    if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -Force }
    $prof = Join-Path $env:TEMP ("edge-res-" + [guid]::NewGuid().ToString("N"))
    $height = if ($t.Height) { $t.Height } else { 1000 }
    & $edge --headless=new --disable-gpu --hide-scrollbars --no-first-run `
      --disable-extensions --disable-sync `
      "--user-data-dir=$prof" --window-size=1280,$height --virtual-time-budget=9000 `
      "--screenshot=$out" ("http://localhost:3100" + $t.Path) 2>$null
    $waited = 0
    while (-not (Test-Path -LiteralPath $out) -and $waited -lt 30) {
      Start-Sleep -Milliseconds 500
      $waited++
    }
    Add-Content -LiteralPath $log -Value ($t.Name + " " + (Test-Path -LiteralPath $out)) -Encoding UTF8
  }
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue
  Remove-Job $job -Force -ErrorAction SilentlyContinue
  Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess |
    Sort-Object -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  Add-Content -LiteralPath $log -Value "END" -Encoding UTF8
}
