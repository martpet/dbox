import type { JSX } from "preact/jsx-runtime";
import { asset } from "../../util/asset.ts";
import ButtonBuyUpload from "../account/ButtonBuyUpload.tsx";

interface Props extends JSX.HTMLAttributes<HTMLButtonElement> {
  dirId: string;
}

export default function ButtonUpload(props: Props) {
  const { dirId, ...buttonProps } = props;

  return (
    <>
      <script type="module" src={asset("inodes/upload.js")} />

      <button
        {...buttonProps}
        id="show-upload"
        disabled
        class="wait-disabled"
        data-dir-id={dirId}
        data-worker-src={asset("upload_worker.js", { cdn: false })}
      >
        <i class="ico-upload" />
        Upload
      </button>

      <template
        id="button-buy-traffic-template"
        data-script={asset("account/buy_upload.js")}
      >
        <ButtonBuyUpload skipScript />
      </template>
    </>
  );
}
