import { listChatMessagesByUser, setDeletedChatMessage } from "$chat";
import { newQueue } from "@henrygd/queue";
import { deleteInodesRecursive } from "../../inodes/kv_wrappers.ts";
import { cleanupUserAcl } from "../acl.ts";
import { listRootDirsByOwner } from "../inodes.ts";
import { kv } from "../kv.ts";
import { deletePasskey, listPasskeysByUser } from "../passkeys.ts";
import {
  deletePayment,
  deletePaymentIntent,
  listPaymentIntentsByUser,
  listPaymentsByUser,
} from "../payments.ts";
import { deleteSession, listSessionsByUser } from "../sessions.ts";
import { cleanupUploadStatsByUser } from "../upload_stats.ts";

export interface QueueMsgCleanupUser {
  type: "cleanup-user";
  userId: string;
  username: string;
}

export function isCleanUpUser(msg: unknown): msg is QueueMsgCleanupUser {
  const { type, userId, username } = msg as Partial<QueueMsgCleanupUser>;
  return typeof msg === "object" &&
    type === "cleanup-user" &&
    typeof userId === "string" &&
    typeof username === "string";
}

export async function handleCleanUpUser(msg: QueueMsgCleanupUser) {
  const { userId, username } = msg;
  const queue = newQueue(5);

  const inodes = await listRootDirsByOwner(userId);
  const passkeys = await listPasskeysByUser(userId);
  const sessions = await listSessionsByUser(userId);
  const chatMessages = await listChatMessagesByUser(userId, kv);
  const payments = await listPaymentsByUser(userId);
  const paymentIntents = await listPaymentIntentsByUser(userId);

  queue.add(() => deleteInodesRecursive(inodes));
  queue.add(() => cleanupUserAcl({ userId, username, queue }));
  queue.add(() => cleanupUploadStatsByUser(userId));

  for (const passkey of passkeys) {
    queue.add(() => deletePasskey(passkey).commit());
  }

  for (const session of sessions) {
    queue.add(() => deleteSession(session).commit());
  }

  for (const msg of chatMessages) {
    const atomic = kv.atomic();
    queue.add(() => setDeletedChatMessage({ msg, atomic }).commit());
  }

  for (const payment of payments) {
    queue.add(() => deletePayment(payment).commit());
  }

  for (const paymentIntent of paymentIntents) {
    queue.add(() => deletePaymentIntent(paymentIntent).commit());
  }

  return queue.done();
}
