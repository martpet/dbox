import { STATUS_CODE } from "@std/http";
import { AWS_WEBHOOKS_KEY } from "../../util/aws/consts.ts";
import { SITE_ID } from "../../util/consts.ts";
import { enqueue } from "../../util/kv/enqueue.ts";
import { QueueMsgGeneralPostProcessorEvent } from "../../util/kv/queue/post_processor_event/general_post_processor_event.ts";
import { type QueueMsgSharpProcessorEvent } from "../../util/kv/queue/post_processor_event/sharp_processor_event.ts";
import { QueueMsgStripePaymentIntentSuccess } from "../../util/kv/queue/post_processor_event/stripe_payment_intent_success.ts";
import { type QueueMsgVideoProcessorEvent } from "../../util/kv/queue/post_processor_event/video_processor_event.ts";
import type { Context } from "../../util/types.ts";

const SHARP_PROC = `${SITE_ID}.sharp-processor`;
const LIBRE_PROC = `${SITE_ID}.libre-processor`;
const PANDOC_PROC = `${SITE_ID}.pandoc-processor`;
const CSV_PROC = `${SITE_ID}.csv-processor`;
const HIGHLIGHT_PROC = `${SITE_ID}.highlight-processor`;

export default async function awsWebhookHandler(ctx: Context) {
  const apiKey = ctx.req.headers.get("X-Api-Key");

  if (apiKey !== AWS_WEBHOOKS_KEY) {
    return ctx.respond(null, STATUS_CODE.Forbidden);
  }

  const msg = await ctx.req.json();

  const queue = msgToQueue(msg);

  if (queue) {
    await queue.commit();
  } else {
    console.error("Unhandled AWS webhook message", msg);
  }

  return ctx.respond();
}

function msgToQueue(msg: any) {
  if (msg["detail-type"] === "payment_intent.succeeded") {
    return enqueue<QueueMsgStripePaymentIntentSuccess>({
      type: "stripe-payment-intent-success",
      detail: msg.detail,
    });
  }

  switch (msg.source) {
    case "aws.mediaconvert":
      return enqueue<QueueMsgVideoProcessorEvent>({
        type: "video-processor-event",
        detail: msg.detail,
      });

    case SHARP_PROC:
      return enqueue<QueueMsgSharpProcessorEvent>({
        type: "sharp-processor-event",
        time: msg.time,
        detail: msg.detail,
      });

    case LIBRE_PROC:
    case PANDOC_PROC:
    case CSV_PROC:
    case HIGHLIGHT_PROC:
      return enqueue<QueueMsgGeneralPostProcessorEvent>({
        type: "general-post-processor-event",
        time: msg.time,
        detail: msg.detail,
      });
  }
}
