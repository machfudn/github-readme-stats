import { Card } from "../common/Card.js";
import { getCardColors } from "../common/color.js";
import { kFormatter } from "../common/fmt.js";
import { encodeHTML } from "../common/html.js";
import { I18n } from "../common/I18n.js";
import type { StreakData } from "../fetchers/types.d.ts";
import { isLocaleAvailable, streakCardLocales } from "../translations.js";
import type { StreakCardOptions } from "./types.d.ts";

const withHash = (hex: string | undefined, fallback: string): string =>
  hex ? `#${hex.replace(/^#/, "")}` : fallback;

const formatNumber = (
  num: number,
  locale = "en",
  shortNumbers = false,
): string => {
  if (shortNumbers) {
    return String(kFormatter(num));
  }

  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch {
    return new Intl.NumberFormat("en").format(num);
  }
};

const resolveIntlLocale = (locale: string): string => {
  try {
    new Intl.DateTimeFormat(locale);
    return locale;
  } catch {
    return "en";
  }
};

const formatDateWithPattern = (
  date: Date,
  validLocale: string,
  pattern: string,
): string => {
  const isCurrentYear = date.getUTCFullYear() === new Date().getUTCFullYear();
  const expandedPattern = pattern.replace(/\[([^\]]*)\]/g, (_match, inner) =>
    isCurrentYear ? "" : inner,
  );
  const year = date.getUTCFullYear();
  const monthNum = date.getUTCMonth() + 1;
  const dayNum = date.getUTCDate();

  const shortMonth = new Intl.DateTimeFormat(validLocale, {
    month: "short",
    timeZone: "UTC",
  }).format(date);
  const longMonth = new Intl.DateTimeFormat(validLocale, {
    month: "long",
    timeZone: "UTC",
  }).format(date);

  const tokens: Record<string, string> = {
    Y: String(year),
    y: String(year).slice(-2),
    F: longMonth,
    M: shortMonth,
    m: String(monthNum).padStart(2, "0"),
    n: String(monthNum),
    d: String(dayNum).padStart(2, "0"),
    j: String(dayNum),
  };

  return expandedPattern.replace(/[YyFMmndj]/g, (tok) => tokens[tok] ?? tok);
};

