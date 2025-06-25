import { SESSION_COOKIE } from "$webauthn";
import { MINUTE } from "@std/datetime";
import { deleteCookie, STATUS_CODE } from "@std/http";
import { isProd, SITE_NAME } from "../../util/consts.ts";
import { enqueue } from "../../util/kv/enqueue.ts";
import { kv } from "../../util/kv/kv.ts";
import { QueueMsgAdminAlert } from "../../util/kv/queue/admin_alert.ts";
import { type QueueMsgCleanupUser } from "../../util/kv/queue/cleanup_user.ts";
import { deleteUser } from "../../util/kv/users.ts";
import { isSessionFresh } from "../../util/session.ts";
import type { Context } from "../../util/types.ts";

export default async function deleteAccountHandler(ctx: Context) {
  const { user, session } = ctx.state;

  if (!user || !session) {
    return ctx.respond(null, STATUS_CODE.Unauthorized);
  }

  if (!isSessionFresh(session, MINUTE)) {
    return ctx.respondJson({ error: "auth_again" }, STATUS_CODE.Forbidden);
  }

  const cleanupMsg: QueueMsgCleanupUser = {
    type: "cleanup-user",
    userId: user.id,
    username: user.username,
  };

  const atomic = kv.atomic();
  deleteUser(user, atomic);
  enqueue(cleanupMsg, atomic);

  if (isProd) {
    const adminAlert: QueueMsgAdminAlert = {
      type: "admin-alert",
      emailSubject: `Deleted ${SITE_NAME} user`,
      message: `Username: ${user.username}`,
    };
    enqueue(adminAlert, atomic);
  }

  const commit = await atomic.commit();

  if (!commit.ok) {
    return ctx.respond(null, STATUS_CODE.Conflict);
  }

  deleteCookie(ctx.resp.headers, SESSION_COOKIE, { path: "/" });

  return ctx.respond();
}
