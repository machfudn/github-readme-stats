export const HOME_STYLES = `
      :root {
        --bg: #f6f3ea;
        --surface: #ffffff;
        --surface-2: #eae4d3;
        --ink: #121212;
        --muted: #4a4a45;
        --border: #121212;
        --accent: #ffd23f;
        --accent-ink: #121212;
        --link: #1442cc;
        --ok: #11633b;
        --err: #b42318;
        --shadow-color: #121212;
        --panel-ring: 0 0 0 0 transparent;
        --shadow-sm: 2px 2px 0 var(--shadow-color);
        --shadow-md: 4px 4px 0 var(--shadow-color);
        --radius-sm: 4px;
        --radius-md: 6px;
        --font-ui:
          system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial,
          sans-serif;
        --font-mono:
          ui-monospace, "Cascadia Code", "SFMono-Regular", Menlo, Consolas,
          monospace;
        color-scheme: light;
      }

      html[data-theme="dark"] {
        --bg: #111315;
        --surface: #1a1d21;
        --surface-2: #242930;
        --ink: #f5f2ea;
        --muted: #b8b3a6;
        --border: #e6e0d0;
        --accent: #ffd23f;
        --accent-ink: #121212;
        --link: #7db3ff;
        --ok: #5ce09a;
        --err: #ff857d;
        --shadow-color: #000000;
        --panel-ring: 0 0 0 1px #383f4b;
        color-scheme: dark;
      }

      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
        scrollbar-color: var(--muted) var(--surface-2);
      }

      body {
        margin: 0;
        background-color: var(--bg);
        color: var(--ink);
        font-family: var(--font-ui);
        font-size: 15px;
        line-height: 1.5;
        overflow-x: clip;
        transition:
          background-color 140ms ease,
          color 140ms ease;
      }

      ::selection {
        background: var(--accent);
        color: var(--accent-ink);
      }

      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }

      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      ::-webkit-scrollbar-track {
        background: var(--surface-2);
      }
      ::-webkit-scrollbar-thumb {
        background: var(--muted);
        border: 2px solid var(--surface-2);
      }

      a {
        color: var(--link);
        text-underline-offset: 3px;
      }

      code,
      pre,
      .mono {
        font-family: var(--font-mono);
      }

      .num-cell {
        font-variant-numeric: tabular-nums;
      }

      .container {
        max-width: 1360px;
        margin: 0 auto;
        padding: 1.25rem 1.25rem 3.5rem;
      }

      /* Header */
      .site-header {
        background: var(--surface);
        border: 2px solid var(--border);
        box-shadow: var(--shadow-md), var(--panel-ring);
        border-radius: var(--radius-md);
        padding: 1.15rem 1.25rem;
        margin-bottom: 1.5rem;
      }

      .header-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .brand-wrap {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
        min-width: 0;
        max-width: 70ch;
      }

      .brand-mark {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        background: var(--accent);
        color: var(--accent-ink);
        border: 2px solid var(--border);
        box-shadow: var(--shadow-sm);
        border-radius: var(--radius-sm);
      }

      h1 {
        margin: 0;
        font-size: clamp(1.75rem, 2.5vw, 2.35rem);
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -0.02em;
      }

      .subtitle {
        margin: 0.35rem 0 0;
        color: var(--muted);
        max-width: 66ch;
        font-size: 0.95rem;
      }

      .header-controls {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        flex-wrap: wrap;
      }

      .header-bottom {
        margin-top: 1rem;
        padding-top: 0.85rem;
        border-top: 2px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .nav-links,
      .doc-links {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        flex-wrap: wrap;
      }

      /* Buttons & Segmented Controls */
      .btn,
      .nav-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        min-height: 44px;
        padding: 0.5rem 0.9rem;
        font-family: var(--font-ui);
        font-size: 0.9rem;
        font-weight: 700;
        line-height: 1.2;
        text-decoration: none;
        color: var(--ink);
        background: var(--surface);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm);
        cursor: pointer;
        transition:
          transform 140ms ease,
          box-shadow 140ms ease,
          background-color 140ms ease;
      }

      .btn:hover,
      .nav-link:hover {
        background: var(--surface-2);
      }

      .btn:active,
      .nav-link:active {
        transform: translate(2px, 2px);
        box-shadow: none;
      }

      .btn-accent {
        background: var(--accent);
        color: var(--accent-ink);
      }

      .btn-accent:hover {
        filter: brightness(0.96);
        background: var(--accent);
      }

      .btn-sm {
        min-height: 44px;
        padding: 0.4rem 0.75rem;
        font-size: 0.84rem;
      }

      .btn[disabled] {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
      }

      .seg-group {
        display: inline-flex;
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        background: var(--surface-2);
      }

      .seg-btn {
        min-height: 44px;
        min-width: 46px;
        padding: 0 0.75rem;
        border: 0;
        border-right: 2px solid var(--border);
        background: transparent;
        color: var(--ink);
        font-family: var(--font-ui);
        font-size: 0.86rem;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 140ms ease;
      }

      .seg-btn:last-child {
        border-right: 0;
      }

      .seg-btn[aria-pressed="true"] {
        background: var(--accent);
        color: var(--accent-ink);
      }

      /* Section Headings */
      .section-block {
        margin-top: 2.25rem;
      }

      .section-head {
        margin-bottom: 1rem;
      }

      .section-head h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
        letter-spacing: -0.015em;
      }

      .section-head p {
        margin: 0.3rem 0 0;
        color: var(--muted);
        max-width: 72ch;
      }

      /* Workbench Grid */
      .workbench {
        display: grid;
        grid-template-columns: minmax(340px, 470px) minmax(0, 1fr);
        gap: 1.25rem;
        align-items: start;
      }

      .panel {
        background: var(--surface);
        border: 2px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md), var(--panel-ring);
        min-width: 0;
      }

      .panel-header {
        padding: 1rem 1.15rem;
        border-bottom: 2px solid var(--border);
        background: var(--surface-2);
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }

      .panel-header h2,
      .panel-header h3 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
      }

      .panel-header p {
        margin: 0.25rem 0 0;
        color: var(--muted);
        font-size: 0.88rem;
      }

      .panel-body {
        padding: 1.1rem 1.15rem;
      }

      /* Endpoint Selector Tabs */
      .endpoint-tabs {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
        gap: 0.5rem;
        margin-top: 0.55rem;
      }

      .ep-tab {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        min-height: 48px;
        padding: 0.45rem 0.65rem;
        background: var(--surface);
        color: var(--ink);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm);
        cursor: pointer;
        text-align: left;
        transition:
          transform 140ms ease,
          box-shadow 140ms ease,
          background-color 140ms ease;
      }

      .ep-tab:hover {
        background: var(--surface-2);
      }

      .ep-tab:active {
        transform: translate(2px, 2px);
        box-shadow: none;
      }

      .ep-tab[aria-selected="true"] {
        background: var(--accent);
        color: var(--accent-ink);
      }

      .ep-tab-title {
        font-size: 0.88rem;
        font-weight: 800;
      }

      .ep-tab-path {
        font-family: var(--font-mono);
        font-size: 0.74rem;
        opacity: 0.85;
      }

      /* Builder Field Groups */
      .field-group {
        padding-top: 1rem;
        margin-top: 1rem;
        border-top: 2px solid var(--border);
      }

      .field-group-title {
        margin: 0 0 0.75rem;
        font-size: 1rem;
        font-weight: 700;
      }

      .field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        min-width: 0;
      }

      .field.full {
        grid-column: 1 / -1;
      }

      .field label,
      .group-label {
        font-size: 0.82rem;
        font-weight: 700;
      }

      input[type="text"],
      input[type="number"],
      select {
        width: 100%;
        min-height: 44px;
        padding: 0.45rem 0.65rem;
        font-family: var(--font-ui);
        font-size: 0.9rem;
        color: var(--ink);
        background: var(--surface);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
      }

      input.mono-input {
        font-family: var(--font-mono);
        font-size: 0.85rem;
      }

      .hint-text {
        font-size: 0.78rem;
        color: var(--muted);
      }

      /* Theme Swatch Strip */
      .theme-swatches {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin-top: 0.45rem;
        flex-wrap: wrap;
      }

      .swatch-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.2rem 0.45rem;
        border: 1.5px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--surface-2);
        font-family: var(--font-mono);
        font-size: 0.72rem;
      }

      .swatch-dot {
        width: 12px;
        height: 12px;
        border: 1.5px solid var(--border);
        border-radius: 2px;
        display: inline-block;
      }

      /* Flag Checkboxes */
      .flags-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
        gap: 0.5rem;
        margin-bottom: 0.85rem;
      }

      .flag-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 44px;
        padding: 0.4rem 0.65rem;
        background: var(--surface-2);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: 0.84rem;
        font-weight: 700;
      }

      .flag-item input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: var(--accent-ink);
        cursor: pointer;
        flex-shrink: 0;
      }

      /* Quick Chip Selectors */
      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.35rem;
      }

      .chip-btn {
        min-height: 36px;
        padding: 0.25rem 0.55rem;
        font-family: var(--font-mono);
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--ink);
        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-sm);
        cursor: pointer;
      }

      .chip-btn[aria-pressed="true"] {
        background: var(--accent);
        color: var(--accent-ink);
      }

      /* Color Rows */
      .color-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.65rem;
      }

      .color-control {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .color-control input[type="color"] {
        width: 44px;
        min-width: 44px;
        height: 44px;
        padding: 2px;
        background: var(--surface);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        cursor: pointer;
      }

      .color-control input[type="text"] {
        flex: 1;
        min-width: 0;
      }

      .icon-clear-btn {
        min-width: 44px;
        min-height: 44px;
        padding: 0 0.55rem;
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--surface-2);
        color: var(--ink);
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
      }

      /* Custom Params Rows */
      .custom-param-list {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        margin-bottom: 0.75rem;
      }

      .custom-param-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
        gap: 0.45rem;
        align-items: center;
      }

      .builder-actions-row {
        display: flex;
        gap: 0.65rem;
        flex-wrap: wrap;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 2px solid var(--border);
      }

      /* Sticky Preview & Code Dock */
      .preview-dock {
        position: sticky;
        top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .url-bar {
        display: flex;
        align-items: stretch;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 0.85rem;
      }

      .url-display {
        flex: 1;
        min-width: 220px;
        min-height: 44px;
        padding: 0.55rem 0.75rem;
        background: var(--surface-2);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.82rem;
        word-break: break-all;
        display: flex;
        align-items: center;
      }

      .preview-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.65rem;
        flex-wrap: wrap;
        margin-bottom: 0.75rem;
      }

      .status-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.25rem 0.6rem;
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        background: var(--surface-2);
      }

      .status-pill[data-state="success"] {
        color: var(--ok);
      }

      .status-pill[data-state="error"],
      .status-pill[data-state="missing"] {
        color: var(--err);
      }

      .preview-stage {
        min-height: 230px;
        padding: 1.25rem;
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-x: auto;
      }

      .preview-stage[data-canvas="checker"] {
        background-color: #d8d4c8;
        background-image:
          linear-gradient(45deg, #ede9dd 25%, transparent 25%),
          linear-gradient(-45deg, #ede9dd 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #ede9dd 75%),
          linear-gradient(-45deg, transparent 75%, #ede9dd 75%);
        background-size: 20px 20px;
        background-position:
          0 0,
          0 10px,
          10px -10px,
          -10px 0;
      }

      html[data-theme="dark"] .preview-stage[data-canvas="checker"] {
        background-color: #1c2026;
        background-image:
          linear-gradient(45deg, #262b33 25%, transparent 25%),
          linear-gradient(-45deg, #262b33 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #262b33 75%),
          linear-gradient(-45deg, transparent 75%, #262b33 75%);
      }

      .preview-stage[data-canvas="light"] {
        background: #ffffff;
      }

      .preview-stage[data-canvas="dark"] {
        background: #0d1117;
      }

      #preview-img {
        display: block;
        max-width: 100%;
        height: auto;
      }

      .stage-message {
        max-width: 48ch;
        padding: 1rem 1.15rem;
        background: var(--surface);
        color: var(--ink);
        border: 2px solid var(--border);
        box-shadow: var(--shadow-sm);
        border-radius: var(--radius-sm);
        text-align: center;
      }

      .stage-message p {
        margin: 0 0 0.75rem;
        font-weight: 600;
      }

      .loading-skeleton {
        width: min(460px, 100%);
        height: 170px;
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--surface);
        padding: 1rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .skel-line {
        height: 16px;
        background: var(--surface-2);
        border: 1.5px solid var(--border);
        border-radius: 2px;
      }

      .skel-line.short {
        width: 55%;
      }

      .skel-line.mid {
        width: 80%;
      }

      /* Synchronized Code Tabs */
      .code-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .code-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin-bottom: 0.75rem;
      }

      .code-tab {
        min-height: 44px;
        padding: 0.4rem 0.8rem;
        background: var(--surface-2);
        color: var(--ink);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        font-family: var(--font-ui);
        font-size: 0.84rem;
        font-weight: 800;
        cursor: pointer;
      }

      .code-tab[aria-selected="true"] {
        background: var(--accent);
        color: var(--accent-ink);
        box-shadow: var(--shadow-sm);
      }

      .code-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .code-box {
        margin: 0;
        padding: 0.9rem 1rem;
        background: var(--surface-2);
        color: var(--ink);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        font-size: 0.82rem;
        line-height: 1.5;
        overflow: auto;
        max-height: 300px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      /* API Endpoint Documentation */
      .docs-toolbar {
        display: flex;
        gap: 0.55rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      .endpoint-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .endpoint-card {
        background: var(--surface);
        border: 2px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md), var(--panel-ring);
        overflow: hidden;
      }

      .endpoint-card-head {
        padding: 0.9rem 1.15rem;
        background: var(--surface-2);
        border-bottom: 2px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.85rem;
        flex-wrap: wrap;
      }

      .endpoint-title-group {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        flex-wrap: wrap;
        min-width: 0;
      }

      .method-badge {
        padding: 0.2rem 0.55rem;
        background: var(--accent);
        color: var(--accent-ink);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.78rem;
        font-weight: 800;
      }

      .endpoint-path {
        font-family: var(--font-mono);
        font-size: 1rem;
        font-weight: 800;
      }

      .endpoint-label {
        font-weight: 700;
      }

      .endpoint-card-body {
        padding: 1rem 1.15rem;
      }

      .endpoint-summary {
        margin: 0 0 0.35rem;
        font-weight: 600;
      }

      .endpoint-alias {
        margin: 0 0 0.85rem;
        font-size: 0.84rem;
        color: var(--muted);
      }

      .example-strip {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        flex-wrap: wrap;
        padding: 0.55rem 0.75rem;
        margin-bottom: 0.9rem;
        background: var(--surface-2);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        font-size: 0.82rem;
      }

      .example-strip code {
        word-break: break-all;
      }

      .table-wrap {
        width: 100%;
        overflow-x: auto;
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.86rem;
      }

      th,
      td {
        padding: 0.6rem 0.75rem;
        text-align: left;
        border-bottom: 1.5px solid var(--border);
        vertical-align: top;
      }

      tr:last-child td {
        border-bottom: 0;
      }

      th {
        background: var(--surface-2);
        font-weight: 800;
      }

      .tag-badge {
        display: inline-block;
        padding: 0.12rem 0.45rem;
        border: 1.5px solid var(--border);
        border-radius: var(--radius-sm);
        font-size: 0.76rem;
        font-weight: 700;
        background: var(--surface-2);
      }

      .tag-badge.req {
        background: var(--accent);
        color: var(--accent-ink);
      }

      .live-json-box {
        margin-top: 0.85rem;
        padding: 0.75rem 0.9rem;
        background: var(--surface-2);
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.8rem;
        overflow: auto;
        max-height: 220px;
      }

      .hidden {
        display: none !important;
      }

      /* Tablet breakpoint */
      @media (max-width: 1024px) {
        .workbench {
          grid-template-columns: 1fr;
        }
        .preview-dock {
          position: static;
        }
      }

      /* Mobile breakpoint */
      @media (max-width: 640px) {
        .container {
          padding: 0.85rem 0.85rem 2.5rem;
        }
        .site-header {
          padding: 0.95rem;
        }
        .panel-header,
        .panel-body,
        .endpoint-card-head,
        .endpoint-card-body {
          padding: 0.85rem;
        }
        .field-grid {
          grid-template-columns: 1fr;
        }
        .custom-param-row {
          grid-template-columns: 1fr;
        }
        .endpoint-tabs {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .flags-grid {
          grid-template-columns: 1fr;
        }
        .color-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto;
        }
        *,
        *::before,
        *::after {
          transition: none !important;
        }
      }
`;
