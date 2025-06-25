import type { MaybeNever } from "../../modules/util/types.ts";
import type { PostProcessConf } from "../inodes/post_process/types.ts";
import type { InodeDisplay } from "../inodes/types.ts";

export type MimeConf =
  & {
    title: string | Record<string, string>;
    display?: InodeDisplay;
  }
  & MaybeNever<
    PostProcessConf & {
      showOrig?: boolean;
    }
  >;
