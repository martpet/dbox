import { MiB } from "$util";
import { getMimeConf } from "../mime/get_mime_conf.ts";
import { getFileNodeUrl } from "./helpers.ts";
import { isPostProcessedToVideo } from "./post_process/type_predicates.ts";
import type { FileNode, InodeDisplay } from "./types.ts";

export type FilePreviewDetails = Partial<{
  url: string;
  display: InodeDisplay;
  mimeType: string;
  isOrig: boolean;
}>;

export async function getFilePreviewDetails(
  inode: FileNode,
): Promise<FilePreviewDetails> {
  const { display, showOrig } = getMimeConf(inode.mimeType) || {};
  const { previewMimeType, previewFileName } = inode.postProcess || {};
  const hasProcessedPreview = previewMimeType;
  const isSmallFile = inode.fileSize <= MiB * 20;
  const isImage = display === "image";

  if (isPostProcessedToVideo(inode)) {
    return {
      display: "video",
      isOrig: false,
    };
  }

  if (
    display &&
    (
      showOrig ||
      isSmallFile && (isImage || !hasProcessedPreview) ||
      display === "audio"
    )
  ) {
    return {
      isOrig: true,
      url: await getFileNodeUrl(inode.s3Key),
      mimeType: inode.mimeType,
      display,
    };
  }

  const previewMimeConf = getMimeConf(previewMimeType);

  if (
    hasProcessedPreview &&
    previewMimeConf?.display
  ) {
    let url;
    if (previewFileName) {
      url = await getFileNodeUrl(`${inode.s3Key}/${previewFileName}`);
    }
    return {
      url,
      display: previewMimeConf.display,
      mimeType: previewMimeType,
      isOrig: false,
    };
  }

  return {};
}
