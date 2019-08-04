import { Site } from "../models/site";
import { Repository } from "./index";
import { SiteConfig } from "../../config";
export declare class SiteRepository implements Repository<Site> {
  readonly config: SiteConfig;
  private logger;
  constructor(config: SiteConfig);
  readAll(): Promise<Site>;
  saveAll(site: Site, force: boolean): Promise<void>;
}
