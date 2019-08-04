import { Logger } from "../../logger";
import { Repository } from "./index";
import { SiteConfig } from "../../config";
export declare abstract class DataRepository<T> implements Repository<T> {
  readonly config: SiteConfig;
  readonly name: string;
  protected logger: Logger;
  protected readonly parentFile: string;
  protected constructor(config: SiteConfig, name: string);
  readAll(): Promise<T>;
  saveAll(values: T, force: boolean): Promise<void>;
}
