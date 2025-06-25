import { ComponentChildren, type JSX } from "preact";

export interface Props {
  children: ComponentChildren;
  menuItems: JSX.Element;
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
