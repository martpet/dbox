import { asset } from "../../util/asset.ts";
import type { Context } from "../../util/types.ts";

export default function ButtonDeleteAccount(_: unknown, ctx: Context) {
  const { user } = ctx.state;

  if (!user) return null;

  return (
    <>
      <script type="module" src={asset("account/delete_account.js")} />
      <button
        id="show-delete-account"
        class="wait-disabled"
        disabled
      >
        Delete Account
      </button>
    </>
  );
}
