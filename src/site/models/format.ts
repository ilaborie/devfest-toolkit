import { FormatId } from "../../conference-hall/model/format";
import { Markdown } from "./index";

export type FormatKey = string;

export interface Format {
  id?: FormatId;
  key: FormatKey;
  name: string;
  description?: Markdown;
}
