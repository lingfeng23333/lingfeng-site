$ErrorActionPreference = "Continue"

$wd = (Get-Location).Path
$log = Join-Path $wd "shots\verify.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $log) | Out-Null

$job = Start-Job -ScriptBlock {
  param($d)
  Set-Location $d
  npm.cmd run start -- -p 3100
} -ArgumentList $wd

try {
  Start-Sleep -Seconds 7

  $checks = @(
    @{ Path = "/"; Text = "凌风的个人站" },
    @{ Path = "/"; Text = "最近在看" },
    @{ Path = "/"; Text = "去追番" },
    @{ Path = "/bangumi"; Text = "共 35 部" },
    @{ Path = "/bangumi/27364"; Text = "冰菓" },
    @{ Path = "/bangumi/27364"; Text = "EP 4" },
    @{ Path = "/blog/bingguo-ep4"; Text = "EP04" },
    @{ Path = "/blog/bingguo-ep4"; Text = "辉煌光荣的古籍部之昔日" },
    @{ Path = "/blog/bingguo-ep4"; Text = "剧透" },
    @{ Path = "/about"; Text = "在看" }
  )

  foreach ($c in $checks) {
    try {
      $html = (Invoke-WebRequest -UseBasicParsing -Uri ("http://localhost:3100" + $c.Path) -TimeoutSec 8).Content
      Add-Content -LiteralPath $log -Value ($c.Path + " contains [" + $c.Text + "]: " + $html.Contains($c.Text))
    } catch {
      Add-Content -LiteralPath $log -Value ($c.Path + " ERROR " + $_.Exception.Message)
    }
  }

  $wp = Invoke-RestMethod -Uri "http://localhost:3100/api/wallpaper" -TimeoutSec 8
  Add-Content -LiteralPath $log -Value ("wallpaper=" + ($wp | ConvertTo-Json -Compress))
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue
  Remove-Job $job -Force -ErrorAction SilentlyContinue
  Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess |
    Sort-Object -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}
