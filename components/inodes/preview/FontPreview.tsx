import { type ResourcePermissions } from "../../../modules/util/file_permissions.ts";
import { type FilePreviewDetails } from "../../../util/inodes/file_preview.ts";
import FontSample from "./FontSample.tsx";
import GeneralPreview from "./GeneralPreview.tsx";

interface Props {
  preview: FilePreviewDetails;
  perm: ResourcePermissions;
}

export default function FontPreview(props: Props) {
  const { preview, perm } = props;

  if (!preview.url) {
    return null;
  }

  return (
    <GeneralPreview perm={perm}>
      <FontSample src={preview.url} />
    </GeneralPreview>
  );
}
