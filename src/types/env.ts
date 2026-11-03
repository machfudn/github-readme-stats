export type Bindings = {
  CACHE_SECONDS?: string;
  WHITELIST?: string;
  GIST_WHITELIST?: string;
  EXCLUDE_REPO?: string;
  FETCH_MULTI_PAGE_STARS?: string;
  NODE_ENV?: string;
  GITHUB_USERNAME?: string;
  README_THEME?: string;
  README_LOCALE?: string;
  README_INCLUDE_ALL_COMMITS?: string;
  README_LANGS_COUNT?: string;
  [key: `PAT_${number}`]: string | undefined;
};
