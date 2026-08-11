$ErrorActionPreference = "Stop"

$log = Join-Path (Get-Location).Path "shots\gh.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $log) | Out-Null
Set-Content -LiteralPath $log -Value "GH START" -Encoding UTF8

$lines = "protocol=https`nhost=github.com`n`n" | git credential fill
$pass = ($lines | Where-Object { $_ -like 'password=*' }) -replace '^password=',''
if (-not $pass) {
  Add-Content -LiteralPath $log -Value "NO_CRED" -Encoding UTF8
  exit 1
}

$h = @{
  Authorization = "Bearer $pass"
  "User-Agent" = "codex"
  "X-GitHub-Api-Version" = "2022-11-28"
}

$repo = "lingfeng23333/lingfeng-site"

$key = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/actions/secrets/public-key" -Headers $h -TimeoutSec 30
Add-Content -LiteralPath $log -Value ("KEY_ID " + $key.key_id) -Encoding UTF8

$env:GH_PUBLIC_KEY = $key.key
$env:GH_SECRET_VALUE = $env:BANGUMI_TOKEN
if (-not $env:GH_SECRET_VALUE) {
  Add-Content -LiteralPath $log -Value "NO_TOKEN_ENV" -Encoding UTF8
  exit 1
}
$enc = (& node (Join-Path (Get-Location).Path "scripts\gh-encrypt.mjs")) | Select-Object -Last 1
Add-Content -LiteralPath $log -Value ("ENC_LEN " + $enc.Length) -Encoding UTF8

$body = @{ encrypted_value = $enc; key_id = $key.key_id } | ConvertTo-Json
try {
  Invoke-RestMethod -Method Put -Uri "https://api.github.com/repos/$repo/actions/secrets/BANGUMI_TOKEN" -Headers $h -ContentType "application/json" -Body $body -TimeoutSec 30 | Out-Null
  Add-Content -LiteralPath $log -Value "SECRET_SET_OK" -Encoding UTF8
} catch {
  Add-Content -LiteralPath $log -Value ("SECRET_SET_FAIL " + $_.Exception.Message) -Encoding UTF8
  exit 1
}

$list = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/actions/secrets" -Headers $h -TimeoutSec 30
Add-Content -LiteralPath $log -Value ("SECRET_LIST " + (($list.secrets | ForEach-Object { $_.name }) -join ",")) -Encoding UTF8

try {
  Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$repo/actions/workflows/sync.yml/dispatches" -Headers $h -ContentType "application/json" -Body '{"ref":"main"}' -TimeoutSec 30 | Out-Null
  Add-Content -LiteralPath $log -Value "DISPATCH_OK" -Encoding UTF8
} catch {
  Add-Content -LiteralPath $log -Value ("DISPATCH_FAIL " + $_.Exception.Message) -Encoding UTF8
  exit 1
}

Start-Sleep -Seconds 10
$deadline = (Get-Date).AddMinutes(10)
$done = $false

while ((Get-Date) -lt $deadline -and -not $done) {
  $runs = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/actions/runs?per_page=5&event=workflow_dispatch" -Headers $h -TimeoutSec 30
  if ($runs.total_count -gt 0) {
    $run = $runs.workflow_runs[0]
    Add-Content -LiteralPath $log -Value ("RUN " + $run.id + " status=" + $run.status + " conclusion=" + $run.conclusion) -Encoding UTF8
    if ($run.status -eq "completed") {
      $done = $true
      Add-Content -LiteralPath $log -Value ("RESULT " + $run.conclusion) -Encoding UTF8
    }
  } else {
    Add-Content -LiteralPath $log -Value "NO_RUN_YET" -Encoding UTF8
  }
  if (-not $done) {
    Start-Sleep -Seconds 15
  }
}

Add-Content -LiteralPath $log -Value "GH END" -Encoding UTF8
