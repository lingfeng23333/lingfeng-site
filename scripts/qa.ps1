$ErrorActionPreference = "Continue"

$wd = (Get-Location).Path
$dir = Join-Path $wd "shots"
$log = Join-Path $dir "qa.txt"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Set-Content -LiteralPath $log -Value "QA START" -Encoding UTF8

$job = Start-Job -ScriptBlock {
  param($d)
  Set-Location $d
  npm.cmd run start -- -p 3100
} -ArgumentList $wd

try {
  Start-Sleep -Seconds 7
  $edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

  $targets = @(
    @{ Path = "/"; Name = "home" },
    @{ Path = "/bangumi"; Name = "bangumi" },
    @{ Path = "/blog/bingguo-ep4"; Name = "post" },
    @{ Path = "/bangumi/27364"; Name = "subject" },
    @{ Path = "/stats"; Name = "stats" }
  )

  foreach ($t in $targets) {
    $out = Join-Path $dir ($t.Name + ".png")
    if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -Force }
    $prof = Join-Path $env:TEMP ("edge-shot-" + [guid]::NewGuid().ToString("N"))
    & $edge --headless=new --disable-gpu --hide-scrollbars --no-first-run `
      --disable-extensions --disable-sync `
      "--user-data-dir=$prof" --window-size=1280,900 --virtual-time-budget=8000 `
      "--screenshot=$out" ("http://localhost:3100" + $t.Path) 2>$null
    $waited = 0
    while (-not (Test-Path -LiteralPath $out) -and $waited -lt 20) {
      Start-Sleep -Milliseconds 500
      $waited++
    }
    if (Test-Path -LiteralPath $out) {
      Add-Content -LiteralPath $log -Value ("SHOT OK " + $t.Name + " " + (Get-Item -LiteralPath $out).Length) -Encoding UTF8
    } else {
      Add-Content -LiteralPath $log -Value ("SHOT FAIL " + $t.Name) -Encoding UTF8
    }
  }

  $checks = @(
    @{ Path = "/"; Text = "凌风的个人站" },
    @{ Path = "/"; Text = "最近在看" },
    @{ Path = "/bangumi"; Text = "共 35 部" },
    @{ Path = "/bangumi/27364"; Text = "冰菓" },
    @{ Path = "/blog/bingguo-ep4"; Text = "辉煌光荣的古籍部之昔日" },
    @{ Path = "/blog/bingguo-ep4"; Text = "剧透" },
    @{ Path = "/about"; Text = "本站是干嘛的" },
    @{ Path = "/stats"; Text = "成就墙" },
    @{ Path = "/stats"; Text = "最近 12 周" },
    @{ Path = "/stats"; Text = "最神速的一集" }
  )

  foreach ($c in $checks) {
    try {
      $html = (Invoke-WebRequest -UseBasicParsing -Uri ("http://localhost:3100" + $c.Path) -TimeoutSec 8).Content
      Add-Content -LiteralPath $log -Value ($c.Path + " contains [" + $c.Text + "]: " + $html.Contains($c.Text)) -Encoding UTF8
    } catch {
      Add-Content -LiteralPath $log -Value ($c.Path + " ERROR " + $_.Exception.Message) -Encoding UTF8
    }
  }

  try {
    $wp = Invoke-RestMethod -Uri "http://localhost:3100/api/wallpaper" -TimeoutSec 8
    Add-Content -LiteralPath $log -Value ("WALLPAPER " + ($wp | ConvertTo-Json -Compress)) -Encoding UTF8
  } catch {
    Add-Content -LiteralPath $log -Value ("WALLPAPER ERROR " + $_.Exception.Message) -Encoding UTF8
  }
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue
  Remove-Job $job -Force -ErrorAction SilentlyContinue
  Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess |
    Sort-Object -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  Add-Content -LiteralPath $log -Value "QA END" -Encoding UTF8
}
