export function renderHomeClientScript(): string {
  return `(function () {
        var bootstrapEl = document.getElementById("grs-bootstrap");
        if (!bootstrapEl) return;
        var BOOT = JSON.parse(bootstrapEl.textContent || "{}");
        var THEME_CATALOG = BOOT.themes || {};
        var ENDPOINTS = BOOT.endpoints || [];
        var I18N_CACHE = BOOT.i18n || {};

        var currentLang =
          document.documentElement.getAttribute("lang") === "id"
            ? "id"
            : BOOT.defaults && BOOT.defaults.lang === "id"
              ? "id"
              : "en";
        var currentEndpoint = "/api";
        var currentCodeTab = "markdown";
        var currentDocFilter = "all";
        var latestSvgText = "";
        var latestBlobUrl = "";
        var latestHttpStatus = "";
        var latestCacheHeader = "";
        var debounceTimer = null;
        var activeController = null;
        var fetchCounter = 0;
        var customParams = [];

        var form = document.getElementById("builder-form");
        var endpointTabs = Array.from(document.querySelectorAll("#endpoint-tabs .ep-tab"));
        var codeTabs = Array.from(document.querySelectorAll("#code-tabs .code-tab"));
        var docFilterBtns = Array.from(document.querySelectorAll("[data-doc-filter]"));
        var canvasBgBtns = Array.from(document.querySelectorAll("[data-canvas-bg]"));
        var previewStage = document.getElementById("preview-stage");
        var previewImg = document.getElementById("preview-img");
        var previewLoading = document.getElementById("preview-loading");
        var previewMissing = document.getElementById("preview-missing");
        var previewError = document.getElementById("preview-error");
        var previewErrorText = document.getElementById("preview-error-text");
        var statusPill = document.getElementById("preview-status-pill");
        var metaPill = document.getElementById("preview-meta-pill");
        var activeUrlText = document.getElementById("active-url-text");
        var openRawLink = document.getElementById("open-raw-link");
        var sourceCodeOutput = document.getElementById("source-code-output");
        var copyCodeBtn = document.getElementById("copy-code-btn");
        var downloadSvgBtn = document.getElementById("download-svg-btn");
        var themeSelect = document.getElementById("input-theme");
        var themeSwatches = document.getElementById("theme-swatches");
        var customParamList = document.getElementById("custom-param-list");

        var FIELD_NAMES_BY_ENDPOINT = {
          "/api": [
            "username",
            "custom_title",
            "theme",
            "locale",
            "card_width",
            "border_radius",
            "line_height",
            "show_icons",
            "include_all_commits",
            "hide_border",
            "hide_title",
            "hide_rank",
            "text_bold",
            "disable_animations",
            "hide",
            "show",
            "exclude_repo",
            "commits_year",
            "number_format",
            "number_precision",
            "rank_icon",
            "cache_seconds",
            "title_color",
            "text_color",
            "icon_color",
            "bg_color",
            "border_color",
            "ring_color",
          ],
          "/api/streak": [
            "username",
            "user",
            "theme",
            "locale",
            "card_width",
            "card_height",
            "border_radius",
            "hide_border",
            "disable_animations",
            "short_numbers",
            "timezone",
            "starting_year",
            "date_format",
            "cache_seconds",
            "title_color",
            "text_color",
            "icon_color",
            "bg_color",
            "border_color",
            "ring_color",
            "fire_color",
            "side_nums_color",
            "side_labels_color",
            "dates_color",
          ],
          "/api/top-langs": [
            "username",
            "custom_title",
            "theme",
            "locale",
            "layout",
            "card_width",
            "border_radius",
            "hide_border",
            "hide_title",
            "disable_animations",
            "hide_progress",
            "hide",
            "exclude_repo",
            "langs_count",
            "stats_format",
            "size_weight",
            "count_weight",
            "cache_seconds",
            "title_color",
            "text_color",
            "bg_color",
            "border_color",
          ],
          "/api/pin": [
            "username",
            "repo",
            "theme",
            "locale",
            "border_radius",
            "hide_border",
            "show_owner",
            "description_lines_count",
            "cache_seconds",
            "title_color",
            "text_color",
            "icon_color",
            "bg_color",
            "border_color",
          ],
          "/api/wakatime": [
            "username",
            "custom_title",
            "theme",
            "locale",
            "layout",
            "card_width",
            "border_radius",
            "line_height",
            "hide_border",
            "hide_title",
            "disable_animations",
            "hide_progress",
            "hide",
            "langs_count",
            "api_domain",
            "range",
            "display_format",
            "cache_seconds",
            "title_color",
            "text_color",
            "icon_color",
            "bg_color",
            "border_color",
          ],
          "/api/gist": [
            "id",
            "theme",
            "locale",
            "border_radius",
            "hide_border",
            "show_owner",
            "cache_seconds",
            "title_color",
            "text_color",
            "icon_color",
            "bg_color",
            "border_color",
          ],
        };

        var DEFAULT_FLAGS = {
          show_icons: true,
          include_all_commits:
            BOOT.defaults && BOOT.defaults.includeAllCommits !== undefined
              ? Boolean(BOOT.defaults.includeAllCommits)
              : true,
          hide_border: false,
          hide_title: false,
          hide_rank: false,
          text_bold: false,
          disable_animations: false,
          hide_progress: false,
          show_owner: true,
          short_numbers: false,
        };

        function getDict() {
          return I18N_CACHE[currentLang] || I18N_CACHE.en || {};
        }

        function getNested(obj, path) {
          var parts = path.split(".");
          var cur = obj;
          for (var i = 0; i < parts.length; i++) {
            if (!cur || typeof cur !== "object") return undefined;
            cur = cur[parts[i]];
          }
          return cur;
        }

        function t(path, fallback) {
          var v = getNested(getDict(), path);
          return typeof v === "string" ? v : fallback || path;
        }

        function updateThemeToggleLabel() {
          var isDark = document.documentElement.getAttribute("data-theme") === "dark";
          var btn = document.getElementById("theme-toggle-btn");
          var label = document.getElementById("theme-toggle-label");
          var icon = document.getElementById("theme-icon");
          if (btn) {
            btn.setAttribute("aria-pressed", isDark ? "true" : "false");
            btn.setAttribute(
              "aria-label",
              isDark ? t("toggles.switchToLight") : t("toggles.switchToDark"),
            );
          }
          if (label) {
            label.textContent = isDark ? t("toggles.themeLight") : t("toggles.themeDark");
          }
          if (icon) {
            while (icon.firstChild) icon.removeChild(icon.firstChild);
            var svgNs = "http://www.w3.org/2000/svg";
            if (isDark) {
              var c = document.createElementNS(svgNs, "circle");
              c.setAttribute("cx", "12");
              c.setAttribute("cy", "12");
              c.setAttribute("r", "4");
              icon.appendChild(c);
              var rays = [
                [12, 2, 12, 5],
                [12, 19, 12, 22],
                [4.93, 4.93, 7.05, 7.05],
                [16.95, 16.95, 19.07, 19.07],
                [2, 12, 5, 12],
                [19, 12, 22, 12],
              ];
              rays.forEach(function (r) {
                var l = document.createElementNS(svgNs, "line");
                l.setAttribute("x1", String(r[0]));
                l.setAttribute("y1", String(r[1]));
                l.setAttribute("x2", String(r[2]));
                l.setAttribute("y2", String(r[3]));
                icon.appendChild(l);
              });
            } else {
              var p = document.createElementNS(svgNs, "path");
              p.setAttribute("d", "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z");
              icon.appendChild(p);
            }
          }
        }

        function applyTranslations() {
          var dict = getDict();
          document.title = t("meta.title", document.title);
          document.documentElement.setAttribute("lang", currentLang);

          var enBtn = document.getElementById("lang-en-btn");
          var idBtn = document.getElementById("lang-id-btn");
          if (enBtn) enBtn.setAttribute("aria-pressed", currentLang === "en" ? "true" : "false");
          if (idBtn) idBtn.setAttribute("aria-pressed", currentLang === "id" ? "true" : "false");

          var nodes = document.querySelectorAll("[data-i18n]");
          for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var key = el.getAttribute("data-i18n");
            if (!key) continue;
            var val = getNested(dict, key);
            if (typeof val === "string") {
              el.textContent = val;
            }
          }

          var ariaNodes = document.querySelectorAll("[data-i18n-aria]");
          for (var a = 0; a < ariaNodes.length; a++) {
            var ariaEl = ariaNodes[a];
            var ariaKey = ariaEl.getAttribute("data-i18n-aria");
            if (!ariaKey) continue;
            var ariaVal = getNested(dict, ariaKey);
            if (typeof ariaVal === "string") {
              ariaEl.setAttribute("aria-label", ariaVal);
            }
          }

          var altNodes = document.querySelectorAll("[data-i18n-alt]");
          for (var b = 0; b < altNodes.length; b++) {
            var altEl = altNodes[b];
            var altKey = altEl.getAttribute("data-i18n-alt");
            if (!altKey) continue;
            var altVal = getNested(dict, altKey);
            if (typeof altVal === "string") {
              altEl.setAttribute("alt", altVal);
            }
          }

          var pickerNodes = document.querySelectorAll("[data-picker-label]");
          for (var c = 0; c < pickerNodes.length; c++) {
            var pickerEl = pickerNodes[c];
            var pickerKey = pickerEl.getAttribute("data-picker-label");
            if (!pickerKey) continue;
            pickerEl.setAttribute(
              "aria-label",
              t(pickerKey) + " " + t("aria.pickerSuffix"),
            );
          }

          var keyInputs = document.querySelectorAll("[data-custom-key]");
          for (var j = 0; j < keyInputs.length; j++) {
            keyInputs[j].setAttribute("placeholder", t("builder.fields.paramKeyPlaceholder"));
          }
          var valInputs = document.querySelectorAll("[data-custom-val]");
          for (var k = 0; k < valInputs.length; k++) {
            valInputs[k].setAttribute("placeholder", t("builder.fields.paramValPlaceholder"));
          }

          if (dict.deployment && Array.isArray(dict.deployment.vars)) {
            dict.deployment.vars.forEach(function (v, idx) {
              var typeEl = document.querySelector('[data-deploy-type="' + idx + '"]');
              var descEl = document.querySelector('[data-deploy-desc="' + idx + '"]');
              if (typeEl) typeEl.textContent = v.type;
              if (descEl) descEl.textContent = v.desc;
            });
          }

          updateThemeToggleLabel();
          renderThemeSwatches();
          renderEndpointDocs();
          refreshStatusBadgeText();
          updateSourceCodeDisplay();
        }

        async function switchLanguage(lang) {
          if (lang !== "en" && lang !== "id") return;
          currentLang = lang;
          try {
            localStorage.setItem("grs-ui-lang", lang);
          } catch (err) {
            /* ignore */
          }
          if (window.fetch) {
            try {
              var res = await fetch("/i18n/" + lang + ".json");
              if (res.ok) {
                I18N_CACHE[lang] = await res.json();
              }
            } catch (err) {
              /* fallback to embedded dictionary */
            }
          }
          applyTranslations();
        }

        function normalizeHex(raw) {
          if (!raw) return "";
          var trimmed = String(raw).trim().replace(/^#/, "");
          if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
            return (
              trimmed[0] +
              trimmed[0] +
              trimmed[1] +
              trimmed[1] +
              trimmed[2] +
              trimmed[2]
            );
          }
          if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
          return "";
        }

        function renderThemeSwatches() {
          if (!themeSwatches || !themeSelect) return;
          var themeName = themeSelect.value || "default";
          var palette = THEME_CATALOG[themeName];
          while (themeSwatches.firstChild) {
            themeSwatches.removeChild(themeSwatches.firstChild);
          }
          if (!palette) return;

          var hint = document.createElement("span");
          hint.className = "hint-text";
          hint.textContent = t("builder.themePaletteHint");
          themeSwatches.appendChild(hint);

          ["bg_color", "border_color", "title_color", "icon_color", "text_color"].forEach(
            function (key) {
              var raw = palette[key];
              if (!raw) return;
              var clean = raw.replace(/^#/, "");
              var previewHex = clean.slice(0, 6);
              if (clean.length === 3) {
                previewHex =
                  clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
              }
              if (!/^[0-9a-fA-F]{6}$/.test(previewHex)) return;

              var chip = document.createElement("span");
              chip.className = "swatch-chip";
              var dot = document.createElement("span");
              dot.className = "swatch-dot";
              dot.style.backgroundColor = "#" + previewHex;
              var label = document.createElement("span");
              label.textContent = key.replace("_color", "") + ": #" + clean;
              chip.appendChild(dot);
              chip.appendChild(label);
              themeSwatches.appendChild(chip);
            },
          );
        }

        function updateVisibleFields() {
          var controlled = document.querySelectorAll("[data-for]");
          for (var i = 0; i < controlled.length; i++) {
            var el = controlled[i];
            var allowed = (el.getAttribute("data-for") || "").split(/\\s+/).filter(Boolean);
            if (allowed.length === 0 || allowed.indexOf(currentEndpoint) !== -1) {
              el.classList.remove("hidden");
            } else {
              el.classList.add("hidden");
            }
          }

          var layoutSelect = document.getElementById("input-layout");
          if (layoutSelect) {
            var currentLayout = layoutSelect.value;
            var opts =
              currentEndpoint === "/api/wakatime"
                ? ["", "normal", "compact"]
                : ["", "normal", "compact", "donut", "donut-vertical", "pie"];
            while (layoutSelect.firstChild) {
              layoutSelect.removeChild(layoutSelect.firstChild);
            }
            opts.forEach(function (val) {
              var opt = document.createElement("option");
              opt.value = val;
              if (!val) {
                opt.setAttribute("data-i18n", "builder.selects.default");
                opt.textContent = t("builder.selects.default");
              } else {
                opt.textContent = val;
              }
              if (val === currentLayout) opt.selected = true;
              layoutSelect.appendChild(opt);
            });
          }

          endpointTabs.forEach(function (tab) {
            var active = tab.getAttribute("data-endpoint") === currentEndpoint;
            tab.setAttribute("aria-selected", active ? "true" : "false");
          });
        }

        function buildRelativeUrl() {
          var allowed = FIELD_NAMES_BY_ENDPOINT[currentEndpoint] || [];
          var params = new URLSearchParams();

          allowed.forEach(function (name) {
            var input = form.querySelector('[name="' + name + '"]');
            if (!input) return;

            if (input.type === "checkbox") {
              var checked = Boolean(input.checked);
              if (name === "include_all_commits") {
                params.set(name, checked ? "true" : "false");
              } else if (checked) {
                params.set(name, "true");
              }
              return;
            }

            var val = String(input.value || "").trim();
            if (!val) return;
            if (name === "langs_count" && currentEndpoint !== "/api/top-langs" && currentEndpoint !== "/api/wakatime") {
              return;
            }
            if (name.endsWith("_color")) {
              val = val.replace(/^#/, "");
            }
            params.set(name, val);
          });

          customParams.forEach(function (pair) {
            var k = String(pair.key || "").trim();
            var v = String(pair.value || "").trim();
            if (k && v) {
              params.set(k, v);
            }
          });

          var qs = params.toString();
          return qs ? currentEndpoint + "?" + qs : currentEndpoint;
        }

        function buildFullUrl(relativeUrl) {
          var origin =
            window.location &&
            window.location.origin &&
            window.location.origin !== "null"
              ? window.location.origin
              : "https://github-readme-stats.pages.dev";
          return origin + relativeUrl;
        }

        function getMissingRequiredParam() {
          if (currentEndpoint === "/api/pin") {
            var repoInput = document.getElementById("input-repo");
            if (!repoInput || !repoInput.value.trim()) return "repo";
          }
          if (currentEndpoint === "/api/gist") {
            var idInput = document.getElementById("input-id");
            if (!idInput || !idInput.value.trim()) return "id";
          }
          if (currentEndpoint === "/api/wakatime") {
            var userInput = document.getElementById("input-username");
            if (!userInput || !userInput.value.trim()) return "username";
          }
          return null;
        }

        function refreshStatusBadgeText() {
          if (!statusPill) return;
          var state = statusPill.getAttribute("data-state") || "idle";
          if (state === "loading") statusPill.textContent = t("preview.statusLoading");
          else if (state === "success")
            statusPill.textContent =
              t("preview.statusSuccess") + (latestHttpStatus ? " (" + latestHttpStatus + ")" : "");
          else if (state === "error")
            statusPill.textContent =
              t("preview.statusError") + (latestHttpStatus ? " (" + latestHttpStatus + ")" : "");
          else if (state === "missing") statusPill.textContent = t("preview.statusMissing");
          else statusPill.textContent = t("preview.statusIdle");
        }

        function setStageState(state, errorDetail) {
          statusPill.setAttribute("data-state", state);
          refreshStatusBadgeText();

          previewImg.classList.add("hidden");
          previewLoading.classList.add("hidden");
          previewMissing.classList.add("hidden");
          previewError.classList.add("hidden");

          if (state === "loading") {
            previewLoading.classList.remove("hidden");
            if (downloadSvgBtn) downloadSvgBtn.disabled = true;
          } else if (state === "missing") {
            previewMissing.classList.remove("hidden");
            metaPill.classList.add("hidden");
            if (downloadSvgBtn) downloadSvgBtn.disabled = true;
          } else if (state === "error") {
            previewError.classList.remove("hidden");
            if (previewErrorText) {
              previewErrorText.textContent = errorDetail || t("preview.errorGuide");
            }
            metaPill.classList.add("hidden");
            if (downloadSvgBtn) downloadSvgBtn.disabled = true;
          } else if (state === "success") {
            previewImg.classList.remove("hidden");
            if (downloadSvgBtn) downloadSvgBtn.disabled = !latestSvgText;
          }
        }

        function updateSourceCodeDisplay() {
          var relativeUrl = buildRelativeUrl();
          var fullUrl = buildFullUrl(relativeUrl);
          if (activeUrlText) activeUrlText.textContent = relativeUrl;
          if (openRawLink) openRawLink.setAttribute("href", relativeUrl);

          var usernameEl = document.getElementById("input-username");
          var userAliasEl = document.getElementById("input-user");
          var targetUser =
            (currentEndpoint === "/api/streak" && userAliasEl && userAliasEl.value.trim()) ||
            (usernameEl && usernameEl.value.trim()) ||
            (BOOT.defaults && BOOT.defaults.username) ||
            "machfudn";
          var cardTitle = t("cards." + currentEndpoint + ".label", "GitHub Stats");
          var profileUrl = "https://github.com/" + encodeURIComponent(targetUser);

          var text = "";
          if (currentCodeTab === "markdown") {
            text = "[![" + cardTitle + "](" + fullUrl + ")](" + profileUrl + ")";
          } else if (currentCodeTab === "html") {
            text = '<img src="' + fullUrl + '" alt="' + cardTitle + '" />';
          } else if (currentCodeTab === "url") {
            text = fullUrl;
          } else if (currentCodeTab === "curl") {
            text =
              'curl -s "' +
              fullUrl +
              '"\\n\\n// JavaScript fetch\\nconst res = await fetch("' +
              fullUrl +
              '");\\nconst svg = await res.text();';
          } else if (currentCodeTab === "svg") {
            if (latestSvgText) {
              text = latestSvgText;
            } else if (statusPill.getAttribute("data-state") === "loading") {
              text = t("preview.svgPending");
            } else {
              text = t("preview.svgUnavailable");
            }
          }

          if (sourceCodeOutput) sourceCodeOutput.textContent = text;
        }

        async function fetchPreview() {
          var relativeUrl = buildRelativeUrl();
          updateSourceCodeDisplay();

          var missing = getMissingRequiredParam();
          if (missing) {
            latestSvgText = "";
            latestHttpStatus = "";
            setStageState("missing");
            updateSourceCodeDisplay();
            return;
          }

          if (activeController) {
            activeController.abort();
          }
          activeController = new AbortController();
          var token = ++fetchCounter;

          latestSvgText = "";
          latestHttpStatus = "";
          setStageState("loading");
          updateSourceCodeDisplay();

          try {
            var res = await fetch(relativeUrl, {
              signal: activeController.signal,
              headers: { Accept: "image/svg+xml,*/*;q=0.8" },
            });
            if (token !== fetchCounter) return;

            latestHttpStatus = String(res.status);
            latestCacheHeader = res.headers.get("Cache-Control") || "";
            var body = await res.text();
            if (token !== fetchCounter) return;

            if (!res.ok || body.indexOf("<svg") === -1) {
              latestSvgText = "";
              setStageState("error", t("preview.errorGuide") + " (HTTP " + res.status + ")");
              updateSourceCodeDisplay();
              return;
            }

            latestSvgText = body;
            if (latestBlobUrl) {
              URL.revokeObjectURL(latestBlobUrl);
            }
            var blob = new Blob([body], { type: "image/svg+xml;charset=utf-8" });
            latestBlobUrl = URL.createObjectURL(blob);
            previewImg.onload = function () {
              if (token !== fetchCounter) return;
              var dims =
                previewImg.naturalWidth && previewImg.naturalHeight
                  ? previewImg.naturalWidth + "x" + previewImg.naturalHeight
                  : "";
              var metaParts = [];
              if (dims) metaParts.push(dims);
              if (latestCacheHeader) metaParts.push(latestCacheHeader.split(",")[0]);
              if (metaParts.length > 0) {
                metaPill.textContent = metaParts.join(" | ");
                metaPill.classList.remove("hidden");
              } else {
                metaPill.classList.add("hidden");
              }
            };
            previewImg.src = latestBlobUrl;
            setStageState("success");
            updateSourceCodeDisplay();
          } catch (err) {
            if (err && err.name === "AbortError") return;
            if (token !== fetchCounter) return;
            latestSvgText = "";
            setStageState("error", t("preview.errorGuide"));
            updateSourceCodeDisplay();
          }
        }

        function schedulePreview(immediate) {
          updateSourceCodeDisplay();
          if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
          }
          if (immediate) {
            fetchPreview();
          } else {
            debounceTimer = setTimeout(fetchPreview, 260);
          }
        }

        function syncChipButtons() {
          var chips = document.querySelectorAll(".chip-btn");
          for (var i = 0; i < chips.length; i++) {
            var chip = chips[i];
            var targetId = chip.getAttribute("data-chip-target");
            var val = chip.getAttribute("data-chip-val");
            var input = targetId ? document.getElementById(targetId) : null;
            var items = input
              ? String(input.value || "")
                  .split(",")
                  .map(function (s) {
                    return s.trim();
                  })
                  .filter(Boolean)
              : [];
            chip.setAttribute("aria-pressed", items.indexOf(val) !== -1 ? "true" : "false");
          }
        }

        function renderCustomParamRows() {
          if (!customParamList) return;
          while (customParamList.firstChild) {
            customParamList.removeChild(customParamList.firstChild);
          }

          customParams.forEach(function (pair, index) {
            var row = document.createElement("div");
            row.className = "custom-param-row";

            var keyInput = document.createElement("input");
            keyInput.type = "text";
            keyInput.className = "mono-input";
            keyInput.value = pair.key;
            keyInput.setAttribute("data-custom-key", "true");
            keyInput.setAttribute("placeholder", t("builder.fields.paramKeyPlaceholder"));
            keyInput.addEventListener("input", function () {
              customParams[index].key = keyInput.value;
              schedulePreview(false);
            });

            var valInput = document.createElement("input");
            valInput.type = "text";
            valInput.className = "mono-input";
            valInput.value = pair.value;
            valInput.setAttribute("data-custom-val", "true");
            valInput.setAttribute("placeholder", t("builder.fields.paramValPlaceholder"));
            valInput.addEventListener("input", function () {
              customParams[index].value = valInput.value;
              schedulePreview(false);
            });

            var removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.className = "btn btn-sm";
            removeBtn.textContent = t("builder.actions.removeParam");
            removeBtn.addEventListener("click", function () {
              customParams.splice(index, 1);
              renderCustomParamRows();
              schedulePreview(true);
            });

            row.appendChild(keyInput);
            row.appendChild(valInput);
            row.appendChild(removeBtn);
            customParamList.appendChild(row);
          });
        }

        function bindColorInputs() {
          var colorPickers = document.querySelectorAll('input[type="color"][id^="picker-"]');
          for (var i = 0; i < colorPickers.length; i++) {
            (function (picker) {
              var name = picker.id.replace("picker-", "");
              var textInput = document.getElementById("input-" + name);
              if (!textInput) return;

              picker.addEventListener("input", function () {
                textInput.value = picker.value.replace(/^#/, "");
                schedulePreview(false);
              });

              textInput.addEventListener("input", function () {
                var hex = normalizeHex(textInput.value);
                if (hex) {
                  picker.value = "#" + hex;
                }
                schedulePreview(false);
              });
            })(colorPickers[i]);
          }

          var clearBtns = document.querySelectorAll("[data-clear-target]");
          for (var j = 0; j < clearBtns.length; j++) {
            (function (btn) {
              btn.addEventListener("click", function () {
                var targetId = btn.getAttribute("data-clear-target");
                var input = targetId ? document.getElementById(targetId) : null;
                if (input) {
                  input.value = "";
                  schedulePreview(true);
                }
              });
            })(clearBtns[j]);
          }
        }

        function resetDefaults() {
          var def = BOOT.defaults || {};
          form.reset();
          var u = document.getElementById("input-username");
          if (u) u.value = def.username || "machfudn";
          var th = document.getElementById("input-theme");
          if (th) th.value = def.theme || "transparent";
          var loc = document.getElementById("input-locale");
          if (loc) loc.value = def.locale || "en";
          var lc = document.getElementById("input-langs_count");
          if (lc) lc.value = def.langsCount || "8";
          var cs = document.getElementById("input-cache_seconds");
          if (cs) cs.value = def.cacheSeconds || "";
          var repo = document.getElementById("input-repo");
          if (repo) repo.value = "github-readme-stats";
          var gist = document.getElementById("input-id");
          if (gist) gist.value = "bbfce31e0217a3689c8d961a356cb10d";

          Object.keys(DEFAULT_FLAGS).forEach(function (flag) {
            var cb = document.getElementById("flag-" + flag);
            if (cb) cb.checked = Boolean(DEFAULT_FLAGS[flag]);
          });

          customParams = [];
          renderCustomParamRows();
          syncChipButtons();
          renderThemeSwatches();
          updateVisibleFields();
          schedulePreview(true);
        }

        function loadEndpointPreset(path, sampleParams) {
          if (FIELD_NAMES_BY_ENDPOINT[path]) {
            currentEndpoint = path;
            updateVisibleFields();
            if (sampleParams && typeof sampleParams === "object") {
              Object.keys(sampleParams).forEach(function (key) {
                var el = form.querySelector('[name="' + key + '"]');
                if (!el) return;
                if (el.type === "checkbox") {
                  el.checked = sampleParams[key] === "true";
                } else {
                  el.value = sampleParams[key];
                }
              });
            }
            syncChipButtons();
            schedulePreview(true);
            var pg = document.getElementById("playground");
            if (pg && pg.scrollIntoView) {
              pg.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        }

        function renderEndpointDocs() {
          var container = document.getElementById("endpoint-docs-list");
          if (!container) return;
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }

          var filtered = ENDPOINTS.filter(function (ep) {
            if (currentDocFilter === "all") return true;
            return ep.category === currentDocFilter;
          });

          filtered.forEach(function (ep) {
            var card = document.createElement("article");
            card.className = "endpoint-card";

            var head = document.createElement("div");
            head.className = "endpoint-card-head";

            var titleGroup = document.createElement("div");
            titleGroup.className = "endpoint-title-group";

            var method = document.createElement("span");
            method.className = "method-badge";
            method.textContent = ep.method;

            var pathCode = document.createElement("code");
            pathCode.className = "endpoint-path";
            pathCode.textContent = ep.path;

            var labelSpan = document.createElement("span");
            labelSpan.className = "endpoint-label";
            labelSpan.textContent = t("cards." + ep.path + ".label", ep.path);

            titleGroup.appendChild(method);
            titleGroup.appendChild(pathCode);
            titleGroup.appendChild(labelSpan);

            var actionBtn = document.createElement("button");
            actionBtn.type = "button";
            actionBtn.className = "btn btn-sm btn-accent";
            if (ep.category === "cards") {
              actionBtn.textContent = t("docs.loadInBuilder");
              actionBtn.addEventListener("click", function () {
                loadEndpointPreset(ep.path, ep.sampleParams);
              });
            } else {
              actionBtn.textContent = t("docs.testEndpoint");
            }

            head.appendChild(titleGroup);
            head.appendChild(actionBtn);

            var body = document.createElement("div");
            body.className = "endpoint-card-body";

            var summary = document.createElement("p");
            summary.className = "endpoint-summary";
            summary.textContent = t("cards." + ep.path + ".summary", "");

            var alias = document.createElement("p");
            alias.className = "endpoint-alias";
            alias.textContent = t("cards." + ep.path + ".aliases", "");

            var exStrip = document.createElement("div");
            exStrip.className = "example-strip";
            var exLabel = document.createElement("strong");
            exLabel.textContent = t("docs.exampleLabel") + ":";
            var exLink = document.createElement("a");
            exLink.href = ep.exampleQuery;
            exLink.target = "_blank";
            exLink.rel = "noreferrer";
            var exCode = document.createElement("code");
            exCode.textContent = ep.exampleQuery;
            exLink.appendChild(exCode);
            exStrip.appendChild(exLabel);
            exStrip.appendChild(exLink);

            body.appendChild(summary);
            if (alias.textContent) body.appendChild(alias);
            body.appendChild(exStrip);

            if (ep.params && ep.params.length > 0) {
              var wrap = document.createElement("div");
              wrap.className = "table-wrap";
              var table = document.createElement("table");
              var thead = document.createElement("thead");
              var htr = document.createElement("tr");
              ["paramsColName", "paramsColReq", "paramsColExample", "paramsColDesc"].forEach(
                function (colKey) {
                  var th = document.createElement("th");
                  th.textContent = t("docs." + colKey);
                  htr.appendChild(th);
                },
              );
              thead.appendChild(htr);
              table.appendChild(thead);

              var tbody = document.createElement("tbody");
              ep.params.forEach(function (p) {
                var tr = document.createElement("tr");
                var tdName = document.createElement("td");
                var codeName = document.createElement("code");
                codeName.textContent = p.name;
                tdName.appendChild(codeName);

                var tdReq = document.createElement("td");
                var reqBadge = document.createElement("span");
                reqBadge.className = "tag-badge" + (p.required ? " req" : "");
                reqBadge.textContent = p.required
                  ? t("docs.requiredYes")
                  : t("docs.requiredNo");
                tdReq.appendChild(reqBadge);

                var tdEx = document.createElement("td");
                var codeEx = document.createElement("code");
                codeEx.textContent = p.example;
                tdEx.appendChild(codeEx);

                var tdDesc = document.createElement("td");
                tdDesc.textContent = currentLang === "id" ? p.descId : p.descEn;

                tr.appendChild(tdName);
                tr.appendChild(tdReq);
                tr.appendChild(tdEx);
                tr.appendChild(tdDesc);
                tbody.appendChild(tr);
              });

              table.appendChild(tbody);
              wrap.appendChild(table);
              body.appendChild(wrap);
            } else {
              var noParams = document.createElement("p");
              noParams.className = "hint-text";
              noParams.textContent = t("docs.noParams");
              body.appendChild(noParams);
            }

            if (ep.category === "status") {
              var outPre = document.createElement("pre");
              outPre.className = "live-json-box hidden";
              body.appendChild(outPre);

              actionBtn.addEventListener("click", async function () {
                actionBtn.disabled = true;
                actionBtn.textContent = t("docs.runningCheck");
                outPre.classList.remove("hidden");
                outPre.textContent = t("docs.runningCheck");
                try {
                  var res = await fetch(ep.path, {
                    headers: { Accept: "application/json" },
                  });
                  var txt = await res.text();
                  try {
                    var parsed = JSON.parse(txt);
                    outPre.textContent =
                      "HTTP " + res.status + "\\n" + JSON.stringify(parsed, null, 2);
                  } catch (jsonErr) {
                    outPre.textContent = "HTTP " + res.status + "\\n" + txt;
                  }
                } catch (netErr) {
                  outPre.textContent = t("docs.requestFailed");
                } finally {
                  actionBtn.disabled = false;
                  actionBtn.textContent = t("docs.testEndpoint");
                }
              });
            }

            card.appendChild(head);
            card.appendChild(body);
            container.appendChild(card);
          });
        }

        function copyTextWithFallback(text) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(function () {
              fallbackExecCopy(text);
            });
          }
          fallbackExecCopy(text);
          return Promise.resolve();
        }

        function fallbackExecCopy(text) {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }

        /* Event bindings */
        var themeToggleBtn = document.getElementById("theme-toggle-btn");
        if (themeToggleBtn) {
          themeToggleBtn.addEventListener("click", function () {
            var cur = document.documentElement.getAttribute("data-theme");
            var next = cur === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            try {
              localStorage.setItem("grs-ui-theme", next);
            } catch (err) {
              /* ignore */
            }
            updateThemeToggleLabel();
          });
        }

        document.querySelectorAll("[data-lang-choice]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            switchLanguage(btn.getAttribute("data-lang-choice"));
          });
        });

        endpointTabs.forEach(function (tab, idx) {
          tab.addEventListener("click", function () {
            var nextEp = tab.getAttribute("data-endpoint");
            if (!nextEp || nextEp === currentEndpoint) return;
            currentEndpoint = nextEp;
            updateVisibleFields();
            schedulePreview(true);
          });
          tab.addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              var delta = e.key === "ArrowRight" ? 1 : -1;
              var nextTab =
                endpointTabs[(idx + delta + endpointTabs.length) % endpointTabs.length];
              if (nextTab) {
                nextTab.focus();
                nextTab.click();
              }
            }
          });
        });

        codeTabs.forEach(function (tab, idx) {
          tab.addEventListener("click", function () {
            var nextTab = tab.getAttribute("data-code-tab");
            if (!nextTab) return;
            currentCodeTab = nextTab;
            codeTabs.forEach(function (item) {
              item.setAttribute(
                "aria-selected",
                item.getAttribute("data-code-tab") === currentCodeTab
                  ? "true"
                  : "false",
              );
            });
            updateSourceCodeDisplay();
          });
          tab.addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              var delta = e.key === "ArrowRight" ? 1 : -1;
              var nextBtn = codeTabs[(idx + delta + codeTabs.length) % codeTabs.length];
              if (nextBtn) {
                nextBtn.focus();
                nextBtn.click();
              }
            }
          });
        });

        canvasBgBtns.forEach(function (btn) {
          btn.addEventListener("click", function () {
            var bg = btn.getAttribute("data-canvas-bg");
            if (!bg || !previewStage) return;
            previewStage.setAttribute("data-canvas", bg);
            canvasBgBtns.forEach(function (b) {
              b.setAttribute(
                "aria-pressed",
                b.getAttribute("data-canvas-bg") === bg ? "true" : "false",
              );
            });
          });
        });

        docFilterBtns.forEach(function (btn) {
          btn.addEventListener("click", function () {
            var f = btn.getAttribute("data-doc-filter") || "all";
            currentDocFilter = f;
            docFilterBtns.forEach(function (b) {
              var active = b.getAttribute("data-doc-filter") === f;
              b.setAttribute("aria-pressed", active ? "true" : "false");
              b.classList.toggle("btn-accent", active);
            });
            renderEndpointDocs();
          });
        });

        if (form) {
          form.addEventListener("input", function (e) {
            var target = e.target;
            if (target && (target.id === "input-hide" || target.id === "input-show")) {
              syncChipButtons();
            }
            if (target && target.type === "color") return;
            schedulePreview(false);
          });
          form.addEventListener("change", function (e) {
            var target = e.target;
            if (target && target.id === "input-theme") {
              renderThemeSwatches();
            }
            if (target && (target.type === "checkbox" || target.tagName === "SELECT")) {
              schedulePreview(true);
            }
          });
        }

        document.querySelectorAll(".chip-btn").forEach(function (chip) {
          chip.addEventListener("click", function () {
            var targetId = chip.getAttribute("data-chip-target");
            var chipVal = chip.getAttribute("data-chip-val");
            var input = targetId ? document.getElementById(targetId) : null;
            if (!input || !chipVal) return;
            var parts = String(input.value || "")
              .split(",")
              .map(function (s) {
                return s.trim();
              })
              .filter(Boolean);
            var existingIdx = parts.indexOf(chipVal);
            if (existingIdx === -1) parts.push(chipVal);
            else parts.splice(existingIdx, 1);
            input.value = parts.join(",");
            syncChipButtons();
            schedulePreview(true);
          });
        });

        var addCustomBtn = document.getElementById("add-custom-param-btn");
        if (addCustomBtn) {
          addCustomBtn.addEventListener("click", function () {
            customParams.push({ key: "", value: "" });
            renderCustomParamRows();
          });
        }

        var renderNowBtn = document.getElementById("render-now-btn");
        if (renderNowBtn) {
          renderNowBtn.addEventListener("click", function () {
            fetchPreview();
          });
        }

        var retryRenderBtn = document.getElementById("retry-render-btn");
        if (retryRenderBtn) {
          retryRenderBtn.addEventListener("click", function () {
            fetchPreview();
          });
        }

        var fillSampleBtn = document.getElementById("fill-sample-btn");
        if (fillSampleBtn) {
          fillSampleBtn.addEventListener("click", function () {
            if (currentEndpoint === "/api/pin") {
              var r = document.getElementById("input-repo");
              if (r) r.value = "github-readme-stats";
            } else if (currentEndpoint === "/api/gist") {
              var g = document.getElementById("input-id");
              if (g) g.value = "bbfce31e0217a3689c8d961a356cb10d";
            } else {
              var u = document.getElementById("input-username");
              if (u) u.value = (BOOT.defaults && BOOT.defaults.username) || "machfudn";
            }
            fetchPreview();
          });
        }

        var resetBtn = document.getElementById("reset-builder-btn");
        if (resetBtn) {
          resetBtn.addEventListener("click", resetDefaults);
        }

        if (copyCodeBtn) {
          copyCodeBtn.addEventListener("click", function () {
            var codeText = sourceCodeOutput ? sourceCodeOutput.textContent || "" : "";
            copyTextWithFallback(codeText).then(function () {
              copyCodeBtn.textContent = t("preview.copied");
              setTimeout(function () {
                copyCodeBtn.textContent = t("preview.copy");
              }, 1600);
            });
          });
        }

        if (downloadSvgBtn) {
          downloadSvgBtn.addEventListener("click", function () {
            if (!latestSvgText) return;
            var blob = new Blob([latestSvgText], {
              type: "image/svg+xml;charset=utf-8",
            });
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download =
              currentEndpoint.replace(/^\\/api\\/?/, "github-stats-") + ".svg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });
        }

        bindColorInputs();
        syncChipButtons();
        updateVisibleFields();
        applyTranslations();
        fetchPreview();
      })();`;
}
