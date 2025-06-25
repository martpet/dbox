import { mediaconvert } from "$aws";
import {
  deleteChatFeedItem,
  deleteChatMessage,
  deleteChatSub,
  deleteLastFeedItemIdByChat,
  listChatMessages,
  listChatSubs,
  listFeedItemsByChat,
} from "$chat";
import { ACL_ID_ALL } from "$util";
import { newQueue } from "@henrygd/queue";
import { AWS_REGION } from "../../aws/consts.ts";
import { getSigner } from "../../aws/signer.ts";
import type { InodeBase } from "../../inodes/types.ts";
import { deleteInAclOfNotOwnInode } from "../acl.ts";
import { kv } from "../kv.ts";

type PartialInode = Pick<InodeBase, "id" | "ownerId" | "acl">;

export interface QueueMsgCleanUpInode {
  type: "cleanup-inode";
  inode: PartialInode;
  pendingMediaConvertJob?: string;
}

export function isCleanUpInode(msg: unknown): msg is QueueMsgCleanUpInode {
  const {
    type,
    inode,
    pendingMediaConvertJob,
  } = msg as Partial<QueueMsgCleanUpInode>;

  return typeof msg === "object" &&
    type === "cleanup-inode" &&
    typeof inode === "object" &&
    typeof inode.id === "string" &&
    typeof inode.ownerId === "string" &&
    (typeof pendingMediaConvertJob === "string" ||
      typeof pendingMediaConvertJob === "undefined");
}

export async function handleCleanUpInode(msg: QueueMsgCleanUpInode) {
  const { inode, pendingMediaConvertJob } = msg;

  const promises = [
    (async () => {
      await cleanupChat(inode.id);
      await cleanupAclIndexes(inode);
    })(),
  ];

  if (pendingMediaConvertJob) {
    promises.push(mediaconvert.cancelJob({
      jobId: pendingMediaConvertJob,
      signer: getSigner(),
      region: AWS_REGION,
    }));
  }

  await Promise.all(promises);
}

async function cleanupChat(chatId: string) {
  const chatSubs = await listChatSubs({ kv, chatId });
  const chatFeeds = await listFeedItemsByChat({ kv, chatId });
  const { messages } = await listChatMessages({ kv, chatId });
  const queue = newQueue(5);

  queue.add(() => deleteLastFeedItemIdByChat(chatId, kv));

  for (const sub of chatSubs) {
    queue.add(() => deleteChatSub(sub, kv.atomic()).commit());
  }

  for (const feed of chatFeeds) {
    queue.add(() => deleteChatFeedItem(feed, kv));
  }

  for (const msg of messages) {
    queue.add(() => deleteChatMessage(msg, kv.atomic()).commit());
  }

  return queue.done();
}

function cleanupAclIndexes(inode: PartialInode) {
  const queue = newQueue(5);
  for (const userId of Object.keys(inode.acl)) {
    if (userId !== inode.ownerId && userId !== ACL_ID_ALL) {
      queue.add(() =>
        deleteInAclOfNotOwnInode({
          userId,
          inodeId: inode.id,
        }).commit()
      );
    }
  }
  return queue.done();
}
