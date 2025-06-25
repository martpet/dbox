import type { HandlerConfig, InboundChatEvent } from "../util/types.ts";
import { deletedChatMsgHandler } from "./delete_chat_msg.ts";
import { editedChatMsgHandler } from "./edit_chat_msg.ts";
import { lastSeenFeedItemHandler } from "./last_seen_feed_item.ts";
import { loadOlderMessagesHandler } from "./load_older_messages.ts";
import { newChatMsgHandler } from "./new_chat_msg.ts";
import { subscriberOnlineHandler } from "./subscriber_online.ts";
import { userTypingHandler } from "./user_is_typing.ts";

export const config = new Map<
  InboundChatEvent["type"],
  HandlerConfig
>();

config.set("new-chat-msg", {
  handler: newChatMsgHandler,
  queue: "msg",
});

config.set("edited-chat-msg", {
  handler: editedChatMsgHandler,
  queue: "msg",
});

config.set("deleted-chat-msg", {
  handler: deletedChatMsgHandler,
  queue: "msg",
});

config.set("last-seen-feed-item", {
  handler: lastSeenFeedItemHandler,
});

config.set("load-older-messages", {
  handler: loadOlderMessagesHandler,
});

config.set("user-typing", {
  handler: userTypingHandler,
});

config.set("subscriber-online", {
  handler: subscriberOnlineHandler,
});
