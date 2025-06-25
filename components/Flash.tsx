import { type AppFlashType } from "$app";
import { type JSX } from "preact";

interface Props extends JSX.HTMLAttributes<HTMLDialogElement> {
  type?: AppFlashType;
}

export default function Flash(props: Props) {
  const { type = "success", children, ...dialogProps } = props;
  const classes = ["flash", "alert", type];

  const iconTypes: Record<AppFlashType, string> = {
    "success": "ico-check-circle",
    "warning": "ico-exclamation-triangle",
    "error": "ico-x-circle",
    "info": "ico-info-circle",
  };

  if (dialogProps.class) classes.push(dialogProps.class as string);

  return (
    <dialog
      open
      class={classes.join(" ")}
      {...dialogProps}
    >
      <form method="dialog">
        <i class={iconTypes[type]} />
        {children}
        <button>OK</button>
      </form>
    </dialog>
  );
}
