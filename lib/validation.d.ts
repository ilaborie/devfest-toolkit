import { Logger } from "./logger";
declare enum ValidationLevel {
  OK = 0,
  WARN = 1,
  ERROR = 2
}
export interface ValidationResult<T> {
  attribute: keyof T;
  message: string;
  level: ValidationLevel;
  arg?: any;
}
export declare function ok<T>(
  attribute: keyof T,
  message: string,
  arg?: any
): ValidationResult<T>;
export declare function warn<T>(
  attribute: keyof T,
  message: string,
  arg?: any
): ValidationResult<T>;
export declare function error<T>(
  attribute: keyof T,
  message: string,
  arg?: any
): ValidationResult<T>;
export declare abstract class ValidationService<T> {
  readonly name: string;
  protected logger: Logger;
  protected constructor(name: string);
  abstract validate(t: T): ValidationResult<T>[];
  validateAndLog(t: T): void;
}
export {};
