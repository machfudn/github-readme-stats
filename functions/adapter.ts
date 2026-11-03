import type { Context } from "hono";
import { runWithEnv, getEnv } from "../src/common/envs.js";

export function createHonoResponseAdapter() {
  const headers = new Headers();
  let statusCode = 200;
  let responseBody: BodyInit | null = "";
  let resolved = false;

  let resolvePromise: (value: Response) => void;
  const responsePromise = new Promise<Response>((resolve) => {
    resolvePromise = resolve;
  });

  const finish = (body: BodyInit | null) => {
    if (resolved) return;
    resolved = true;
    responseBody = body;
    resolvePromise(
      new Response(responseBody, {
        status: statusCode,
        headers,
      }),
    );
  };

  const res = {
    headersSent: false,
    setHeader(name: string, value: string) {
      headers.set(name, value);
      return res;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    send(content: any) {
      res.headersSent = true;
      finish(content);
      return res;
    },
    json(data: any) {
      res.headersSent = true;
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      finish(JSON.stringify(data));
      return res;
    },
  };

  return {
    res,
    toResponse: async () => {
      if (!resolved) {
        finish(responseBody);
      }
      return responsePromise;
    },
  };
}

export function handleApi(
  handler: (req: any, res: any) => Promise<any> | any,
): any {
  return async (c: Context) => {
    return runWithEnv(c.env as Record<string, any>, async () => {
      const adapter = createHonoResponseAdapter();
      const queries = c.req.queries();
      const query: Record<string, any> = {};
      for (const [key, values] of Object.entries(queries)) {
        query[key] = values && values.length > 1 ? values : (values?.[0] ?? "");
      }

      // ponytail: flat param-to-env fallback, upgrade to per-route transform if param matrix grows
      if (!query.username) {
        const defaultUser = getEnv("GITHUB_USERNAME");
        if (defaultUser) query.username = defaultUser;
      }
      if (!query.theme) {
        const defaultTheme = getEnv("README_THEME");
        if (defaultTheme) query.theme = defaultTheme;
      }
      if (!query.locale) {
        const defaultLocale = getEnv("README_LOCALE");
        if (defaultLocale) query.locale = defaultLocale;
      }
      if (
        query.include_all_commits === undefined ||
        query.include_all_commits === ""
      ) {
        const defaultInclude = getEnv("README_INCLUDE_ALL_COMMITS");
        if (defaultInclude !== undefined) {
          query.include_all_commits = defaultInclude;
        }
      }
      if (!query.langs_count) {
        const defaultLangsCount = getEnv("README_LANGS_COUNT");
        if (defaultLangsCount) query.langs_count = defaultLangsCount;
      }
      if (!query.cache_seconds) {
        const defaultCache = getEnv("CACHE_SECONDS");
        if (defaultCache) query.cache_seconds = defaultCache;
      }
      const envExclude = getEnv("EXCLUDE_REPO");
      if (envExclude) {
        query.exclude_repo = query.exclude_repo
          ? `${query.exclude_repo},${envExclude}`
          : envExclude;
      }

      const req = {
        query,
        headers: c.req.header(),
        url: c.req.url,
        path: c.req.path,
      };
      await handler(req, adapter.res);
      return adapter.toResponse();
    });
  };
}
