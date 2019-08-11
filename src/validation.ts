import { Logger } from "plop-logger";
import colors from "ansi-colors";

enum ValidationLevel {
  OK,
  WARN,
  ERROR
}

export interface ValidationResult<T> {
  attribute: keyof T;
  message: string;
  level: ValidationLevel;
  arg?: any;
}

export function ok<T>(
  attribute: keyof T,
  message: string,
  arg?: any
): ValidationResult<T> {
  return { level: ValidationLevel.OK, attribute, message, arg };
}

export function warn<T>(
  attribute: keyof T,
  message: string,
  arg?: any
): ValidationResult<T> {
  return { level: ValidationLevel.WARN, attribute, message, arg };
}

export function error<T>(
  attribute: keyof T,
  message: string,
  arg?: any
): ValidationResult<T> {
  return { level: ValidationLevel.ERROR, attribute, message, arg };
}

export abstract class ValidationService<T> {
  protected logger: Logger;

  protected constructor(readonly name: string) {
    this.logger = Logger.getLogger("validator." + name);
  }

  abstract validate(t: T): ValidationResult<T>[];

  validateAndLog(t: T): void {
    this.validate(t).forEach(entry => {
      const msgBuilder = (): string =>
        colors.yellow(entry.attribute.toString()) + " " + entry.message;
      switch (entry.level) {
        case ValidationLevel.OK:
          this.logger.info(msgBuilder, entry.arg);
          break;
        case ValidationLevel.WARN:
          this.logger.warn(msgBuilder, entry.arg);
          break;
        case ValidationLevel.ERROR:
          this.logger.error(msgBuilder, entry.arg);
          break;
      }
    });
  }
}
