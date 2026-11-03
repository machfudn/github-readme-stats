<div align="center">
  <img src="https://res.cloudinary.com/anuraghazra/image/upload/v1594908242/logo_ccswme.svg" width="100px" alt="GitHub Readme Stats Logo" />
  <h1>GitHub Readme Stats</h1>
  <p>Dynamically generate GitHub stats cards for your READMEs — built on <b>Cloudflare Pages Functions</b> and <b>Hono JS</b>.</p>

  <p>
    <a href="https://github.com/anuraghazra/github-readme-stats/actions"><img alt="Tests Passing" src="https://img.shields.io/github/actions/workflow/status/anuraghazra/github-readme-stats/test.yml?branch=master&label=Tests" /></a>
    <img alt="Runtime" src="https://img.shields.io/badge/Runtime-Cloudflare%20Pages%20Functions-F38020?logo=cloudflare" />
    <img alt="Framework" src="https://img.shields.io/badge/Framework-Hono%20JS-E36002?logo=hono" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript" />
    <a href="https://github.com/anuraghazra/github-readme-stats/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/anuraghazra/github-readme-stats" /></a>
  </p>
</div>

---

## Overview

**GitHub Readme Stats** generates customizable SVG cards displaying GitHub user statistics, top languages, pinned repositories, gists, and WakaTime coding activity directly inside markdown READMEs.

This edition runs on **Cloudflare Pages Functions** powered by **Hono** and **@hono/zod-openapi**:
- **Pure Serverless Edge Runtime**: Zero Node.js/Express overhead, instant cold starts, and distributed edge caching via Cloudflare network.
- **Interactive Swagger Documentation**: Built-in OpenAPI 3.0 schema and interactive UI available out of the box at `/ui` (or `/swagger`).
- **Dynamic URL Parameters with Fallbacks**: Customize any card on the fly using query parameters, or rely on instance-wide environment fallbacks (`GITHUB_USERNAME`, `README_THEME`, `README_LOCALE`, `CACHE_SECONDS`).
- **PAT Token Rotation**: Distribute API load across multiple Personal Access Tokens (`PAT_1`, `PAT_2`, etc.) to maximize GitHub GraphQL rate limits.

---

## Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Cards & Features](#cards--features)
  - [GitHub Stats Card](#github-stats-card)
  - [Top Languages Card](#top-languages-card)
  - [Repository Pin Card](#repository-pin-card)
  - [GitHub Gist Pin Card](#github-gist-pin-card)
  - [WakaTime Card](#wakatime-card)
- [Card Customization](#card-customization)
  - [Common Query Parameters](#common-query-parameters)
  - [Themes](#themes)
  - [Supported Locales](#supported-locales)
- [Dynamic URL Fallback System](#dynamic-url-fallback-system)
- [Deployment & Self-Hosting](#deployment--self-hosting)
  - [Deploy to Cloudflare Pages (Recommended)](#deploy-to-cloudflare-pages-recommended)
  - [Local Development with Wrangler](#local-development-with-wrangler)
- [Environment Variables](#environment-variables)
- [Acknowledgments](#acknowledgments)

---

## Quick Start

Embed dynamic stats in your GitHub profile or repository README using standard Markdown image syntax:

### Stats Card
```md
![GitHub Stats](https://<your-project>.pages.dev/api?username=yourusername&show_icons=true&theme=transparent)
```

### Top Languages Card
```md
![Top Languages](https://<your-project>.pages.dev/api/top-langs?username=yourusername&layout=compact&langs_count=8)
```

### Pinned Repository Card
```md
![Pinned Repo](https://<your-project>.pages.dev/api/pin?username=yourusername&repo=your-repo&theme=dracula)
```

> [!TIP]
> If your instance defines `GITHUB_USERNAME` or other defaults, you can omit `?username=` from URLs completely. For example, `https://<your-project>.pages.dev/api` will automatically render cards for that configured default user.

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api` | `GET` | Generates GitHub stats card SVG |
| `/api/pin` | `GET` | Generates pinned repository card SVG |
| `/api/top-langs` | `GET` | Generates top programming languages card SVG |
| `/api/wakatime` | `GET` | Generates WakaTime coding activity card SVG |
| `/api/gist` | `GET` | Generates pinned GitHub Gist card SVG |
| `/api/status/up` | `GET` | Instance health check and uptime status (JSON) |
| `/api/status/pat-info` | `GET` | GitHub PAT tokens rate-limit health check (JSON) |
| `/ui` or `/swagger` | `GET` | Interactive Swagger UI API documentation |
| `/doc` | `GET` | OpenAPI 3.0 specification JSON |
| `/health` or `/` | `GET` | Service readiness probe JSON |

---

## Cards & Features

### GitHub Stats Card

Displays total stars earned, commits, pull requests, issues opened, contributed repositories, and an overall activity percentile rank.

```md
![Stats Card](https://<your-project>.pages.dev/api?username=anuraghazra&show_icons=true&include_all_commits=true)
```

**Key Parameters**:
- `hide`: Comma-separated stats to exclude (`stars,commits,prs,issues,contribs`).
- `show`: Additional stats to display (`reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage`).
- `show_icons`: Enable icons next to stats (`true` / `false`).
- `include_all_commits`: Count lifetime commits instead of only the current year (`true` / `false`).
- `commits_year`: Filter commits for a specific year (e.g. `2024`).
- `hide_rank`: Hide the global rank circle (`true` / `false`).
- `rank_icon`: Select rank badge icon (`default`, `github`, or `percentile`).
- `number_format`: Number abbreviations (`short` for `1.2k` or `long` for `1,200`).

---

### Top Languages Card

Visualizes your most frequently used programming languages across public repositories.

```md
![Top Languages](https://<your-project>.pages.dev/api/top-langs?username=anuraghazra&layout=compact&langs_count=8)
```

**Key Parameters**:
- `layout`: Card visual style:
  - `normal`: Standard list with progress bars.
  - `compact`: Compact badges.
  - `donut`: Circular donut chart.
  - `donut-vertical`: Vertical stacked donut chart.
  - `pie`: Circular pie chart.
- `langs_count`: Number of top languages to display (1 to 20, default `5` or `6`).
- `hide`: Comma-separated languages to hide (e.g. `html,css`).
- `exclude_repo`: Comma-separated repository names to exclude from calculation.
- `hide_progress`: Hide progress percentages bar (`true` / `false`).
- `stats_format`: Display format (`percentages` or `bytes`).

---

### Repository Pin Card

Showcases any public GitHub repository with star count, forks, language indicator, and description.

```md
![Pinned Repo](https://<your-project>.pages.dev/api/pin?username=anuraghazra&repo=github-readme-stats&show_owner=true)
```

**Key Parameters**:
- `username`: Repository owner (defaults to `GITHUB_USERNAME` env if configured).
- `repo`: Repository name *(required)*.
- `show_owner`: Show the owner username alongside repo title (`true` / `false`).
- `description_lines_count`: Restrict description line clamp (1 to 3).

---

### GitHub Gist Pin Card

Pins public GitHub Gists onto your README.

```md
![Gist Card](https://<your-project>.pages.dev/api/gist?id=bbfce31e0217a3689c8d961a356cb10d)
```

**Key Parameters**:
- `id`: GitHub Gist ID *(required)*.
- `show_owner`: Show gist creator username (`true` / `false`).

---

### WakaTime Card

Embeds coding statistics from your public [WakaTime](https://wakatime.com) profile.

```md
![WakaTime Stats](https://<your-project>.pages.dev/api/wakatime?username=anuraghazra&layout=compact)
```

> [!NOTE]
> WakaTime profile must have both `Display code time publicly` and `Display languages, editors, os, categories publicly` toggled on.

**Key Parameters**:
- `username`: WakaTime username.
- `layout`: Display layout (`default` or `compact`).
- `range`: Time period (e.g. `last_7_days`, `last_30_days`, `all_time`).
- `api_domain`: Custom backend domain for compatible self-hosted alternatives like [Wakapi](https://github.com/muety/wakapi).

---

## Card Customization

### Common Query Parameters

Every card endpoint supports consistent visual styling parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `theme` | string | `default` | Theme name from built-in themes |
| `title_color` | string | `2f80ed` | Title text hex color (without `#`) |
| `text_color` | string | `434d58` | Body label hex color |
| `icon_color` | string | `4c71f2` | Icon hex color |
| `border_color` | string | `e4e2e2` | Card border hex color |
| `bg_color` | string | `fffefe` | Background hex color or gradient |
| `hide_border` | boolean | `false` | Disable outer border stroke |
| `border_radius` | number | `4.5` | Corner rounding radius in px |
| `locale` | string | `en` | Translation language code |
| `cache_seconds` | number | *card default* | CDN cache header duration (clamped by server limits) |
| `custom_title` | string | *default title* | URL-encoded custom heading |
| `disable_animations`| boolean | `false` | Disable CSS animations in rendered SVG |

#### Background Gradient Syntax
Provide an angle and comma-separated hex stops in `bg_color`:
```
&bg_color=45,000000,130f40
```

---

### Themes

Choose from 30+ pre-designed palettes including `transparent`, `dark`, `radical`, `tokyonight`, `dracula`, `onedark`, `gruvbox`, `monokai`, and `catppuccin`.

```md
![Transparent Theme](https://<your-project>.pages.dev/api?username=anuraghazra&theme=transparent)
```

See [themes/README.md](themes/README.md) for full visual previews of each built-in theme.

---

### Supported Locales

Cards support over 35 languages via `&locale=<code>`:

| Code | Language | Code | Language | Code | Language | Code | Language |
|---|---|---|---|---|---|---|---|
| `en` | English | `id` | Indonesian | `es` | Spanish | `fr` | French |
| `de` | German | `ja` | Japanese | `cn` | Chinese | `zh-tw` | Chinese (Taiwan) |
| `kr` | Korean | `ru` | Russian | `pt-br` | Portuguese (BR) | `it` | Italian |
| `hi` | Hindi | `ar` | Arabic | `nl` | Dutch | `tr` | Turkish |
| `pl` | Polish | `vi` | Vietnamese | `uk-ua` | Ukrainian | `cs` | Czech |

---

## Dynamic URL Fallback System

When hosting your own instance, card endpoints dynamically fallback to configured environment variables if a parameter is omitted from the URL query string:

| URL Query Parameter | Environment Fallback Variable | Behavior |
|---|---|---|
| `?username=...` | `GITHUB_USERNAME` | If omitted in URL, uses default instance user. URL value overrides env. |
| `?theme=...` | `README_THEME` | Applies default card theme; URL value overrides env. |
| `?locale=...` | `README_LOCALE` | Sets default localization language; URL value overrides env. |
| `?include_all_commits=...` | `README_INCLUDE_ALL_COMMITS` | Default commit counting scope (`true`/`false`). |
| `?langs_count=...` | `README_LANGS_COUNT` | Default top languages count. |
| `?cache_seconds=...` | `CACHE_SECONDS` | Cache TTL duration. |
| `?exclude_repo=...` | `EXCLUDE_REPO` | Excluded repositories from URL are merged with instance excluded list. |

> [!CAUTION]
> **Security Boundaries**: Personal Access Tokens (`PAT_1`, `PAT_2`, etc.), authorization whitelists (`WHITELIST`, `GIST_WHITELIST`), and resource-intensive flags (`FETCH_MULTI_PAGE_STARS`) **cannot** be modified via URL query parameters. They remain strictly protected server-side secrets to safeguard your GitHub API limits and prevent unauthorized access.

---

## Deployment & Self-Hosting

### Deploy to Cloudflare Pages (Recommended)

1. **Fork this repository** to your personal GitHub account.
2. Sign in to the **[Cloudflare Dashboard](https://dash.cloudflare.com/)** and navigate to **Workers & Pages > Create application > Pages > Connect to Git**.
3. Select your forked repository and click **Begin setup**.
4. Configure build parameters:
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `public`
5. Configure Environment Variables & Secrets:
   - **Encrypted Secrets**:
     - `PAT_1` *(Required)*: Your GitHub Personal Access Token. Add `PAT_2`, `PAT_3`, etc. for round-robin rotation across multiple tokens.
   - **Plain Environment Variables** (configured in Cloudflare Pages settings or `wrangler.toml [vars]`):
     - `GITHUB_USERNAME`: Default username for your cards.
     - `README_THEME`: Default card theme (e.g. `transparent`).
     - `README_LOCALE`: Default language code (e.g. `en`).
     - `CACHE_SECONDS`: Custom cache TTL in seconds (e.g. `3600`).
6. Click **Save and Deploy**. Your instance will be live at `https://<your-project>.pages.dev` with full Swagger docs accessible at `/ui`.

---

### Local Development with Wrangler

You can run and test the complete Cloudflare Pages Functions app locally using Wrangler:

1. **Clone repository & install dependencies**:
   ```bash
   git clone https://github.com/anuraghazra/github-readme-stats.git
   cd github-readme-stats
   npm install
   ```

2. **Configure local secrets**:
   Create a `.dev.vars` file in the root directory (ignored by git):
   ```ini
   PAT_1=ghp_yourPersonalAccessTokenHere
   ```

3. **Start local dev server**:
   ```bash
   npm run dev
   # or
   npm start
   ```
   Wrangler will launch the Pages dev server at `http://127.0.0.1:8788`.

4. **Verify endpoints in browser**:
   - `http://127.0.0.1:8788/ui` — Interactive Swagger UI
   - `http://127.0.0.1:8788/api` — Default user stats card
   - `http://127.0.0.1:8788/health` — JSON health check

5. **Run test suite**:
   ```bash
   npm test
   ```

---

## Environment Variables

| Variable | Secret? | Default | Description |
|---|---|---|---|
| `PAT_1` | **Yes (Secret)** | *None* | GitHub Personal Access Token (classic or fine-grained with `repo`, `read:user` scopes). |
| `PAT_2` ... `PAT_N` | **Yes (Secret)** | *None* | Additional GitHub PATs for load-balanced round-robin rotation. |
| `GITHUB_USERNAME` | No (Variable) | *None* | Default GitHub username applied when `?username=` is omitted from request. |
| `README_THEME` | No (Variable) | `default` | Default theme applied when `?theme=` is omitted. |
| `README_LOCALE` | No (Variable) | `en` | Default localization language code. |
| `README_INCLUDE_ALL_COMMITS` | No (Variable) | `false` | Set to `true` to count lifetime commits by default. |
| `README_LANGS_COUNT` | No (Variable) | `5` / `6` | Default number of languages shown in top-languages cards. |
| `CACHE_SECONDS` | No (Variable) | *Card default* | Global cache lifetime in seconds (e.g. `3600` for 1 hour). |
| `WHITELIST` | No (Variable) | *None* | Comma-separated list of allowed GitHub usernames (restricts public usage). |
| `GIST_WHITELIST` | No (Variable) | *None* | Comma-separated list of allowed Gist IDs. |
| `EXCLUDE_REPO` | No (Variable) | *None* | Comma-separated list of repository names to hide from all cards. |
| `FETCH_MULTI_PAGE_STARS` | No (Variable) | `false` | Enable multi-page GraphQL star fetching for users with >100 repos. |

---

## Acknowledgments

Special thanks to **[Anurag Hazra](https://github.com/anuraghazra)**, the original creator of **[github-readme-stats](https://github.com/anuraghazra/github-readme-stats)**, whose vision and open-source contributions created one of the most beloved tools in the developer ecosystem.

We also thank all the contributors, translators, and community members who have continuously enriched themes, localization, and features.
