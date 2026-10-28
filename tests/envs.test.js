// @ts-check

import { afterEach, describe, expect, it } from "@jest/globals";
import { resolveUsername } from "../src/common/envs.js";

const originalUsername = process.env.GITHUB_USERNAME;

afterEach(() => {
  if (originalUsername === undefined) {
    delete process.env.GITHUB_USERNAME;
  } else {
    process.env.GITHUB_USERNAME = originalUsername;
  }
});

describe("resolveUsername", () => {
  it("prefers the username from the query string", () => {
    process.env.GITHUB_USERNAME = "fallback-user";

    expect(resolveUsername("query-user")).toBe("query-user");
  });

  it("falls back to GITHUB_USERNAME", () => {
    process.env.GITHUB_USERNAME = "fallback-user";

    expect(resolveUsername(undefined)).toBe("fallback-user");
  });

  it("falls back to GITHUB_USERNAME when the query is empty", () => {
    process.env.GITHUB_USERNAME = "fallback-user";

    expect(resolveUsername("")).toBe("fallback-user");
  });

  it("trims GITHUB_USERNAME", () => {
    process.env.GITHUB_USERNAME = "  fallback-user  ";

    expect(resolveUsername(undefined)).toBe("fallback-user");
  });

  it("returns undefined when both values are missing", () => {
    delete process.env.GITHUB_USERNAME;

    expect(resolveUsername(undefined)).toBeUndefined();
  });
});
