import { assert } from "@std/assert";
import { env, isProd } from "../consts.ts";

if (isProd) {
  assert(env.STRIPE_PUB_KEY_PROD);
  assert(env.STRIPE_SECRET_PROD);
} else {
  assert(env.STRIPE_PUB_KEY_DEV);
  assert(env.STRIPE_SECRET_DEV);
}

export const STRIPE_PUB_KEY = isProd
  ? env.STRIPE_PUB_KEY_PROD
  : env.STRIPE_PUB_KEY_DEV;

export const STRIPE_SECRET = isProd
  ? env.STRIPE_SECRET_PROD
  : env.STRIPE_SECRET_DEV;
