import { Command, flags } from "@oclif/command";
import { Logger } from "plop-logger";
import { colorEmojiConfig } from "plop-logger/lib/extra/colorEmojiConfig";
import { Config } from "../config";
import { commonsFlags, generateSite, loggerLevels } from "../commons";
import { SiteRepository } from "../site/repositories";
import { SiteValidator } from "../site/validation";

export default class Generate extends Command {
  static description =
    "Append a new speaker to add-on (require a generation after)";

  static flags: flags.Input<any> = {
    ...commonsFlags,
    force: flags.boolean({ description: "override file if required" })
  };

  async run(): Promise<void> {
    Logger.config = {
      ...colorEmojiConfig,
      levels: loggerLevels
    };

    const logger = Logger.getLogger("main");
    const { flags } = this.parse(Generate);
    logger.info(Generate.description);
    const config = flags as Config;

    const { force, siteDir } = config;

    logger.debug("site output dir", siteDir);
    const site = await generateSite(logger, config);

    // validate
    const siteValidator = new SiteValidator(config);
    siteValidator.validateAndLog(site);

    const siteRepo = new SiteRepository(config);
    await siteRepo.saveAll(site, force);

    logger.info("✅ all done");
  }
}
