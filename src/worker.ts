import { app } from "../functions/app.ts";
import type { Bindings } from "./types/env.ts";

export default {
  async fetch(
    request: Request,
    env: Bindings & { ASSETS?: { fetch: (req: Request) => Promise<Response> } },
    ctx: ExecutionContext,
  ): Promise<Response> {
    const res = await app.fetch(request, env as any, ctx);
    if (res.status === 404 && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return res;
  },
};
