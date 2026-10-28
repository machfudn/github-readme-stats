# Self-Hosting GitHub Readme Stats (fork `machfudn`)

This document explains how to run the `machfudn/github-readme-stats` fork on Vercel with a GitHub token, including counting private repositories as **aggregate numbers** and generating a README snippet automatically.

> [!WARNING]
> Private statistics become **public information** when a card is embedded in a public README. Anyone can see the total number of commits, stars, pull requests, issues, repositories, and languages. Do not embed `/api/pin` for private repositories because that card shows the repository name and description. Use only `/api` and `/api/top-langs/` for aggregate data.

## 1. Architecture and privacy warning

The flow is:

```text
Public README
   -> <img src="https://your-domain/api?...">
   -> GitHub Camo (image proxy and cache)
   -> Vercel Function (/api, /api/top-langs/, /api/pin/)
   -> GitHub API with PAT_1
   -> SVG containing aggregate numbers
```

- Main endpoints: `/api` (stats), `/api/top-langs/` (languages), `/api/pin/` (repository card). There is no database; responses are cached through HTTP headers and GitHub Camo.
- `GITHUB_USERNAME` lets you omit `?username=` on all three endpoints. `WHITELIST` restricts usernames, but it does not restrict repository names on `/api/pin/`.

**Privacy:** with a classic PAT that has the `repo` scope, private repositories are included in the aggregate. This gives more complete numbers, but those numbers become publicly visible if the card is embedded. Never display the name or description of a private repository. The `/api/pin/` endpoint has no per-repository access control; anyone who knows a repository name can request its card. If you do not need it, do not publish the pin route, or block it with Vercel Firewall.

## 2. Prerequisites

- Node.js **>= 22** (this repo uses an `.nvmrc` containing `22`), npm, and Git.
- A GitHub account (`machfudn`) and a Vercel account connected to GitHub.
- A classic Personal Access Token (PAT) from the GitHub account.

## 3. Fork and push

1. Open `https://github.com/anuraghazra/github-readme-stats`.
2. Click **Fork** and choose the `machfudn` owner to create `https://github.com/machfudn/github-readme-stats`.
3. From this local project folder, make sure the remote points to your fork, then push the `master` branch.

```powershell
git remote -v
# If origin still points to anuraghazra, change it to your fork:
git remote set-url origin https://github.com/machfudn/github-readme-stats.git
git push -u origin master
```

If the fork has not been created yet, click **Fork** first; the push will fail if the destination repository does not exist. Do not commit `.env` or any token to the repository.

## 4. Create a classic PAT

Use a **classic token**, not a fine-grained token, because fine-grained tokens do not count private commits completely.

1. Open **GitHub Settings -> Developer settings -> Personal access tokens -> Tokens (classic)**.
2. Click **Generate new token (classic)**.
3. Give it a name, for example `grs-machfudn-vercel`.
4. Choose a limited expiration, for example 90 days, and set a rotation reminder.
5. Select `repo` (required for private repositories) and `read:user` (profile data).
6. Generate the token and copy it once. Store it only in a password manager.

| Token type | Private commits | Used in this guide |
| --- | --- | --- |
| Classic `repo` + `read:user` | Yes | Yes |
| Fine-grained | No (public commits only) | No |

Never put a token in a README, issue, screenshot, chat message, or Git commit. A classic token with `repo` has broad access, so treat it like a password.

## 5. Local `.env` configuration

Copy `.env.example` to `.env` in the project root (the file is already covered by `.gitignore`), then adjust it. Full example:

```dotenv
# Required: token, username fallback, and whitelist
PAT_1=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=machfudn
WHITELIST=machfudn
# Public instance URL; fill this in after deployment, WITHOUT a trailing slash.
# For temporary local testing you can use: http://localhost:9000
SITE_URL=https://github-readme-stats-machfudn.vercel.app
# Optional runtime settings
CACHE_SECONDS=21600
FETCH_MULTI_PAGE_STARS=true
EXCLUDE_REPO=
# Optional README generator settings
README_THEME=transparent
README_LOCALE=en
README_INCLUDE_ALL_COMMITS=true
README_LANGS_COUNT=8
```

| Variable | Required | Description |
| --- | --- | --- |
| `PAT_1` | Yes | Classic token for the GitHub API. Without it, the card shows an error. |
| `GITHUB_USERNAME` | Yes | Fallback when `?username=` is omitted. Set it to `machfudn`. |
| `WHITELIST` | Yes on Vercel | Only `machfudn` may use your instance and token. |
| `SITE_URL` | Yes for the generator | Production domain, without a trailing `/`. |
| `CACHE_SECONDS`, `FETCH_MULTI_PAGE_STARS`, `EXCLUDE_REPO` | No | Cache, multi-page stars, and repositories excluded from stars/top-langs; `EXCLUDE_REPO` does not reduce the total commit count. |
| `README_*` | No | Read only by the README generator: theme, locale, all commits, and language count. |

