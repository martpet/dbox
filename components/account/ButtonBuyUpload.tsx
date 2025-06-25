import { asset } from "../../util/asset.ts";
import { PRICE_PER_GB_CENTS } from "../../util/consts.ts";
import { STRIPE_PUB_KEY } from "../../util/stripe/consts.ts";

interface Props {
  skipScript?: boolean;
}

export default function ButtonBuyUpload(props: Props) {
  const { skipScript } = props;

  return (
    <>
      {!skipScript && (
        <script type="module" src={asset("account/buy_upload.js")} />
      )}

      <button
        disabled
        id="show-buy-traffic"
        class="wait-disabled"
        data-stripe-pub-key={STRIPE_PUB_KEY}
        data-price-per-gb={PRICE_PER_GB_CENTS}
      >
        Buy Upload Quota
      </button>
    </>
  );
}
