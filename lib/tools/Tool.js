"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
class Tool {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.logger = logger_1.Logger.getLogger("command." + name);
  }
}
exports.Tool = Tool;
