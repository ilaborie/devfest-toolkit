"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const yaml = tslib_1.__importStar(require("js-yaml"));
const matter = tslib_1.__importStar(require("gray-matter"));
const logger_1 = require("../../logger");
const fs_utils_1 = require("../../fs-utils");
const models_1 = require("../models");
class ContentRepository {
  constructor(config, name) {
    this.config = config;
    this.name = name;
    this.logger = logger_1.Logger.getLogger("site.repo." + name);
    this.parentPath = path.join(config.siteDir, "content", this.name);
  }
  read(key) {
    const file = path.join(this.parentPath, `${key}.md`);
    return this.readContentFile(file);
  }
  readContentFile(file) {
    this.logger.debug("Read file", file);
    try {
      const result = matter.read(file);
      const value = this.transform(result);
      if (!value.key) {
        value.key = path.basename(file, path.extname(file));
      }
      return Promise.resolve(value);
    } catch (e) {
      this.logger.error(() => "fail to read file: " + file, e);
      return Promise.reject(e);
    }
  }
  transform({ content, data }) {
    this.logger.trace("Read", () => JSON.stringify({ content, data }, null, 2));
    const partial = data;
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    return Object.assign({}, partial, { description: (content || "").trim() });
  }
  async readDirFiles(dir) {
    let files = await fs_utils_1.readdir(dir);
    return files
      .filter(file => !file.startsWith("_"))
      .filter(file => file.endsWith(".md"))
      .map(file => path.join(dir, file));
  }
  getAllFiles() {
    this.logger.info("Search all files into", this.parentPath);
    return this.readDirFiles(this.parentPath);
  }
  async readAll() {
    this.logger.info("read all");
    let files = await this.getAllFiles();
    let elements = await Promise.all(files.map(file => this.getAllData(file)));
    const result = elements.flat();
    result.sort(models_1.compareKey);
    return result;
  }
  async getAllData(file) {
    try {
      let elt = await this.readContentFile(file);
      return [elt];
    } catch (e) {
      return [];
    }
  }
  save(value, force = false) {
    const file = path.join(this.parentPath, `${value.key}.md`);
    return this.saveTo(file, force, value);
  }
  async saveTo(file, force, value) {
    this.logger.debug("save to", file);
    const parent = path.dirname(file);
    try {
      await fs_utils_1.mkdir(parent, { recursive: true });
      const flag = force ? "w" : "wx";
      const { description: md } = value,
        fm = tslib_1.__rest(value, ["description"]);
      const yml = yaml.safeDump(JSON.parse(JSON.stringify(fm)));
      const data = ["---", yml, "---", md].join("\n");
      return await fs_utils_1.writeFile(file, data, { flag });
    } catch (err) {
      this.logger.error(() => "fail to write file: " + file, err);
      return await Promise.reject(err);
    }
  }
  async saveAll(values, force = false) {
    this.logger.info("save all");
    const promises = values.map(t => this.save(t, force));
    await Promise.all(promises);
    return;
  }
}
exports.ContentRepository = ContentRepository;
