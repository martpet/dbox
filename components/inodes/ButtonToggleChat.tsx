import type { Inode } from "../../util/inodes/types.ts";

interface Props {
  inode: Inode;
}

export default function ButtonToggleChat({ inode }: Props) {
  return (
    <form method="post" action="/chat/toggle">
      <button name="inodeId" value={inode.id}>
        {inode.chatEnabled
          ? (
            <>
              <i class="ico-stop-circle" />Disable chat
            </>
          )
          : (
            <>
              <i class="ico-chat-dots" />Enable chat
            </>
          )}
      </button>
    </form>
  );
}
