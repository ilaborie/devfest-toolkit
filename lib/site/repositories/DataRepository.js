"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const yaml = tslib_1.__importStar(require("js-yaml"));
const logger_1 = require("../../logger");
const fs_utils_1 = require("../../fs-utils");
const cache_1 = require("../../cache");
class DataRepository {
  constructor(config, name) {
    this.config = config;
    this.name = name;
    this.logger = logger_1.Logger.getLogger("site.repo." + name);
    this.parentFile = path.join(config.siteDir, "data", this.name + ".yml");
  }
  async readAll() {
    this.logger.info("read all", this.parentFile);
    try {
      const data = await cache_1.readFileCache.get(this.parentFile);
      return yaml.safeLoad(data);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      return {};
    }
  }
  async saveAll(values, force) {
    this.logger.info("save all");
    const file = this.parentFile;
    await fs_utils_1.mkdir(path.dirname(file), { recursive: true });
    const flag = force ? "w" : "wx";
    let data = yaml.safeDump(values);
    return await fs_utils_1.writeFile(file, data, { flag });
  }
}
exports.DataRepository = DataRepository;
