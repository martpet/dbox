import { sns } from "$aws";
import { AWS_REGION } from "./consts.ts";
import { getSigner } from "./signer.ts";

export interface SnsPublishOptions {
  topicArn: string;
  message: string;
  emailSubject?: string;
}

export function snsPublish(options: SnsPublishOptions) {
  const { topicArn, message, emailSubject } = options;

  return sns.publish({
    region: AWS_REGION,
    signer: getSigner(),
    topicArn,
    message,
    emailSubject,
  });
}
