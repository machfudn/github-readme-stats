import { z } from "@hono/zod-openapi";

export const CommonCardParams = {
  title_color: z.string().optional().openapi({
    description: "Title color (hex code without # or color name)",
    example: "2f80ed",
  }),
  text_color: z.string().optional().openapi({
    description: "Body text color (hex code without # or color name)",
    example: "434d58",
  }),
  icon_color: z.string().optional().openapi({
    description: "Icon color (hex code without # or color name)",
    example: "4c71f2",
  }),
  bg_color: z.string().optional().openapi({
    description:
      "Card background color or gradient (e.g. 'fff' or 'deg,color1,color2')",
    example: "fff",
  }),
  border_color: z.string().optional().openapi({
    description: "Card border color (hex code without # or color name)",
    example: "e4e2e2",
  }),
  border_radius: z.string().optional().openapi({
    description: "Border radius in px (0 - 50)",
    example: "4.5",
  }),
  hide_border: z.string().optional().openapi({
    description: "Hide card border (true/false)",
    example: "false",
  }),
  theme: z.string().optional().openapi({
    description:
      "Theme name (e.g. radical, dracula, tokyonight, dark, synthwave)",
    example: "radical",
  }),
  locale: z.string().optional().openapi({
    description:
      "Card localization language code (e.g. en, id, ja, de, es, fr)",
    example: "en",
  }),
  cache_seconds: z.string().optional().openapi({
    description: "Custom cache lifetime in seconds",
    example: "1800",
  }),
  custom_title: z.string().optional().openapi({
    description: "Custom title for the card",
    example: "My Custom Stats",
  }),
};

export const StatsQuerySchema = z.object({
  username: z.string().optional().openapi({
    description: "GitHub username",
    example: "anuraghazra",
  }),
  hide: z.string().optional().openapi({
    description:
      "Comma-separated stats to hide (stars, commits, prs, issues, contribs)",
    example: "contribs,issues",
  }),
  hide_title: z.string().optional().openapi({
    description: "Hide card title (true/false)",
    example: "false",
  }),
  card_width: z.string().optional().openapi({
    description: "Custom card width in px",
    example: "450",
  }),
  hide_rank: z.string().optional().openapi({
    description: "Hide rank display (true/false)",
    example: "false",
  }),
  show_icons: z.string().optional().openapi({
    description: "Show icons next to stats (true/false)",
    example: "true",
  }),
  include_all_commits: z.string().optional().openapi({
    description:
      "Count all lifetime commits instead of current year only (true/false)",
    example: "true",
  }),
  commits_year: z.string().optional().openapi({
    description: "Count commits starting from specific year",
    example: "2024",
  }),
  line_height: z.string().optional().openapi({
    description: "Line height between stats items",
    example: "25",
  }),
  ring_color: z.string().optional().openapi({
    description: "Color of the rank circle",
    example: "2f80ed",
  }),
  text_bold: z.string().optional().openapi({
    description: "Bold labels (true/false)",
    example: "true",
  }),
  exclude_repo: z.string().optional().openapi({
    description:
      "Comma-separated list of repository names to exclude from star count",
    example: "repo1,repo2",
  }),
  disable_animations: z.string().optional().openapi({
    description: "Disable SVG animations (true/false)",
    example: "false",
  }),
  number_format: z.string().optional().openapi({
    description: "Number formatting ('short' or 'long')",
    example: "short",
  }),
  number_precision: z.string().optional().openapi({
    description: "Number precision for shortened numbers",
    example: "1",
  }),
  rank_icon: z.string().optional().openapi({
    description: "Rank icon style ('default' or 'github')",
    example: "default",
  }),
  show: z.string().optional().openapi({
    description:
      "Comma-separated additional stats to show (prs_merged, prs_merged_percentage, discussions_started, discussions_answered)",
    example: "prs_merged,discussions_started",
  }),
  ...CommonCardParams,
});

export const PinQuerySchema = z.object({
  username: z.string().optional().openapi({
    description: "GitHub repository owner username",
    example: "anuraghazra",
  }),
  repo: z.string().openapi({
    description: "GitHub repository name",
    example: "github-readme-stats",
  }),
  show_owner: z.string().optional().openapi({
    description: "Show repository owner name (true/false)",
    example: "true",
  }),
  description_lines_count: z.string().optional().openapi({
    description: "Maximum lines for repository description",
    example: "2",
  }),
  ...CommonCardParams,
});

