import {
  getPermissions,
  type NonRootPath,
  parsePathname,
  segmentsToPathname,
} from "$util";
import { format as formatBytes } from "@std/fmt/bytes";
import { STATUS_CODE } from "@std/http";
import ChatSection from "../../components/chat/ChatSection.tsx";
import ButtonPageSettings from "../../components/inodes/ButtonPageSettings.tsx";
import InodeHeader from "../../components/inodes/InodeHeader.tsx";
import FilePreview from "../../components/inodes/preview/FilePreview.tsx";
import PageNotFound from "../../components/pages/error/PageNotFound.tsx";
import Page from "../../components/pages/Page.tsx";
import { asset } from "../../util/asset.ts";
import { getFilePreviewDetails } from "../../util/inodes/file_preview.ts";
import { getDirByPath, getInodeByDir } from "../../util/kv/inodes.ts";
import type { Context } from "../../util/types.ts";
import { FROM_TOGGLE_CHAT } from "../chat/toggle_chat.ts";

export default async function showFileHandler(ctx: Context) {
  const { user } = ctx.state;
  const path = parsePathname(ctx.url.pathname) as NonRootPath;
  const from = ctx.url.searchParams.get("from");

  if (path.isRootSegment) {
    return ctx.redirect(ctx.req.url + "/", STATUS_CODE.PermanentRedirect);
  }

  const { value: dirNode } = await getDirByPath(path.parentSegments, {
    consistency: from === FROM_TOGGLE_CHAT ? "strong" : "eventual",
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
        <ButtonPageSettings inode={inode} perm={perm} showDelete />
      )}
    </>
  );

  const fileName = decodeURIComponent(inode.name);

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
        <h1 hidden>{fileName}</h1>
        <p>
          <a href={`/download/${inode.id}`}>Download</a>{" "}
          ({formatBytes(inode.fileSize)})
        </p>
      </InodeHeader>

      <ChatSection
        enabled={inode.chatEnabled}
        chatId={inode.id}
        chatTitle={inode.name}
        perm={perm}
      />
    </Page>
  );
}
