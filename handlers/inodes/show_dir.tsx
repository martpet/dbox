import { getPermissions, parsePathname, segmentsToPathname } from "$util";
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
import { asset } from "../../util/asset.ts";
import { getFilePreviewDetails } from "../../util/inodes/file_preview.ts";
import { Inode } from "../../util/inodes/types.ts";
import { getDirByPath, listInodesByDir } from "../../util/kv/inodes.ts";
import type { Context } from "../../util/types.ts";
import { TOGGLE_CHAT } from "../chat/toggle_chat.ts";
import { FROM_DELETE } from "./delete.ts";

export const PARTIAL_INODES = "inodes";

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

  const previewUrls: [Inode, string][] = [];
  for (const inode of inodes) {
    if (inode.type === "file") {
      const preview = await getFilePreviewDetails(inode);
      previewUrls.push([inode, preview.url!]);
    }
  }

  const inodesTable = (
    <InodesTable
      inodes={inodes}
      canCreate={perm.canCreate}
      inodesPermissions={inodesPermissions}
      previewUrls={new Map(previewUrls)}
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
        <ButtoeInodeSettings inode={dirNode} perm={perm} showDelete />
      )}
    </>
  );

  return (
    <Page
      id="dir-page"
      title={dirNode.name}
      head={head}
      header={{ breadcrumb: true }}
    >
      <InodeHeader menuItems={menuItems} />
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
