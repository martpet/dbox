import { type AppMiddleware } from "$app";
import { accepts, STATUS_CODE } from "@std/http";

export function errorMiddleware(
  ErrorPage?: preact.AnyComponent,
): AppMiddleware {
  return async (ctx, next) => {
    try {
      return await next();
    } catch (error) {
      ctx.error = error;
      ctx.resp.status = STATUS_CODE.InternalServerError;

      console.error(error);

      if (ErrorPage && accepts(ctx.req).includes("text/html")) {
        return ctx.respondJsx(<ErrorPage />);
      }

      return ctx.respond();
    }
  };
}
