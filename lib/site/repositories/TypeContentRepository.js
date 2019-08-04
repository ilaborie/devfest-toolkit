"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const matter = tslib_1.__importStar(require("gray-matter"));
const ContentRepository_1 = require("./ContentRepository");
const fs_utils_1 = require("../../fs-utils");
const models_1 = require("../models");
class TypeContentRepository extends ContentRepository_1.ContentRepository {
  constructor(config, name) {
    super(config, name);
  }
  read(key) {
    const lookup = this.getAllTypes()
      .map(type => ({
        type,
        file: path.join(this.config.siteDir, type, `${key}.md`)
      }))
      .find(({ file }) => fs_utils_1.canRead(file));
    if (lookup != null) {
      const { file, type } = lookup;
      return this.readTypeContentFile(type, file);
    }
    return Promise.reject(`Key ${key} not found!`);
  }
  readTypeContentFile(type, file) {
    this.logger.debug("Read file", file);
    try {
      const result = matter.read(file);
      const value = this.typeTransform(type, result);
      if (!value.key) {
        value.key = path.basename(file, path.extname(file));
      }
      return Promise.resolve(value);
    } catch (e) {
      this.logger.error(() => "fail to read file: " + file, e);
      return Promise.reject(e);
    }
  }
  typeTransform(type, { content, data }) {
    this.logger.trace("Read", () => JSON.stringify({ content, data }, null, 2));
    const partial = data;
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    return Object.assign({}, partial, { type, description: content });
  }
  async getAllTypeFiles() {
    this.logger.info("Search all files into", this.config.siteDir);
    const promises = this.getAllTypes().map(type =>
      this.readDirFiles(path.join(this.config.siteDir, type)).then(files =>
        files.map(file => ({ file, type }))
      )
    );
    let arr = await Promise.all(promises);
    return arr.flat();
  }
  async readAll() {
    this.logger.info("read all");
    let files = await this.getAllTypeFiles();
    let elements = await Promise.all(
      files.map(({ file, type }) => this.getAllTypeData(type, file))
    );
    const result = elements.flat();
    result.sort(models_1.compareKey);
    return result;
  }
  async getAllTypeData(type, file) {
    try {
      let elt = await this.readTypeContentFile(type, file);
      return [elt];
    } catch (e) {
      return [];
    }
  }
  save(value, force = false) {
    const file = path.join(this.config.siteDir, value.type, `${value.key}.md`);
    return this.saveTo(file, force, value);
  }
}
exports.TypeContentRepository = TypeContentRepository;
