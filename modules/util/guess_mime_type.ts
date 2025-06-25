import { fileTypeFromBuffer } from "file-type";
import { Buffer } from "node:buffer";
import * as istextorbinary from "npm:istextorbinary";
import { getFileExt } from "./file_ext.ts";

interface FindMimeTypeOptions {
  fileName?: string;
  bytesChunk?: Buffer;
  textFileExtToMime?: Record<string, string>;
  isUtf8?: boolean;
}

export async function guessMimeType(options: FindMimeTypeOptions) {
  const { bytesChunk, fileName, textFileExtToMime, isUtf8 } = options;
  let isText: boolean | undefined = isUtf8;

  if (typeof isText === "undefined" && bytesChunk) {
    isText = istextorbinary.isText(null, bytesChunk) || undefined;
  }

  if (isText && textFileExtToMime && fileName) {
    return textFileExtToMime?.[getFileExt(fileName)] || "text/plain";
  }

  if (bytesChunk) {
    const hit = await fileTypeFromBuffer(bytesChunk);
    if (hit) return hit.mime;
  }

  return "application/octstream";
}
