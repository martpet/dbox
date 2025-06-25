import { asset } from "../../util/asset.ts";
import type { InodeLabel } from "../../util/inodes/types.ts";
import PopMenu from "../PopMenu.tsx";

interface Props {
  dirId: string;
  isSingleSelect?: boolean;
  inodeLabel?: InodeLabel;
}

export default function ButtonTableActions(props: Props) {
  const { dirId, isSingleSelect, inodeLabel } = props;

  return (
    <>
      <script type="module" src={asset("inodes/bulk_actions.js")} />

      <PopMenu
        btnContent="Actions"
        id="button-bulk-actions"
        menuId="menu-bulk-actions"
        data-dir-id={dirId}
        data-is-single-select={isSingleSelect ? "1" : null}
        data-inode-label={isSingleSelect ? inodeLabel : null}
        hidden
      >
        <button id="button-bulk-delete" class="danger">
          <i class="ico-trash" />
          Delete {isSingleSelect ? inodeLabel : "Selected"}
        </button>
      </PopMenu>
    </>
  );
}
