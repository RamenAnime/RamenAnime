# Slack automation for all RamenAnime repositories

Applies to every repo under https://github.com/RamenAnime:

| Repository | Purpose |
|------------|---------|
| **RamenAnime** | Main marketplace app |
| **MCP-Arch** | Kyoto Learn OS installer |
| **A.E.T.H.E.R-AI** | Local AI assistant (Python) |
| **RamenAnime-Portfolio** | Public portfolio / profile docs |

Each repo includes:

- `slack-ci-notify.yml` - Slack message after **CI** passes or fails
- `slack-health-review.yml` - Weekly health scan + **stopping point** (Slack + GitHub issue)
- `slack-enhancement-continue.yml` - Runs after you comment `/approve-continue`

---

## One-time Slack setup

1. https://api.slack.com/apps → Create app → **Incoming Webhooks** → add to a channel.
2. GitHub → **RamenAnime** organization (recommended) → **Settings** → **Secrets and variables** → **Actions** → **New organization secret**
   - Name: `SLACK_WEBHOOK_URL`
   - Value: your webhook URL
   - Repository access: **All repositories**

Or add the same secret on each repo individually.

---

## Stopping points

| Phase | What happens | Your action |
|-------|----------------|-------------|
| 1 | Health checks run; Slack + issue created | Read report |
| 2 | You comment `/approve-continue` | Enhancement suggestions posted |
| 3 | You implement in Cursor / open PR | Full control |

No automatic commits.

---

## Commands on auto-created issues

- `/approve-continue` - run enhancement review
- `/stop` - done with this cycle

---

## Re-sync files to all repos (local)

From a machine with all repos cloned as siblings under your user folder:

```powershell
powershell -File "RamenAnime\.github\repo-automation\sync-slack-bundle.ps1"
```

(Fix paths in the script if your layout differs.)

---

## Add a new repository later

Copy into the new repo:

```
.github/scripts/slack-post.mjs
.github/scripts/project-health.mjs
.github/workflows/slack-ci-notify.yml
.github/workflows/slack-health-review.yml
.github/workflows/slack-enhancement-continue.yml
```

Ensure a workflow named **CI** exists (`name: CI` in `ci.yml` or `main.yml`).

Add org secret access for the new repo.

---

## Optional: Cursor cloud agent

Add `CURSOR_API_KEY` and a second approval command (`/approve-apply`) before any auto-PR (not enabled by default).
