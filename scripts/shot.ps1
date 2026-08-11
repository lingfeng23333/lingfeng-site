$ErrorActionPreference = "Continue"

$wd = (Get-Location).Path
$log = Join-Path $wd "shots\results.txt"
$job = Start-Job -ScriptBlock {
  param($d)
  Set-Location $d
  npm.cmd run start -- -p 3100
} -ArgumentList $wd

try {
  Start-Sleep -Seconds 7
  $dir = Join-Path $wd "shots"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null

  $edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
  $targets = @(
    @{ Path = "/"; Name = "home" },
    @{ Path = "/bangumi"; Name = "bangumi" },
    @{ Path = "/blog/bingguo-ep4"; Name = "post" },
    @{ Path = "/bangumi/27364"; Name = "subject" }
  )

  foreach ($t in $targets) {
    $out = Join-Path $dir ($t.Name + ".png")
    $prof = Join-Path $env:TEMP ("edge-shot-" + [guid]::NewGuid().ToString("N"))
    & $edge --headless=new --disable-gpu --hide-scrollbars --no-first-run `
      --disable-extensions --disable-sync `
      "--user-data-dir=$prof" --window-size=1280,900 --virtual-time-budget=8000 `
      "--screenshot=$out" ("http://localhost:3100" + $t.Path) 2>$null
    if (Test-Path -LiteralPath $out) {
      Add-Content -LiteralPath $log -Value ("OK " + $t.Name + " " + (Get-Item -LiteralPath $out).Length)
    } else {
      Add-Content -LiteralPath $log -Value ("FAIL " + $t.Name)
    }
  }
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue
  Remove-Job $job -Force -ErrorAction SilentlyContinue
  Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess |
    Sort-Object -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}
