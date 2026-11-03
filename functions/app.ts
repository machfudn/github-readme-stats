import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import type { Bindings } from "../src/types/env.ts";
import { handleApi } from "./adapter.ts";
import { renderError } from "../src/common/render.js";
import {
  StatsQuerySchema,
  PinQuerySchema,
  TopLangsQuerySchema,
  WakatimeQuerySchema,
  GistQuerySchema,
  StatusUpQuerySchema,
} from "./schemas.ts";

// Import existing core handlers
// @ts-ignore
import statsHandler from "../api/index.js";
// @ts-ignore
import pinHandler from "../api/pin.js";
// @ts-ignore
import topLangsHandler from "../api/top-langs.js";
// @ts-ignore
import wakatimeHandler from "../api/wakatime.js";
// @ts-ignore
import gistHandler from "../api/gist.js";
// @ts-ignore
import statusUpHandler from "../api/status/up.js";
// @ts-ignore
import patInfoHandler from "../api/status/pat-info.js";

export const app = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: (result, c) => {
    if (!result.success && "error" in result) {
      if (c.req.path.startsWith("/api/status")) {
        return c.json({ error: result.error }, 400);
      }
      const query = c.req.query();
      const firstIssue = (result.error as any).issues?.[0];
      const missingField = firstIssue?.path?.[0] || "parameter";
      const svg = renderError({
        message: `Missing param '${missingField}'`,
        secondaryMessage: "Make sure you pass all required parameters",
        renderOptions: {
          title_color: query.title_color,
          text_color: query.text_color,
          bg_color: query.bg_color,
          border_color: query.border_color,
          theme: query.theme,
        },
      });
      return c.body(svg, 200, {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      });
    }
  },
});

app.onError((err, c) => {
  if (c.req.path.startsWith("/api/status") || c.req.path.startsWith("/doc")) {
    return c.json({ error: err.message }, 500);
  }
  const svg = renderError({
    message: err.message || "An unexpected error occurred",
    secondaryMessage: "Please try again later or check your request",
  });
  return c.body(svg, 500, {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  });
});
// SVG response schema representation
const SvgResponse = {
  description: "SVG Card representation",
  content: {
    "image/svg+xml": {
      schema: z.string(),
    },
  },
};

// --- Routes Definition ---

const statsRoute = createRoute({
  method: "get",
  path: "/api",
  tags: ["Cards"],
  summary: "GitHub Stats Card",
  description: "Dynamically generate a stats card for your GitHub profile",
  request: {
    query: StatsQuerySchema,
  },
  responses: {
    200: SvgResponse,
  },
});

const pinRoute = createRoute({
  method: "get",
  path: "/api/pin",
  tags: ["Cards"],
  summary: "Pinned Repository Card",
  description:
    "Dynamically generate a card for a pinned or specific GitHub repository",
  request: {
    query: PinQuerySchema,
  },
  responses: {
    200: SvgResponse,
  },
});

const topLangsRoute = createRoute({
  method: "get",
  path: "/api/top-langs",
  tags: ["Cards"],
  summary: "Top Languages Card",
  description:
    "Dynamically generate a card displaying your most used programming languages",
  request: {
    query: TopLangsQuerySchema,
  },
  responses: {
    200: SvgResponse,
  },
});

const wakatimeRoute = createRoute({
  method: "get",
  path: "/api/wakatime",
  tags: ["Cards"],
  summary: "WakaTime Stats Card",
  description:
    "Dynamically generate a card displaying your WakaTime coding activity",
  request: {
    query: WakatimeQuerySchema,
  },
  responses: {
    200: SvgResponse,
  },
});

const gistRoute = createRoute({
  method: "get",
  path: "/api/gist",
  tags: ["Cards"],
  summary: "GitHub Gist Card",
  description: "Dynamically generate a card for a specific GitHub Gist",
  request: {
    query: GistQuerySchema,
  },
  responses: {
    200: SvgResponse,
  },
});

const statusUpRoute = createRoute({
  method: "get",
  path: "/api/status/up",
  tags: ["Status"],
  summary: "Uptime & Token Health Check",
  description:
    "Check if configured GitHub Personal Access Tokens (PATs) are operational",
  request: {
    query: StatusUpQuerySchema,
  },
  responses: {
    200: {
      description: "Health status boolean or shields.io endpoint response",
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
    },
  },
});

const patInfoRoute = createRoute({
  method: "get",
  path: "/api/status/pat-info",
  tags: ["Status"],
  summary: "PAT Diagnostics Info",
  description: "Details on valid, expired, and rate-limited tokens",
  responses: {
    200: {
      description: "PAT Diagnostic breakdown JSON",
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
    },
  },
});
const rootRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Health"],
  summary: "Health Check",
  description: "Check if the API is running properly",
  responses: {
    200: {
      description: "API health status",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
            message: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
  },
});

// @ts-ignore Hono OpenAPI typing mismatch with defaultHook
app.openapi(rootRoute, (c) => {
  return c.json(
    {
      status: "ok",
      message: "GitHub Readme Stats API is running",
      timestamp: new Date().toISOString(),
    },
    200,
  );
});
app.get("/health", (c) =>
  c.json({
    status: "ok",
    message: "GitHub Readme Stats API is running",
    timestamp: new Date().toISOString(),
  }),
);

app.openapi(statsRoute, handleApi(statsHandler));
app.openapi(pinRoute, handleApi(pinHandler));
app.openapi(topLangsRoute, handleApi(topLangsHandler));
app.openapi(wakatimeRoute, handleApi(wakatimeHandler));
app.openapi(gistRoute, handleApi(gistHandler));
app.openapi(statusUpRoute, handleApi(statusUpHandler));
app.openapi(patInfoRoute, handleApi(patInfoHandler));

// Alias /api/stats to /api
app.get("/api/stats", handleApi(statsHandler));

// Expose OpenAPI JSON document
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "GitHub Readme Stats API",
    version: "1.0.0",
    description:
      "Dynamically generated GitHub stats cards, repo pins, top languages, and WakaTime cards running on Cloudflare Pages Worker.",
  },
  servers: [
    {
      url: "/",
      description: "Current environment",
    },
  ],
});

// Expose Swagger UI
app.get("/ui", swaggerUI({ url: "/doc" }));
app.get("/swagger", (c) => c.redirect("/ui"));
