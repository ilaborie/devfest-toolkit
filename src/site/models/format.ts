import { FormatId } from "../../conference-hall/model/format";

export type FormatKey = string;

export interface Format {
  id?: FormatId;
  key: FormatKey;
  name: string;
}
