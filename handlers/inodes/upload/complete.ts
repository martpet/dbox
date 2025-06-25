import { completeMultipartUploads, type CompleteUploadInit } from "$upload";
import { STATUS_CODE } from "@std/http";
import { getSigner } from "../../../util/aws/signer.ts";
import { INODES_BUCKET } from "../../../util/consts.ts";
import {
  canUpload,
  createFileNodesFromUploads,
} from "../../../util/inodes/create_file_node.ts";
import { checkUploadQuotaAfterUpload } from "../../../util/inodes/helpers.ts";
import { getInodeById } from "../../../util/kv/inodes.ts";
import type { Context } from "../../../util/types.ts";

type ReqData = {
  uploads: CompleteUploadInit[];
  dirId: string;
};

export default async function completeUploadHandler(ctx: Context) {
  const { user } = ctx.state;
  const { origin } = ctx.url;

  if (!user) {
    return ctx.respond(null, STATUS_CODE.Unauthorized);
  }

  const reqData = await ctx.req.json();

  if (!isValidReqData(reqData)) {
    return ctx.respond(null, STATUS_CODE.BadRequest);
  }

  const { dirId, uploads } = reqData;
  const dirEntry = await getInodeById(dirId);

  if (!canUpload(dirEntry, user)) {
    return ctx.respond(null, STATUS_CODE.NotFound);
  }

  const completedUploads = await completeMultipartUploads({
    uploads,
    bucket: INODES_BUCKET,
    signer: getSigner(),
  });

  const uploadQuotaCheck = await checkUploadQuotaAfterUpload({
    userId: user.id,
    uploads: completedUploads,
  });

  if (!uploadQuotaCheck.ok) {
    return ctx.respondJson(uploadQuotaCheck.error, STATUS_CODE.ContentTooLarge);
  }

  const completedIds = await createFileNodesFromUploads({
    uploads: completedUploads,
    dirEntry,
    dirId,
    user,
    appUrl: origin,
  });

  return ctx.respondJson(completedIds);
}

function isValidReqData(data: unknown): data is ReqData {
  const { uploads, dirId } = data as Partial<ReqData>;

  return typeof data === "object" &&
    typeof dirId === "string" &&
    Array.isArray(uploads) && uploads.every((upload) => {
      const {
        uploadId,
        s3Key,
        fileName,
        mimeType,
        isUtf8,
        checksum,
        finishedParts,
      } = upload as ReqData["uploads"][number];

      return typeof s3Key === "string" &&
        typeof uploadId === "string" &&
        typeof fileName === "string" &&
        (typeof mimeType === "string" || mimeType === null) &&
        (typeof isUtf8 === "string" || typeof isUtf8 === "undefined") &&
        typeof checksum === "string" &&
        Array.isArray(finishedParts) &&
        typeof finishedParts[0].partNumber === "number" &&
        typeof finishedParts[0].etag === "string";
    });
}
