import { SITE_NAME } from "../util/consts.ts";

interface Props {
  isLink?: boolean;
  noText?: boolean;
}

export default function LogoText({ isLink, noText }: Props) {
  const content = (
    <>
      <i class="logo ico-box-fill" />
      {!noText && <span>{SITE_NAME}</span>}
    </>
  );

  if (isLink) {
    return <a class="logo-text" href="/">{content}</a>;
  }

  return <span class="logo-text">{content}</span>;
}
