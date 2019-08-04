/// <reference types="node" />
declare enum LogLevel {
  Trace = 0,
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4
}
declare type MessageBuilder = () => string;
declare type Message = string | MessageBuilder;
export declare class Logger {
  readonly name: string;
  readonly printer: Console;
  static defaultLevel: LogLevel;
  static findLevel: (name: string, defaultLevel: LogLevel) => LogLevel;
  static formatLevel: (level: LogLevel) => string;
  static formatDate: (now: Date) => string;
  static formatName: (name: string) => string;
  static formatArg: (arg: any) => string;
  private static loggers;
  static getLogger(name: string): Logger;
  level: LogLevel;
  private constructor();
  dump(obj: any): void;
  trace(message: Message, arg?: any): void;
  debug(message: Message, arg?: any): void;
  info(message: Message, arg?: any): void;
  warn(message: Message, arg?: any): void;
  error(message: Message, arg?: any): void;
  private log;
}
export {};
