import { afterEach, describe, expect, it, jest } from "@jest/globals";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import streakHandler from "../api/streak.ts";
import { availableLocales, streakCardLocales } from "../src/translations.js";
import { renderStreakCard } from "../src/cards/streak.ts";
import { MissingParamError } from "../src/common/error.js";
import { calculateStreakStats, fetchStreak } from "../src/fetchers/streak.ts";

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
});

const contributions = {
  "2026-11-05": 2,
  "2026-11-06": 1,
  "2026-11-07": 0,
  "2026-11-08": 3,
  "2026-11-09": 0,
};

describe("calculateStreakStats", () => {
  it("calculates total, current, longest, and first contribution", () => {
    const result = calculateStreakStats(contributions, {
      timezone: "UTC",
      now: new Date("2026-11-09T12:00:00Z"),
    });

    expect(result.totalContributions).toBe(6);
    expect(result.firstContribution).toBe("2026-11-05");
    expect(result.longestStreak).toEqual({
      length: 2,
      start: "2026-11-05",
      end: "2026-11-06",
    });
    expect(result.currentStreak).toEqual({
      length: 1,
      start: "2026-11-08",
      end: "2026-11-08",
    });
  });

  it("does not reset yesterday's streak when today has no contribution", () => {
    const result = calculateStreakStats(
      { "2026-11-08": 1, "2026-11-09": 0 },
      { timezone: "UTC", now: new Date("2026-11-09T12:00:00Z") },
    );

    expect(result.currentStreak.length).toBe(1);
    expect(result.currentStreak.start).toBe("2026-11-08");
  });

  it("resets current streak after a multi-day gap while preserving longest", () => {
    const result = calculateStreakStats(
      {
        "2026-11-01": 1,
        "2026-11-02": 1,
        "2026-11-03": 1,
        "2026-11-04": 0,
        "2026-11-05": 0,
        "2026-11-06": 1,
      },
      { timezone: "UTC", now: new Date("2026-11-06T12:00:00Z") },
    );

    expect(result.longestStreak.length).toBe(3);
    expect(result.currentStreak.length).toBe(1);
    expect(result.currentStreak.start).toBe("2026-11-06");
  });

  it("falls back to UTC for invalid timezones", () => {
    const result = calculateStreakStats(
      { "2026-11-09": 1 },
      { timezone: "Not/A-Timezone", now: new Date("2026-11-09T12:00:00Z") },
    );

    expect(result.currentStreak.length).toBe(1);
  });
});

describe("fetchStreak", () => {
  it("throws MissingParamError when username is empty", async () => {
    await expect(fetchStreak("")).rejects.toThrow(MissingParamError);
  });

  it("fetches current and past years and aggregates streak stats", async () => {
    const currentYear = new Date().getUTCFullYear();
    const pastYear = currentYear - 1;
    const today = new Date().toISOString().slice(0, 10);

    mock.onPost("https://api.github.com/graphql").replyOnce(200, {
      data: {
        user: {
          createdAt: `${pastYear}-06-01T00:00:00Z`,
          contributionsCollection: {
            contributionYears: [currentYear, pastYear],
            contributionCalendar: {
              weeks: [
                {
                  contributionDays: [
                    { contributionCount: 0, date: `${currentYear}-01-01` },
                    { contributionCount: 4, date: today },
                  ],
                },
              ],
            },
          },
        },
      },
    });

    mock.onPost("https://api.github.com/graphql").replyOnce(200, {
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              weeks: [
                {
                  contributionDays: [
                    { contributionCount: 2, date: `${pastYear}-12-30` },
                    { contributionCount: 3, date: `${pastYear}-12-31` },
                  ],
                },
              ],
            },
          },
        },
      },
    });

    const data = await fetchStreak("octocat", { timezone: "UTC" });
    expect(data.totalContributions).toBe(9);
    expect(data.firstContribution).toBe(`${pastYear}-12-30`);
    expect(data.longestStreak.length).toBe(2);
  });

  it("throws USER_NOT_FOUND when GitHub returns NOT_FOUND", async () => {
    mock.onPost("https://api.github.com/graphql").replyOnce(200, {
      errors: [
        {
          type: "NOT_FOUND",
          message: "Could not resolve to a User with the login of 'nobody'.",
        },
      ],
    });

    await expect(fetchStreak("nobody")).rejects.toThrow(
      "Could not resolve to a User with the login of 'nobody'.",
    );
  });
});

