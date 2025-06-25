import { DAY } from "@std/datetime";
import { serveDir } from "@std/http";
import { HEADER } from "@std/http/unstable-header";
import { ASSET_CACHE_PARAM } from "../util/consts.ts";
import type { AppContext } from "../util/types.ts";

export async function staticFilesHandler(ctx: AppContext) {
  const resp = await serveDir(ctx.req, { quiet: true });

  if (ctx.url.searchParams.has(ASSET_CACHE_PARAM)) {
    const cacheControl = `public, max-age=${DAY * 365 / 1000}, immutable`;
    resp.headers.set(HEADER.CacheControl, cacheControl);
  }

  return ctx.respond(resp);
}
