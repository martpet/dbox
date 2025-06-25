import type { Context } from "../util/types.ts";
import ButtonLogout from "./account/ButtonLogout.tsx";
import LoginOrReg from "./account/LoginOrReg.tsx";
import Breadcrumb, { type BreadcrumbProps } from "./Breadcrumb.tsx";
import LogoText from "./LogoText.tsx";

export interface PageHeaderProps {
  linkHome?: boolean;
  linkHomeNoText?: boolean;
  breadcrumb?: boolean;
  breadcrumbProps?: BreadcrumbProps;
  skipLogin?: boolean;
  skipReg?: boolean;
}

export default function PageHeader(props: PageHeaderProps, ctx: Context) {
  const {
    linkHome,
    linkHomeNoText,
    breadcrumb,
    breadcrumbProps,
    skipLogin,
    skipReg,
  } = props;

  const { user } = ctx.state;

  return (
    <header class="page-header">
      {breadcrumb
        ? <Breadcrumb {...breadcrumbProps} />
        : <LogoText isLink={linkHome} noText={linkHomeNoText} />}
      <div class="secondary">
        {user
          ? <AccountNav username={user.username} />
          : <LoginOrReg skipLogin={skipLogin} skipReg={skipReg} />}
      </div>
    </header>
  );
}

function AccountNav(props: { username: string }, ctx: Context) {
  const { username } = props;
  const { pathname } = new URL(ctx.req.url);
  const isAccountPage = pathname === "/account";
  const isHelpPage = pathname === "/about";

  return (
    <>
      {isAccountPage ? username : <a href="/account">{username}</a>}
      {isHelpPage ? "About" : <a href="/about">About</a>}
      <ButtonLogout />
    </>
  );
}
