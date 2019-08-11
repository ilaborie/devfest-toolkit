import { Config } from "../config";

import { AbstractSiteTool } from "./AbstractSiteTool";
import { SiteRepository } from "../site/repositories";
import { SiteValidator } from "../site/validation";

export class GenerateSiteTool extends AbstractSiteTool {
  constructor() {
    super("generate", "Generate site from conference hall and extra data");
  }

  async run(config: Config): Promise<void> {
    const { force, siteDir } = config;

    this.logger.debug("site output dir", siteDir);
    const site = await this.generateSite(config);

    // validate
    const siteValidator = new SiteValidator(config);
    siteValidator.validateAndLog(site);

    const siteRepo = new SiteRepository(config);
    await siteRepo.saveAll(site, force);
  }
}
