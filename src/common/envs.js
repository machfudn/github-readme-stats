// @ts-check

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

const whitelist = parseList(process.env.WHITELIST);

const gistWhitelist = parseList(process.env.GIST_WHITELIST);

const excludeRepositories = parseList(process.env.EXCLUDE_REPO) ?? [];

/**
 * Resolve the username from the query string, falling back to
 * the GITHUB_USERNAME environment variable.
 *
 * @param {string | undefined} username Username from the query string.
 * @returns {string | undefined} The username to fetch.
 */
const resolveUsername = (username) => {
  const fallback = process.env.GITHUB_USERNAME?.trim();
  return username || fallback || undefined;
};

export { whitelist, gistWhitelist, excludeRepositories, resolveUsername };
