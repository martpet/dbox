import { CHAT_MSG_FOLLOWUP_DURATION, type ChatMessage } from "$chat";
import { type ResourcePermissions } from "$util";
import { asset } from "../../util/asset.ts";
import { CHAT_SUB_WITHOUT_PUSH_SUB_EXPIRES } from "../../util/consts.ts";
import type { Context } from "../../util/types.ts";
import LoaderDots from "../loaders/LoaderDots.tsx";
import ChatDayHeading from "./ChatDayHeading.tsx";
import ChatForm from "./ChatForm.tsx";
import ChatMessages, { chatIntlFmt } from "./ChatMessages.tsx";
import ChatMsg from "./ChatMsg.tsx";
import ChatMsgEditTag from "./ChatMsgEditTag.tsx";
import ChatSubscription from "./ChatSubscription.tsx";

type Props = (PropsWithLazyLoad | PropsWithoutLazyLoad) & {
  enabled: boolean | undefined;
  inodeId: string;
  chatTitle: string;
  perm: ResourcePermissions;
};

interface PropsWithLazyLoad {
  messages?: never;
  olderMsgsCursor?: never;
}

interface PropsWithoutLazyLoad {
  messages: ChatMessage[];
  olderMsgsCursor: string | null;
}

export default function ChatBox({
  enabled,
  perm,
  messages,
  olderMsgsCursor,
  inodeId,
  chatTitle,
}: Props, ctx: Context) {
  if (!enabled) {
    return <div id="chat" hidden />;
  }

  const { locale } = ctx;
  const { dateTimeFmt, timeFmt } = chatIntlFmt({ locale });
  const { canModerate } = perm;

  return (
    <section
      id="chat"
      data-chat-id={inodeId}
      data-chat-title={chatTitle}
      data-can-moderate={canModerate ? "1" : null}
      data-msg-followup-duration={CHAT_MSG_FOLLOWUP_DURATION}
      data-chat-sub-expires={CHAT_SUB_WITHOUT_PUSH_SUB_EXPIRES}
      data-last-seen-feed-item-id={messages?.at(-1)?.feedItemId}
      data-locale={locale}
    >
      <script id="chat-script" type="module" src={asset("chat/chat.js")} />
      <link rel="modulepreload" href={asset("db.js")} />
      <link rel="stylesheet" href={asset("chat/chat.css")} />

      <h1>Chat</h1>

      <div id="chat-box">
        <div id="chat-main">
          {messages && (
            <ChatMessages
              messages={messages}
              olderMsgsCursor={olderMsgsCursor}
              canModerate={canModerate}
            />
          )}
          {!messages && <output id="lazy-messages-mount" class="spinner-lg" />}
        </div>
        <ChatForm />
      </div>

      <aside id="chat-users-typing" aria-live="polite">
        <span class="names"></span> <LoaderDots />
      </aside>

      {ctx.state.canUseServiceWorker && <ChatSubscription />}

      <template id="chat-template">
        <ChatDayHeading />
        <ChatMsg
          msg={{ createdAt: new Date(), username: "" } as ChatMessage}
          canModerate={false}
          timeFmt={timeFmt}
          dateTimeFmt={dateTimeFmt}
        />
        <ChatMsgEditTag
          editedAt={new Date()}
          dateTimeFmt={dateTimeFmt}
        />
      </template>
    </section>
  );
}
