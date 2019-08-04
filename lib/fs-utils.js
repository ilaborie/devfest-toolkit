"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const util = tslib_1.__importStar(require("util"));
const fs = tslib_1.__importStar(require("fs"));
exports.readdir = util.promisify(fs.readdir);
exports.writeFile = util.promisify(fs.writeFile);
exports.readFile = util.promisify(fs.readFile);
exports.stat = util.promisify(fs.stat);
exports.mkdir = util.promisify(fs.mkdir);
exports.canRead = path => {
  try {
    fs.accessSync(path, fs.constants.R_OK);
    return true;
  } catch (_) {
    return false;
  }
};
exports.canWrite = path => {
  try {
    fs.accessSync(path, fs.constants.W_OK);
    return true;
  } catch (_) {
    return false;
  }
};
