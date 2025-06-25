import { STATUS_CODE } from "@std/http";
import type { Middleware } from "../util/types.ts";

export const csrfMiddleware: Middleware = (ctx, next) => {
  const contentType = ctx.req.headers.get("content-type") || "text/plain";
  const originHeader = ctx.req.headers.get("origin");
  const method = ctx.req.method;

  const isSafeMethod = ["GET", "HEAD"].includes(method);

  const isFormRequestMaybe = [
    "application/x-www-form-urlencoded",
    "multipart/form-data",
    "text/plain",
  ].includes(contentType);

  if (
    originHeader !== ctx.url.origin &&
    !isSafeMethod &&
    isFormRequestMaybe
  ) {
    return ctx.respond(null, STATUS_CODE.Forbidden);
  }

  return next();
};
