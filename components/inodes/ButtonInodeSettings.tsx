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

export default function ButtoeInodeSettings(
  { inode, perm, showDelete }: Props,
) {
  return (
    <>
      <PopMenu
        btnContent={<>More</> /* <i class="ico-gear" /> */}
        menuId="inode-page-settings"
      >
        {perm.canModerate && (
          <ButtonToggleChat inodeId={inode.id} isEnabled={inode.chatEnabled} />
        )}
        {showDelete && perm.canModify && <ButtonDeleteInode inode={inode} />}
      </PopMenu>
      {showDelete && <DialogDeleteInode inode={inode} />}
    </>
  );
}
