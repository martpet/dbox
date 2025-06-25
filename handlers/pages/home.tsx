import { MINUTE } from "@std/datetime/constants";
import { HEADER } from "@std/http/unstable-header";
import AboutSite from "../../components/AboutSite.tsx";
import BlankSlate from "../../components/BlankSlate.tsx";
import ButtonBulkActions from "../../components/inodes/ButtonBulkActions.tsx";
import ButtonCreateDir from "../../components/inodes/ButtonCreateDir.tsx";
import InodeHeader from "../../components/inodes/InodeHeader.tsx";
import InodesTable from "../../components/inodes/InodesTable.tsx";
import Page from "../../components/pages/Page.tsx";
import { asset } from "../../util/asset.ts";
import { SITE_SHORT_DESC } from "../../util/consts.ts";
import { ROOT_DIR_ID } from "../../util/inodes/consts.ts";
import { listRootDirsByOwner } from "../../util/kv/inodes.ts";
import type { Context } from "../../util/types.ts";
import { FROM_DELETE } from "../inodes/delete.ts";

const PARTIAL_INODES = "inodes";

export default function homePageHandler(ctx: Context) {
  if (ctx.state.user) return handleUserHome(ctx);

  ctx.resp.headers.set(
    HEADER.CacheControl,
    `Cache-Control: public, max-age=${MINUTE * 30 / 1000}`,
  );

  return (
    <Page title={SITE_SHORT_DESC}>
      <AboutSite noName />
    </Page>
  );
}

async function handleUserHome(ctx: Context) {
  const user = ctx.state.user!;
  const partial = ctx.url.searchParams.get("partial");
  const from = ctx.url.searchParams.get("from");

  const inodes = await listRootDirsByOwner(user.id, {
    consistency: partial === PARTIAL_INODES || from === FROM_DELETE
      ? "strong"
      : "eventual",
  });

  const blankSlate = (
    <BlankSlate title="Hello, create your first box">
      <button class="create-box" data-click="show-create-dir">
        Create a box
      </button>
    </BlankSlate>
  );

  const inodesTable = (
    <InodesTable
      inodes={inodes}
      isMultiSelect={false}
      skipCols={["size", "kind"]}
      canCreate
      blankSlate={blankSlate}
    />
  );

  if (partial === PARTIAL_INODES) {
    return ctx.respondJsxPartial(inodesTable);
  }

  const head = (
    <>
      <script type="module" src={asset("inodes/acl.js")} />
      <link rel="stylesheet" href={asset("inodes/inodes.css")} />
    </>
  );

  const menuItems = (
    <>
      <ButtonBulkActions
        dirId={ROOT_DIR_ID}
        isSingleSelect
        inodeLabel="Box"
      />
      <ButtonCreateDir
        parentDirId={ROOT_DIR_ID}
      />
    </>
  );

  return (
    <Page
      id="home-page"
      head={head}
    >
      <InodeHeader menuItems={menuItems} />
      <div id="inodes-wrapper">
        {inodesTable}
      </div>
    </Page>
  );
}
