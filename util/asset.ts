import { ASSET_CACHE_PARAM } from "$app";
import { ASSETS_CLOUDFRONT_URL } from "./consts.ts";
import { DEPLOYMENT_HEX } from "./deployment_hex.ts";

interface AssetOptions {
  cdn?: boolean;
}

export function asset(pathname: string, options: AssetOptions = {}) {
  const { cdn = true } = options;

  let url = `/${pathname}`;

  if (cdn && ASSETS_CLOUDFRONT_URL) {
    url = ASSETS_CLOUDFRONT_URL + url;
  } else {
    url = "/assets" + url;
  }

  if (DEPLOYMENT_HEX) {
    url += `?${ASSET_CACHE_PARAM}=${DEPLOYMENT_HEX}`;
  }

  return url;
}
