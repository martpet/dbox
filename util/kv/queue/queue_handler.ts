import { handleAdminAlert, isAdminAlert } from "./admin_alert.ts";
import {
  handleChangeDirChildrenAcl,
  isChangeDirChildrenAcl,
} from "./change_dir_children_acl.ts";
import { handleCleanUpInode, isCleanUpInode } from "./cleanup_inode.ts";
import { handleCleanUpUser, isCleanUpUser } from "./cleanup_user.ts";
import {
  handleDeleteDirChildren,
  isDeleteDirChildren,
} from "./delete_dir_children.ts";
import {
  handleDeleteS3Objects,
  isDeleteS3Objects,
} from "./delete_s3_objects.ts";
import {
  handlePostProcessFileNodes,
  isPostProcessFileNodes,
} from "./post_process/post_process_file_nodes.ts";
import {
  handlePostProcessVideoNode,
  isPostProcessVideoNode,
} from "./post_process/post_process_video_node.ts";
import {
  handleGeneralPostProcessorEvent,
  isGeneralPostProcessorEvent,
} from "./post_processor_event/general_post_processor_event.ts";
import {
  handleSharpProcessorEvent,
  isSharpProcessorEvent,
} from "./post_processor_event/sharp_processor_event.ts";
import {
  handleStripePaymentIntentSuccess,
  isStripePaymentIntentSuccess,
} from "./post_processor_event/stripe_payment_intent_success.ts";
import {
  handleVideoProcessorEvent,
  isVideoProcessorEvent,
} from "./post_processor_event/video_processor_event.ts";
import {
  handlePushChatNotification,
  isPushChatNotification,
} from "./push_chat_notification.ts";

export function queueHandler(msg: unknown) {
  if (isPushChatNotification(msg)) {
    return handlePushChatNotification(msg);
  }
  if (isDeleteS3Objects(msg)) {
    return handleDeleteS3Objects(msg);
  }
  if (isDeleteDirChildren(msg)) {
    return handleDeleteDirChildren(msg);
  }
  if (isChangeDirChildrenAcl(msg)) {
    return handleChangeDirChildrenAcl(msg);
  }
  if (isCleanUpInode(msg)) {
    return handleCleanUpInode(msg);
  }
  if (isCleanUpUser(msg)) {
    return handleCleanUpUser(msg);
  }
  if (isPostProcessVideoNode(msg)) {
    return handlePostProcessVideoNode(msg);
  }
  if (isPostProcessFileNodes(msg)) {
    return handlePostProcessFileNodes(msg);
  }
  if (isVideoProcessorEvent(msg)) {
    return handleVideoProcessorEvent(msg);
  }
  if (isSharpProcessorEvent(msg)) {
    return handleSharpProcessorEvent(msg);
  }
  if (isGeneralPostProcessorEvent(msg)) {
    return handleGeneralPostProcessorEvent(msg);
  }
  if (isStripePaymentIntentSuccess(msg)) {
    return handleStripePaymentIntentSuccess(msg);
  }
  if (isAdminAlert(msg)) {
    return handleAdminAlert(msg);
  }

  console.error("Unhandled Queue message", msg);
}
