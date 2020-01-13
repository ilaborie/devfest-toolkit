import * as path from "path";
import * as yaml from "js-yaml";
import { Logger } from "plop-logger";

import { createParentDir, writeFile } from "../../fs-utils";
import { Repository } from "./index";
import { readFileCache } from "../../cache";
import { compareKey, KeyElement } from "../models";
import { SiteConfig } from "../../config";

export abstract class DataArrayRepository<T extends KeyElement>
  implements Repository<T[]> {
  protected logger: Logger;
  protected readonly parentFile: string;

  protected constructor(readonly config: SiteConfig, readonly name: string) {
    this.logger = Logger.getLogger("site.repo." + name);
    this.parentFile = path.join(config.siteDir, "data", this.name + ".yml");
  }

  async readAll(): Promise<T[]> {
    this.logger.info("read all", this.parentFile);
    try {
      const data = await readFileCache.get(this.parentFile);
      const result = yaml.safeLoad(data) as T[];
      result.sort(compareKey);
      return result;
    } catch (e) {
      return [];
    }
  }

  async saveAll(values: T[], force: boolean): Promise<void> {
    this.logger.info("save all");
    const file = this.parentFile;
    await createParentDir(file);
    const flag = force ? "w" : "wx";
    const data = yaml.safeDump(values);
    this.logger.debug("write team member", file);
    return await writeFile(file, data, { flag });
  }
}
