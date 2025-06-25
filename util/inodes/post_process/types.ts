type LibreProc = "libre";
type SharpProc = "sharp";
type PandocProc = "pandoc";
type CsvProc = "csv_parser";
type HighlightProc = "highlight";
type AwsMediaConvertProc = "aws_mediaconvert";

export type PostProcessor =
  | AwsMediaConvertProc
  | CustomPostProcessor;

export type CustomPostProcessor =
  | LibreProc
  | SharpProc
  | PandocProc
  | CsvProc
  | HighlightProc;

export type PostProcessConf =
  | AwsMediaConvertConf
  | CustomPostProcessConf;

export type CustomPostProcessConf =
  | LibreConf
  | PandocConf
  | SharpConf
  | CsvProcConf
  | HighlightProcConf;

export interface AwsMediaConvertConf {
  proc: AwsMediaConvertProc;
  to?: never;
}

export type SharpConf =
  & {
    proc: SharpProc;
  }
  & (
    | {
      to: "image/jpeg";
      thumbOnly?: never;
    }
    | {
      to?: never;
      thumbOnly: true;
    }
  );

export interface LibreConf {
  proc: LibreProc;
  to: "application/pdf" | "image/png";
}

export interface PandocConf {
  proc: PandocProc;
  to: "text/html";
}

export interface CsvProcConf {
  proc: CsvProc;
  to: "text/html";
}

export interface HighlightProcConf {
  proc: HighlightProc;
  to: "text/html";
  codeLang:
    | "auto"
    | "css"
    | "xml"
    | "json"
    | "javascript"
    | "yaml";
}
