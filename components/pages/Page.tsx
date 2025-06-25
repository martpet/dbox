import type { ComponentChildren, JSX } from "preact";
import { asset } from "../../util/asset.ts";
import { isProd, SITE_ID, SITE_NAME } from "../../util/consts.ts";
import type { Context } from "../../util/types.ts";
import DynamicStyles from "../DynamicStyles.tsx";
import Flash from "../Flash.tsx";
import PageHeader, { type PageHeaderProps } from "../PageHeader.tsx";

export interface PageProps extends JSX.HTMLAttributes<HTMLBodyElement> {
  children?: ComponentChildren;
  head?: JSX.Element;
  title?: string;
  fullTitle?: string;
  titleOverride?: boolean;
  header?: PageHeaderProps;
  importmap?: Record<string, string>;
}

export default function Page(props: PageProps, ctx: Context) {
  const { flash, userAgent } = ctx;
  const {
    children,
    head,
    title,
    fullTitle,
    header: headerProps,
    ...bodyProps
  } = props;

  const importmap = {
    "imports": {
      "$main": asset("main.js"),
      "$db": asset("db.js"),
      ...props.importmap,
    },
  };

  return (
    <html
      data-is-dev={isProd ? null : "1"}
      data-device-type={userAgent.device.type}
      data-os-name={userAgent.os.name}
      data-browser-name={userAgent.browser.name}
      data-can-use-service-worker={ctx.state.canUseServiceWorker ? "1" : ""}
      data-service-worker-path={asset("service_worker.js", { cdn: false })}
      data-site-id={SITE_ID}
      data-user-username={ctx.state.user?.username || null}
    >
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="dark light" />
        <title>
          {fullTitle ?? (title ? `${SITE_NAME} — ${title}` : SITE_NAME)}
        </title>
        <script
          type="importmap"
          nonce={ctx.scpNonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(importmap) }}
        />
        <script type="module" src={asset("main.js")} />
        <link
          rel="icon"
          href={asset("img/logo/logo-fill.svg")}
          type="image/svg+xml"
        />
        <link rel="apple-touch-icon" href={asset("img/logo/logo-fill.png")} />
        <link
          rel="preload"
          href={asset("fonts/icons.woff2")}
          as="font"
          type="font/woff2"
          crossorigin="anonymous"
        />
        <link rel="stylesheet" href={asset("main.css")} />
        <DynamicStyles />
        {ctx.userAgent.os.name === "iOS" && (
          <link rel="manifest" href={asset("manifest.json")} />
        )}
        {head}
      </head>
      <body {...bodyProps}>
        {flash && <Flash type={flash.type}>{flash.msg}</Flash>}
        <PageHeader {...headerProps} />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
