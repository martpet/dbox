import type { s3 } from "$aws";
import type { Buffer } from "node:buffer";

export interface UploadInitData {
  fileName: string;
  fileSize: number;
  isUtf8: CompletedUpload["isUtf8"];
  mimeType: string;
  bytesChunk?: Buffer;
  numberOfParts: number;
  savedUpload?: SavedUpload;
}

export interface UploadInitResult {
  uploadId: string;
  s3Key: string;
  createdOn: number;
  finishedParts: s3.FinishedUploadPart[];
  mimeType: string;
}

export interface CompleteUploadInit extends s3.CompleteMultipartInit {
  isUtf8: CompletedUpload["isUtf8"];
}

export interface CompletedUpload extends CompleteUploadInit {
  isUtf8: boolean | undefined;
  fileSize: number;
}

export interface SavedUpload {
  uploadId: string;
  s3Key: string;
  createdOn: number;
  checksum: string;
  finishedParts: s3.FinishedUploadPart[];
}
