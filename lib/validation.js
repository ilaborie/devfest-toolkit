"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const logger_1 = require("./logger");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
var ValidationLevel;
(function(ValidationLevel) {
  ValidationLevel[(ValidationLevel["OK"] = 0)] = "OK";
  ValidationLevel[(ValidationLevel["WARN"] = 1)] = "WARN";
  ValidationLevel[(ValidationLevel["ERROR"] = 2)] = "ERROR";
})(ValidationLevel || (ValidationLevel = {}));
function ok(attribute, message, arg) {
  return { level: ValidationLevel.OK, attribute, message, arg };
}
exports.ok = ok;
function warn(attribute, message, arg) {
  return { level: ValidationLevel.WARN, attribute, message, arg };
}
exports.warn = warn;
function error(attribute, message, arg) {
  return { level: ValidationLevel.ERROR, attribute, message, arg };
}
exports.error = error;
class ValidationService {
  constructor(name) {
    this.name = name;
    this.logger = logger_1.Logger.getLogger("validator." + name);
  }
  validateAndLog(t) {
    this.validate(t).forEach(entry => {
      const msgBuilder = () =>
        chalk_1.default.yellow(entry.attribute.toString()) +
        " " +
        entry.message;
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
exports.ValidationService = ValidationService;
