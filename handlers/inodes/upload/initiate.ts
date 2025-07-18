import { s3 } from "$aws";
import {
  type InitUploadOptions,
  initUploads,
  type UploadInitData,
} from "$upload";
import { DAY } from "@std/datetime";
import { STATUS_CODE } from "@std/http";
import { HEADER } from "@std/http/unstable-header";
import { AWS_CREDENTIALS, AWS_REGION } from "../../../util/aws/consts.ts";
import { getSigner } from "../../../util/aws/signer.ts";
import { INODES_BUCKET, SAVED_UPLOAD_EXPIRES } from "../../../util/consts.ts";
import { checkUploadQuotaAfterUpload } from "../../../util/inodes/helpers.ts";
import type { Context } from "../../../util/types.ts";

interface ReqData {
  uploadsInitData: UploadInitData[];
}

export default async function initiateUploadHandler(ctx: Context) {
  const { user } = ctx.state;

  if (!user) {
    return ctx.respond(null, STATUS_CODE.Unauthorized);
  }

  const reqData = await ctx.req.json();

  if (!isValidReqData(reqData)) {
    return ctx.respond(null, STATUS_CODE.BadRequest);
  }

  const { uploadsInitData } = reqData;

  const uploadQuotaCheck = await checkUploadQuotaAfterUpload({
    userId: user.id,
    uploads: uploadsInitData,
  });

  if (!uploadQuotaCheck.ok) {
    return ctx.respondJson(uploadQuotaCheck.error, STATUS_CODE.ContentTooLarge);
  }

  const headersCallback: InitUploadOptions["headersCallback"] = (upload) => {
    const fileName = encodeURIComponent(upload.fileName);
    return new Headers({
      [HEADER.ContentType]: upload.mimeType,
      [HEADER.ContentDisposition]: `inline; filename*=UTF-8''${fileName}`,
      [HEADER.CacheControl]: `public, max-age=${DAY * 365 / 1000}, immutable`,
    });
  };

  const respData = await initUploads({
    uploadsInitData,
    region: AWS_REGION,
    bucket: INODES_BUCKET,
    credentials: AWS_CREDENTIALS,
    signer: getSigner(),
    savedUploadExpiresIn: SAVED_UPLOAD_EXPIRES,
    s3Endpoint: s3.ACCELERATED_ENDPOINT,
    headersCallback,
  });

  return ctx.respondJson(respData);
}

function isValidReqData(data: unknown): data is ReqData {
  const { uploadsInitData } = data as ReqData;
  return typeof data === "object" &&
    Array.isArray(uploadsInitData) &&
    uploadsInitData.every((item) => {
      const {
        fileName,
        fileSize,
        numberOfParts,
        savedUpload,
        mimeType,
        isUtf8,
      } = item as Partial<UploadInitData>;
      return typeof fileName === "string" &&
        typeof fileSize === "number" &&
        typeof mimeType === "string" &&
        (typeof isUtf8 === "boolean" ||
          typeof isUtf8 === "undefined") &&
        typeof numberOfParts === "number" &&
        (!savedUpload ||
          typeof savedUpload.uploadId === "string" &&
            typeof savedUpload.s3Key === "string" &&
            typeof savedUpload.createdOn === "number" &&
            Array.isArray(savedUpload.finishedParts));
    });
}
