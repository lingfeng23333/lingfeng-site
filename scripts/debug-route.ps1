$ErrorActionPreference = "Continue"

$wd = (Get-Location).Path
$dir = Join-Path $wd "shots"
$log = Join-Path $dir "debug-route.txt"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Set-Content -LiteralPath $log -Value "DEBUG START" -Encoding UTF8

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
  $script = @'
const res = await fetch("http://localhost:3100/api/bangumi/episodes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ subjectId: 27364, episodeId: 152243, type: 2 }),
});
console.log(res.status, await res.text());
'@
  $tmp = Join-Path $dir "debug-client.mjs"
  [System.IO.File]::WriteAllText($tmp, $script, (New-Object System.Text.UTF8Encoding($false)))
  $out = & node $tmp
  Add-Content -LiteralPath $log -Value ($out -join " ") -Encoding UTF8
} finally {
  Stop-Job $job -ErrorAction SilentlyContinue
  Remove-Job $job -Force -ErrorAction SilentlyContinue
  Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess |
    Sort-Object -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  Add-Content -LiteralPath $log -Value "DEBUG END" -Encoding UTF8
}
