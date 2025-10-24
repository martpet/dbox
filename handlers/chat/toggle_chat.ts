import { getPermissions } from "$util";
import { STATUS_CODE } from "@std/http";
import { GENERAL_ERR_MSG } from "../../util/consts.ts";
import { setAnyInode } from "../../util/inodes/kv_wrappers.ts";
import type { DirNode } from "../../util/inodes/types.ts";
import { getInodeById } from "../../util/kv/inodes.ts";
import { kv } from "../../util/kv/kv.ts";
import type { Context } from "../../util/types.ts";

export const TOGGLE_CHAT = "toggle_chat";

export default async function toggleChatHandler(ctx: Context) {
  const { user } = ctx.state;

  if (!user) {
    return ctx.respond(null, STATUS_CODE.Unauthorized);
  }

  const formData = await ctx.req.formData();
  const inodeId = formData.get("inodeId");

  if (typeof inodeId !== "string") {
    return ctx.respond(null, STATUS_CODE.BadRequest);
  }

  const inodeEntry = await getInodeById(inodeId);
  const inode = inodeEntry.value;
  const perms = getPermissions({ user, resource: inode });

  if (!inode || !perms.canModerate) {
    return ctx.redirectBack();
  }

  if ((inode as DirNode).isRootDir) {
    return ctx.respond(null, STATUS_CODE.BadRequest);
  }

  inode.chatEnabled = !inode.chatEnabled;
  const { chatEnabled } = inode;

  const atomic = kv.atomic();
  atomic.check(inodeEntry);
  setAnyInode(inode, atomic);
  const commit = await atomic.commit();

  if (commit.ok) {
    if (chatEnabled) {
      ctx.setFlash("Chat started");
    } else {
      ctx.setFlash({ type: "info", msg: "Chat stopped" });
    }
  } else {
    ctx.setFlash({ type: "error", msg: GENERAL_ERR_MSG });
  }

  return ctx.redirectBack({
    searchParams: { from: TOGGLE_CHAT },
  });
}
