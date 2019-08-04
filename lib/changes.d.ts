import { Logger } from "./logger";
export declare enum ChangeType {
  REMOVED = 0,
  ADDED = 1,
  UPDATED = 2
}
export interface ChangeObject {
  path: string;
  type: ChangeType;
  oldValue?: any;
  newValue?: any;
}
export declare type Changes = ChangeObject[];
export interface KeyChanges {
  [index: string]: Changes;
}
export interface ArrayChanges<T> {
  added: string[];
  removed: string[];
  updated: KeyChanges;
}
export declare const indentPlus: string;
export declare const indentMinus: string;
export declare function displayChange(
  logger: Logger,
  change: ChangeObject
): void;
