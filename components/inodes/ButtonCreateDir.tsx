import type { JSX } from "preact/jsx-runtime";
import { asset } from "../../util/asset.ts";
import { ROOT_DIR_ID } from "../../util/inodes/consts.ts";
import { DIR_NAME_CONSTRAINTS } from "../../util/input_constraints.ts";

interface Props extends JSX.HTMLAttributes<HTMLButtonElement> {
  parentDirId: string;
  isRoot?: boolean;
}

export default function ButtonCreateDir(props: Props) {
  const { parentDirId, ...btnProps } = props;
  const isBox = parentDirId === ROOT_DIR_ID;

  return (
    <>
      <script type="module" src={asset("inodes/create_dir.js")} />

      <button
        {...btnProps}
        id="show-create-dir"
        class="wait-disabled"
        disabled
        data-parent-dir-id={parentDirId}
        data-is-box={isBox ? "1" : null}
        data-constraints={JSON.stringify(DIR_NAME_CONSTRAINTS)}
      >
        {isBox
          ? (
            <>
              <i class="ico-plus-lg" />
              New Box
            </>
          )
          : (
            <>
              <i class="ico-folder-plus" />
              New Folder
            </>
          )}
      </button>
    </>
  );
}
