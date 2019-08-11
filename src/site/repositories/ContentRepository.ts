import * as path from "path";
import * as yaml from "js-yaml";
import * as matter from "gray-matter";
import { GrayMatterFile, Input } from "gray-matter";
import { Logger } from "plop-logger";

import { createParentDir, readdir, writeFile } from "../../fs-utils";
import { Repository } from "./index";
import { compareKey, DescriptionElement, KeyElement } from "../models";
import { SiteConfig } from "../../config";

export abstract class ContentRepository<
  T extends DescriptionElement & KeyElement
> implements Repository<T[]> {
  protected logger: Logger;
  protected readonly parentPath: string;

  protected constructor(readonly config: SiteConfig, readonly name: string) {
    this.logger = Logger.getLogger("site.repo." + name);
    this.parentPath = path.join(config.siteDir, "content", this.name);
  }

  private readContentFile(file: string): Promise<T> {
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

  private transform({ content, data }: GrayMatterFile<Input>): T {
    this.logger.trace("Read", () => JSON.stringify({ content, data }, null, 2));
    const partial = data as Omit<T, "description">;
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    return {
      ...partial,
      description: (content || "").trim()
    } as T;
  }

  protected async readDirFiles(dir: string): Promise<string[]> {
    let files = await readdir(dir);
    return files
      .filter(file => !file.startsWith("_index"))
      .filter(file => file.endsWith(".md"))
      .map(file => path.join(dir, file));
  }

  private getAllFiles(): Promise<string[]> {
    this.logger.info("Search all files into", this.parentPath);
    return this.readDirFiles(this.parentPath);
  }

  async readAll(): Promise<T[]> {
    this.logger.info("read all");
    let files = await this.getAllFiles();
    let elements: T[][] = await Promise.all(
      files.map(file => this.getAllData(file))
    );
    const result = elements.flat();
    result.sort(compareKey);
    return result;
  }

  private async getAllData(file: string): Promise<T[]> {
    try {
      let elt = await this.readContentFile(file);
      return [elt];
    } catch (e) {
      return [];
    }
  }

  save(value: T, force: boolean = false): Promise<void> {
    const file = path.join(this.parentPath, `${value.key}.md`);
    return this.saveTo(file, force, value);
  }

  protected async saveTo(
    file: string,
    force: boolean,
    value: T
  ): Promise<void> {
    this.logger.debug("save to", file);
    try {
      await createParentDir(file);
      const flag = force ? "w" : "wx";
      const { description: md, ...fm } = value;
      const yml = yaml.safeDump(JSON.parse(JSON.stringify(fm)));
      const data = ["---", yml + "---", md].join("\n");
      return await writeFile(file, data, { flag });
    } catch (err) {
      this.logger.error(() => "fail to write file: " + file, err);
      return await Promise.reject(err);
    }
  }

  async saveAll(values: T[], force: boolean = false): Promise<void> {
    this.logger.info("save all");
    const promises = values.map(t => this.save(t, force));
    await Promise.all(promises);
    return;
  }
}
