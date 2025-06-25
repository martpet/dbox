import { type ChatMessage } from "$chat";
import type { Context } from "../../util/types.ts";
import ChatDayHeading from "./ChatDayHeading.tsx";
import ChatMsg from "./ChatMsg.tsx";

interface Props {
  messages: ChatMessage[];
  olderMsgsCursor: string | null;
  canModerate: boolean;
  timeZone?: string;
}

export default function ChatMessages(props: Props, ctx: Context) {
  const { messages, olderMsgsCursor, canModerate, timeZone } = props;

  const { dateFmt, timeFmt, dateTimeFmt } = chatIntlFmt({
    locale: ctx.locale,
    timeZone,
  });

  const msgsByDay = Object.groupBy(
    messages,
    (msg) => dateFmt.format(msg.createdAt),
  );

  return (
    <>
      {olderMsgsCursor && (
        <p id="chat-feed-loader" class="spinner-sm">
          Loading older messages
        </p>
      )}

      <p id="chat-beginning" class="splash" hidden={!!olderMsgsCursor}>
        <em>This is the beginning of the conversation.</em>
      </p>

      <article
        role="log"
        id="chat-feed"
        data-older-msgs-cursor={olderMsgsCursor}
        data-last-seen-feed-item-id={messages.at(-1)?.feedItemId}
      >
        {Object.entries(msgsByDay).map(([day, msgs]) => (
          <>
            <ChatDayHeading>{day}</ChatDayHeading>
            {msgs?.map((msg, i) => (
              <ChatMsg
                msg={msg}
                prevMsg={msgs[i - 1]}
                canModerate={canModerate}
                timeFmt={timeFmt}
                dateTimeFmt={dateTimeFmt}
              />
            ))}
          </>
        ))}
      </article>
    </>
  );
}

export function chatIntlFmt(options: {
  timeZone?: string;
  locale?: string;
}) {
  const { timeZone, locale } = options;
  return {
    dateTimeFmt: new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeStyle: "short",
      timeZone,
    }),
    dateFmt: new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeZone,
    }),
    timeFmt: new Intl.DateTimeFormat(locale, {
      timeStyle: "short",
      timeZone,
    }),
  };
}
