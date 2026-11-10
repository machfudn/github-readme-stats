import { themes } from "../themes/index.js";
import { availableLocales } from "../src/translations.js";
import enDict from "../public/i18n/en.json" with { type: "json" };
import idDict from "../public/i18n/id.json" with { type: "json" };
import {
  ENDPOINT_DOCS,
  type EndpointDocSpec,
  type EndpointParamDoc,
} from "./home-docs.ts";
import { HOME_STYLES } from "./home-styles.ts";
import { renderHomeClientScript } from "./home-client.ts";

export {
  ENDPOINT_DOCS,
  enDict,
  idDict,
  type EndpointDocSpec,
  type EndpointParamDoc,
};

export type UiLang = "en" | "id";

export type HomePageDefaults = {
  username?: string;
  theme?: string;
  locale?: string;
  includeAllCommits?: string;
  langsCount?: string;
  cacheSeconds?: string;
  lang?: UiLang;
};

type ThemePalette = {
  title_color: string;
  icon_color?: string;
  text_color: string;
  bg_color: string;
  border_color?: string;
};

function serializeSafeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getThemeCatalog(): Record<string, ThemePalette> {
  const entries = Object.entries(themes) as Array<[string, ThemePalette]>;
  const catalog: Record<string, ThemePalette> = {};
  for (const [name, palette] of entries) {
    catalog[name] = {
      title_color: palette.title_color,
      icon_color: palette.icon_color,
      text_color: palette.text_color,
      bg_color: palette.bg_color,
      border_color: palette.border_color,
    };
  }
  return catalog;
}

