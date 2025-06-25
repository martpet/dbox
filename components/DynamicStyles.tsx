import { asset } from "../util/asset.ts";

export default function DynamicStyles() {
  const css = `
    @font-face {
      font-family: bootstrap-icons;
      font-display: block;
      src: url("${asset("fonts/icons.woff2")}") format("woff2");
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
