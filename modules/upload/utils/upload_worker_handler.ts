import { type AppContext } from "$app";
import { serveFile } from "@std/http/file-server";

export function uploadWorkerHandler(ctx: AppContext) {
  const filePath =
    new URL("../static/upload_worker.js", import.meta.url).pathname;

  return serveFile(ctx.req, filePath);
}
