import { getFileExt } from "$util";
import { format } from "@std/fmt/bytes";
import {
  signCloudFrontUrl,
  type SignCloudFrontUrlOptions,
} from "../aws/cloudfront.ts";
import { INODES_CLOUDFRONT_URL } from "../consts.ts";
import { getRemainingUploadBytesByUser } from "../kv/upload_stats.ts";
import { getMimeConf } from "../mime/get_mime_conf.ts";
import { ROOT_DIR_ID } from "./consts.ts";
import type { FileNode, Inode, InodeLabel } from "./types.ts";

export function getInodeLabel(inode: Inode): InodeLabel {
  if (inode.type === "file") return "File";
  if (inode.parentDirId === ROOT_DIR_ID) return "Box";
  return "Folder";
}

export function isFileNodeWithMultipleS3Keys(inode: Inode) {
  if (inode.type !== "file") return false;
  const mimeConf = getMimeConf(inode.mimeType);
  return inode.type === "file" && !!mimeConf?.proc;
}

export function getFileNodeKind(inode: FileNode) {
  const mimeConf = getMimeConf(inode.mimeType);
  const title = mimeConf?.title;
  if (typeof title === "string") return title;
  if (typeof title === "object") {
    const ext = getFileExt(inode.name);
    if (title[ext]) return title[ext];
  }
  return inode.mimeType;
}

interface GetFileNodeUrlOptions extends SignCloudFrontUrlOptions {
  isDownload?: boolean;
  urlParams?: Record<string, string>;
}

export function getFileNodeUrl(
  s3Key: string,
  options: GetFileNodeUrlOptions = {},
) {
  const { isDownload, urlParams, ...signOptions } = options;
  const url = new URL(`${INODES_CLOUDFRONT_URL}/${s3Key}`);

  if (isDownload) {
    url.searchParams.set("download", "1");
  }

  if (urlParams) {
    for (const [key, val] of Object.entries(urlParams)) {
      url.searchParams.set(key, val);
    }
  }

  return signCloudFrontUrl(url, signOptions);
}

export async function checkUploadQuotaAfterUpload(opt: {
  userId: string;
  uploads: { fileSize: number }[];
}) {
  const { userId, uploads } = opt;
  const bytesToUpload = uploads.reduce((a, v) => a + v.fileSize, 0);
  const remainingBytesBefore = await getRemainingUploadBytesByUser(userId);
  const remainingBytesAfter = remainingBytesBefore - bytesToUpload;
  if (remainingBytesAfter >= 0) {
    return {
      ok: true,
    };
  }

  return {
    ok: false,
    error: {
      code: "quota_exceeded",
      message: `${
        uploads.length > 1 ? "Total file" : "File"
      } size exceeds your upload quota by ${format(-remainingBytesAfter)}.`,
    },
  };
}