const formatDate = (
  dateString: string,
  locale = "en",
  dateFormat?: string,
): string => {
  if (!dateString) return "";
  try {
    const date = new Date(`${dateString}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return dateString;
    const validLocale = resolveIntlLocale(locale);

    if (dateFormat) {
      return formatDateWithPattern(date, validLocale, dateFormat);
    }

    const isCurrentYear = date.getUTCFullYear() === new Date().getUTCFullYear();
    return new Intl.DateTimeFormat(
      validLocale,
      isCurrentYear
        ? { month: "short", day: "numeric", timeZone: "UTC" }
        : { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
    ).format(date);
  } catch {
    return dateString;
  }
};

const formatRange = (
  start: string,
  end: string,
  locale = "en",
  dateFormat?: string,
): string => {
  const formattedStart = formatDate(start, locale, dateFormat);
  const formattedEnd = formatDate(end, locale, dateFormat);
  if (formattedStart && formattedEnd && formattedStart !== formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }
  return formattedStart;
};

export const renderStreakCard = (
  streakData: StreakData,
  options: StreakCardOptions = {},
): string => {
  const {
    theme = "default",
    hide_border = false,
    border_radius = 4.5,
    card_width = 495,
    card_height = 195,
    short_numbers = false,
    disable_animations = false,
    date_format,
    locale = "en",
    title_color,
    text_color,
    icon_color,
    bg_color,
    border_color,
    ring_color,
    fire_color,
    side_nums_color,
    side_labels_color,
    dates_color,
  } = options;

  const width = Math.max(300, Math.trunc(card_width) || 495);
  const height = Math.max(170, Math.trunc(card_height) || 195);
  const radius = Number.isFinite(border_radius) ? border_radius : 4.5;
  const resolvedLocale = (locale || "en").toLowerCase();

  const i18n = new I18n({
    locale: isLocaleAvailable(resolvedLocale) ? resolvedLocale : "en",
    translations: streakCardLocales,
  });

  const colors = getCardColors({
    title_color,
    text_color,
    icon_color,
    bg_color,
    border_color,
    ring_color,
    theme,
  });

  const gradientSvg = new Card({ colors }).renderGradient();
  const backgroundFill = Array.isArray(colors.bgColor)
    ? "url(#gradient)"
    : colors.bgColor;

  const borderStroke = hide_border ? "none" : colors.borderColor;
  const strokeColor = colors.borderColor;
  const ringColorResolved = withHash(
    ring_color,
    colors.ringColor || colors.iconColor,
  );
  const fireColorResolved = withHash(
    fire_color,
    colors.iconColor || colors.titleColor,
  );
  const currStreakNumColor = colors.titleColor;
  const sideNumsColorResolved = withHash(side_nums_color, colors.titleColor);
  const currStreakLabelColor = colors.titleColor;
  const sideLabelsColorResolved = withHash(side_labels_color, colors.textColor);
  const datesColorResolved = withHash(dates_color, colors.textColor);

  const colWidth = width / 3;
  const heightOffset = (height - 195) / 2;
  const col1X = colWidth / 2;
  const col2X = colWidth * 1.5;
  const col3X = colWidth * 2.5;
  const divider1X = colWidth;
  const divider2X = colWidth * 2;
  const dividerY1 = 28 + heightOffset / 2;
  const dividerY2 = 170 + heightOffset;

  const totalContributionsLabel = encodeHTML(
    i18n.t("streakcard.totalContributions"),
  );
  const currentStreakLabel = encodeHTML(i18n.t("streakcard.currentStreak"));
  const longestStreakLabel = encodeHTML(i18n.t("streakcard.longestStreak"));
  const presentLabel = i18n.t("streakcard.present");

  const totalContributionsFormatted = formatNumber(
    streakData.totalContributions,
    resolvedLocale,
    short_numbers,
  );
  const firstContributionFormatted = formatDate(
    streakData.firstContribution,
    resolvedLocale,
    date_format,
  );
  const totalContributionsRange = firstContributionFormatted
    ? `${firstContributionFormatted} - ${presentLabel}`
    : presentLabel;

  const currentStreakFormatted = formatNumber(
    streakData.currentStreak.length,
    resolvedLocale,
    short_numbers,
  );
  const currentStreakRange = formatRange(
    streakData.currentStreak.start,
    streakData.currentStreak.end,
    resolvedLocale,
    date_format,
  );

  const longestStreakFormatted = formatNumber(
    streakData.longestStreak.length,
    resolvedLocale,
    short_numbers,
  );
  const longestStreakRange = formatRange(
    streakData.longestStreak.start,
    streakData.longestStreak.end,
    resolvedLocale,
    date_format,
  );

  const animStyle = disable_animations
    ? `
      * {
        animation: none !important;
        opacity: 1 !important;
      }
    `
    : `
      @keyframes currstreak {
        0% { font-size: 3px; opacity: 0.2; }
        80% { font-size: 34px; opacity: 1; }
        100% { font-size: 28px; opacity: 1; }
      }
      @keyframes fadein {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    `;

  return `
    <svg
      xmlns='http://www.w3.org/2000/svg'
      xmlns:xlink='http://www.w3.org/1999/xlink'
      style='isolation: isolate'
      viewBox='0 0 ${width} ${height}'
      width='${width}px'
      height='${height}px'
    >
      <style>
        ${animStyle}
      </style>
      <defs>
        <clipPath id='outer_rectangle'>
          <rect width='${width}' height='${height}' rx='${radius}'/>
        </clipPath>
        <mask id='mask_out_ring_behind_fire'>
          <rect width='${width}' height='${height}' fill='white'/>
          <ellipse id='mask-ellipse' cx='${col2X}' cy='${32 + heightOffset}' rx='13' ry='18' fill='black'/>
        </mask>
      </defs>
      ${gradientSvg}
      <g clip-path='url(#outer_rectangle)'>
        <g style='isolation: isolate'>
          <rect
            stroke='${borderStroke}'
            fill='${backgroundFill}'
            rx='${radius}'
            x='0.5'
            y='0.5'
            width='${width - 1}'
            height='${height - 1}'
          />
        </g>
        <g style='isolation: isolate'>
          <line
            x1='${divider1X}'
            y1='${dividerY1}'
            x2='${divider1X}'
            y2='${dividerY2}'
            vector-effect='non-scaling-stroke'
            stroke-width='1'
            stroke='${strokeColor}'
            stroke-linejoin='miter'
            stroke-linecap='square'
            stroke-miterlimit='3'
          />
          <line
            x1='${divider2X}'
            y1='${dividerY1}'
            x2='${divider2X}'
            y2='${dividerY2}'
            vector-effect='non-scaling-stroke'
            stroke-width='1'
            stroke='${strokeColor}'
            stroke-linejoin='miter'
            stroke-linecap='square'
            stroke-miterlimit='3'
          />
        </g>
        <!-- Column 1: Total Contributions -->
        <g style='isolation: isolate'>
          <g transform='translate(${col1X}, ${48 + heightOffset})'>
            <text
              x='0'
              y='32'
              stroke-width='0'
              text-anchor='middle'
              fill='${sideNumsColorResolved}'
              stroke='none'
              font-family='"Segoe UI", Ubuntu, sans-serif'
              font-weight='700'
              font-size='28px'
              font-style='normal'
              style='opacity: 0; animation: fadein 0.5s linear forwards 0.6s'
            >
              ${encodeHTML(totalContributionsFormatted)}
            </text>
          </g>
          <g transform='translate(${col1X}, ${84 + heightOffset})'>
            <text
              x='0'
              y='32'
              stroke-width='0'
              text-anchor='middle'
              fill='${sideLabelsColorResolved}'
              stroke='none'
              font-family='"Segoe UI", Ubuntu, sans-serif'
              font-weight='400'
              font-size='14px'
              font-style='normal'
              style='opacity: 0; animation: fadein 0.5s linear forwards 0.7s'
            >
              ${totalContributionsLabel}
            </text>
          </g>
          <g transform='translate(${col1X}, ${114 + heightOffset})'>
            <text
              x='0'
              y='32'
              stroke-width='0'
              text-anchor='middle'
              fill='${datesColorResolved}'
              stroke='none'
              font-family='"Segoe UI", Ubuntu, sans-serif'
              font-weight='400'
              font-size='12px'
              font-style='normal'
              style='opacity: 0; animation: fadein 0.5s linear forwards 0.8s'
            >
              ${encodeHTML(totalContributionsRange)}
            </text>
          </g>
        </g>
        <!-- Column 2: Current Streak -->
        <g style='isolation: isolate'>
          <g transform='translate(${col2X}, ${108 + heightOffset})'>
            <text
              x='0'
              y='32'
              stroke-width='0'
              text-anchor='middle'
              fill='${currStreakLabelColor}'
              stroke='none'
              font-family='"Segoe UI", Ubuntu, sans-serif'
              font-weight='700'
              font-size='14px'
              font-style='normal'
              style='opacity: 0; animation: fadein 0.5s linear forwards 0.9s'
            >
              ${currentStreakLabel}
            </text>
          </g>
          <g transform='translate(${col2X}, ${145 + heightOffset})'>
            <text
              x='0'
              y='21'
              stroke-width='0'
              text-anchor='middle'
              fill='${datesColorResolved}'
              stroke='none'
              font-family='"Segoe UI", Ubuntu, sans-serif'
              font-weight='400'
              font-size='12px'
              font-style='normal'
              style='opacity: 0; animation: fadein 0.5s linear forwards 0.9s'
            >
              ${encodeHTML(currentStreakRange)}
            </text>
          </g>
          <g mask='url(#mask_out_ring_behind_fire)'>
            <circle
              cx='${col2X}'
              cy='${71 + heightOffset}'
              r='40'
              fill='none'
              stroke='${ringColorResolved}'
              stroke-width='5'
              style='opacity: 0; animation: fadein 0.5s linear forwards 0.4s'
            />
          </g>
          <g
            transform='translate(${col2X}, ${19.5 + heightOffset})'
            stroke-opacity='0'
            style='opacity: 0; animation: fadein 0.5s linear forwards 0.6s'
          >
            <path d='M -12 -0.5 L 15 -0.5 L 15 23.5 L -12 23.5 L -12 -0.5 Z' fill='none'/>
            <path
              d='M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z'
              fill='${fireColorResolved}'
              stroke-opacity='0'
            />
          </g>
          <g transform='translate(${col2X}, ${48 + heightOffset})'>
            <text
              x='0'
              y='32'
              stroke-width='0'
              text-anchor='middle'
              fill='${currStreakNumColor}'
              stroke='none'
              font-family='"Segoe UI", Ubuntu, sans-serif'
              font-weight='700'
              font-size='28px'
              font-style='normal'
              style='animation: currstreak 0.6s linear forwards'
            >
              ${encodeHTML(currentStreakFormatted)}
            </text>
          </g>
        </g>
        <!-- Column 3: Longest Streak -->
        <g style='isolation: isolate'>
          <g transform='translate(${col3X}, ${48 + heightOffset})'>
            <text
              x='0'
              y='32'
              stroke-width='0'
              text-anchor='middle'
              fill='${sideNumsColorResolved}'
              stroke='none'
              font-family='"Segoe UI", Ubuntu, sans-serif'
              font-weight='700'
              font-size='28px'
              font-style='normal'
              style='opacity: 0; animation: fadein 0.5s linear forwards 1.2s'
            >
              ${encodeHTML(longestStreakFormatted)}
            </text>
          </g>
          <g transform='translate(${col3X}, ${84 + heightOffset})'>
            <text
              x='0'
              y='32'
              stroke-width='0'
              text-anchor='middle'
              fill='${sideLabelsColorResolved}'
              stroke='none'
              font-family='"Segoe UI", Ubuntu, sans-serif'
              font-weight='400'
              font-size='14px'
              font-style='normal'
              style='opacity: 0; animation: fadein 0.5s linear forwards 1.3s'
            >
              ${longestStreakLabel}
            </text>
          </g>
          <g transform='translate(${col3X}, ${114 + heightOffset})'>
            <text
              x='0'
              y='32'
              stroke-width='0'
              text-anchor='middle'
              fill='${datesColorResolved}'
              stroke='none'
              font-family='"Segoe UI", Ubuntu, sans-serif'
              font-weight='400'
              font-size='12px'
              font-style='normal'
              style='opacity: 0; animation: fadein 0.5s linear forwards 1.4s'
            >
              ${encodeHTML(longestStreakRange)}
            </text>
          </g>
        </g>
      </g>
    </svg>
  `;
};

export default renderStreakCard;
