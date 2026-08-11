$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$files = @(
  (Join-Path $root "components\Header.tsx"),
  (Join-Path $root "components\Footer.tsx"),
  (Join-Path $root "components\QuoteCard.tsx"),
  (Join-Path $root "components\PostCard.tsx"),
  (Join-Path $root "components\SubjectCard.tsx"),
  (Join-Path $root "components\ProgressBar.tsx"),
  (Join-Path $root "components\Spoiler.tsx"),
  (Join-Path $root "components\Wallpaper.tsx"),
  (Join-Path $root "app\page.tsx"),
  (Join-Path $root "app\blog\page.tsx"),
  (Join-Path $root "app\blog\[slug]\page.tsx"),
  (Join-Path $root "app\bangumi\page.tsx"),
  (Join-Path $root "app\bangumi\[id]\page.tsx"),
  (Join-Path $root "app\tags\page.tsx"),
  (Join-Path $root "app\tags\[tag]\page.tsx"),
  (Join-Path $root "app\archives\page.tsx"),
  (Join-Path $root "app\about\page.tsx"),
  (Join-Path $root "app\not-found.tsx")
)

$pairs = @(
  @("hover:text-accent-300", "hover:text-accent-700"),
  @("hover:border-accent-500/40", "hover:border-accent-500/60"),
  @("text-slate-200", "text-ink-700"),
  @("text-slate-300", "text-ink-700"),
  @("text-slate-400", "text-ink-500"),
  @("text-slate-500", "text-ink-400"),
  @("text-slate-600", "text-ink-400"),
  @("text-accent-300", "text-accent-600"),
  @("bg-accent-500/20", "bg-accent-500/10"),
  @("bg-accent-500/15", "bg-accent-500/10"),
  @("ring-accent-500/40", "ring-accent-500/30"),
  @("border-accent-500/40", "border-accent-500/30"),
  @("text-amber-300", "text-amber-600"),
  @("border-amber-400/30", "border-amber-300"),
  @("border-amber-400/20", "border-amber-200"),
  @("bg-amber-400/10", "bg-amber-50"),
  @("bg-amber-400/5", "bg-amber-50"),
  @("hover:bg-amber-400/20", "hover:bg-amber-100"),
  @("bg-amber-400/15", "bg-amber-100"),
  @("ring-amber-400/30", "ring-amber-300"),
  @("bg-white/5", "bg-paper-200"),
  @("bg-white/10", "bg-paper-200"),
  @("border-white/10", "border-paper-300"),
  @("border-white/15", "border-paper-300"),
  @("hover:border-white/20", "hover:border-accent-500/40"),
  @("divide-white/5", "divide-paper-300"),
  @("bg-night-950/70", "bg-white/75"),
  @("bg-night-800", "bg-paper-200"),
  @("hover:bg-white/5", "hover:bg-paper-200"),
  @("text-night-950", "text-white"),
  @("text-white", "text-ink-900")
)

$enc = New-Object System.Text.UTF8Encoding($false)

foreach ($file in $files) {
  if (-not (Test-Path -LiteralPath $file)) {
    Write-Output ("SKIP " + $file)
    continue
  }
  $text = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
  foreach ($pair in $pairs) {
    $text = $text.Replace($pair[0], $pair[1])
  }
  [System.IO.File]::WriteAllText($file, $text, $enc)
  Write-Output ("DONE " + $file)
}
