import { asset } from "../util/asset.ts";
import type { Context } from "../util/types.ts";

export default function manifestJsonHandler(ctx: Context) {
  return ctx.respondJson({
    "name": "Dbox",
    "start_url": ctx.url.origin,
    "display": "standalone",
    "icons": [
      {
        "src": asset("img/logo/logo-alpha.png"),
        "sizes": "512x512",
        "type": "image/png",
      },
      {
        "src": asset("img/logo/logo-alpha.png"),
        "sizes": "192x192",
        "type": "image/png",
      },
    ],
  });
}
