# Copy Slack automation to all RamenAnime repos (sibling folders under your user directory).
$bundleRoot = Join-Path $PSScriptRoot "bundle"
$parent = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$repos = @(
  (Join-Path $parent "RamenAnime"),
  (Join-Path $parent "mcp-arch"),
  (Join-Path $parent "A.E.T.H.E.R-AI"),
  (Join-Path $parent "RamenAnime-Portfolio")
)

$files = @(
  "scripts\slack-post.mjs",
  "scripts\project-health.mjs",
  "workflows\slack-ci-notify.yml",
  "workflows\slack-health-review.yml",
  "workflows\slack-enhancement-continue.yml"
)

foreach ($repoPath in $repos) {
  if (-not (Test-Path $repoPath)) {
    Write-Warning "Skip missing: $repoPath"
    continue
  }
  foreach ($f in $files) {
    $src = Join-Path $bundleRoot $f
    $dest = Join-Path $repoPath ".github" $f
    $destDir = Split-Path $dest -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item $src $dest -Force
  }
  Write-Host "Synced: $repoPath"
}

Write-Host "Done. Set organization secret SLACK_WEBHOOK_URL for all repos."
