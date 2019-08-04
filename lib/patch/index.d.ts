import { Operation } from "fast-json-patch";
import { KeyElement } from "../site/models";
import { PatchConfig } from "../config";
export interface Patch {
  file: string;
  operations: Operation[];
}
export declare function applyAllPatch<T extends KeyElement>(
  config: PatchConfig,
  type: string,
  data: T[]
): Promise<T[]>;
