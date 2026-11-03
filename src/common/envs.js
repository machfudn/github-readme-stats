// @ts-check
import { AsyncLocalStorage } from "node:async_hooks";

const asyncLocalStorage = new AsyncLocalStorage();
/** @type {Record<string, any>} */
let runtimeEnv = {};

export const runWithEnv = (env, fn) => {
  return asyncLocalStorage.run(env || {}, fn);
};

export const setRuntimeEnv = (env) => {
  if (env && typeof env === "object") {
    runtimeEnv = env;
  }
};

export const getRuntimeEnv = () => {
  return asyncLocalStorage.getStore() || runtimeEnv;
};

export const getEnv = (key) => {
  const store = asyncLocalStorage.getStore();
  if (store && store[key] !== undefined) {
    return store[key];
  }
  if (runtimeEnv && runtimeEnv[key] !== undefined) {
    return runtimeEnv[key];
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return undefined;
};

/**
 * Parse a comma-separated environment variable into a trimmed array.
 *
 * @param {string | undefined} value Comma-separated value.
 * @returns {string[] | undefined} Parsed values, or undefined when empty.
 */
const parseList = (value) => {
  if (!value) {
    return undefined;
  }

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
};

export const getWhitelist = () => {
  return parseList(getEnv("WHITELIST"));
};

export const getGistWhitelist = () => {
  return parseList(getEnv("GIST_WHITELIST"));
};

export const getExcludeRepositories = () => {
  return parseList(getEnv("EXCLUDE_REPO")) ?? [];
};

/**
 * Resolve the username from the query string, falling back to
 * the GITHUB_USERNAME environment variable.
 *
 * @param {string | undefined} username Username from the query string.
 * @returns {string | undefined} The username to fetch.
 */
export const resolveUsername = (username) => {
  const fallback = getEnv("GITHUB_USERNAME")?.trim();
  return username || fallback || undefined;
};

const whitelist = parseList(
  typeof process !== "undefined" ? process.env?.WHITELIST : undefined,
);

const gistWhitelist = parseList(
  typeof process !== "undefined" ? process.env?.GIST_WHITELIST : undefined,
);

const excludeRepositories =
  parseList(
    typeof process !== "undefined" ? process.env?.EXCLUDE_REPO : undefined,
  ) ?? [];

export { whitelist, gistWhitelist, excludeRepositories };
