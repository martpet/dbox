import { asset } from "../../util/asset.ts";
import { Context } from "../../util/types.ts";
import Tooltip from "../Tooltip.tsx";

export default function ChatSubscription(_props: unknown, ctx: Context) {
  const { os, browser } = ctx.userAgent;

  let help;

  if (
    os.name === "macOS" && browser.name === "Safari" ||
    os.name === "iOS" && browser.name === "Safari" ||
    os.name === "Android" && browser.name === "Chrome"
  ) {
    help =
      "You'll get push notifications when this page is closed or in the background.";
  } else {
    help =
      `You'll get push notifications when this page is closed or unfocused, as long as ${browser.name} is running.`;
  }

  return (
    <>
      <div id="chat-sub">
        <label>
          <input id="chat-sub-checkbox" type="checkbox" disabled />
          Subscribe for chat
        </label>

        <Tooltip id="chat-sub-help" info={help}>
          <i class="ico-question-circle" />
        </Tooltip>

        <span
          id="chat-sub-denied"
          class="alert error"
          aria-live="polite"
          hidden
        >
          Disabled in browser settings
        </span>

        <button id="chat-sub-allow" hidden>
          Allow
        </button>
      </div>

      {os.name === "iOS" && (
        <details id="ios-chat-sub-help" hidden>
          <summary>Chat Notifications</summary>
          <p>
            To subscribe for chat notifications on iOS, add this website to your
            Home Screen:
          </p>
          <figure>
            <img loading="lazy" src={asset("img/ios-add-homescreen-1.png")} />
            <img loading="lazy" src={asset("img/ios-add-homescreen-2.png")} />
          </figure>
        </details>
      )}
    </>
  );
}
