$ErrorActionPreference = "Continue"

$wd = (Get-Location).Path
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
    $out = Join-Path $dir ($t.Name + ".html")
    $prof = Join-Path $env:TEMP ("edge-dom-" + [guid]::NewGuid().ToString("N"))
    $dom = & $edge --headless=new --disable-gpu --no-first-run `
      "--user-data-dir=$prof" --virtual-time-budget=6000 --dump-dom `
      ("http://localhost:3100" + $t.Path) 2>$null
    [System.IO.File]::WriteAllText(
      $out,
      ($dom -join "`n"),
      [System.Text.Encoding]::UTF8
    )
    Write-Output ("DOM " + $t.Name + " " + (Get-Item -LiteralPath $out).Length)
  }
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue
  Remove-Job $job -Force -ErrorAction SilentlyContinue
  Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess |
    Sort-Object -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}
