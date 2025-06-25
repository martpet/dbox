import { assert } from "@std/assert";
import { DAY, WEEK } from "@std/datetime";
import { prodKvEntry } from "./kv/kv.ts";

export const isProd = prodKvEntry.value === true;
export const env = Deno.env.toObject();

assert(env.SUPER_ADMIN);
assert(env.SUPER_ADMIN_EMAIL);
assert(env.VAPID_KEYS);

export const { VAPID_KEYS, SUPER_ADMIN_EMAIL, SUPER_ADMIN } = env;
export const SITE_NAME = "Dbox";
export const SITE_ID = "dbox";
export const SITE_DOMAIN = "dbox.im";
export const SITE_DOMAIN_ID = "dbox-im";
export const SITE_SHORT_DESC = "Upload & Share";
export const SUPPORT_EMAIL = "support@dbox.im";
export const DEPLOYMENT_ID = Deno.env.get("DENO_DEPLOYMENT_ID");
export const IS_LOCAL_DEV = DEPLOYMENT_ID === undefined;
export const SESSION_TIMEOUT = WEEK * 4;
export const CHAT_SUB_WITHOUT_PUSH_SUB_EXPIRES = WEEK * 2;
export const SAVED_UPLOAD_EXPIRES = DAY * 7;
export const GENERAL_ERR_MSG = "Oops, something went wrong, try again!";
export const PRICE_PER_GB_CENTS = 100;

export const PUSH_SUB_HOSTS = [
  "fcm.googleapis.com",
  "google.com", // chrome canary
  "push.services.mozilla.com",
  "push.apple.com",
  "notify.windows.com",
];

export const INODES_BUCKET = isProd
  ? `uploads-${SITE_DOMAIN_ID}`
  : `uploads-dev-${SITE_DOMAIN_ID}`;

export const INODES_CLOUDFRONT_URL = isProd
  ? `https://uploads.${SITE_DOMAIN}`
  : `https://uploads.dev.${SITE_DOMAIN}`;

export const ASSETS_CLOUDFRONT_URL = isProd
  ? `https://assets.${SITE_DOMAIN}`
  : "";
