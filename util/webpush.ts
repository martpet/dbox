import { ApplicationServer, importVapidKeys } from "@negrel/webpush";
import { SUPER_ADMIN_EMAIL, VAPID_KEYS } from "./consts.ts";
import type { PushMessage, PushSub } from "./types.ts";

export const vapidKeys = await importVapidKeys(
  JSON.parse(VAPID_KEYS),
  { extractable: false },
);

const applicationServer = await ApplicationServer.new({
  contactInformation: "mailto:" + SUPER_ADMIN_EMAIL,
  vapidKeys,
});

export function sendPushNotification(pushSub: PushSub, message: PushMessage) {
  return applicationServer.subscribe(pushSub).pushTextMessage(
    JSON.stringify(message),
    {},
  );
}

export function sendTestPushNotification(pushSub: PushSub) {
  return sendPushNotification(pushSub, {
    type: "test-notification",
  });
}
