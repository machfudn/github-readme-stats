import { handle } from "hono/cloudflare-pages";
import { app } from "./app.ts";

export const onRequest = handle(app);
