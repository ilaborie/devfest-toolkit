import { Command, flags } from "@oclif/command";
import { Logger, LoggerLevels } from "plop-logger";
import { colorEmojiConfig } from "plop-logger/lib/extra/colorEmojiConfig";

import { commands } from "./tools";
import * as Parser from "@oclif/parser";
import { Config } from "./config";
import { canRead } from "./fs-utils";
import { readFileSync } from "fs";

export default class DevfestToolkit extends Command {
  static description =
    "Tools for working with [Confrerence Hall](https://conference-hall.io/) data, and publish these data to a Web Site or Konfetti) data, and publish these data to a Web Site";

  static flags: flags.Input<any> = {
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    force: flags.boolean({ description: "override file if required" }),
    eventId: flags.string({
      description: "the event id in conference hall",
      required: true
    }),
    apiKey: flags.string({
      description: "the conference hall api key",
      required: true
    }),
    siteDir: flags.string({
      char: "s",
      description: "the conference hall api key",
      required: true
    }),
    patchDir: flags.string({
      description: "the patch directory",
      default: "./patches"
    }),
    addonDir: flags.string({
      description: "the add-on directory",
      default: "./add-on"
    }),
    sponsorCategories: flags.build<string[]>({
      description: "the sponsor categories (gold, silver, ...)",
      parse: input => input.split(",").map(it => it.trim()),
      default: ["platinium", "gold", "soutien", "startup"]
    })(),
    languages: flags.build<string[]>({
      description: "the sponsor lang (en, fr, ...)",
      parse: input => input.split(",").map(it => it.trim()),
      default: ["en", "fr"]
    })()
  };

  static args: Parser.args.IArg[] = [
    {
      name: "command",
      description: "the command to run",
      options: commands.map(it => it.name)
    }
  ];

  private static getLoggerLevels(): LoggerLevels {
    if (canRead("logger.json")) {
      const data = readFileSync("logger.json", "UTF-8");
      return JSON.parse(data) as LoggerLevels;
    } else {
      return {};
    }
  }

  async run(): Promise<void> {
    Logger.config = {
      ...colorEmojiConfig,
      levels: DevfestToolkit.getLoggerLevels()
    };

    const logger = Logger.getLogger("main");
    const { args, flags } = this.parse(DevfestToolkit);

    const tool = commands.find(it => it.name == args.command);
    if (!tool) {
      logger.error("Command not found!", { args, flags });
      this.error(new Error("Command not found: " + args.command));
      return;
    }

    logger.info(tool.description);
    const config = flags as Config;
    logger.debug("Configuration", config);
    await tool.run(config);
    logger.info("✅ all done");
  }
}
