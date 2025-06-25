import { GB } from "$util";
import { ulid } from "@std/ulid";
import { isProd, SITE_NAME } from "../../../consts.ts";
import type { Payment } from "../../../types.ts";
import { enqueue } from "../../enqueue.ts";
import { kv } from "../../kv.ts";
import {
  deletePaymentIntent,
  getPaymentIntent,
  setPayment,
} from "../../payments.ts";
import { addUserRemainingUploadBytes } from "../../upload_stats.ts";
import { getUserById } from "../../users.ts";
import { QueueMsgAdminAlert } from "../admin_alert.ts";

export interface QueueMsgStripePaymentIntentSuccess {
  type: "stripe-payment-intent-success";
  detail: {
    id: string;
    data: {
      object: {
        id: string;
        amount: number;
      };
    };
  };
}

export function isStripePaymentIntentSuccess(
  msg: unknown,
): msg is QueueMsgStripePaymentIntentSuccess {
  const { detail } = msg as Partial<QueueMsgStripePaymentIntentSuccess>;
  return typeof msg === "object" &&
    typeof detail === "object" &&
    typeof detail.id === "string" &&
    typeof detail.data?.object === "object" &&
    typeof detail.data.object.id === "string" &&
    typeof detail.data.object.amount === "number";
}

export async function handleStripePaymentIntentSuccess(
  msg: QueueMsgStripePaymentIntentSuccess,
) {
  const stripeEventId = msg.detail.id;
  const stripeIntentId = msg.detail.data.object.id;
  const amount = msg.detail.data.object.amount;
  const paymentIntentEntry = await getPaymentIntent(stripeIntentId);

  if (!paymentIntentEntry.value) {
    return;
  }

  const paymentIntent = paymentIntentEntry.value;
  const { userId, product, quantity } = paymentIntent;
  const { value: user } = await getUserById(userId);

  if (!user) {
    return;
  }

  const payment: Payment = {
    id: ulid(),
    userId,
    stripeEventId,
    stripeIntentId,
    product,
    quantity,
    amount,
  };

  const atomic = kv.atomic();

  atomic.check(paymentIntentEntry);
  deletePaymentIntent(paymentIntent);
  setPayment(payment, atomic);

  addUserRemainingUploadBytes({
    bytes: quantity * GB,
    userId,
    atomic,
  });

  if (isProd) {
    const adminAlert: QueueMsgAdminAlert = {
      type: "admin-alert",
      emailSubject: `New payment in ${SITE_NAME}`,
      message: `User "${user.username}."`,
    };
    enqueue(adminAlert, atomic);
  }

  await atomic.commit();
}
