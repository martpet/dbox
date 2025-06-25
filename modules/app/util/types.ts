import type { KvWatchOptions, MaybePromise } from "$util";
import type { RedirectStatus, UserAgent } from "@std/http";
import type { Method } from "@std/http/unstable-method";
import type { VNode } from "preact";

export interface AppOptions {
  trailingSlash?: "mixed" | "always" | "never";
}

type AppState = Record<string, unknown>;

export interface AppContext<S = AppState> {
  req: Request;
  resp: AppRespOptions;
  state: S;
  error?: unknown;
  url: URL;
  urlPatternResult: URLPatternResult;
  cookies: Record<string, string>;
  userAgent: UserAgent;
  locale?: string;
  flash?: AppFlash;
  setFlash: ContextFnFlash;
  handler: AppHandler;
  respond: ContextFnRespond;
  respondJsx: ContextFnJsx;
  respondJsxPartial: ContextFnJsxPartial;
  respondJson: ContextFnJson;
  respondSse: ContextFnSse;
  respondKvWatchSse: ContextFnWatchSse;
  redirect: ContextFnRedirect;
  redirectBack: ContextFnRedirectBack;
  get scpNonce(): string;
}

export type AppHandler<S = AppState> = (ctx: AppContext<S>) =>
  | Response
  | VNode
  | Promise<Response | VNode>;

export type AppMiddleware<S = AppState> = (
  ctx: AppContext<S>,
  next: () => ReturnType<AppMiddleware>,
) =>
  | Response
  | Promise<Response>;

export interface AppRoute {
  method: RouteMethod;
  pattern: URLPattern;
  handler: AppHandler;
}

export type RouteMethod = "*" | Method | Method[];

export interface RouteMatch extends AppRoute {
  patternResult: URLPatternResult;
}

export type AppFlashType = "success" | "warning" | "error" | "info";

export interface AppFlash {
  msg: string;
  type: AppFlashType;
}

export type AppRespOptions = Omit<ResponseInit, "headers"> & {
  headers: Headers;
  skipDoctype?: boolean;
};

export type ContextFnJsx = (arg: VNode) => Response;

export type ContextFnJsxPartial = (arg: VNode) => Response;

export type ContextFnJson = (arg: unknown, status?: number | null) => Response;

export type ContextFnSse = (arg: ContextFnSseOptions) => Response;

export type ContextFnRedirect = (
  path: string,
  status?: RedirectStatus,
) => Response;

export type ContextFnRedirectBack = (
  opt?: ContextFnRedirectBackOptions,
) => Response;

export type ContextFnFlash = (arg: string | AppFlash) => void;

export type ContextFnWatchSse = <T extends unknown[]>(
  arg: ContextFnWatchSseOptions<T>,
) => Response;

export type ContextFnRespond = (
  respOrBody?: Response | BodyInit | null,
  status?: number | null,
  headers?: HeadersInit,
) => Response;

interface ContextFnSseOptions {
  onStart: (arg: ContextFnSseOnStartOptions) => void;
  onCancel?: () => void;
}

interface ContextFnRedirectBackOptions {
  searchParams?: Record<string, string>;
  fragment?: string;
}

interface ContextFnSseOnStartOptions {
  sendMsg: (msg: unknown) => void;
  sendClose: () => void;
  controller: ReadableStreamDefaultController;
}

export type ContextFnWatchSseOptions<T extends unknown[]> = {
  kv: Deno.Kv;
  kvKeys: KvWatchOptions<T>["kvKeys"];
  onEntries: (
    arg: ContextFnSseOnStartOptions & {
      entries: Parameters<KvWatchOptions<T>["onEntries"]>[0];
    },
  ) => MaybePromise<void>;
};
