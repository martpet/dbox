import { type ResourcePermissions } from "$util";
import type { Inode } from "../../util/inodes/types.ts";
import PopMenu from "../PopMenu.tsx";
import ButtonDeleteInode, { DialogDeleteInode } from "./ButtonDeleteInode.tsx";
import ButtonToggleChat from "./ButtonToggleChat.tsx";

interface Props {
  inode: Inode;
  perm: ResourcePermissions;
  showDelete?: boolean;
}

export default function ButtonPageSettings({ inode, perm, showDelete }: Props) {
  return (
    <>
      <PopMenu
        btnContent={<i class="ico-gear" />}
        menuId="inode-page-settings"
      >
        {perm.canModerate && <ButtonToggleChat inode={inode} />}
        {showDelete && perm.canModify && <ButtonDeleteInode inode={inode} />}
      </PopMenu>
      {showDelete && <DialogDeleteInode inode={inode} />}
    </>
  );
}
