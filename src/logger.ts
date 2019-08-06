import chalk from "chalk";
import * as fs from "fs";
import { Console } from "inspector";
import { canRead } from "../lib/fs-utils";

enum LogLevel {
  Trace,
  Debug,
  Info,
  Warn,
  Error
}

function logLevel(s: string): LogLevel | null {
  switch ((s || "").toLowerCase()) {
    case "trace":
      return LogLevel.Trace;
    case "debug":
      return LogLevel.Debug;
    case "info":
      return LogLevel.Info;
    case "warn":
      return LogLevel.Warn;
    case "error":
      return LogLevel.Error;
    default:
      return null;
  }
}

function defaultFormatLevel(level: LogLevel): string {
  switch (level) {
    case LogLevel.Trace:
      return "🐾";
    case LogLevel.Debug:
      return "🐛";
    case LogLevel.Info:
      return "ℹ️ ";
    case LogLevel.Warn:
      return "⚠️ ";
    case LogLevel.Error:
      return "💥";
    default:
      return LogLevel[level];
  }
}

function defaultFormatDate(date: Date): string {
  return [
    date
      .getMinutes()
      .toString()
      .padStart(2, "0"),
    ":",
    date
      .getSeconds()
      .toString()
      .padStart(2, "0"),
    ".",
    date
      .getMilliseconds()
      .toString()
      .padStart(3, "0")
  ].join("");
}

function defaultFormatArg(arg: any): string {
  let value: string;
  if (typeof arg === "function") {
    value = arg.apply(null);
  } else if (typeof arg === "object") {
    value = JSON.stringify(arg);
  } else {
    value = `${arg}`;
  }
  return chalk.cyan(value);
}

function defaultFormatName(name: string): string {
  return chalk.magenta(name);
}

// LoggerLevels
interface LoggerLevels {
  [index: string]: string;
}

const loggerLevels: LoggerLevels = canRead("logger.json")
  ? (JSON.parse(
      fs.readFileSync("logger.json", "utf-8") || "{}"
    ) as LoggerLevels)
  : {};

function defaultFindLevel(name: string, defaultLevel: LogLevel): LogLevel {
  const names = name.split(".");
  const aux = (idx: number, acc: LogLevel): LogLevel => {
    if (idx > names.length) {
      return acc;
    }
    const slice = names.slice(0, idx);
    const currentName = slice.join(".");
    const maybeLevel = logLevel(loggerLevels[currentName]);
    return aux(idx + 1, maybeLevel == null ? acc : maybeLevel);
  };
  return aux(1, defaultLevel);
}

type MessageBuilder = () => string;
type Message = string | MessageBuilder;

export class Logger {
  // Static
  static defaultLevel: LogLevel = LogLevel.Info;
  static findLevel: (
    name: string,
    defaultLevel: LogLevel
  ) => LogLevel = defaultFindLevel;

  static formatLevel: (level: LogLevel) => string = defaultFormatLevel;
  static formatDate: (now: Date) => string = defaultFormatDate;
  static formatName: (name: string) => string = defaultFormatName;
  static formatArg: (arg: any) => string = defaultFormatArg;

  private static loggers = new Map<string, Logger>();

  static getLogger(name: string): Logger {
    const result = Logger.loggers.get(name);
    if (result) {
      return result;
    }
    const level = Logger.findLevel(name, Logger.defaultLevel);
    const newLogger = new Logger(name, level, console);
    Logger.loggers.set(name, newLogger);
    return newLogger;
  }

  // Instance
  level: LogLevel;

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  private constructor(
    readonly name: string,
    level: LogLevel,
    readonly printer: Console
  ) {
    this.level = level;
  }

  dump(obj: any): void {
    this.printer.log("🗑", chalk.yellow(JSON.stringify(obj, null, 2)));
  }

  trace(message: Message, arg?: any): void {
    this.log(LogLevel.Trace, message, arg);
  }

  debug(message: Message, arg?: any): void {
    this.log(LogLevel.Debug, message, arg);
  }

  info(message: Message, arg?: any): void {
    this.log(LogLevel.Info, message, arg);
  }

  warn(message: Message, arg?: any): void {
    this.log(LogLevel.Warn, message, arg);
  }

  error(message: Message, arg?: any): void {
    this.log(LogLevel.Error, message, arg);
  }

  private log(level: LogLevel, message: Message, arg?: any): void {
    if (this.level <= level) {
      let msg: string;
      if (typeof message === "function") {
        msg = message.apply(null);
      } else {
        msg = `${message}`;
      }
      // FIXME Pattern
      const formatted = [
        Logger.formatLevel(level),
        Logger.formatDate(new Date()),
        Logger.formatName(this.name),
        "-",
        msg,
        arg ? Logger.formatArg(arg) : ""
      ];
      this.printer.log(...formatted);
    }
  }
}
