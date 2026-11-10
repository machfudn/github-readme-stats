# DESIGN.md - GitHub Readme Stats Workbench

## Reading & Dials
- Surface mode: **Operate + Read** (developer playground and live API reference).
- Visual world: **Neobrutalism Dual-Mode** (high-contrast tactile workbench with light/dark parity).
- Dials: **ENERGY 2 / RHYTHM 2 / MOTION 1**.
- Identity motif: crisp `2px` ink borders paired with hard `4px 4px 0` offset shadows on primary action controls and elevated workbench panels, shifting `2px, 2px` on `:active`.

## Color Tokens (WCAG AA Verified)
Palette capped at neutral base + ink + secondary surface + 1 signature accent (`#FFD23F`), plus semantic feedback tones (`ok`, `err`).

### Light Mode (Warm Paper)
- `--bg`: `#F6F3EA` (canvas)
- `--surface`: `#FFFFFF` (primary cards, inputs, panels)
- `--surface-2`: `#EAE4D3` (secondary controls, table heads, preview toolbar)
- `--ink`: `#121212` (primary text & borders; contrast `16.88:1` on `--bg`, `18.73:1` on `--surface`)
- `--muted`: `#4A4A45` (secondary text; contrast `8.91:1` on `--surface`, `8.03:1` on `--bg`)
- `--accent`: `#FFD23F` (`--accent-ink`: `#121212`, contrast `12.97:1`)
- `--link`: `#1442CC` (contrast `7.83:1` on `--surface`)
- `--ok`: `#11633B` (contrast `7.31:1` on `--surface`)
- `--err`: `#B42318` (contrast `6.57:1` on `--surface`)

### Dark Mode (Charcoal Studio)
- `--bg`: `#111315` (canvas)
- `--surface`: `#1A1D21` (primary panels, inputs)
- `--surface-2`: `#242930` (secondary controls, table heads, preview toolbar)
- `--ink`: `#F5F2EA` (primary text; contrast `16.64:1` on `--bg`, `15.12:1` on `--surface`)
- `--muted`: `#B8B3A6` (secondary text; contrast `8.08:1` on `--surface`)
- `--border`: `#E6E0D0` (crisp high-visibility brutalist rules)
- `--shadow-color`: `#000000` with outer ring `#383F4B` for crisp depth separation
- `--accent`: `#FFD23F` (`--accent-ink`: `#121212`, contrast `12.97:1`)
- `--link`: `#7DB3FF` (contrast `7.86:1` on `--surface`)
- `--ok`: `#5CE09A` (contrast `10.14:1` on `--surface`)
- `--err`: `#FF857D` (contrast `7.17:1` on `--surface`)

## Typography & Scale
- UI font: `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (zero-latency workhorse UI stack for Operate surfaces).
- Code/URL/hex font: `ui-monospace, "Cascadia Code", "SFMono-Regular", Menlo, Consolas, monospace` (strictly for URLs, parameter names, hex codes, and code snippets).
- Heading scale: `h1` `clamp(1.75rem, 2.5vw, 2.35rem)` weight `800`, tracking `-0.02em`; `h2` `1.35rem` weight `800`; `h3` `1rem` weight `700`.
- Numerals: `font-variant-numeric: tabular-nums` for dimensions, counts, and status codes.

## Layout & Rhythm
- Header bar: brand title, section jump links (`Playground`, `API Reference`, `Deployment`), theme switcher (`Light`/`Dark`), language switcher (`EN`/`ID`), and doc links (`/ui`, `/doc`, `Original Project`).
- Section 1 (`#playground`): asymmetric 2-column workbench on desktop (`minmax(340px, 460px)` input builder + `1fr` sticky preview & live source code dock), collapsing cleanly at `1024px` and `640px` breakpoints with `>= 44px` tap targets.
- Section 2 (`#endpoints`): interactive API reference across all 9 endpoints with parameter tables, live JSON runner for `/api/status/*` + `/health`, and "Load in Builder" triggers.
- Section 3 (`#deployment`): preserved Cloudflare Pages & Workers environment variable reference.

## Decision Rationales (R-31)
- **Color**: Warm paper light + charcoal dark eliminate glare while `#FFD23F` marks primary actions and active states without diluting hierarchy.
- **Borders & Shadow**: Solid `2px` ink borders and `4px 4px 0` hard offset shadows carry the requested Neobrutalism identity cleanly across both themes.
- **Typography**: System sans guarantees crisp legibility and instant first paint in a developer workbench; monospace is restricted to code, endpoints, and hex inputs.
- **Asymmetric Workbench**: Sticky preview and source code alongside scrollable custom controls let users tweak inputs and copy Markdown/HTML/SVG without losing sight of the output.
- **Motion**: Fast `140ms` button press and tab state transitions respect Operate flow and `prefers-reduced-motion`.
