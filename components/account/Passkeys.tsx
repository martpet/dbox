import { asset } from "../../util/asset.ts";
import type { Passkey } from "../../util/types.ts";
import RelativeTime from "../RelativeTime.tsx";
import Tooltip from "../Tooltip.tsx";
import RegForm from "./RegForm.tsx";

interface Props {
  passkeys: Passkey[];
}

export default function Passkeys({ passkeys }: Props) {
  return (
    <>
      <script type="module" src={asset("account/passkeys.js")} />
      <script type="module" src={asset("account/reg.js")} />

      <ul class="passkeys-list">
        {passkeys.map((passkey) => (
          <ListItem passkey={passkey} count={passkeys.length} />
        ))}
      </ul>

      <RegForm />
    </>
  );
}

function ListItem(props: { passkey: Passkey; count: number }) {
  const { passkey, count } = props;
  const { createdAt, lastUsedAt } = passkey;

  return (
    <li>
      <ButtonName passkey={passkey} /> —{" "}
      {passkey.aaguidLabel && `${passkey.aaguidLabel} — `}
      {count > 1 && <ButtonDelete passkey={passkey} />}
      created {<RelativeTime date={createdAt} />}, {lastUsedAt
        ? <>last used {<RelativeTime date={lastUsedAt} />}.</>
        : "Never used."}
    </li>
  );
}

function ButtonName(props: { passkey: Passkey }) {
  return (
    <Tooltip info="Rename passkey" class="rename-tooltip">
      <button class="rename-passkey" data-cred-id={props.passkey.credId}>
        {props.passkey.name || "Untitled"}
      </button>
    </Tooltip>
  );
}

function ButtonDelete(props: { passkey: Passkey }) {
  return (
    <form
      method="post"
      action="/auth/passkey-delete"
      class="delete-passkey"
    >
      <input
        type="hidden"
        name="credId"
        value={props.passkey.credId}
      />
      <button>Delete</button>
    </form>
  );
}
