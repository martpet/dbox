import { ComponentChildren, type JSX } from "preact";

export interface Props {
  menuItems: JSX.Element;
  children?: ComponentChildren;
}

export default function InodeHeader({ children, menuItems }: Props) {
  return (
    <header class="inode-header">
      {children}
      <menu class="menubar">
        {menuItems}
      </menu>
    </header>
  );
}
