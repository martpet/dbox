import { USERNAME_CONSTRAINTS } from "../../util/input_constraints.ts";
import type { Context } from "../../util/types.ts";

export default function RegForm(_props: unknown, ctx: Context) {
  const { user } = ctx.state;

  return (
    <>
      <form id="reg-form">
        {!user && (
          <>
            <p>
              You’ll use Face ID, fingerprint, or your computer password.
            </p>
            <label for="username">
              Choose a username:
            </label>
            <input
              id="reg-form-username"
              type="text"
              required
              // autofocus
              autocomplete="off"
              autocapitalize="off"
              spellcheck={false}
              {...USERNAME_CONSTRAINTS}
            />
          </>
        )}
        <button id="reg-form-submit" class="wait-disabled" disabled>
          {!user ? "Add a passkey" : "Add Passkey"}
        </button>

        <p id="reg-form-error" class="alert error" hidden></p>
      </form>
    </>
  );
}
