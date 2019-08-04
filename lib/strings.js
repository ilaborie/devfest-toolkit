"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const diff_1 = require("diff");
const cache_1 = require("./cache");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
exports.buildKey = cache_1.memoize(s => {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\s]/g, "-") // whitespace
    .replace(/[^\x00-\x7F]/g, "") // not ASCII
    .replace(/[\W]/g, "_"); // not word
});
exports.cleanSocialKey = cache_1.memoize(s => {
  let x = s;
  if (x.includes("/")) {
    const idx = x.lastIndexOf("/");
    x = x.substring(idx + 1);
  }
  if (x.startsWith("@")) {
    x = x.substring(1);
  }
  return x;
});
function indent(s, indent = "  ") {
  return (s || "")
    .toString()
    .split("\n")
    .map(it => (it.length ? indent + it : it))
    .join("\n");
}
exports.indent = indent;
function diffString(a, b) {
  let diffResult;
  if (typeof a === "string" && typeof b === "string") {
    diffResult = diff_1.diffWordsWithSpace(a.toString(), b.toString());
  } else {
    diffResult = diff_1.diffJson(JSON.stringify(a), JSON.stringify(b));
  }
  return diffResult.reduce((acc, change) => {
    if (change.added) {
      return acc + chalk_1.default.green(change.value);
    } else if (change.removed) {
      return acc + chalk_1.default.red(change.value);
    } else {
      return acc + chalk_1.default.grey(change.value);
    }
  }, "");
}
exports.diffString = diffString;
