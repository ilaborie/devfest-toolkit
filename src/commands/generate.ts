import { flags } from "@oclif/command";
import { Config } from "../config";
import { commonsFlags, DevfestToolkitCommand, generateSite } from "../commons";
import { SiteRepository } from "../site/repositories";
import { SiteValidator } from "../site/validation";

export default class Generate extends DevfestToolkitCommand {
  static description =
    "Append a new speaker to add-on (require a generation after)";

  static flags: flags.Input<any> = {
    ...commonsFlags,
    force: flags.boolean({ description: "override file if required" })
  };

  get configuration(): Config {
    const { flags } = this.parse(Generate);
    return flags as Config;
  }

  async runWithConfig(config: Config): Promise<void> {
    const { force, siteDir } = config;

    this.logger.debug("site output dir", siteDir);
    const site = await generateSite(this.logger, config);

    // validate
    const siteValidator = new SiteValidator(config);
    siteValidator.validateAndLog(site);

    const siteRepo = new SiteRepository(config);
    await siteRepo.saveAll(site, force);
  }
}
