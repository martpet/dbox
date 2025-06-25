import { type Browser } from "@std/http/user-agent";
import { type ResourcePermissions } from "../../../modules/util/file_permissions.ts";
import { type FilePreviewDetails } from "../../../util/inodes/file_preview.ts";
import GeneralPreview from "./GeneralPreview.tsx";

interface Props {
  preview: FilePreviewDetails;
  perm: ResourcePermissions;
  browser: Browser;
  fileName: string;
}

export default function AudioPreview(props: Props) {
  const { preview, perm, browser, fileName } = props;
  let canPlayAudio = true;

  if (fileName.endsWith(".mp2") && browser.name !== "Safari") {
    canPlayAudio = false;
  }

  if (!preview.url || !canPlayAudio) {
    return null;
  }

  return (
    <GeneralPreview perm={perm}>
      <audio src={preview.url} controls />
    </GeneralPreview>
  );
}
