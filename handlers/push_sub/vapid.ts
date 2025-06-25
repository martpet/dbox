import { encodeBase64Url } from "@std/encoding";
import type { Context } from "../../util/types.ts";

export default async function vapidHandler(ctx: Context) {
  const { vapidKeys } = await import("../../util/webpush.ts");

  const publicKey = encodeBase64Url(
    await crypto.subtle.exportKey("raw", vapidKeys.publicKey),
  );

  return ctx.respondJson(publicKey);
}
