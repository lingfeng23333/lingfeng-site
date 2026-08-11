$ErrorActionPreference = "Continue"

$wd = (Get-Location).Path
$dir = Join-Path $wd "shots"
$log = Join-Path $dir "reverse.txt"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Set-Content -LiteralPath $log -Value "REVERSE TEST START" -Encoding UTF8

$job = Start-Job -ScriptBlock {
  param($d)
  Set-Location $d
  $env:BANGUMI_TOKEN = "IV8dlBlQFzJPOtIp9VxzIs8xj9ocevgw8lnzAiUG"
  $env:HTTPS_PROXY = "http://127.0.0.1:7890"
  $env:HTTP_PROXY = "http://127.0.0.1:7890"
  $env:NODE_USE_ENV_PROXY = "1"
  npm.cmd run start -- -p 3100
} -ArgumentList $wd

try {
  Start-Sleep -Seconds 7

  $body = @{ subjectId = 27364; episodeId = 152243; type = 2 } | ConvertTo-Json
  try {
    $r = Invoke-RestMethod -Method Post -Uri "http://localhost:3100/api/bangumi/episodes" `
      -ContentType "application/json" -Body $body -TimeoutSec 20
    Add-Content -LiteralPath $log -Value ("OK " + ($r | ConvertTo-Json -Compress)) -Encoding UTF8
  } catch {
    $detail = ""
    if ($_.ErrorDetails) { $detail = $_.ErrorDetails.Message }
    Add-Content -LiteralPath $log -Value ("OK-ERR " + $_.Exception.Message + " | " + $detail) -Encoding UTF8
  }

  try {
    Invoke-RestMethod -Method Post -Uri "http://localhost:3100/api/bangumi/episodes" `
      -ContentType "application/json" -Body '{"subjectId":1}' -TimeoutSec 10 | Out-Null
    Add-Content -LiteralPath $log -Value "BAD unexpected success" -Encoding UTF8
  } catch {
    Add-Content -LiteralPath $log -Value ("BAD status=" + [int]$_.Exception.Response.StatusCode) -Encoding UTF8
  }

  $html = (Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3100/bangumi/27364" -TimeoutSec 10).Content
  Add-Content -LiteralPath $log -Value ("PAGE has 取消已看: " + $html.Contains("取消已看")) -Encoding UTF8
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue
  Remove-Job $job -Force -ErrorAction SilentlyContinue
  Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess |
    Sort-Object -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  Add-Content -LiteralPath $log -Value "REVERSE TEST END" -Encoding UTF8
}