Notes:

- **`SITE_URL` must not have a trailing slash.** Correct: `https://github-readme-stats-machfudn.vercel.app`; incorrect: `.../`.
- `EXCLUDE_REPO` uses repository names only, for example `EXCLUDE_REPO=heavy-repo,other-repo` (comma-separated). It only affects stars and top-langs, not the total commit count.
- On Vercel, set variables through the dashboard. After changing `.env`, restart `node express.js`; after changing Vercel environment variables, redeploy.

## 6. Local testing

```powershell
npm install
node express.js
```

The server listens on port `9000`. Open the following URLs **without `?username=`** to verify the `GITHUB_USERNAME` fallback:

- `http://localhost:9000/api`
- `http://localhost:9000/api/top-langs/`
- Optional, public repositories only: `http://localhost:9000/api/pin/?repo=github-readme-stats`

Open them in a browser or with `Start-Process "http://localhost:9000/api"`. If the card shows `machfudn` data, the fallback is working. If `PAT_1` is not set, the card shows **`No GitHub API tokens found`**; that is expected. If the variable exists but is empty or expired, fill in or rotate the token, then restart the server.

## 7. Deploy to Vercel

1. In Vercel, click **Add New... -> Project**.
2. Import the `machfudn/github-readme-stats` repository.
3. Keep the default settings; Vercel detects the functions in the `api/` folder. No custom build command is required.
4. Open **Settings -> Environment Variables**, then add these for **Production**:

| Name | Value |
| --- | --- |
| `PAT_1` | your classic token (store it as a secret) |
| `WHITELIST` | `machfudn` |
| `GITHUB_USERNAME` | `machfudn` |
| `SITE_URL` | production domain, without a trailing slash |
| `CACHE_SECONDS` | `21600` |
| `FETCH_MULTI_PAGE_STARS` | `true` |
| `EXCLUDE_REPO` | optional, comma-separated repository names |

5. Deploy. After you receive a domain such as `https://github-readme-stats-machfudn.vercel.app`, set `SITE_URL` to that domain (or your custom domain).
6. **Redeploy** after adding or changing environment variables. New values do not apply to an existing deployment.
7. Test production without the username parameter:

```text
https://YOUR-DOMAIN/api
https://YOUR-DOMAIN/api/top-langs/
```

If you use Preview Deployments, add the same variables to the Preview environment. For production, make sure the **Production** values are the ones in use. Do not enable Vercel Authentication/Deployment Protection on the card URL, because GitHub cannot fetch images from a protected deployment.

## 8. Generate the README snippet

Make sure `.env` contains `SITE_URL` and the desired `README_*` variables. Run:

```powershell
npm run readme:snippet
```

The command prints a Markdown/HTML block to the terminal. Short example:

```markdown
<!-- github-readme-stats:start -->
<a href="https://github.com/machfudn"><img height="180" align="center" src="https://github-readme-stats-machfudn.vercel.app/api?show_icons=true&theme=transparent&locale=en&include_all_commits=true" alt="GitHub Stats machfudn" /></a>
<a href="https://github.com/machfudn?tab=repositories"><img height="180" align="center" src="https://github-readme-stats-machfudn.vercel.app/api/top-langs/?layout=compact&langs_count=8&theme=transparent&locale=en" alt="Top Languages machfudn" /></a>
<!-- github-readme-stats:end -->
```

To write directly to a file:

```powershell
node scripts/print-readme.mjs --write PROFILE_README.md
```

`--write` inserts the block between the `github-readme-stats:start/end` markers. If the markers already exist, only that block is replaced, so the rest of the README stays safe.

> [!WARNING]
> Do not overwrite the project's official `readme.md` with the generator output. Write to a separate file such as `PROFILE_README.md` or `README.cards.md`, then copy the block into the `machfudn/machfudn` profile repository README. Review the file before committing.

## 9. Display customization

Parameters are added to the query string. The examples use `https://github-readme-stats-machfudn.vercel.app`; replace it with your own domain.

| Need | Parameter | Example value |
| --- | --- | --- |
| Theme | `theme` | `radical`, `tokyonight`, `dark`, `transparent` |
| Card language | `locale` | `en`, `id`, `es`, `ja` |
| Hide stats | `hide` | `issues,prs` |
| Show extra stats | `show` | `reviews,prs_merged` |
| Icons | `show_icons` | `true` |
| Custom title | `custom_title` | `Machfud%27s%20Stats` |
| All commits | `include_all_commits` | `true` |
| Language layout | `layout` | `compact`, `donut`, `donut-vertical`, `pie` |
| Language count | `langs_count` | `1` to `20` |
| Hide border | `hide_border` | `true` |
| Card width | `card_width` | `400` |

