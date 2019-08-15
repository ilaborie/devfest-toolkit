import * as path from "path";
import * as matter from "gray-matter";
import { GrayMatterFile, Input } from "gray-matter";

import { ContentRepository } from "./ContentRepository";
import { canRead } from "../../fs-utils";
import {
  compareKey,
  DescriptionElement,
  KeyElement,
  TypeElement
} from "../models";
import { SiteConfig } from "../../config";

export abstract class TypeContentRepository<
  T extends TypeElement & KeyElement & DescriptionElement
> extends ContentRepository<T> {
  protected constructor(config: SiteConfig, name: string) {
    super(config, name);
  }

  read(key: string): Promise<T> {
    const lookup = this.getAllTypes()
      .map(type => ({
        type,
        file: path.join(this.parentPath, type, `${key}.md`)
      }))
      .find(({ file }) => canRead(file));

    if (lookup != null) {
      const { file, type } = lookup;
      return this.readTypeContentFile(type, file);
    }
    return Promise.reject(`Key ${key} not found!`);
  }

  abstract getAllTypes(): string[];

  private readTypeContentFile(type: string, file: string): Promise<T> {
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

  private typeTransform(
    type: string,
    { content, data }: GrayMatterFile<Input>
  ): T {
    this.logger.trace("Read", () => JSON.stringify({ content, data }, null, 2));
    const partial = data as Omit<T, "description">;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return { ...partial, type, description: content } as T;
  }

  private async getAllTypeFiles(): Promise<{ type: string; file: string }[]> {
    this.logger.info("Search all files into", this.parentPath);

    const promises = this.getAllTypes().map(type =>
      this.readDirFiles(path.join(this.parentPath, type)).then(files =>
        files.map(file => ({ file, type }))
      )
    );

    const arr = await Promise.all(promises);
    return arr.flat();
  }

  async readAll(): Promise<T[]> {
    this.logger.info("read all");
    const files = await this.getAllTypeFiles();
    const elements: T[][] = await Promise.all(
      files.map(({ file, type }) => this.getAllTypeData(type, file))
    );
    const result = elements.flat();
    result.sort(compareKey);
    return result;
  }

  private async getAllTypeData(type: string, file: string): Promise<T[]> {
    try {
      const elt = await this.readTypeContentFile(type, file);
      return [elt];
    } catch (e) {
      return [];
    }
  }

  save(value: T, force: boolean = false): Promise<void> {
    const file = path.join(this.parentPath, value.type, `${value.key}.md`);
    return this.saveTo(file, force, value);
  }
}