export function renderHomePage(defaults: HomePageDefaults = {}): string {
  const initialLang: UiLang = defaults.lang === "id" ? "id" : "en";
  const dict = initialLang === "id" ? idDict : enDict;
  const defaultUsername = defaults.username?.trim() || "machfudn";
  const defaultTheme =
    defaults.theme && defaults.theme in themes ? defaults.theme : "transparent";
  const defaultLocale =
    defaults.locale && availableLocales.includes(defaults.locale)
      ? defaults.locale
      : "en";
  const defaultIncludeAllCommits =
    defaults.includeAllCommits !== undefined
      ? defaults.includeAllCommits === "true"
      : true;
  const defaultLangsCount = defaults.langsCount?.trim() || "8";
  const defaultCacheSeconds = defaults.cacheSeconds?.trim() || "";

  const themeCatalog = getThemeCatalog();
  const themeNames = Object.keys(themeCatalog);

  const bootstrapPayload = serializeSafeJson({
    defaults: {
      username: defaultUsername,
      theme: defaultTheme,
      locale: defaultLocale,
      includeAllCommits: defaultIncludeAllCommits,
      langsCount: defaultLangsCount,
      cacheSeconds: defaultCacheSeconds,
      lang: initialLang,
    },
    themes: themeCatalog,
    locales: availableLocales,
    endpoints: ENDPOINT_DOCS,
    i18n: {
      en: enDict,
      id: idDict,
    },
  });

  const themeOptionsHtml = themeNames
    .map(
      (name) =>
        `<option value="${escapeHtml(name)}"${name === defaultTheme ? " selected" : ""}>${escapeHtml(name)}</option>`,
    )
    .join("");

  const localeOptionsHtml = availableLocales
    .map(
      (code) =>
        `<option value="${escapeHtml(code)}"${code === defaultLocale ? " selected" : ""}>${escapeHtml(code)}</option>`,
    )
    .join("");

  const deploymentRowsHtml = dict.deployment.vars
    .map(
      (item, idx) => `
      <tr data-deploy-row="${idx}">
        <td><code>${escapeHtml(item.name)}</code></td>
        <td><span class="tag-badge" data-deploy-type="${idx}">${escapeHtml(item.type)}</span></td>
        <td class="num-cell"><code>${escapeHtml(item.defaultValue)}</code></td>
        <td data-deploy-desc="${idx}">${escapeHtml(item.desc)}</td>
      </tr>`,
    )
    .join("");

  const colorFieldsHtml = [
    { name: "title_color", showFor: "" },
    { name: "text_color", showFor: "" },
    {
      name: "icon_color",
      showFor: "/api /api/streak /api/pin /api/wakatime /api/gist",
    },
    { name: "bg_color", showFor: "" },
    { name: "border_color", showFor: "" },
    { name: "ring_color", showFor: "/api /api/streak" },
    { name: "fire_color", showFor: "/api/streak" },
    { name: "side_nums_color", showFor: "/api/streak" },
    { name: "side_labels_color", showFor: "/api/streak" },
    { name: "dates_color", showFor: "/api/streak" },
  ]
    .map((colorField) => {
      const labelKey = colorField.name as keyof typeof dict.builder.colorLabels;
      const defaultHidden =
        colorField.showFor && !colorField.showFor.split(" ").includes("/api")
          ? " hidden"
          : "";
      const attrFor = colorField.showFor
        ? ` data-for="${colorField.showFor}"`
        : "";
      const placeholder =
        colorField.name === "bg_color"
          ? dict.builder.fields.bgPlaceholder
          : "2f80ed";
      const pickerAria = `${dict.builder.colorLabels[labelKey]} ${dict.aria.pickerSuffix}`;
      return `
                    <div class="field${defaultHidden}"${attrFor}>
                      <label for="input-${colorField.name}" data-i18n="builder.colorLabels.${colorField.name}">${escapeHtml(dict.builder.colorLabels[labelKey])}</label>
                      <div class="color-control">
                        <input
                          type="color"
                          id="picker-${colorField.name}"
                          value="#2f80ed"
                          data-picker-label="builder.colorLabels.${colorField.name}"
                          aria-label="${escapeHtml(pickerAria)}"
                        />
                        <input
                          type="text"
                          id="input-${colorField.name}"
                          name="${colorField.name}"
                          class="mono-input"
                          placeholder="${escapeHtml(placeholder)}"
                        />
                        <button
                          type="button"
                          class="icon-clear-btn"
                          data-clear-target="input-${colorField.name}"
                          data-i18n="builder.actions.clearColor"
                        >${escapeHtml(dict.builder.actions.clearColor)}</button>
                      </div>
                    </div>`;
    })
    .join("");

  const initialQuery = new URLSearchParams({
    username: defaultUsername,
    theme: defaultTheme,
    locale: defaultLocale,
    show_icons: "true",
    include_all_commits: String(defaultIncludeAllCommits),
  });
  if (defaultCacheSeconds) {
    initialQuery.set("cache_seconds", defaultCacheSeconds);
  }
  const initialPath = `/api?${initialQuery.toString()}`;

  return `<!doctype html>
<html lang="${initialLang}" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(dict.meta.title)}</title>
    <script>
      (function () {
        try {
          var savedTheme = localStorage.getItem("grs-ui-theme");
          if (savedTheme === "dark" || savedTheme === "light") {
            document.documentElement.setAttribute("data-theme", savedTheme);
          } else if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ) {
            document.documentElement.setAttribute("data-theme", "dark");
          }
          var savedLang = localStorage.getItem("grs-ui-lang");
          if (savedLang === "en" || savedLang === "id") {
            document.documentElement.setAttribute("lang", savedLang);
          }
        } catch (err) {
          /* ignore storage access errors */
        }
      })();
    </script>
    <style>${HOME_STYLES}</style>
  </head>
  <body>
    <div class="container" id="top">
      <header class="site-header">
        <div class="header-top">
          <div class="brand-wrap">
            <div class="brand-mark" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="square"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="7" y1="15" x2="7" y2="11" />
                <line x1="12" y1="15" x2="12" y2="8" />
                <line x1="17" y1="15" x2="17" y2="12" />
              </svg>
            </div>
            <div>
              <h1 data-i18n="meta.brand">${escapeHtml(dict.meta.brand)}</h1>
              <p class="subtitle" data-i18n="meta.subtitle">
                ${escapeHtml(dict.meta.subtitle)}
              </p>
            </div>
          </div>

          <div class="header-controls">
            <div
              class="seg-group"
              role="group"
              data-i18n-aria="aria.langGroup"
              aria-label="${escapeHtml(dict.aria.langGroup)}"
            >
              <button
                type="button"
                class="seg-btn"
                id="lang-en-btn"
                data-lang-choice="en"
                aria-pressed="${initialLang === "en" ? "true" : "false"}"
              >
                EN
              </button>
              <button
                type="button"
                class="seg-btn"
                id="lang-id-btn"
                data-lang-choice="id"
                aria-pressed="${initialLang === "id" ? "true" : "false"}"
              >
                ID
              </button>
            </div>

            <button
              type="button"
              class="btn"
              id="theme-toggle-btn"
              aria-pressed="false"
            >
              <svg
                id="theme-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
                <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
              </svg>
              <span id="theme-toggle-label" data-i18n="toggles.themeDark">
                ${escapeHtml(dict.toggles.themeDark)}
              </span>
            </button>
          </div>
        </div>

        <div class="header-bottom">
          <nav
            class="nav-links"
            data-i18n-aria="aria.navSections"
            aria-label="${escapeHtml(dict.aria.navSections)}"
          >
            <a class="nav-link" href="#playground" data-i18n="nav.playground"
              >${escapeHtml(dict.nav.playground)}</a
            >
            <a class="nav-link" href="#endpoints" data-i18n="nav.endpoints"
              >${escapeHtml(dict.nav.endpoints)}</a
            >
            <a class="nav-link" href="#deployment" data-i18n="nav.deployment"
              >${escapeHtml(dict.nav.deployment)}</a
            >
          </nav>

          <div class="doc-links">
            <a class="btn btn-accent" href="/ui" data-i18n="nav.swagger"
              >${escapeHtml(dict.nav.swagger)}</a
            >
            <a class="btn" href="/doc" data-i18n="nav.openapi"
              >${escapeHtml(dict.nav.openapi)}</a
            >
            <a
              class="btn"
              href="https://github.com/anuraghazra/github-readme-stats"
              target="_blank"
              rel="noreferrer"
              data-i18n="nav.sourceRepo"
              >${escapeHtml(dict.nav.sourceRepo)}</a
            >
          </div>
        </div>
      </header>

      <main>
        <section
          id="playground"
          class="workbench"
          data-i18n-aria="aria.playground"
          aria-label="${escapeHtml(dict.aria.playground)}"
        >
          <section class="panel" aria-labelledby="builder-heading">
            <div class="panel-header">
              <h2 id="builder-heading" data-i18n="builder.heading">
                ${escapeHtml(dict.builder.heading)}
              </h2>
              <p data-i18n="builder.lead">${escapeHtml(dict.builder.lead)}</p>
            </div>
            <div class="panel-body">
              <div>
                <span class="group-label" data-i18n="builder.cardTypeLabel"
                  >${escapeHtml(dict.builder.cardTypeLabel)}</span
                >
                <div
                  class="endpoint-tabs"
                  id="endpoint-tabs"
                  role="tablist"
                  data-i18n-aria="aria.cardEndpoint"
                  aria-label="${escapeHtml(dict.aria.cardEndpoint)}"
                >
                  <button
                    type="button"
                    class="ep-tab"
                    role="tab"
                    aria-selected="true"
                    data-endpoint="/api"
                  >
                    <span class="ep-tab-title" data-i18n="cards./api.label"
                      >${escapeHtml(dict.cards["/api"].label)}</span
                    >
                    <span class="ep-tab-path">/api</span>
                  </button>
                  <button
                    type="button"
                    class="ep-tab"
                    role="tab"
                    aria-selected="false"
                    data-endpoint="/api/streak"
                  >
                    <span
                      class="ep-tab-title"
                      data-i18n="cards./api/streak.label"
                      >${escapeHtml(dict.cards["/api/streak"].label)}</span
                    >
                    <span class="ep-tab-path">/api/streak</span>
                  </button>
                  <button
                    type="button"
                    class="ep-tab"
                    role="tab"
                    aria-selected="false"
                    data-endpoint="/api/top-langs"
                  >
                    <span
                      class="ep-tab-title"
                      data-i18n="cards./api/top-langs.label"
                      >${escapeHtml(dict.cards["/api/top-langs"].label)}</span
                    >
                    <span class="ep-tab-path">/api/top-langs</span>
                  </button>
                  <button
                    type="button"
                    class="ep-tab"
                    role="tab"
                    aria-selected="false"
                    data-endpoint="/api/pin"
                  >
                    <span class="ep-tab-title" data-i18n="cards./api/pin.label"
                      >${escapeHtml(dict.cards["/api/pin"].label)}</span
                    >
                    <span class="ep-tab-path">/api/pin</span>
                  </button>
                  <button
                    type="button"
                    class="ep-tab"
                    role="tab"
                    aria-selected="false"
                    data-endpoint="/api/wakatime"
                  >
                    <span
                      class="ep-tab-title"
                      data-i18n="cards./api/wakatime.label"
                      >${escapeHtml(dict.cards["/api/wakatime"].label)}</span
                    >
                    <span class="ep-tab-path">/api/wakatime</span>
                  </button>
                  <button
                    type="button"
                    class="ep-tab"
                    role="tab"
                    aria-selected="false"
                    data-endpoint="/api/gist"
                  >
                    <span class="ep-tab-title" data-i18n="cards./api/gist.label"
                      >${escapeHtml(dict.cards["/api/gist"].label)}</span
                    >
                    <span class="ep-tab-path">/api/gist</span>
                  </button>
                </div>
              </div>

              <form id="builder-form" onsubmit="return false;">
                <div class="field-group">
                  <h3 class="field-group-title" data-i18n="builder.groups.target">
                    ${escapeHtml(dict.builder.groups.target)}
                  </h3>
                  <div class="field-grid">
                    <div class="field" data-for="/api /api/streak /api/top-langs /api/pin /api/wakatime">
                      <label for="input-username" data-i18n="builder.fields.username"
                        >${escapeHtml(dict.builder.fields.username)}</label
                      >
                      <input
                        id="input-username"
                        name="username"
                        type="text"
                        value="${escapeHtml(defaultUsername)}"
                        placeholder="machfudn"
                        autocomplete="off"
                      />
                    </div>

                    <div class="field hidden" data-for="/api/streak">
                      <label for="input-user" data-i18n="builder.fields.userAlias"
                        >${escapeHtml(dict.builder.fields.userAlias)}</label
                      >
                      <input
                        id="input-user"
                        name="user"
                        type="text"
                        value=""
                        placeholder="machfudn"
                        autocomplete="off"
                      />
                    </div>

                    <div class="field hidden" data-for="/api/pin">
                      <label for="input-repo" data-i18n="builder.fields.repo"
                        >${escapeHtml(dict.builder.fields.repo)}</label
                      >
                      <input
                        id="input-repo"
                        name="repo"
                        type="text"
                        value="github-readme-stats"
                        placeholder="github-readme-stats"
                        autocomplete="off"
                      />
                    </div>

                    <div class="field hidden" data-for="/api/gist">
                      <label for="input-id" data-i18n="builder.fields.gistId"
                        >${escapeHtml(dict.builder.fields.gistId)}</label
                      >
                      <input
                        id="input-id"
                        name="id"
                        type="text"
                        class="mono-input"
                        value="bbfce31e0217a3689c8d961a356cb10d"
                        placeholder="bbfce31e0217a3689c8d961a356cb10d"
                        autocomplete="off"
                      />
                    </div>

                    <div class="field" data-for="/api /api/top-langs /api/wakatime">
                      <label for="input-custom_title" data-i18n="builder.fields.customTitle"
                        >${escapeHtml(dict.builder.fields.customTitle)}</label
                      >
                      <input
                        id="input-custom_title"
                        name="custom_title"
                        type="text"
                        placeholder="My GitHub Stats"
                      />
                    </div>
                  </div>
                </div>

                <div class="field-group">
                  <h3 class="field-group-title" data-i18n="builder.groups.appearance">
                    ${escapeHtml(dict.builder.groups.appearance)}
                  </h3>
                  <div class="field-grid">
                    <div class="field">
                      <label for="input-theme" data-i18n="builder.fields.theme"
                        >${escapeHtml(dict.builder.fields.theme)}</label
                      >
                      <select id="input-theme" name="theme">
                        ${themeOptionsHtml}
                      </select>
                      <div class="theme-swatches" id="theme-swatches" aria-live="polite"></div>
                    </div>

                    <div class="field">
                      <label for="input-locale" data-i18n="builder.fields.locale"
                        >${escapeHtml(dict.builder.fields.locale)}</label
                      >
                      <select id="input-locale" name="locale">
                        ${localeOptionsHtml}
                      </select>
                    </div>

                    <div class="field hidden" data-for="/api/top-langs /api/wakatime">
                      <label for="input-layout" data-i18n="builder.fields.layout"
                        >${escapeHtml(dict.builder.fields.layout)}</label
                      >
                      <select id="input-layout" name="layout">
                        <option value="" data-i18n="builder.selects.default">${escapeHtml(dict.builder.selects.default)}</option>
                        <option value="normal">normal</option>
                        <option value="compact">compact</option>
                        <option value="donut">donut</option>
                        <option value="donut-vertical">donut-vertical</option>
                        <option value="pie">pie</option>
                      </select>
                    </div>

                    <div class="field" data-for="/api /api/streak /api/top-langs /api/wakatime">
                      <label for="input-card_width" data-i18n="builder.fields.cardWidth"
                        >${escapeHtml(dict.builder.fields.cardWidth)}</label
                      >
                      <input
                        id="input-card_width"
                        name="card_width"
                        type="number"
                        min="200"
                        max="1200"
                        placeholder="495"
                      />
                    </div>

                    <div class="field hidden" data-for="/api/streak">
                      <label for="input-card_height" data-i18n="builder.fields.cardHeight"
                        >${escapeHtml(dict.builder.fields.cardHeight)}</label
                      >
                      <input
                        id="input-card_height"
                        name="card_height"
                        type="number"
                        min="120"
                        max="800"
                        placeholder="195"
                      />
                    </div>

                    <div class="field">
                      <label for="input-border_radius" data-i18n="builder.fields.borderRadius"
                        >${escapeHtml(dict.builder.fields.borderRadius)}</label
                      >
                      <input
                        id="input-border_radius"
                        name="border_radius"
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        placeholder="4.5"
                      />
                    </div>

                    <div class="field" data-for="/api /api/wakatime">
                      <label for="input-line_height" data-i18n="builder.fields.lineHeight"
                        >${escapeHtml(dict.builder.fields.lineHeight)}</label
                      >
                      <input
                        id="input-line_height"
                        name="line_height"
                        type="number"
                        min="15"
                        max="60"
                        placeholder="25"
                      />
                    </div>
                  </div>
                </div>

                <div class="field-group">
                  <h3 class="field-group-title" data-i18n="builder.groups.options">
                    ${escapeHtml(dict.builder.groups.options)}
                  </h3>
                  <div class="flags-grid">
                    <label class="flag-item" data-for="/api">
                      <input type="checkbox" name="show_icons" id="flag-show_icons" checked />
                      <span data-i18n="builder.flags.show_icons"
                        >${escapeHtml(dict.builder.flags.show_icons)}</span
                      >
                    </label>
                    <label class="flag-item" data-for="/api">
                      <input
                        type="checkbox"
                        name="include_all_commits"
                        id="flag-include_all_commits"${defaultIncludeAllCommits ? " checked" : ""}
                      />
                      <span data-i18n="builder.flags.include_all_commits"
                        >${escapeHtml(dict.builder.flags.include_all_commits)}</span
                      >
                    </label>
                    <label class="flag-item">
                      <input type="checkbox" name="hide_border" id="flag-hide_border" />
                      <span data-i18n="builder.flags.hide_border"
                        >${escapeHtml(dict.builder.flags.hide_border)}</span
                      >
                    </label>
                    <label class="flag-item" data-for="/api /api/top-langs /api/wakatime">
                      <input type="checkbox" name="hide_title" id="flag-hide_title" />
                      <span data-i18n="builder.flags.hide_title"
                        >${escapeHtml(dict.builder.flags.hide_title)}</span
                      >
                    </label>
                    <label class="flag-item" data-for="/api">
                      <input type="checkbox" name="hide_rank" id="flag-hide_rank" />
                      <span data-i18n="builder.flags.hide_rank"
                        >${escapeHtml(dict.builder.flags.hide_rank)}</span
                      >
                    </label>
                    <label class="flag-item" data-for="/api">
                      <input type="checkbox" name="text_bold" id="flag-text_bold" />
                      <span data-i18n="builder.flags.text_bold"
                        >${escapeHtml(dict.builder.flags.text_bold)}</span
                      >
                    </label>
                    <label class="flag-item" data-for="/api /api/streak /api/top-langs /api/wakatime">
                      <input type="checkbox" name="disable_animations" id="flag-disable_animations" />
                      <span data-i18n="builder.flags.disable_animations"
                        >${escapeHtml(dict.builder.flags.disable_animations)}</span
                      >
                    </label>
                    <label class="flag-item hidden" data-for="/api/top-langs /api/wakatime">
                      <input type="checkbox" name="hide_progress" id="flag-hide_progress" />
                      <span data-i18n="builder.flags.hide_progress"
                        >${escapeHtml(dict.builder.flags.hide_progress)}</span
                      >
                    </label>
                    <label class="flag-item hidden" data-for="/api/pin /api/gist">
                      <input type="checkbox" name="show_owner" id="flag-show_owner" checked />
                      <span data-i18n="builder.flags.show_owner"
                        >${escapeHtml(dict.builder.flags.show_owner)}</span
                      >
                    </label>
                    <label class="flag-item hidden" data-for="/api/streak">
                      <input type="checkbox" name="short_numbers" id="flag-short_numbers" />
                      <span data-i18n="builder.flags.short_numbers"
                        >${escapeHtml(dict.builder.flags.short_numbers)}</span
                      >
                    </label>
                  </div>

                  <div class="field-grid">
                    <div class="field full" data-for="/api /api/top-langs /api/wakatime">
                      <label for="input-hide" data-i18n="builder.fields.hide"
                        >${escapeHtml(dict.builder.fields.hide)}</label
                      >
                      <input
                        id="input-hide"
                        name="hide"
                        type="text"
                        class="mono-input"
                        placeholder="contribs,issues"
                      />
                      <div class="chip-row" data-for="/api" id="hide-chips">
                        <button type="button" class="chip-btn" data-chip-target="input-hide" data-chip-val="stars" aria-pressed="false">stars</button>
                        <button type="button" class="chip-btn" data-chip-target="input-hide" data-chip-val="commits" aria-pressed="false">commits</button>
                        <button type="button" class="chip-btn" data-chip-target="input-hide" data-chip-val="prs" aria-pressed="false">prs</button>
                        <button type="button" class="chip-btn" data-chip-target="input-hide" data-chip-val="issues" aria-pressed="false">issues</button>
                        <button type="button" class="chip-btn" data-chip-target="input-hide" data-chip-val="contribs" aria-pressed="false">contribs</button>
                      </div>
                    </div>

                    <div class="field full" data-for="/api">
                      <label for="input-show" data-i18n="builder.fields.show"
                        >${escapeHtml(dict.builder.fields.show)}</label
                      >
                      <input
                        id="input-show"
                        name="show"
                        type="text"
                        class="mono-input"
                        placeholder="prs_merged,discussions_started"
                      />
                      <div class="chip-row" id="show-chips">
                        <button type="button" class="chip-btn" data-chip-target="input-show" data-chip-val="prs_merged" aria-pressed="false">prs_merged</button>
                        <button type="button" class="chip-btn" data-chip-target="input-show" data-chip-val="prs_merged_percentage" aria-pressed="false">prs_merged_percentage</button>
                        <button type="button" class="chip-btn" data-chip-target="input-show" data-chip-val="discussions_started" aria-pressed="false">discussions_started</button>
                        <button type="button" class="chip-btn" data-chip-target="input-show" data-chip-val="discussions_answered" aria-pressed="false">discussions_answered</button>
                      </div>
                    </div>

                    <div class="field" data-for="/api /api/top-langs">
                      <label for="input-exclude_repo" data-i18n="builder.fields.excludeRepo"
                        >${escapeHtml(dict.builder.fields.excludeRepo)}</label
                      >
                      <input
                        id="input-exclude_repo"
                        name="exclude_repo"
                        type="text"
                        class="mono-input"
                        placeholder="repo1,repo2"
                      />
                    </div>

                    <div class="field" data-for="/api">
                      <label for="input-commits_year" data-i18n="builder.fields.commitsYear"
                        >${escapeHtml(dict.builder.fields.commitsYear)}</label
                      >
                      <input
                        id="input-commits_year"
                        name="commits_year"
                        type="number"
                        min="2008"
                        max="2035"
                        placeholder="2025"
                      />
                    </div>

                    <div class="field" data-for="/api">
                      <label for="input-number_format" data-i18n="builder.fields.numberFormat"
                        >${escapeHtml(dict.builder.fields.numberFormat)}</label
                      >
                      <select id="input-number_format" name="number_format">
                        <option value="" data-i18n="builder.selects.defaultShort">${escapeHtml(dict.builder.selects.defaultShort)}</option>
                        <option value="short">short</option>
                        <option value="long">long</option>
                      </select>
                    </div>

                    <div class="field" data-for="/api">
                      <label for="input-number_precision" data-i18n="builder.fields.numberPrecision"
                        >${escapeHtml(dict.builder.fields.numberPrecision)}</label
                      >
                      <input
                        id="input-number_precision"
                        name="number_precision"
                        type="number"
                        min="0"
                        max="3"
                        placeholder="1"
                      />
                    </div>

                    <div class="field" data-for="/api">
                      <label for="input-rank_icon" data-i18n="builder.fields.rankIcon"
                        >${escapeHtml(dict.builder.fields.rankIcon)}</label
                      >
                      <select id="input-rank_icon" name="rank_icon">
                        <option value="" data-i18n="builder.selects.default">${escapeHtml(dict.builder.selects.default)}</option>
                        <option value="default">default</option>
                        <option value="github">github</option>
                        <option value="percentile">percentile</option>
                      </select>
                    </div>

                    <div class="field hidden" data-for="/api/top-langs /api/wakatime">
                      <label for="input-langs_count" data-i18n="builder.fields.langsCount"
                        >${escapeHtml(dict.builder.fields.langsCount)}</label
                      >
                      <input
                        id="input-langs_count"
                        name="langs_count"
                        type="number"
                        min="1"
                        max="20"
                        value="${escapeHtml(defaultLangsCount)}"
                        placeholder="8"
                      />
                    </div>

                    <div class="field hidden" data-for="/api/top-langs">
                      <label for="input-stats_format" data-i18n="builder.fields.statsFormat"
                        >${escapeHtml(dict.builder.fields.statsFormat)}</label
                      >
                      <select id="input-stats_format" name="stats_format">
                        <option value="" data-i18n="builder.selects.percentages">${escapeHtml(dict.builder.selects.percentages)}</option>
                        <option value="percentages">percentages</option>
                        <option value="bytes">bytes</option>
                      </select>
                    </div>

                    <div class="field hidden" data-for="/api/top-langs">
                      <label for="input-size_weight" data-i18n="builder.fields.sizeWeight"
                        >${escapeHtml(dict.builder.fields.sizeWeight)}</label
                      >
                      <input id="input-size_weight" name="size_weight" type="number" step="0.1" placeholder="1" />
                    </div>

                    <div class="field hidden" data-for="/api/top-langs">
                      <label for="input-count_weight" data-i18n="builder.fields.countWeight"
                        >${escapeHtml(dict.builder.fields.countWeight)}</label
                      >
                      <input id="input-count_weight" name="count_weight" type="number" step="0.1" placeholder="0" />
                    </div>

                    <div class="field hidden" data-for="/api/pin">
                      <label for="input-description_lines_count" data-i18n="builder.fields.descLines"
                        >${escapeHtml(dict.builder.fields.descLines)}</label
                      >
                      <input
                        id="input-description_lines_count"
                        name="description_lines_count"
                        type="number"
                        min="1"
                        max="6"
                        placeholder="2"
                      />
                    </div>

                    <div class="field hidden" data-for="/api/wakatime">
                      <label for="input-api_domain" data-i18n="builder.fields.apiDomain"
                        >${escapeHtml(dict.builder.fields.apiDomain)}</label
                      >
                      <input id="input-api_domain" name="api_domain" type="text" placeholder="wakatime.com" />
                    </div>

                    <div class="field hidden" data-for="/api/wakatime">
                      <label for="input-range" data-i18n="builder.fields.range"
                        >${escapeHtml(dict.builder.fields.range)}</label
                      >
                      <select id="input-range" name="range">
                        <option value="" data-i18n="builder.selects.default">${escapeHtml(dict.builder.selects.default)}</option>
                        <option value="last_7_days">last_7_days</option>
                        <option value="last_30_days">last_30_days</option>
                        <option value="last_6_months">last_6_months</option>
                        <option value="last_year">last_year</option>
                        <option value="all_time">all_time</option>
                      </select>
                    </div>

                    <div class="field hidden" data-for="/api/wakatime">
                      <label for="input-display_format" data-i18n="builder.fields.displayFormat"
                        >${escapeHtml(dict.builder.fields.displayFormat)}</label
                      >
                      <select id="input-display_format" name="display_format">
                        <option value="" data-i18n="builder.selects.time">${escapeHtml(dict.builder.selects.time)}</option>
                        <option value="time">time</option>
                        <option value="percent">percent</option>
                      </select>
                    </div>

                    <div class="field hidden" data-for="/api/streak">
                      <label for="input-timezone" data-i18n="builder.fields.timezone"
                        >${escapeHtml(dict.builder.fields.timezone)}</label
                      >
                      <input
                        id="input-timezone"
                        name="timezone"
                        type="text"
                        list="timezone-list"
                        placeholder="Asia/Jakarta"
                      />
                      <datalist id="timezone-list">
                        <option value="UTC"></option>
                        <option value="Asia/Jakarta"></option>
                        <option value="Asia/Tokyo"></option>
                        <option value="Asia/Singapore"></option>
                        <option value="America/New_York"></option>
                        <option value="America/Los_Angeles"></option>
                        <option value="Europe/London"></option>
                      </datalist>
                    </div>

                    <div class="field hidden" data-for="/api/streak">
                      <label for="input-starting_year" data-i18n="builder.fields.startingYear"
                        >${escapeHtml(dict.builder.fields.startingYear)}</label
                      >
                      <input
                        id="input-starting_year"
                        name="starting_year"
                        type="number"
                        min="2008"
                        max="2035"
                        placeholder="2020"
                      />
                    </div>

                    <div class="field hidden" data-for="/api/streak">
                      <label for="input-date_format" data-i18n="builder.fields.dateFormat"
                        >${escapeHtml(dict.builder.fields.dateFormat)}</label
                      >
                      <input id="input-date_format" name="date_format" type="text" placeholder="M j[, Y]" />
                    </div>

                    <div class="field">
                      <label for="input-cache_seconds" data-i18n="builder.fields.cacheSeconds"
                        >${escapeHtml(dict.builder.fields.cacheSeconds)}</label
                      >
                      <input
                        id="input-cache_seconds"
                        name="cache_seconds"
                        type="number"
                        min="0"
                        value="${escapeHtml(defaultCacheSeconds)}"
                        placeholder="3600"
                      />
                    </div>
                  </div>
                </div>

                <div class="field-group">
                  <h3 class="field-group-title" data-i18n="builder.groups.colors">
                    ${escapeHtml(dict.builder.groups.colors)}
                  </h3>
                  <div class="color-grid">
                    ${colorFieldsHtml}
                  </div>
                </div>

                <div class="field-group">
                  <h3 class="field-group-title" data-i18n="builder.groups.customParams">
                    ${escapeHtml(dict.builder.groups.customParams)}
                  </h3>
                  <p class="hint-text" data-i18n="builder.customParamsHint">
                    ${escapeHtml(dict.builder.customParamsHint)}
                  </p>
                  <div class="custom-param-list" id="custom-param-list"></div>
                  <button
                    type="button"
                    class="btn btn-sm"
                    id="add-custom-param-btn"
                    data-i18n="builder.actions.addParam"
                  >
                    ${escapeHtml(dict.builder.actions.addParam)}
                  </button>
                </div>

                <div class="builder-actions-row">
                  <button
                    type="button"
                    class="btn btn-accent"
                    id="render-now-btn"
                    data-i18n="builder.actions.render"
                  >
                    ${escapeHtml(dict.builder.actions.render)}
                  </button>
                  <button
                    type="button"
                    class="btn"
                    id="reset-builder-btn"
                    data-i18n="builder.actions.reset"
                  >
                    ${escapeHtml(dict.builder.actions.reset)}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <div class="preview-dock">
            <section class="panel" aria-labelledby="preview-heading">
              <div class="panel-header">
                <h2 id="preview-heading" data-i18n="preview.heading">
                  ${escapeHtml(dict.preview.heading)}
                </h2>
              </div>
              <div class="panel-body">
                <div class="url-bar">
                  <div class="url-display" id="active-url-text">${escapeHtml(initialPath)}</div>
                  <a
                    class="btn btn-sm"
                    id="open-raw-link"
                    href="${escapeHtml(initialPath)}"
                    target="_blank"
                    rel="noreferrer"
                    data-i18n="builder.actions.openRaw"
                    >${escapeHtml(dict.builder.actions.openRaw)}</a
                  >
                </div>

                <div class="preview-toolbar">
                  <div class="status-row">
                    <span
                      class="status-pill"
                      id="preview-status-pill"
                      data-state="idle"
                      aria-live="polite"
                    >${escapeHtml(dict.preview.statusIdle)}</span>
                    <span class="status-pill hidden" id="preview-meta-pill"></span>
                  </div>

                  <div class="status-row">
                    <span class="group-label" data-i18n="preview.canvasBg"
                      >${escapeHtml(dict.preview.canvasBg)}</span
                    >
                    <div
                      class="seg-group"
                      role="group"
                      data-i18n-aria="aria.canvasBg"
                      aria-label="${escapeHtml(dict.aria.canvasBg)}"
                    >
                      <button
                        type="button"
                        class="seg-btn"
                        data-canvas-bg="checker"
                        aria-pressed="true"
                        data-i18n="preview.bgChecker"
                      >${escapeHtml(dict.preview.bgChecker)}</button>
                      <button
                        type="button"
                        class="seg-btn"
                        data-canvas-bg="light"
                        aria-pressed="false"
                        data-i18n="preview.bgLight"
                      >${escapeHtml(dict.preview.bgLight)}</button>
                      <button
                        type="button"
                        class="seg-btn"
                        data-canvas-bg="dark"
                        aria-pressed="false"
                        data-i18n="preview.bgDark"
                      >${escapeHtml(dict.preview.bgDark)}</button>
                    </div>
                  </div>
                </div>

                <div class="preview-stage" id="preview-stage" data-canvas="checker">
                  <img
                    id="preview-img"
                    class="hidden"
                    data-i18n-alt="preview.imageAlt"
                    alt="${escapeHtml(dict.preview.imageAlt)}"
                  />
                  <div class="loading-skeleton hidden" id="preview-loading">
                    <div class="skel-line short"></div>
                    <div class="skel-line mid"></div>
                    <div class="skel-line"></div>
                    <div class="skel-line mid"></div>
                  </div>
                  <div class="stage-message hidden" id="preview-missing">
                    <p data-i18n="preview.missingGuide">${escapeHtml(dict.preview.missingGuide)}</p>
                    <button
                      type="button"
                      class="btn btn-accent btn-sm"
                      id="fill-sample-btn"
                      data-i18n="builder.actions.fillSample"
                    >${escapeHtml(dict.builder.actions.fillSample)}</button>
                  </div>
                  <div class="stage-message hidden" id="preview-error">
                    <p id="preview-error-text" data-i18n="preview.errorGuide">${escapeHtml(dict.preview.errorGuide)}</p>
                    <button
                      type="button"
                      class="btn btn-accent btn-sm"
                      id="retry-render-btn"
                      data-i18n="preview.retry"
                    >${escapeHtml(dict.preview.retry)}</button>
                  </div>
                </div>
              </div>
            </section>

            <section class="panel" aria-labelledby="source-heading">
              <div class="panel-header code-head">
                <h2 id="source-heading" data-i18n="preview.sourceHeading">
                  ${escapeHtml(dict.preview.sourceHeading)}
                </h2>
                <div class="code-actions">
                  <button
                    type="button"
                    class="btn btn-accent btn-sm"
                    id="copy-code-btn"
                    data-i18n="preview.copy"
                  >${escapeHtml(dict.preview.copy)}</button>
                  <button
                    type="button"
                    class="btn btn-sm"
                    id="download-svg-btn"
                    disabled
                    data-i18n="preview.downloadSvg"
                  >${escapeHtml(dict.preview.downloadSvg)}</button>
                </div>
              </div>
              <div class="panel-body">
                <div
                  class="code-tabs"
                  id="code-tabs"
                  role="tablist"
                  data-i18n-aria="aria.codeFormat"
                  aria-label="${escapeHtml(dict.aria.codeFormat)}"
                >
                  <button
                    type="button"
                    class="code-tab"
                    role="tab"
                    aria-selected="true"
                    data-code-tab="markdown"
                    data-i18n="preview.tabs.markdown"
                  >${escapeHtml(dict.preview.tabs.markdown)}</button>
                  <button
                    type="button"
                    class="code-tab"
                    role="tab"
                    aria-selected="false"
                    data-code-tab="html"
                    data-i18n="preview.tabs.html"
                  >${escapeHtml(dict.preview.tabs.html)}</button>
                  <button
                    type="button"
                    class="code-tab"
                    role="tab"
                    aria-selected="false"
                    data-code-tab="url"
                    data-i18n="preview.tabs.url"
                  >${escapeHtml(dict.preview.tabs.url)}</button>
                  <button
                    type="button"
                    class="code-tab"
                    role="tab"
                    aria-selected="false"
                    data-code-tab="curl"
                    data-i18n="preview.tabs.curl"
                  >${escapeHtml(dict.preview.tabs.curl)}</button>
                  <button
                    type="button"
                    class="code-tab"
                    role="tab"
                    aria-selected="false"
                    data-code-tab="svg"
                    data-i18n="preview.tabs.svg"
                  >${escapeHtml(dict.preview.tabs.svg)}</button>
                </div>

                <pre class="code-box" role="tabpanel" id="source-code-panel"><code id="source-code-output"></code></pre>
              </div>
            </section>
          </div>
        </section>

        <section id="endpoints" class="section-block" aria-labelledby="docs-heading">
          <div class="section-head">
            <h2 id="docs-heading" data-i18n="docs.heading">${escapeHtml(dict.docs.heading)}</h2>
            <p data-i18n="docs.lead">${escapeHtml(dict.docs.lead)}</p>
          </div>

          <div
            class="docs-toolbar"
            role="group"
            data-i18n-aria="aria.docsFilter"
            aria-label="${escapeHtml(dict.aria.docsFilter)}"
          >
            <button
              type="button"
              class="btn btn-sm btn-accent"
              data-doc-filter="all"
              aria-pressed="true"
              data-i18n="docs.filterAll"
            >${escapeHtml(dict.docs.filterAll)}</button>
            <button
              type="button"
              class="btn btn-sm"
              data-doc-filter="cards"
              aria-pressed="false"
              data-i18n="docs.filterCards"
            >${escapeHtml(dict.docs.filterCards)}</button>
            <button
              type="button"
              class="btn btn-sm"
              data-doc-filter="status"
              aria-pressed="false"
              data-i18n="docs.filterStatus"
            >${escapeHtml(dict.docs.filterStatus)}</button>
          </div>

          <div class="endpoint-list" id="endpoint-docs-list"></div>
        </section>

        <section id="deployment" class="section-block" aria-labelledby="deploy-heading">
          <div class="section-head">
            <h2 id="deploy-heading" data-i18n="deployment.heading">
              ${escapeHtml(dict.deployment.heading)}
            </h2>
            <p data-i18n="deployment.lead">${escapeHtml(dict.deployment.lead)}</p>
          </div>

          <div class="panel">
            <div class="panel-body">
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th data-i18n="deployment.colVar">${escapeHtml(dict.deployment.colVar)}</th>
                      <th data-i18n="deployment.colType">${escapeHtml(dict.deployment.colType)}</th>
                      <th data-i18n="deployment.colDefault">${escapeHtml(dict.deployment.colDefault)}</th>
                      <th data-i18n="deployment.colDesc">${escapeHtml(dict.deployment.colDesc)}</th>
                    </tr>
                  </thead>
                  <tbody id="deployment-tbody">
                    ${deploymentRowsHtml}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <script id="grs-bootstrap" type="application/json">${bootstrapPayload}</script>
    <script>${renderHomeClientScript()}</script>
  </body>
</html>`;
}
