import { accepts, STATUS_CODE } from "@std/http";
import PageNotFound from "../../components/pages/error/PageNotFound.tsx";
import type { Context } from "../../util/types.ts";

export default function errorNotFoundHandler(ctx: Context) {
  if (accepts(ctx.req).includes("text/html")) {
    return <PageNotFound />;
  }
  return ctx.respond(null, STATUS_CODE.NotFound);
}
