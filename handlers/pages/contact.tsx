import { MINUTE } from "@std/datetime";
import { HEADER } from "@std/http/unstable-header";
import Page from "../../components/pages/Page.tsx";
import { SITE_NAME, SUPPORT_EMAIL } from "../../util/consts.ts";
import { Context } from "../../util/types.ts";

export default function contactPageHandler(ctx: Context) {
  const title = "Contact";

  ctx.resp.headers.set(
    HEADER.CacheControl,
    `Cache-Control: public, max-age=${MINUTE * 30 / 1000}`,
  );

  return (
    <Page title={title} header={{ linkHome: true }}>
      <div class="prose">
        <h1>{title}</h1>
        <p>
          {SITE_NAME}{" "}
          is independently developed and maintained, and all support inquiries
          are handled personally.
        </p>

        <p>
          For help, feedback, or to report an issue, please contact:<br />
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </div>
    </Page>
  );
}
