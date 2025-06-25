import { cloudfront } from "$aws";
import {
  AWS_CLOUDFRONT_KEYPAIR_ID,
  AWS_CLOUDFRONT_SIGNER_PRIVATE_KEY,
} from "./consts.ts";

export type SignCloudFrontUrlOptions = {
  expireIn?: number;
};

export function signCloudFrontUrl(
  url: cloudfront.SignUrlOptions["url"],
  options: SignCloudFrontUrlOptions = {},
) {
  const { expireIn } = options;
  return cloudfront.signUrl({
    url,
    keyPairId: AWS_CLOUDFRONT_KEYPAIR_ID,
    privateKey: AWS_CLOUDFRONT_SIGNER_PRIVATE_KEY,
    expireIn,
  });
}
