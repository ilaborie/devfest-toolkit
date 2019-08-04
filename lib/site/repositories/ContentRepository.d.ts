import { Logger } from "../../logger";
import { Repository } from "./index";
import { DescriptionElement, KeyElement } from "../models";
import { SiteConfig } from "../../config";
export declare abstract class ContentRepository<
  T extends DescriptionElement & KeyElement
> implements Repository<T[]> {
  readonly config: SiteConfig;
  readonly name: string;
  protected logger: Logger;
  protected readonly parentPath: string;
  protected constructor(config: SiteConfig, name: string);
  read(key: string): Promise<T>;
  private readContentFile;
  private transform;
  protected readDirFiles(dir: string): Promise<string[]>;
  private getAllFiles;
  readAll(): Promise<T[]>;
  private getAllData;
  save(value: T, force?: boolean): Promise<void>;
  protected saveTo(file: string, force: boolean, value: T): Promise<void>;
  saveAll(values: T[], force?: boolean): Promise<void>;
}
