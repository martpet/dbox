import { STATUS_CODE } from "@std/http";
import type { Context } from "../../../util/types.ts";
import Page, { type PageProps } from "../Page.tsx";

export default function PageNotFound(props: PageProps, ctx: Context) {
  ctx.resp.status = STATUS_CODE.NotFound;

  return (
    <Page
      title="Error: Page not found"
      header={{ linkHome: true }}
      {...props}
    >
      <h1>Not found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </Page>
  );
}
