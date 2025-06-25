import type { ResourcePermissions } from "$util";
import { type ComponentChildren } from "preact";

export interface Props {
  perm: ResourcePermissions;
  children?: ComponentChildren;
  isPostProcessError?: boolean;
}

export default function GeneralPreview(props: Props) {
  const { children, perm, isPostProcessError } = props;

  return (
    <>
      {(!isPostProcessError || perm.canModify) && children && (
        <figure id="file-preview-canvas">{children}</figure>
      )}
    </>
  );
}
