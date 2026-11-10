import { renderStreakCard } from "../src/cards/streak.ts";
import { guardAccess } from "../src/common/access.js";
import {
  CACHE_TTL,
  resolveCacheSeconds,
  setCacheHeaders,
  setErrorCacheHeaders,
} from "../src/common/cache.js";
import { resolveUsername } from "../src/common/envs.js";
import {
  MissingParamError,
  retrieveSecondaryMessage,
} from "../src/common/error.js";
import { parseBoolean } from "../src/common/ops.js";
import { renderError } from "../src/common/render.js";
import { fetchStreak } from "../src/fetchers/streak.ts";
import { isLocaleAvailable } from "../src/translations.js";
type QueryValue = string | string[] | undefined;

export type StreakApiRequest = {
  query: Record<string, QueryValue>;
};

export type StreakApiResponse = {
  setHeader: (name: string, value: string) => void;
  send: (body: string) => unknown;
};

const firstString = (value: QueryValue): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const parseOptionalNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default async (req: StreakApiRequest, res: StreakApiResponse) => {
  const requestedUsername = firstString(req.query.username);
  const aliasUsername = firstString(req.query.user);
  const theme = firstString(req.query.theme);
  const hide_border = firstString(req.query.hide_border);
  const border_radius = firstString(req.query.border_radius);
  const card_width = firstString(req.query.card_width);
  const card_height = firstString(req.query.card_height);
  const short_numbers = firstString(req.query.short_numbers);
  const timezone = firstString(req.query.timezone);
  const date_format = firstString(req.query.date_format);
  const starting_year = firstString(req.query.starting_year);
  const cache_seconds = firstString(req.query.cache_seconds);
  const locale = firstString(req.query.locale);
  const disable_animations = firstString(req.query.disable_animations);
  const title_color = firstString(req.query.title_color);
  const text_color = firstString(req.query.text_color);
  const icon_color = firstString(req.query.icon_color);
  const bg_color = firstString(req.query.bg_color);
  const border_color = firstString(req.query.border_color);
  const ring_color = firstString(req.query.ring_color);
  const fire_color = firstString(req.query.fire_color);
  const side_nums_color = firstString(req.query.side_nums_color);
  const side_labels_color = firstString(req.query.side_labels_color);
  const dates_color = firstString(req.query.dates_color);

  const rawUsername = requestedUsername || aliasUsername;
  const username = resolveUsername(rawUsername);
  res.setHeader("Content-Type", "image/svg+xml");

  const access = guardAccess({
    res,
    id: username ?? "",
    type: "username",
    colors: {
      title_color,
      text_color,
      bg_color,
      border_color,
      theme,
    },
  });
  if (!access.isPassed) {
    return access.result;
  }

  if (locale && !isLocaleAvailable(locale)) {
    return res.send(
      renderError({
        message: "Something went wrong",
        secondaryMessage: "Language not found",
        renderOptions: {
          title_color,
          text_color,
          bg_color,
          border_color,
          theme,
        },
      }),
    );
  }

  try {
    if (!username) {
      throw new MissingParamError(["username"]);
    }

    const streakData = await fetchStreak(username, {
      timezone,
      startingYear: starting_year,
    });

    const cacheSeconds = resolveCacheSeconds({
      requested: parseInt(cache_seconds ?? "", 10),
      def: CACHE_TTL.STREAK_CARD.DEFAULT,
      min: CACHE_TTL.STREAK_CARD.MIN,
      max: CACHE_TTL.STREAK_CARD.MAX,
    });

    setCacheHeaders(res, cacheSeconds);

    return res.send(
      renderStreakCard(streakData, {
        theme,
        hide_border: parseBoolean(hide_border),
        border_radius: parseOptionalNumber(border_radius),
        card_width: parseOptionalNumber(card_width),
        card_height: parseOptionalNumber(card_height),
        short_numbers: parseBoolean(short_numbers),
        disable_animations: parseBoolean(disable_animations),
        date_format,
        locale: locale ? locale.toLowerCase() : undefined,
        text_color,
        icon_color,
        bg_color,
        border_color,
        ring_color,
        fire_color,
        side_nums_color,
        side_labels_color,
        dates_color,
      }),
    );
  } catch (err) {
    setErrorCacheHeaders(res);
    if (err instanceof Error) {
      return res.send(
        renderError({
          message: err.message,
          secondaryMessage: retrieveSecondaryMessage(err),
          renderOptions: {
            title_color,
            text_color,
            bg_color,
            border_color,
            theme,
            show_repo_link: !(err instanceof MissingParamError),
          },
        }),
      );
    }
    return res.send(
      renderError({
        message: "An unknown error occurred",
        renderOptions: {
          title_color,
          text_color,
          bg_color,
          border_color,
          theme,
        },
      }),
    );
  }
};
