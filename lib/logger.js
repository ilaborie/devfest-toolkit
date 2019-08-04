"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const fs = tslib_1.__importStar(require("fs"));
var LogLevel;
(function(LogLevel) {
  LogLevel[(LogLevel["Trace"] = 0)] = "Trace";
  LogLevel[(LogLevel["Debug"] = 1)] = "Debug";
  LogLevel[(LogLevel["Info"] = 2)] = "Info";
  LogLevel[(LogLevel["Warn"] = 3)] = "Warn";
  LogLevel[(LogLevel["Error"] = 4)] = "Error";
})(LogLevel || (LogLevel = {}));
function logLevel(s) {
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
      return LogLevel.Info;
  }
}
function defaultFormatLevel(level) {
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
function defaultFormatDate(date) {
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
function defaultFormatArg(arg) {
  let value;
  if (typeof arg === "function") {
    value = arg.apply(null);
  } else if (typeof arg === "object") {
    value = JSON.stringify(arg);
  } else {
    value = `${arg}`;
  }
  return chalk_1.default.cyan(value);
}
function defaultFormatName(name) {
  return chalk_1.default.magenta(name);
}
const loggerLevels = JSON.parse(
  fs.readFileSync("logger.json", "utf-8") || "{}"
);
function defaultFindLevel(name, defaultLevel) {
  const names = name.split(".");
  const aux = (idx, acc) => {
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
class Logger {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(name, level, printer) {
    this.name = name;
    this.printer = printer;
    this.level = level;
  }
  static getLogger(name) {
    const result = Logger.loggers.get(name);
    if (result) {
      return result;
    }
    const level = Logger.findLevel(name, Logger.defaultLevel);
    const newLogger = new Logger(name, level, console);
    Logger.loggers.set(name, newLogger);
    return newLogger;
  }
  dump(obj) {
    this.printer.log("🗑", chalk_1.default.yellow(JSON.stringify(obj, null, 2)));
  }
  trace(message, arg) {
    this.log(LogLevel.Trace, message, arg);
  }
  debug(message, arg) {
    this.log(LogLevel.Debug, message, arg);
  }
  info(message, arg) {
    this.log(LogLevel.Info, message, arg);
  }
  warn(message, arg) {
    this.log(LogLevel.Warn, message, arg);
  }
  error(message, arg) {
    this.log(LogLevel.Error, message, arg);
  }
  log(level, message, arg) {
    if (this.level <= level) {
      let msg;
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
// Static
Logger.defaultLevel = LogLevel.Info;
Logger.findLevel = defaultFindLevel;
Logger.formatLevel = defaultFormatLevel;
Logger.formatDate = defaultFormatDate;
Logger.formatName = defaultFormatName;
Logger.formatArg = defaultFormatArg;
Logger.loggers = new Map();
exports.Logger = Logger;
