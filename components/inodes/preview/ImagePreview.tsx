import { type ResourcePermissions } from "$util";
import { asset } from "../../../util/asset.ts";
import { FilePreviewDetails } from "../../../util/inodes/file_preview.ts";
import { getRemainingProcessingTimeout } from "../../../util/inodes/post_process/post_process.ts";
import { getResponsiveMediaStyles } from "../../../util/inodes/responsive_media_styles.ts";
import type {
  FileNode,
  PostProcessedToImage,
} from "../../../util/inodes/types.ts";
import LoaderSpinner from "../../loaders/LoaderSpinner.tsx";
import GeneralPreview from "./GeneralPreview.tsx";

interface Props {
  inode: FileNode;
  preview: FilePreviewDetails;
  perm: ResourcePermissions;
}

export default function ImagePreview(props: Props) {
  const { inode, preview, perm } = props;

  let timeoutAfter;
  let isProcessing;
  let showError;
  let style;

  if (inode.postProcess) {
    if (!preview.isOrig) {
      timeoutAfter = getRemainingProcessingTimeout(inode);
      isProcessing = !!timeoutAfter;
      showError = inode.postProcess.status === "ERROR" || timeoutAfter === 0;
    }
    const { width, height } = (inode as PostProcessedToImage).postProcess;
    if (width && height) style = getResponsiveMediaStyles(width, height);
  }

  return (
    <GeneralPreview perm={perm} isPostProcessError={showError}>
      {isProcessing && (
        <>
          <script
            type="module"
            src={asset("inodes/listen_post_proc.js")}
          />
          <LoaderSpinner block id="file-preview-loader">
            Loading image preview…
          </LoaderSpinner>
        </>
      )}

      {(isProcessing || showError) && (
        <p id="file-preview-error" class="alert error" hidden={!showError}>
          Image preview not available
        </p>
      )}

      {!showError && (
        <img
          id="file-preview"
          src={preview?.url}
          hidden={isProcessing}
          data-inode-id={isProcessing ? inode.id : null}
          data-processing-timeout={isProcessing ? timeoutAfter : null}
          style={style}
        />
      )}
    </GeneralPreview>
  );
}