export const TopLangsQuerySchema = z.object({
  username: z.string().optional().openapi({
    description: "GitHub username",
    example: "anuraghazra",
  }),
  hide: z.string().optional().openapi({
    description: "Comma-separated list of languages to hide",
    example: "html,css",
  }),
  hide_title: z.string().optional().openapi({
    description: "Hide card title (true/false)",
    example: "false",
  }),
  card_width: z.string().optional().openapi({
    description: "Custom card width in px",
    example: "300",
  }),
  layout: z.string().optional().openapi({
    description:
      "Layout style ('normal', 'compact', 'donut', 'donut-vertical', 'pie')",
    example: "compact",
  }),
  langs_count: z.string().optional().openapi({
    description: "Number of top languages to display (1 - 10)",
    example: "5",
  }),
  exclude_repo: z.string().optional().openapi({
    description: "Comma-separated list of repositories to exclude",
    example: "repo1,repo2",
  }),
  hide_progress: z.string().optional().openapi({
    description: "Hide progress bars (true/false)",
    example: "false",
  }),
  disable_animations: z.string().optional().openapi({
    description: "Disable SVG animations (true/false)",
    example: "false",
  }),
  ...CommonCardParams,
});

export const WakatimeQuerySchema = z.object({
  username: z.string().optional().openapi({
    description: "WakaTime username",
    example: "anuraghazra",
  }),
  layout: z.string().optional().openapi({
    description: "Layout style ('compact' or 'normal')",
    example: "compact",
  }),
  langs_count: z.string().optional().openapi({
    description: "Number of top languages to display",
    example: "5",
  }),
  hide: z.string().optional().openapi({
    description: "Comma-separated list of languages to hide",
    example: "Other",
  }),
  hide_progress: z.string().optional().openapi({
    description: "Hide progress bars (true/false)",
    example: "false",
  }),
  api_domain: z.string().optional().openapi({
    description: "Custom WakaTime API domain instance",
    example: "wakatime.com",
  }),
  range: z.string().optional().openapi({
    description: "WakaTime stats time range",
    example: "last_7_days",
  }),
  ...CommonCardParams,
});

export const GistQuerySchema = z.object({
  id: z.string().openapi({
    description: "GitHub Gist ID",
    example: "bbfce31e0217a3689c8d961a356cb10d",
  }),
  show_owner: z.string().optional().openapi({
    description: "Show gist owner username (true/false)",
    example: "true",
  }),
  ...CommonCardParams,
});

export const StatusUpQuerySchema = z.object({
  type: z.string().optional().openapi({
    description: "Response type ('boolean' or 'shields')",
    example: "shields",
  }),
});

export const StreakQuerySchema = z.object({
  username: z.string().optional().openapi({
    description: "GitHub username",
    example: "anuraghazra",
  }),
  user: z.string().optional().openapi({
    description: "GitHub username alias (streak-stats compatibility)",
    example: "anuraghazra",
  }),
  timezone: z.string().optional().openapi({
    description:
      "Timezone identifier (e.g. Asia/Jakarta, America/New_York, UTC)",
    example: "Asia/Jakarta",
  }),
  starting_year: z.string().optional().openapi({
    description: "Minimum year to calculate streak from",
    example: "2020",
  }),
  card_width: z.string().optional().openapi({
    description: "Custom card width in px",
    example: "495",
  }),
  card_height: z.string().optional().openapi({
    description: "Custom card height in px",
    example: "195",
  }),
  short_numbers: z.string().optional().openapi({
    description: "Format large numbers with suffix (e.g. 1.2k)",
    example: "true",
  }),
  date_format: z.string().optional().openapi({
    description: "Custom date format pattern",
    example: "M j[, Y]",
  }),
  disable_animations: z.string().optional().openapi({
    description: "Disable SVG animations (true/false)",
    example: "false",
  }),
  ring_color: z.string().optional().openapi({
    description: "Ring color (hex code without # or color name)",
    example: "fb8c00",
  }),
  fire_color: z.string().optional().openapi({
    description: "Fire icon color (hex code without # or color name)",
    example: "ff4500",
  }),
  side_nums_color: z.string().optional().openapi({
    description: "Side numbers color (hex code without # or color name)",
  }),
  side_labels_color: z.string().optional().openapi({
    description: "Side labels color (hex code without # or color name)",
  }),
  dates_color: z.string().optional().openapi({
    description: "Date text color (hex code without # or color name)",
  }),
  ...CommonCardParams,
});
