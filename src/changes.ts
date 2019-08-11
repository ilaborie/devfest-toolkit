import colors from "ansi-colors";
import { Logger } from "plop-logger";

import { diffString, indent } from "./strings";

export enum ChangeType {
  REMOVED,
  ADDED,
  UPDATED
}

export interface ChangeObject {
  path: string;
  type: ChangeType;
  oldValue?: any;
  newValue?: any;
}

export type Changes = ChangeObject[];

export interface KeyChanges {
  [index: string]: Changes;
}

export interface ArrayChanges<T> {
  added: string[];
  removed: string[];
  updated: KeyChanges;
}

export const indentPlus = " " + colors.bgGreen.black("+") + " ";
export const indentMinus = " " + colors.bgRed.black("-") + " ";

export function displayChange(logger: Logger, change: ChangeObject): void {
  const { path, oldValue, newValue } = change;
  const attribute = path.substring(1);
  const msgBuilder = (): string => {
    switch (change.type) {
      case ChangeType.ADDED:
        return `\t${colors.green("+" + attribute)}
${indent(colors.green(JSON.stringify(newValue)), indentPlus)}`;
      case ChangeType.REMOVED:
        return `\t${colors.red("-" + attribute)}
${indent(colors.red(JSON.stringify(oldValue)), indentMinus)}`;
      case ChangeType.UPDATED:
        return `\t${colors.yellow("-" + attribute)}
${indent(diffString(oldValue, newValue))}`;
      default:
        return `\t??? ${path}
${indent(diffString(oldValue, newValue))}`;
    }
  };
  logger.info(msgBuilder);
}
