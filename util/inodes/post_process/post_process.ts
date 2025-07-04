import { MINUTE } from "@std/datetime/constants";
import { decodeTime } from "@std/ulid";
import { INODES_BUCKET } from "../../consts.ts";
import { enqueue } from "../../kv/enqueue.ts";
import { getInodeById } from "../../kv/inodes.ts";
import { type QueueMsgDeleteS3Objects } from "../../kv/queue/delete_s3_objects.ts";
import { setAnyInode } from "../kv_wrappers.ts";
import type { FileNode, Inode } from "../types.ts";
import { isPostProcessedFileNode } from "./type_predicates.ts";

export async function patchPostProcessedNode(opt: {
  inodePatch: Partial<FileNode>;
  inodeEntry: Deno.KvEntryMaybe<Inode>;
  inodeId: string;
  inodeS3Key: string;
  stateChangeDate: Date;
}) {
  const { inodePatch, inodeId, inodeS3Key, stateChangeDate } = opt;
  let { inodeEntry } = opt;
  let inode = inodeEntry.value;
  let commit = { ok: false };
  let commitIndex = 0;

  while (!commit.ok) {
    if (commitIndex) {
      inodeEntry = await getInodeById(inodeId);
      inode = inodeEntry.value;
    }
    if (isStaleEvent(inode, stateChangeDate)) {
      return;
    }
    if (inode?.type !== "file") {
      await cleanupS3Objects(inodeS3Key);
      return;
    }
    const atomic = setAnyInode({ ...inode, ...inodePatch });
    atomic.check(inodeEntry);
    commit = await atomic.commit();
    commitIndex++;
  }
}

export function isStaleEvent(inode: Inode | null, currentChangeDate: Date) {
  if (!isPostProcessedFileNode(inode)) return false;
  const prevChangeDate = inode.postProcess.stateChangeDate;
  if (!prevChangeDate) return false;
  return prevChangeDate > currentChangeDate;
}

export function cleanupS3Objects(inodeS3Key: string) {
  return enqueue<QueueMsgDeleteS3Objects>({
    type: "delete-s3-objects",
    bucket: INODES_BUCKET,
    s3KeysData: [{
      name: inodeS3Key,
      isPrefix: true,
    }],
  }).commit();
}

export function getRemainingProcessingTimeout(inode: FileNode) {
  if (inode.postProcess?.status !== "PENDING") return null;
  const createdAt = new Date(decodeTime(inode.id));
  const now = new Date();
  const diff = now.getTime() - createdAt.getTime();
  const TIMEOUT = MINUTE * 5;
  return Math.max(0, TIMEOUT - diff);
}
