import { DAY } from "@std/datetime/constants";
import { HEADER } from "@std/http/unstable-header";
import AboutSite from "../../components/AboutSite.tsx";
import Page from "../../components/pages/Page.tsx";
import type { Context } from "../../util/types.ts";

export default function helpPageHandler(ctx: Context) {
  const { user } = ctx.state;

  ctx.resp.headers.set(
    HEADER.CacheControl,
    `Cache-Control: public, max-age=${DAY / 1000}`,
  );

  if (!user) {
    return ctx.redirect("/");
  }

  return (
    <Page title="Help" header={{ linkHome: true }}>
      <AboutSite noSubline />
    </Page>
  );
}
