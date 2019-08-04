"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractSiteTool_1 = require("./AbstractSiteTool");
const repositories_1 = require("../site/repositories");
const site_1 = require("../site/models/site");
class GenerateSiteTool extends AbstractSiteTool_1.AbstractSiteTool {
  constructor() {
    super("generate", "Generate site from conference hall and extra data");
  }
  async run(config) {
    const { force, siteDir } = config;
    this.logger.debug("site output dir", siteDir);
    const site = await this.generateSite(config);
    // validate
    site_1.siteValidator.validateAndLog(site);
    const siteRepo = new repositories_1.SiteRepository(config);
    await siteRepo.saveAll(site, force);
  }
}
exports.GenerateSiteTool = GenerateSiteTool;
