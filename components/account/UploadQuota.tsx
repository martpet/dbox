import { format } from "@std/fmt/bytes";
import type { Context } from "../../util/types.ts";
import ButtonBuyUpload from "./ButtonBuyUpload.tsx";

interface Props {
  remainingBytes: number;
}

export default function UploadQuota(props: Props, ctx: Context) {
  const { user } = ctx.state;
  const { remainingBytes } = props;

  if (!user) {
    return null;
  }

  return (
    <>
      <p id="upload-quota">{format(remainingBytes)}</p>
      <ButtonBuyUpload />
    </>
  );
}
