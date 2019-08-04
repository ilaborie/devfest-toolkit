import { Logger } from "../../logger";
import { Repository } from "./index";
import { KeyElement } from "../models";
import { SiteConfig } from "../../config";
export declare abstract class DataArrayRepository<T extends KeyElement>
  implements Repository<T[]> {
  readonly config: SiteConfig;
  readonly name: string;
  protected logger: Logger;
  protected readonly parentFile: string;
  protected constructor(config: SiteConfig, name: string);
  readAll(): Promise<T[]>;
  saveAll(values: T[], force: boolean): Promise<void>;
}
