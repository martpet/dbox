import { MINUTE } from "@std/datetime";
import { HEADER } from "@std/http/unstable-header";
import RegForm from "../../components/account/RegForm.tsx";
import Page from "../../components/pages/Page.tsx";
import { asset } from "../../util/asset.ts";
import type { Context } from "../../util/types.ts";

export default function signupPageHandler(ctx: Context) {
  const { user } = ctx.state;
  const title = "Create a new account";

  if (user) {
    return ctx.redirect("/");
  }

  const head = <script type="module" src={asset("account/reg.js")} />;

  ctx.resp.headers.set(
    HEADER.CacheControl,
    `Cache-Control: public, max-age=${MINUTE * 30 / 1000}`,
  );

  return (
    <Page
      title={title}
      head={head}
      header={{ linkHome: true, skipLogin: true, skipReg: true }}
    >
      <div class="prose">
        <h1>{title}</h1>

        <RegForm />
      </div>
    </Page>
  );
}
