import ChatBox from "../../components/chat/ChatBox.tsx";
import ButtonBulkActions from "../../components/inodes/ButtonBulkActions.tsx";
import ButtonCreateDir from "../../components/inodes/ButtonCreateDir.tsx";
import ButtoeInodeSettings from "../../components/inodes/ButtonInodeSettings.tsx";
import ButtonUpload from "../../components/inodes/ButtonUpload.tsx";
import InodeHeader from "../../components/inodes/InodeHeader.tsx";
import InodesTable, {
  getInodesPermissions,
} from "../../components/inodes/InodesTable.tsx";
import PageNotFound from "../../components/pages/error/PageNotFound.tsx";
import Page from "../../components/pages/Page.tsx";
import { getPermissions } from "../../modules/util/file_permissions.ts";
import {
  parsePathname,
  segmentsToPathname,
} from "../../modules/util/pathname.ts";
import { asset } from "../../util/asset.ts";
import { getDirByPath, listInodesByDir } from "../../util/kv/inodes.ts";
import type { Context } from "../../util/types.ts";
import { TOGGLE_CHAT } from "../chat/toggle_chat.ts";
import { FROM_DELETE } from "./delete.ts";
import { PARTIAL_INODES } from "./show_dir.tsx";

export default async function showDirHandler(ctx: Context) {
  const { user } = ctx.state;
  const path = parsePathname(ctx.url.pathname);
  const partial = ctx.url.searchParams.get("partial");
  const from = ctx.url.searchParams.get("from");

  const { value: dirNode } = await getDirByPath(path.segments, {
    consistency: from === TOGGLE_CHAT ? "strong" : "eventual",
  });

  const perm = getPermissions({ user, resource: dirNode });

  if (!dirNode || !perm.canRead) {
    return <PageNotFound />;
  }

  const canonicalPathname = segmentsToPathname(dirNode.pathSegments, {
    isDir: true,
  });

  if (canonicalPathname !== ctx.url.pathname) {
    return ctx.redirect(canonicalPathname);
  }

  const inodes = await listInodesByDir(dirNode.id, {
    consistency: partial === PARTIAL_INODES || from === FROM_DELETE
      ? "strong"
      : "eventual",
  });

  const inodesPermissions = getInodesPermissions(inodes, ctx.state.user);
  const { canModifySome, canChangeAclSome } = inodesPermissions;

  const inodesTable = (
    <InodesTable
      inodes={inodes}
      canCreate={perm.canCreate}
      inodesPermissions={inodesPermissions}
    />
  );

  if (partial === PARTIAL_INODES) {
    return ctx.respondJsxPartial(inodesTable);
  }

  const head = (
    <>
      <meta name="robots" content="noindex, nofollow" />
      {(canChangeAclSome || perm.canCreate) && (
        <script type="module" src={asset("inodes/acl.js")} />
      )}
      <link rel="stylesheet" href={asset("inodes/inodes.css")} />
    </>
  );

  const menuItems = (
    <>
      {(canModifySome || perm.canCreate) && (
        <ButtonBulkActions dirId={dirNode.id} />
      )}
      {perm.canCreate && <ButtonUpload dirId={dirNode.id} />}
      {perm.canCreate && <ButtonCreateDir parentDirId={dirNode.id} />}
      {(perm.canModify || perm.canModerate) && (
        <ButtoeInodeSettings inode={dirNode} perm={perm} />
      )}
    </>
  );

  return (
    <Page
      id="dir-page"
      title={dirNode.name}
      head={head}
      header={{
        breadcrumb: true,
      }}
    >
      <InodeHeader menuItems={menuItems}>
        <h1 hidden>{dirNode.name}</h1>
      </InodeHeader>
      <div id="inodes-wrapper">
        {inodesTable}
      </div>
      <ChatBox
        enabled={dirNode.chatEnabled}
        inodeId={dirNode.id}
        chatTitle={dirNode.name}
        perm={perm}
      />
    </Page>
  );
}
