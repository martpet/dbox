import type { JSX } from "preact/jsx-runtime";

type Props = JSX.HTMLAttributes<HTMLHeadingElement>;

export default function ChatDayHeading(props: Props) {
  return <h3 {...props} class="day" />;
}
