"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const strings_1 = require("./strings");
var ChangeType;
(function(ChangeType) {
  ChangeType[(ChangeType["REMOVED"] = 0)] = "REMOVED";
  ChangeType[(ChangeType["ADDED"] = 1)] = "ADDED";
  ChangeType[(ChangeType["UPDATED"] = 2)] = "UPDATED";
})((ChangeType = exports.ChangeType || (exports.ChangeType = {})));
exports.indentPlus = " " + chalk_1.default.bgGreen.black("+") + " ";
exports.indentMinus = " " + chalk_1.default.bgRed.black("-") + " ";
function displayChange(logger, change) {
  const { path, oldValue, newValue } = change;
  const attribute = path.substring(1);
  const msgBuilder = () => {
    switch (change.type) {
      case ChangeType.ADDED:
        return `\t${chalk_1.default.green("+" + attribute)}
${strings_1.indent(
  chalk_1.default.green(JSON.stringify(newValue)),
  exports.indentPlus
)}`;
      case ChangeType.REMOVED:
        return `\t${chalk_1.default.red("-" + attribute)}
${strings_1.indent(
  chalk_1.default.red(JSON.stringify(oldValue)),
  exports.indentMinus
)}`;
      case ChangeType.UPDATED:
        return `\t${chalk_1.default.yellow("-" + attribute)}
${strings_1.indent(strings_1.diffString(oldValue, newValue))}`;
      default:
        return `\t??? ${path}
${strings_1.indent(strings_1.diffString(oldValue, newValue))}`;
    }
  };
  logger.info(msgBuilder);
}
exports.displayChange = displayChange;
