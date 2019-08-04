import { FormatId } from "../../conference-hall/model/format";
import { Markdown } from "./index";
export declare type FormatKey = string;
export interface Format {
  id?: FormatId;
  key: FormatKey;
  name: string;
  description?: Markdown;
}
