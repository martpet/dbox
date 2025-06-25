import { type ResourcePermissions } from "$util";
import { asset } from "../../../util/asset.ts";
import { FilePreviewDetails } from "../../../util/inodes/file_preview.ts";
import { getRemainingProcessingTimeout } from "../../../util/inodes/post_process/post_process.ts";
import type { FileNode } from "../../../util/inodes/types.ts";
import LoaderSpinner from "../../loaders/LoaderSpinner.tsx";
import GeneralPreview from "./GeneralPreview.tsx";

interface Props {
  inode: FileNode;
  preview: FilePreviewDetails;
  perm: ResourcePermissions;
}

export default function IframePreview(props: Props) {
  const { inode, preview, perm } = props;

  let timeoutAfter;
  let isProcessing;
  let showError;

  if (inode.postProcess?.previewMimeType) {
    timeoutAfter = getRemainingProcessingTimeout(inode);
    isProcessing = !!timeoutAfter;
    showError = inode.postProcess.status === "ERROR" || timeoutAfter === 0;
  }

  return (
    <GeneralPreview
      perm={perm}
      isPostProcessError={showError}
    >
      {isProcessing && (
        <>
          <script
            type="module"
            src={asset("inodes/listen_post_proc.js")}
          />
          <LoaderSpinner block id="file-preview-loader">
            Creating a preview…
          </LoaderSpinner>
        </>
      )}

      {(isProcessing || showError) && (
        <p id="file-preview-error" class="alert error" hidden={!showError}>
          Could not create a preview
        </p>
      )}

      {!showError && (
        <iframe
          id="file-preview"
          src={preview?.url || undefined}
          hidden={isProcessing}
          data-mime={preview.mimeType}
          data-proc={inode.postProcess?.proc}
          data-inode-id={isProcessing ? inode.id : null}
          data-processing-timeout={isProcessing ? timeoutAfter : null}
        />
      )}
    </GeneralPreview>
  );
}
