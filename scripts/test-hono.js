import test from "node:test";
import assert from "node:assert/strict";
// ponytail: delete ambient machine env vars before importing app to keep module-level singletons isolated
delete process.env.GITHUB_USERNAME;
delete process.env.README_THEME;
delete process.env.README_LOCALE;
delete process.env.README_INCLUDE_ALL_COMMITS;
delete process.env.README_LANGS_COUNT;
delete process.env.CACHE_SECONDS;
delete process.env.EXCLUDE_REPO;
delete process.env.WHITELIST;

const { app } = await import("../functions/app.ts");
const { handleApi } = await import("../functions/adapter.ts");

test("GET /ui returns Swagger UI HTML", async () => {
  const res = await app.request("/ui");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type") || "", /text\/html/);
  const text = await res.text();
  assert.match(text, /SwaggerUIBundle/);
});

test("GET /doc returns OpenAPI 3.0 JSON specification", async () => {
  const res = await app.request("/doc");
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.openapi, "3.0.0");
  assert.equal(data.info.title, "GitHub Readme Stats API");
  assert.ok(data.paths["/api"]);
  assert.ok(data.paths["/api/pin"]);
  assert.ok(data.paths["/api/top-langs"]);
  assert.ok(data.paths["/api/wakatime"]);
  assert.ok(data.paths["/api/gist"]);
  assert.ok(data.paths["/api/status/up"]);
  assert.ok(data.paths["/api/status/pat-info"]);
  assert.ok(data.paths["/"]);
});

test("GET / returns health check JSON with status ok", async () => {
  const res = await app.request("/");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type") || "", /application\/json/);
  const data = await res.json();
  assert.equal(data.status, "ok");
  assert.equal(data.message, "GitHub Readme Stats API is running");
  assert.ok(data.timestamp);
});

test("GET /health returns health check JSON with status ok", async () => {
  const res = await app.request("/health");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type") || "", /application\/json/);
  const data = await res.json();
  assert.equal(data.status, "ok");
  assert.equal(data.message, "GitHub Readme Stats API is running");
  assert.ok(data.timestamp);
});

test("GET /swagger redirects to /ui", async () => {
  const res = await app.request("/swagger");
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("Location"), "/ui");
});

test("GET /api without username returns error SVG with 200 status and Cache-Control", async () => {
  const res = await app.request("/api");
  assert.match(res.headers.get("Content-Type") || "", /image\/svg\+xml/);
  assert.ok(res.headers.get("Cache-Control"));
  const svg = await res.text();
  assert.match(svg, /Missing param/);
});
test("GET /api/pin without params returns error SVG", async () => {
  const res = await app.request("/api/pin");
  assert.match(res.headers.get("Content-Type") || "", /image\/svg\+xml/);
  const svg = await res.text();
  assert.match(svg, /Missing param/);
});

test("GET /api/top-langs without username returns error SVG", async () => {
  const res = await app.request("/api/top-langs");
  assert.match(res.headers.get("Content-Type") || "", /image\/svg\+xml/);
  const svg = await res.text();
  assert.match(svg, /Missing param/);
});

test("GET /api/wakatime without username returns error SVG", async () => {
  const res = await app.request("/api/wakatime");
  assert.match(res.headers.get("Content-Type") || "", /image\/svg\+xml/);
  const svg = await res.text();
  assert.match(svg, /Missing param/);
});

test("GET /api/gist without id returns error SVG", async () => {
  const res = await app.request("/api/gist");
  assert.match(res.headers.get("Content-Type") || "", /image\/svg\+xml/);
  const svg = await res.text();
  assert.match(svg, /Missing param/);
});

test("GET /api with WHITELIST env rejects unauthorized user", async () => {
  const res = await app.request(
    "/api?username=unauthorized_user",
    {},
    { WHITELIST: "allowed_user" },
  );
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type") || "", /image\/svg\+xml/);
  const svg = await res.text();
  assert.match(svg, /This username is not whitelisted/);
});

test("GET /api/status/up returns JSON response with HTTP 200", async () => {
  const res = await app.request("/api/status/up");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type") || "", /application\/json/);
  const data = await res.json();
  assert.ok(data !== undefined);
});