describe("renderStreakCard", () => {
  it("renders required labels, dimensions, fire mask, and theme colors", () => {
    const svg = renderStreakCard(
      {
        totalContributions: 1200,
        firstContribution: "2020-01-05",
        currentStreak: { length: 2, start: "2020-02-01", end: "2020-02-02" },
        longestStreak: { length: 4, start: "2020-01-10", end: "2020-01-13" },
      },
      {
        theme: "dracula",
        disable_animations: true,
        short_numbers: true,
        hide_border: true,
      },
    );

    expect(svg).toContain("Total Contributions");
    expect(svg).toContain("Current Streak");
    expect(svg).toContain("Longest Streak");
    expect(svg).toContain("1.2k");
    expect(svg).toContain("width='495px'");
    expect(svg).toContain("height='195px'");
    expect(svg).toContain("mask_out_ring_behind_fire");
    expect(svg).toContain("stroke='none'");
    expect(svg).toContain("#ff6e96");
  });

  it("translates labels via streakCardLocales and formats dates via date_format", () => {
    const svg = renderStreakCard(
      {
        totalContributions: 42,
        firstContribution: "2020-01-05",
        currentStreak: { length: 3, start: "2020-02-01", end: "2020-02-03" },
        longestStreak: { length: 5, start: "2020-01-10", end: "2020-01-14" },
      },
      {
        locale: "id",
        date_format: "M j[, Y]",
      },
    );

    expect(svg).toContain("Total Kontribusi");
    expect(svg).toContain("Streak Saat Ini");
    expect(svg).toContain("Streak Terpanjang");
    expect(svg).toContain("Jan 5, 2020 - Sekarang");
    expect(svg).toContain("Feb 1, 2020 - Feb 3, 2020");
  });

  it("covers all 46 availableLocales in streakCardLocales", () => {
    for (const key of Object.keys(streakCardLocales)) {
      const locales = Object.keys(
        streakCardLocales[key as keyof typeof streakCardLocales],
      ).sort();
      expect(locales).toEqual([...availableLocales].sort());
    }
  });
});

describe("api/streak", () => {
  it("supports user alias parameter and sets cache headers", async () => {
    const today = new Date().toISOString().slice(0, 10);
    mock.onPost("https://api.github.com/graphql").replyOnce(200, {
      data: {
        user: {
          createdAt: `${new Date().getUTCFullYear()}-01-01T00:00:00Z`,
          contributionsCollection: {
            contributionYears: [new Date().getUTCFullYear()],
            contributionCalendar: {
              weeks: [
                {
                  contributionDays: [{ contributionCount: 1, date: today }],
                },
              ],
            },
          },
        },
      },
    });

    const headers: Record<string, string> = {};
    let body = "";
    const res = {
      setHeader: jest.fn((name: string, value: string) => {
        headers[name] = value;
      }),
      send: jest.fn((svg: string) => {
        body = svg;
        return svg;
      }),
    };

    await streakHandler({ query: { user: "octocat" } }, res);

    expect(headers["Content-Type"]).toBe("image/svg+xml");
    expect(headers["Cache-Control"]).toContain("max-age=");
    expect(body).toContain("Current Streak");
  });

  it("renders error SVG when username is missing", async () => {
    let body = "";
    const res = {
      setHeader: jest.fn(),
      send: jest.fn((svg: string) => {
        body = svg;
        return svg;
      }),
    };

    await streakHandler({ query: {} }, res);
    expect(body).toContain("Missing param");
  });

  it("renders Language not found error SVG when locale is unsupported", async () => {
    let body = "";
    const res = {
      setHeader: jest.fn(),
      send: jest.fn((svg: string) => {
        body = svg;
        return svg;
      }),
    };

    await streakHandler({ query: { username: "octocat", locale: "zz" } }, res);
    expect(body).toContain("Language not found");
  });
});
