"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_utils_1 = require("./fs-utils");
const rp = tslib_1.__importStar(require("request-promise-native"));
const logger_1 = require("./logger");
function memoize(fun) {
  const map = new Map();
  return key => {
    if (map.has(key)) {
      return map.get(key) || fun(key);
    }
    const value = fun(key);
    map.set(key, value);
    return value;
  };
}
exports.memoize = memoize;
class MapCache {
  constructor() {
    this.map = new Map();
  }
  async get(key) {
    let upToDate = await this.upToDateFn(key);
    if (upToDate) {
      return this.map.get(key) || this.loadFn(key);
    }
    const value = this.loadFn(key);
    this.map.set(key, value);
    return value;
  }
  upToDateFn(key) {
    return Promise.resolve(this.map.has(key));
  }
}
class ReadFileCache extends MapCache {
  constructor() {
    super(...arguments);
    this.modified = new Map();
    this.logger = logger_1.Logger.getLogger("cache.file");
  }
  async getAsJson(path) {
    const result = await this.get(path);
    return JSON.parse(result);
  }
  loadFn(key) {
    this.logger.info("Read file", key);
    return fs_utils_1.readFile(key, "utf-8");
  }
  async upToDateFn(key) {
    this.logger.trace("check up-to-date", key);
    let stats = await fs_utils_1.stat(key);
    let lastModified = stats.mtimeMs;
    if (this.modified.get(key) === lastModified) {
      this.logger.trace("Hooray, it is up-to-date", key);
      return true;
    }
    this.logger.trace("Out of date", key);
    this.modified.set(key, lastModified);
    return false;
  }
}
exports.readFileCache = new ReadFileCache();
class FetchCache extends MapCache {
  constructor() {
    super(...arguments);
    this.logger = logger_1.Logger.getLogger("cache.http");
  }
  loadFn(key) {
    this.logger.info("HTTP get", key);
    return rp.get(key, { json: true });
  }
}
exports.fetchCache = new FetchCache();
