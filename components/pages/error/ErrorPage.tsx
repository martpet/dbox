import { GENERAL_ERR_MSG, IS_LOCAL_DEV } from "../../../util/consts.ts";
import type { Context } from "../../../util/types.ts";
import Page from "../Page.tsx";

export default function ErrorPage(_props: unknown, ctx: Context) {
  return (
    <Page
      title="Internal Server Error"
      header={{ linkHome: true }}
    >
      <h1 class="alert error">{GENERAL_ERR_MSG}</h1>

      {IS_LOCAL_DEV && ctx.error instanceof Error && (
        <pre class="basic">{ctx.error.stack}</pre>
      )}
    </Page>
  );
}
