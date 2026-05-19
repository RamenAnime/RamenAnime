# GitHub profile and private repo

Your GitHub username (`RamenAnime`) matches the app repository name (`RamenAnime/RamenAnime`). GitHub uses that repo's root `README.md` as your **profile README** while the repo is **public**.

After you make the app repo **private**, that profile README disappears. Use the public portfolio repo instead.

## Quick links

- **Portfolio (public):** [github.com/RamenAnime/RamenAnime-Portfolio](https://github.com/RamenAnime/RamenAnime-Portfolio)
- **Copy-paste bio and pin instructions:** [RamenAnime-Portfolio/GITHUB_PROFILE.md](../RamenAnime-Portfolio/GITHUB_PROFILE.md)
- **Make app private:** [RamenAnime settings → Danger zone](https://github.com/RamenAnime/RamenAnime/settings#danger-zone)

## Local development after privatizing

Making the repo private does **not** block local development as long as:

1. This project stays cloned on your machine (e.g. `RamenAnime` folder).
2. Git remotes still use your GitHub login (HTTPS or SSH) with permission to push.

You push when ready; CI still runs on GitHub if Actions are enabled on the private repo.

**HTTPS push and workflow files:** If `git push` is rejected for `.github/workflows/`, update your GitHub personal access token to include the **workflow** scope, or push with an SSH key that has write access to this repository.

## Submodule

`RamenAnime-Portfolio/` is a Git submodule. Update it after portfolio changes:

```bash
cd RamenAnime-Portfolio && git pull origin main && cd ..
git add RamenAnime-Portfolio && git commit -m "chore: bump portfolio submodule" && git push
```
