import { type AwsCredentials, s3 } from "$aws";
import { newQueue } from "@henrygd/queue";
import { DAY } from "@std/datetime";
import { getSignatureKey, getSignedUrl } from "aws_s3_presign";
import { AWSSignerV4 } from "deno_aws_sign_v4";
import type {
  SavedUpload,
  UploadInitData,
  UploadInitResult,
} from "./utils/types.ts";

export interface InitUploadOptions {
  uploadsInitData: UploadInitData[];
  region: string;
  bucket: string;
  credentials: AwsCredentials;
  signer: AWSSignerV4;
  savedUploadExpiresIn: number;
  signedUrlExpiresIn?: number;
  s3Endpoint?: string;
  headersCallback?: (u: UploadInitData & { mimeType: string }) => Headers;
}
const DEFAULT_SIGNED_URL_EXPIRES_IN = DAY / 1000;

export async function initUploads(options: InitUploadOptions) {
  const {
    uploadsInitData,
    region,
    bucket,
    credentials,
    signer,
    savedUploadExpiresIn,
    signedUrlExpiresIn = DEFAULT_SIGNED_URL_EXPIRES_IN,
    s3Endpoint,
    headersCallback,
  } = options;

  const queue = newQueue(10);
  const signedUrls: string[] = [];
  const { accessKeyId, secretAccessKey } = credentials;
  const signatureKey = getSignatureKey({
    date: new Date(),
    region,
    secretAccessKey,
  });

  let uploadedSize = 0;

  const uploadsInitResults = await Promise.all(
    uploadsInitData.map((upload) =>
      queue.add<UploadInitResult>(async () => {
        const { numberOfParts, savedUpload } = upload;
        const mimeType = upload.mimeType;
        const finishedPartsNumbers = [];

        let uploadId;
        let s3Key;
        let createdOn;
        let finishedParts: s3.FinishedUploadPart[];

        if (isValidSavedUpload(savedUpload, savedUploadExpiresIn)) {
          ({ uploadId, s3Key, createdOn, finishedParts } = savedUpload);
          for (const { partSize, partNumber } of finishedParts) {
            uploadedSize += partSize;
            finishedPartsNumbers.push(partNumber);
          }
        } else {
          const headers = headersCallback?.({ ...upload, mimeType });
          finishedParts = [];
          createdOn = Date.now();
          s3Key = crypto.randomUUID();
          uploadId = await s3.createMultipartUpload({
            s3Key,
            bucket,
            signer,
            headers,
          });
        }

        for (let partNumber = 1; partNumber <= numberOfParts; partNumber++) {
          if (finishedPartsNumbers.includes(partNumber)) continue;
          signedUrls.push(getSignedUrl({
            region,
            bucket,
            accessKeyId,
            secretAccessKey,
            signatureKey,
            ...(s3Endpoint && { endpoint: s3Endpoint }),
            key: s3Key,
            expiresIn: signedUrlExpiresIn,
            method: "PUT",
            queryParams: { uploadId, partNumber },
          }));
        }

        return {
          uploadId,
          mimeType,
          s3Key,
          createdOn,
          finishedParts,
        };
      })
    ),
  );

  return {
    uploadsInitResults,
    signedUrls,
    uploadedSize,
  };
}

function isValidSavedUpload(
  upload: SavedUpload | undefined,
  savedUploadExpiresIn: number,
): upload is SavedUpload {
  return typeof upload !== "undefined" &&
    Date.now() - upload.createdOn < savedUploadExpiresIn;
}
