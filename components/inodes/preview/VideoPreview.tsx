import { type ResourcePermissions } from "$util";
import { asset } from "../../../util/asset.ts";
import { isPostProcessedToVideo } from "../../../util/inodes/post_process/type_predicates.ts";
import { getResponsiveMediaStyles } from "../../../util/inodes/responsive_media_styles.ts";
import { FileNode } from "../../../util/inodes/types.ts";
import type { Context } from "../../../util/types.ts";
import LoaderSpinner from "../../loaders/LoaderSpinner.tsx";
import GeneralPreview from "./GeneralPreview.tsx";

interface Props {
  inode: FileNode;
  perm: ResourcePermissions;
}

export default function VideoPreview(props: Props, ctx: Context) {
  const { inode, perm } = props;
  const isPostProcessed = isPostProcessedToVideo(inode);
  const browserName = ctx.userAgent.browser.name;
  const supportsHls = browserName === "Safari";
  const hlsWorkerPath = asset("vendored/hls/hls.worker.js", { cdn: false });

  let isProcessing;
  let showError;
  let percentComplete;
  let videoUrl;
  let width;
  let height;
  let style;

  if (isPostProcessed) {
    isProcessing = inode.postProcess.status === "PENDING";
    showError = inode.postProcess.status === "ERROR";
    percentComplete = inode.postProcess.percentComplete;
    videoUrl = inode.postProcess.playlistDataUrl;
    width = inode.postProcess.width;
    height = inode.postProcess.height;
    if (width && height) style = getResponsiveMediaStyles(width, height);
  }

  return (
    <GeneralPreview perm={perm}>
      {isPostProcessed && (
        <>
          {isProcessing && (
            <link
              rel="modulepreload"
              href={asset("inodes/listen_post_proc.js")}
            />
          )}

          {!supportsHls && !showError && (
            <link rel="modulepreload" href={asset("vendored/hls/hls.mjs")} />
          )}

          {(isProcessing || (!supportsHls && !showError)) && (
            <script type="module" src={asset("inodes/video_preview.js")} />
          )}

          {isProcessing && (
            <LoaderSpinner block id="file-preview-loader">
              Converting video…{" "}
              <span id="progress-perc">
                {percentComplete ? `${percentComplete}%` : null}
              </span>
            </LoaderSpinner>
          )}

          {(isProcessing || showError) && (
            <p id="file-preview-error" class="alert error" hidden={!showError}>
              There was an error converting this video, try uploading it again.
            </p>
          )}
        </>
      )}

      {!showError && (
        <video
          id="file-preview"
          src={supportsHls ? videoUrl : undefined}
          hidden={isProcessing}
          controls
          data-inode-id={isProcessing ? inode.id : null}
          data-is-processing={isProcessing || null}
          data-video-url={(isPostProcessed && !supportsHls && videoUrl) || null}
          data-supports-hls={(isProcessing && supportsHls) ? "1" : null}
          data-hls-worker-path={isPostProcessed && !supportsHls
            ? hlsWorkerPath
            : null}
          style={style}
        />
      )}
    </GeneralPreview>
  );
}