Example URLs:

```text
https://github-readme-stats-machfudn.vercel.app/api?show_icons=true&theme=tokyonight&locale=en&include_all_commits=true&hide=issues
https://github-readme-stats-machfudn.vercel.app/api/top-langs/?layout=compact&langs_count=8&theme=tokyonight&locale=en&custom_title=Top%20Languages
https://github-readme-stats-machfudn.vercel.app/api/pin/?repo=github-readme-stats&theme=tokyonight
```

The last example is for **public** repositories only. Do not use `/api/pin/` for private repositories.

The full theme list is in `themes/README.md`; the locale list is in the **Available locales** section of `readme.md`. For themes that follow GitHub's dark/light mode, append `#gh-dark-mode-only` or `#gh-light-mode-only` to the image URL.

## 10. Security and privacy

- **`WHITELIST=machfudn` is required on Vercel.** Without a whitelist, anyone can use your instance and token quota for other usernames. The whitelist does not hide `machfudn`'s public statistics; embedded cards remain public.
- Do not commit `.env`. Verify with `git check-ignore -v .env`; the file is already listed in `.gitignore`.
- Use a dedicated token with a limited lifetime and rotate it before expiration. If it leaks: **revoke it immediately**, create a new token, update `PAT_1` on Vercel, then redeploy.
- Do not use `/api/pin/` for private repositories. This route exposes the repository name and description, and third-party caches may store them.
- `CACHE_SECONDS=21600` reduces GitHub requests but also delays updates. GitHub Camo's cache may keep an old image visible after the README changes.
- The card deployment must be publicly accessible so GitHub can fetch images. The main protection is therefore data aggregation and the whitelist, not a secret URL.

## 11. Troubleshooting

| Symptom | Common cause | Solution |
| --- | --- | --- |
| `No GitHub API tokens found` | `PAT_1` is empty, misnamed, or `.env` is not being read | Set `PAT_1`, restart the server; on Vercel add the variable and redeploy. |
| `Missing param: username` | `GITHUB_USERNAME` is empty or the deployment is stale | Set the variable, restart/redeploy; temporarily add `?username=machfudn`. |
| `Downtime due to GitHub API rate limiting` | GitHub API quota exhausted | Wait, increase the cache, reduce `FETCH_MULTI_PAGE_STARS`, or use another token. |
| Private numbers are low or zero | The profile does not allow private contributions | Enable **Include private contributions on my profile** in GitHub profile settings. |
| Private commits still do not appear | A fine-grained token is being used | Switch to a classic PAT with `repo` + `read:user` scopes. |
| Vercel environment variables have no effect | Variables only apply to new deployments | Redeploy the **Production** environment; saving the variable alone is not enough. |
| Snippet link/image is wrong | `SITE_URL` is wrong, uses a preview domain, or has a trailing slash | Fix it to the production domain without `/`, then regenerate the snippet; redeploy if the Vercel environment variable changed. |
| Card still shows old data | `CACHE_SECONDS` or GitHub Camo cache | Wait for the cache to expire, lower `CACHE_SECONDS`, then redeploy. |
| `This username is not whitelisted` | A username other than `machfudn` was requested | Remove `?username=`, or adjust `WHITELIST` if you really need another user. |

If a card shows an error, open the URL directly in a browser (not only through the README) to see the SVG message. GitHub Camo sometimes hides the original error.

## 12. Upstream notes and migration

The `anuraghazra/github-readme-stats` repository is **no longer maintained**. The upstream README points to an active successor:

- **GitHub Stats Extended:** `https://github.com/stats-organization/github-stats-extended` — an alternative action is available at `stats-organization/github-readme-stats-action`.

The public upstream instance is also not recommended for production or private data. This fork remains usable, but it does not receive regular security patches.

Migration steps to GitHub Stats Extended:

1. Fork/deploy `stats-organization/github-stats-extended` to a new Vercel project.
2. Copy the same environment variables: `PAT_1`, `WHITELIST`, `GITHUB_USERNAME` (if supported), `CACHE_SECONDS`, `FETCH_MULTI_PAGE_STARS`, and `EXCLUDE_REPO`.
3. Test `/api?username=machfudn`, `/api/top-langs/`, and pin for public repositories.
4. Change the domain in the README snippet. The `/api`, `/api/top-langs/`, and `/api/pin/` paths are compatible, so usually only the host changes.
5. Once confirmed, revoke the old token and remove the old deployment.

Local changes such as the `GITHUB_USERNAME` fallback and `scripts/print-readme.mjs` are additions from this fork. The successor may not have the same fallback behavior; after migrating, use `?username=machfudn` explicitly if needed. Back up local changes before moving the repository.
