import { AppContext, type AppHandler } from "$app";
import errorNotFound from "../../handlers/error/error_not_found.tsx";
import { SUPER_ADMIN } from "../consts.ts";
import type { Context, Handler, State } from "../types.ts";

export type AdminContext = AppContext<StateWithUser>;
type StateWithUser = Omit<State, "user"> & Required<Pick<State, "user">>;

export function withAdmin(handler: AppHandler<StateWithUser>): Handler {
  return (ctx) => {
    if (!isAdminContext(ctx)) {
      return errorNotFound(ctx);
    }
    return handler(ctx);
  };
}

function isAdminContext(ctx: Context): ctx is AdminContext {
  return ctx.state.user?.username === SUPER_ADMIN;
}
