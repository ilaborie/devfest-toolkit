import chalk from "chalk";

import { Logger } from "./logger";
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

export const indentPlus = " " + chalk.bgGreen.black("+") + " ";
export const indentMinus = " " + chalk.bgRed.black("-") + " ";

export function displayChange(logger: Logger, change: ChangeObject): void {
  const { path, oldValue, newValue } = change;
  const attribute = path.substring(1);
  const msgBuilder = (): string => {
    switch (change.type) {
      case ChangeType.ADDED:
        return `\t${chalk.green("+" + attribute)}
${indent(chalk.green(JSON.stringify(newValue)), indentPlus)}`;
      case ChangeType.REMOVED:
        return `\t${chalk.red("-" + attribute)}
${indent(chalk.red(JSON.stringify(oldValue)), indentMinus)}`;
      case ChangeType.UPDATED:
        return `\t${chalk.yellow("-" + attribute)}
${indent(diffString(oldValue, newValue))}`;
      default:
        return `\t??? ${path}
${indent(diffString(oldValue, newValue))}`;
    }
  };
  logger.info(msgBuilder);
}
