"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareKey = (a, b) => {
  if (a.key > b.key) return 1;
  else if (a.key < b.key) return -1;
  else return 0;
};
