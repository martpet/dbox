import { type NonRootPath, parsePathname } from "$util";
import { Context } from "../util/types.ts";
import LogoText from "./LogoText.tsx";

export interface BreadcrumbProps {
  noLinkTrailingSlash?: boolean;
}

export default function Breadcrumb(props: BreadcrumbProps, ctx: Context) {
  const { noLinkTrailingSlash } = props;
  const path = parsePathname(ctx.url.pathname);

  return (
    <nav class="breadcrumb">
      <ol>
        <li>
          <LogoText
            isLink
            noText={path.segments.length > 0}
          />
        </li>
        {path.parentSegments &&
          path.parentSegments.map((segment, index) => (
            <li>
              <a href={getBreadcrumbHref({ path, index, noLinkTrailingSlash })}>
                {segment}
              </a>
            </li>
          ))}
        <li>
          {decodeURIComponent(path.lastSegment || "")}
        </li>
      </ol>
    </nav>
  );
}

function getBreadcrumbHref(options: {
  path: NonRootPath;
  index: number;
  noLinkTrailingSlash?: boolean;
}) {
  const { path, index, noLinkTrailingSlash } = options;

  if (noLinkTrailingSlash) {
    return "/" + path.segments.slice(0, index + 1).join("/");
  }

  const { parentSegments, isDir } = path;
  const isLastSegment = index + 1 === parentSegments.length;

  if (!isDir && isLastSegment) {
    return "./";
  }

  let repeatTimes = parentSegments.length - index;

  if (!isDir) {
    repeatTimes -= 1;
  }

  return "../".repeat(repeatTimes);
}
