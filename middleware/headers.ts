import { HEADER } from "@std/http/unstable-header";
import { extension } from "@std/media-types";
import {
  ASSETS_CLOUDFRONT_URL,
  INODES_CLOUDFRONT_URL,
} from "../util/consts.ts";
import type { Context, Middleware } from "../util/types.ts";

const SERVICE_WORKER_PATH = "/assets/service_worker.js";
const STRIPE_URL = "https://js.stripe.com";

export const headersMiddleware: Middleware = async (ctx, next) => {
  const isServiceWorkerPath = ctx.url.pathname === SERVICE_WORKER_PATH;

  if (isServiceWorkerPath) {
    ctx.resp.headers.set("Service-Worker-Allowed", "/");
  }

  ctx.resp.headers.set(HEADER.Vary, "Cookie");

  const resp = await next();

  const respContentType = resp.headers.get(HEADER.ContentType);
  const isHtmlResp = extension(respContentType || "") === "html";

  if (isHtmlResp) {
    resp.headers.set("Content-Security-Policy", makeCsp(ctx));
  }

  if (ctx.flash) {
    resp.headers.set(HEADER.CacheControl, `Cache-Control: private, no-store`);
  }

  return resp;
};

function makeCsp(ctx: Context) {
  return [
    `default-src 'self' 'nonce-${ctx.scpNonce}' ${ASSETS_CLOUDFRONT_URL} ${INODES_CLOUDFRONT_URL} ${STRIPE_URL}`,
    `connect-src 'self' data: ${INODES_CLOUDFRONT_URL}`,
    `worker-src 'self' blob:`,
    `style-src 'self' 'unsafe-inline' ${ASSETS_CLOUDFRONT_URL}`,
    `media-src 'self' blob: data: ${INODES_CLOUDFRONT_URL}`,
  ].join(";");
}
