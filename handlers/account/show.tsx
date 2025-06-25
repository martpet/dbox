import ButtonDeleteAccount from "../../components/account/ButtonDeleteAccount.tsx";
import Passkeys from "../../components/account/Passkeys.tsx";
import UploadQuota from "../../components/account/UploadQuota.tsx";
import LoginPage from "../../components/pages/LoginPage.tsx";
import Page from "../../components/pages/Page.tsx";
import { asset } from "../../util/asset.ts";
import { listPasskeysByUser } from "../../util/kv/passkeys.ts";
import { getRemainingUploadBytesByUser } from "../../util/kv/upload_stats.ts";
import type { Context } from "../../util/types.ts";

export default async function showAccountHandler(ctx: Context) {
  const user = ctx.state.user;
  const title = "Your Account";

  if (!user) {
    return <LoginPage title={title} />;
  }

  const head = (
    <>
      <link rel="stylesheet" href={asset("account/passkeys.css")} />
    </>
  );

  const [passkeys, remainingBytes] = await Promise.all([
    listPasskeysByUser(user.id),
    getRemainingUploadBytesByUser(user.id),
  ]);

  return (
    <Page
      id="account-page"
      title={title}
      head={head}
      header={{ linkHome: true }}
    >
      <div class="sectioned">
        <h1>{title}</h1>
        <section>
          <h2>Remaining Upload Quota</h2>
          <UploadQuota remainingBytes={remainingBytes} />
        </section>
        <section>
          <h2>Passkeys</h2>
          <Passkeys passkeys={passkeys} />
        </section>
        <section>
          <h2>Delete Account</h2>
          <p>
            Delete your account, files, and chat messages.
          </p>
          <ButtonDeleteAccount />
        </section>
      </div>
    </Page>
  );
}
