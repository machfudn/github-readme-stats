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
export const getWhitelist = () => {
  const val = getEnv("WHITELIST");
  return val ? val.split(",") : undefined;
};

export const getGistWhitelist = () => {
  const val = getEnv("GIST_WHITELIST");
  return val ? val.split(",") : undefined;
};

export const getExcludeRepositories = () => {
  const val = getEnv("EXCLUDE_REPO");
  return val ? val.split(",") : [];
};

const whitelist =
  typeof process !== "undefined" && process.env?.WHITELIST
    ? process.env.WHITELIST.split(",")
    : undefined;

const gistWhitelist =
  typeof process !== "undefined" && process.env?.GIST_WHITELIST
    ? process.env.GIST_WHITELIST.split(",")
    : undefined;

const excludeRepositories =
  typeof process !== "undefined" && process.env?.EXCLUDE_REPO
    ? process.env.EXCLUDE_REPO.split(",")
    : [];

export { whitelist, gistWhitelist, excludeRepositories };
