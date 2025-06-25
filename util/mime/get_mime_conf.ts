import { MIME_CONF } from "./mime_conf.ts";
import type { MimeConf } from "./types.ts";

export function getMimeConf(mime?: string): MimeConf | undefined {
  if (!mime) return undefined;

  if (mime.startsWith("text/")) {
    mime = "text/plain";
  }

  return MIME_CONF[mime];
}
