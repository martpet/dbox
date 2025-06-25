import {
  AWS_ADMIN_EMAIL_ALERT_TOPIC,
  AWS_ADMIN_SMS_ALERT_TOPIC,
} from "../../aws/consts.ts";
import { snsPublish, type SnsPublishOptions } from "../../aws/sns.ts";

export interface QueueMsgAdminAlert
  extends Omit<SnsPublishOptions, "topicArn"> {
  type: "admin-alert";
  isSms?: boolean;
}

export function isAdminAlert(
  msg: unknown,
): msg is QueueMsgAdminAlert {
  const { type, message, isSms, emailSubject } = msg as Partial<
    QueueMsgAdminAlert
  >;
  return typeof msg === "object" &&
    type === "admin-alert" &&
    typeof message === "string" &&
    (typeof isSms === "boolean" || typeof isSms === "undefined") &&
    (typeof emailSubject === "string" || typeof emailSubject === "undefined");
}

export function handleAdminAlert(msg: QueueMsgAdminAlert) {
  const { message, isSms, emailSubject } = msg;

  const topicArn = isSms
    ? AWS_ADMIN_SMS_ALERT_TOPIC
    : AWS_ADMIN_EMAIL_ALERT_TOPIC;

  return snsPublish({
    topicArn,
    message,
    emailSubject,
  });
}
