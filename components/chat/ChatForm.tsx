import { CHAT_MESSAGE_CONTRAINTS } from "$chat";
import type { Context } from "../../util/types.ts";

export default function ChatForm(_props: unknown, ctx: Context) {
  const { state, userAgent } = ctx;

  return (
    <div id="chat-form-wrapper">
      {state.user && (
        <form id="chat-form">
          <fieldset disabled>
            <textarea
              rows={1}
              required
              {...CHAT_MESSAGE_CONTRAINTS}
              placeholder="Type a message…"
            />
            <button hidden>Send</button>
          </fieldset>
        </form>
      )}
      <button
        id="scrollto-unseen-msg-btn"
        title="See new message"
        aria-live="polite"
        hidden
      >
        {userAgent.device.type === "mobile" ? "↓" : "⬇"}
      </button>
    </div>
  );
}