test("GET /api/status/pat-info returns JSON response with HTTP 200", async () => {
  const res = await app.request("/api/status/pat-info");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type") || "", /application\/json/);
  const data = await res.json();
  assert.ok(data && typeof data === "object");
});

test("repeated query parameters correctly parse as arrays in req.query", async () => {
  let capturedQuery;
  const handler = handleApi((req, res) => {
    capturedQuery = req.query;
    res.send("ok");
  });
  const mockContext = {
    env: {},
    req: {
      queries: () => ({ arrayParam: ["val1", "val2"], singleParam: ["val3"] }),
      header: () => ({}),
      url: "http://localhost/test?arrayParam=val1&arrayParam=val2&singleParam=val3",
      path: "/test",
    },
  };
  await handler(mockContext);
  assert.deepEqual(capturedQuery, {
    arrayParam: ["val1", "val2"],
    singleParam: "val3",
  });
});

test("handleApi applies environment fallbacks when URL query parameters are missing", async () => {
  let capturedQuery;
  const handler = handleApi((req, res) => {
    capturedQuery = req.query;
    res.send("ok");
  });
  const mockContext = {
    env: {
      GITHUB_USERNAME: "default_user",
      README_THEME: "dracula",
      README_LOCALE: "id",
      README_INCLUDE_ALL_COMMITS: "true",
      README_LANGS_COUNT: "6",
      CACHE_SECONDS: "1800",
      EXCLUDE_REPO: "hidden-repo",
    },
    req: {
      queries: () => ({}),
      header: () => ({}),
      url: "http://localhost/api",
      path: "/api",
    },
  };
  await handler(mockContext);
  assert.equal(capturedQuery.username, "default_user");
  assert.equal(capturedQuery.theme, "dracula");
  assert.equal(capturedQuery.locale, "id");
  assert.equal(capturedQuery.include_all_commits, "true");
  assert.equal(capturedQuery.langs_count, "6");
  assert.equal(capturedQuery.cache_seconds, "1800");
  assert.equal(capturedQuery.exclude_repo, "hidden-repo");
});

test("handleApi prioritizes URL query parameters over environment fallbacks", async () => {
  let capturedQuery;
  const handler = handleApi((req, res) => {
    capturedQuery = req.query;
    res.send("ok");
  });
  const mockContext = {
    env: {
      GITHUB_USERNAME: "env_user",
      README_THEME: "env_theme",
      README_LOCALE: "en",
      README_INCLUDE_ALL_COMMITS: "true",
      README_LANGS_COUNT: "10",
      CACHE_SECONDS: "7200",
      EXCLUDE_REPO: "repo-env",
    },
    req: {
      queries: () => ({
        username: ["url_user"],
        theme: ["nord"],
        locale: ["ja"],
        include_all_commits: ["false"],
        langs_count: ["3"],
        cache_seconds: ["900"],
        exclude_repo: ["repo-url"],
      }),
      header: () => ({}),
      url: "http://localhost/api?username=url_user&theme=nord&locale=ja&include_all_commits=false&langs_count=3&cache_seconds=900&exclude_repo=repo-url",
      path: "/api",
    },
  };
  await handler(mockContext);
  assert.equal(capturedQuery.username, "url_user");
  assert.equal(capturedQuery.theme, "nord");
  assert.equal(capturedQuery.locale, "ja");
  assert.equal(capturedQuery.include_all_commits, "false");
  assert.equal(capturedQuery.langs_count, "3");
  assert.equal(capturedQuery.cache_seconds, "900");
  assert.equal(capturedQuery.exclude_repo, "repo-url,repo-env");
});

test("GET /api with GITHUB_USERNAME env uses fallback instead of Missing param error", async () => {
  const res = await app.request(
    "/api",
    {},
    {
      GITHUB_USERNAME: "fallback_user",
      WHITELIST: "whitelisted_user_only",
    },
  );
  assert.equal(res.status, 200);
  const svg = await res.text();
  assert.doesNotMatch(svg, /Missing param/);
  assert.match(svg, /This username is not whitelisted/);
});
