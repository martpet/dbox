import type { ResourcePermissions } from "$util";
import { type Browser } from "@std/http";
import { type FilePreviewDetails } from "../../../util/inodes/file_preview.ts";
import type { FileNode } from "../../../util/inodes/types.ts";
import AudioPreview from "./AudioPreview.tsx";
import FontPreview from "./FontPreview.tsx";
import GeneralPreview from "./GeneralPreview.tsx";
import IframePreview from "./IframePreview.tsx";
import ImagePreview from "./ImagePreview.tsx";
import VideoPreview from "./VideoPreview.tsx";

interface Props {
  inode: FileNode;
  preview: FilePreviewDetails;
  perm: ResourcePermissions;
  browser: Browser;
}

export default function FilePreview(props: Props) {
  const { inode, perm, preview, browser } = props;

  if (preview?.display === "video") {
    return <VideoPreview inode={inode} perm={perm} />;
  }

  if (preview?.display === "image") {
    return <ImagePreview inode={inode} preview={preview} perm={perm} />;
  }

  if (preview?.display === "iframe") {
    return <IframePreview inode={inode} preview={preview} perm={perm} />;
  }

  if (preview?.display === "audio") {
    return (
      <AudioPreview
        preview={preview}
        perm={perm}
        browser={browser}
        fileName={inode.name}
      />
    );
  }

  if (preview?.display === "font") {
    return <FontPreview preview={preview} perm={perm} />;
  }

  return <GeneralPreview perm={perm} />;
}
