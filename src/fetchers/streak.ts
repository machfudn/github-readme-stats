import { CustomError, MissingParamError } from "../common/error.js";
import { request } from "../common/http.js";
import { logger } from "../common/log.js";
import { retryer } from "../common/retryer.js";
import type { StreakData } from "./types.d.ts";

export const GRAPHQL_CURRENT_YEAR_QUERY = `
  query userInfo($login: String!) {
    user(login: $login) {
      createdAt
      contributionsCollection {
        contributionYears
        contributionCalendar {
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

export const GRAPHQL_YEAR_QUERY = `
  query userYearInfo($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

type Contributions = Record<string, number>;

export type StreakOptions = {
  timezone?: string;
  now?: Date;
};

type ContributionWeek = {
  contributionDays?: Array<{
    contributionCount: number;
    date: string;
  }>;
};

type GraphQLErrorItem = {
  type?: string;
  message?: string;
};

type GraphQLStreakResponse = {
  data?: {
    message?: string;
    errors?: GraphQLErrorItem[];
    data?: {
      user?: {
        createdAt?: string;
        contributionsCollection?: {
          contributionYears?: number[];
          contributionCalendar?: {
            weeks?: ContributionWeek[];
          };
        };
      } | null;
    };
  };
};

const fetcher = (variables: Record<string, string>, token: string) => {
  const { query, ...vars } = variables;
  return request(
    {
      query,
      variables: vars,
    },
    {
      Authorization: `bearer ${token}`,
    },
  );
};

export const getCurrentDate = (timezone = "UTC", now = new Date()): string => {
  let validTz = timezone;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(now);
  } catch {
    validTz = "UTC";
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: validTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
};

const collectCalendarDays = (
  weeks: ContributionWeek[] | undefined,
  contributions: Contributions,
): void => {
  for (const week of weeks || []) {
    for (const day of week.contributionDays || []) {
      contributions[day.date] = day.contributionCount;
    }
  }
};

export const calculateStreakStats = (
  contributions: Contributions,
  { timezone = "UTC", now = new Date() }: StreakOptions = {},
): StreakData => {
  const today = getCurrentDate(timezone, now);
  const tomorrowDate = new Date(`${today}T00:00:00Z`);
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
  const tomorrow = tomorrowDate.toISOString().slice(0, 10);

  const filteredDates = Object.keys(contributions)
    .filter(
      (date) => date <= today || (date === tomorrow && contributions[date] > 0),
    )
    .sort();

  if (filteredDates.length === 0) {
    return {
      totalContributions: 0,
      firstContribution: "",
      currentStreak: { length: 0, start: "", end: "" },
      longestStreak: { length: 0, start: "", end: "" },
    };
  }

  const firstDate = filteredDates[0];
  const lastDate = filteredDates[filteredDates.length - 1];
  const stats: StreakData = {
    totalContributions: 0,
    firstContribution: "",
    currentStreak: { length: 0, start: lastDate, end: lastDate },
    longestStreak: { length: 0, start: firstDate, end: firstDate },
  };

  let prevTime: number | null = null;

  for (const date of filteredDates) {
    const time = Date.parse(`${date}T00:00:00Z`);
    if (prevTime !== null && time - prevTime > 86_400_000) {
      stats.currentStreak.length = 0;
      stats.currentStreak.start = today;
      stats.currentStreak.end = today;
    }
    prevTime = time;

    const count = contributions[date] || 0;
    stats.totalContributions += count;

    if (count > 0) {
      stats.currentStreak.length++;
      stats.currentStreak.end = date;
      if (stats.currentStreak.length === 1) {
        stats.currentStreak.start = date;
      }
      if (!stats.firstContribution) {
        stats.firstContribution = date;
      }
      if (stats.currentStreak.length > stats.longestStreak.length) {
        stats.longestStreak.start = stats.currentStreak.start;
        stats.longestStreak.end = stats.currentStreak.end;
        stats.longestStreak.length = stats.currentStreak.length;
      }
    } else if (date !== today) {
      stats.currentStreak.length = 0;
      stats.currentStreak.start = today;
      stats.currentStreak.end = today;
    }
  }

  return stats;
};

export const fetchStreak = async (
  username: string,
  {
    timezone = "UTC",
    startingYear,
  }: { timezone?: string; startingYear?: string | number } = {},
): Promise<StreakData> => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  const res = (await retryer(fetcher, {
    login: username,
    query: GRAPHQL_CURRENT_YEAR_QUERY,
  })) as GraphQLStreakResponse;

  if (res.data?.errors) {
    logger.error(res.data.errors);
    const firstError = res.data.errors[0];
    if (
      firstError?.type === "NOT_FOUND" ||
      firstError?.message?.includes("Could not resolve to a User")
    ) {
      throw new CustomError(
        firstError.message ||
          `Could not resolve to a User with the login of '${username}'.`,
        CustomError.USER_NOT_FOUND,
      );
    }
    if (firstError?.message?.includes("rate limit")) {
      throw new CustomError(
        firstError.message || "Rate limit exceeded.",
        CustomError.MAX_RETRY,
      );
    }
    throw new CustomError(
      firstError?.message || "Could not fetch user streak data.",
      CustomError.GRAPHQL_ERROR,
    );
  }

  const user = res.data?.data?.user;
  if (!user) {
    throw new CustomError(
      res.data?.message || "Could not fetch user streak data.",
      CustomError.GRAPHQL_ERROR,
    );
  }

  const userCreatedYear = user.createdAt
    ? new Date(user.createdAt).getUTCFullYear()
    : new Date().getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();

  let parsedStartingYear = startingYear
    ? parseInt(String(startingYear), 10)
    : userCreatedYear;
  if (Number.isNaN(parsedStartingYear)) {
    parsedStartingYear = userCreatedYear;
  }
  const minYear = Math.max(parsedStartingYear, 2005);

  const contributionYears =
    user.contributionsCollection?.contributionYears || [];
  const yearsToFetch: number[] = [];
  for (let year = minYear; year < currentYear; year++) {
    yearsToFetch.push(year);
  }

  const firstContribYear =
    contributionYears[contributionYears.length - 1] ?? userCreatedYear;
  if (firstContribYear < 2005 && !yearsToFetch.includes(firstContribYear)) {
    yearsToFetch.unshift(firstContribYear);
  }

  const contributions: Contributions = {};
  collectCalendarDays(
    user.contributionsCollection?.contributionCalendar?.weeks,
    contributions,
  );

  if (yearsToFetch.length > 0) {
    const pastResponses = await Promise.all(
      yearsToFetch.map((year) =>
        (
          retryer(fetcher, {
            login: username,
            from: `${year}-01-01T00:00:00Z`,
            to: `${year}-12-31T23:59:59Z`,
            query: GRAPHQL_YEAR_QUERY,
          }) as Promise<GraphQLStreakResponse>
        ).catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          logger.error(
            `Failed to fetch contributions for year ${year}: ${message}`,
          );
          return null;
        }),
      ),
    );

    for (const pastRes of pastResponses) {
      collectCalendarDays(
        pastRes?.data?.data?.user?.contributionsCollection?.contributionCalendar
          ?.weeks,
        contributions,
      );
    }
  }

  return calculateStreakStats(contributions, { timezone });
};

export default fetchStreak;
