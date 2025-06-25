import {
  getPermissions,
  type NonRootPath,
  parsePathname,
  segmentsToPathname,
} from "$util";
import { format as formatBytes } from "@std/fmt/bytes";
import { STATUS_CODE } from "@std/http";
import ChatBox from "../../components/chat/ChatBox.tsx";
import ButtoeInodeSettings from "../../components/inodes/ButtonInodeSettings.tsx";
import InodeHeader from "../../components/inodes/InodeHeader.tsx";
import FilePreview from "../../components/inodes/preview/FilePreview.tsx";
import PageNotFound from "../../components/pages/error/PageNotFound.tsx";
import Page from "../../components/pages/Page.tsx";
import { asset } from "../../util/asset.ts";
import { getFilePreviewDetails } from "../../util/inodes/file_preview.ts";
import { getDirByPath, getInodeByDir } from "../../util/kv/inodes.ts";
import type { Context } from "../../util/types.ts";
import { TOGGLE_CHAT } from "../chat/toggle_chat.ts";

export default async function showFileHandler(ctx: Context) {
  const { user } = ctx.state;
  const path = parsePathname(ctx.url.pathname) as NonRootPath;
  const chatWasToggled = ctx.url.searchParams.get("from") === TOGGLE_CHAT;

  if (path.isRootSegment) {
    return ctx.redirect(ctx.req.url + "/", STATUS_CODE.PermanentRedirect);
  }

  const { value: dirNode } = await getDirByPath(path.parentSegments, {
    consistency: chatWasToggled ? "strong" : "eventual",
  });

  if (!dirNode) {
    return <PageNotFound />;
  }

  const { value: inode } = await getInodeByDir({
    inodeName: path.lastSegment,
    parentDirId: dirNode.id,
    consistency: "eventual",
  });

  const perm = getPermissions({ user, resource: inode });

  if (!inode || !perm.canRead) {
    return <PageNotFound />;
  }

  if (inode.type === "dir") {
    return ctx.redirect(ctx.url.pathname + "/");
  }

  const canonicalPathname = segmentsToPathname(
    dirNode.pathSegments.concat(inode.name),
  );

  if (canonicalPathname !== ctx.url.pathname) {
    return ctx.redirect(canonicalPathname);
  }

  const preview = await getFilePreviewDetails(inode);
  let importmap;

  if (preview?.display === "video") {
    importmap = {
      "$hls": asset("vendored/hls/hls.mjs"),
      "$listenPostProcessing": asset("inodes/listen_post_proc.js"),
    };
  }

  const head = (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <link rel="stylesheet" href={asset("inodes/inodes.css")} />
    </>
  );

  const menuItems = (
    <>
      {(perm.canModerate || perm.canModify) && (
        <ButtoeInodeSettings inode={inode} perm={perm} showDelete />
      )}
    </>
  );

  const fileName = decodeURIComponent(inode.name);

  console.log(inode);

  return (
    <Page
      id="file-page"
      title={fileName}
      importmap={importmap}
      head={head}
      header={{ breadcrumb: true }}
    >
      <FilePreview
        inode={inode}
        preview={preview}
        perm={perm}
        browser={ctx.userAgent.browser}
      />
      <InodeHeader menuItems={menuItems}>
        <span>
          <a href={`/download/${inode.id}`}>Download</a>
          {", "}
          {formatBytes(inode.fileSize)}
        </span>
      </InodeHeader>
      <ChatBox
        enabled={inode.chatEnabled}
        inodeId={inode.id}
        chatTitle={inode.name}
        perm={perm}
      />
    </Page>
  );
}
