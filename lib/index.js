"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const logger_1 = require("./logger");
const tools_1 = require("./tools");
// noinspection JSUnusedGlobalSymbols
class DevfestToolkit extends command_1.Command {
  async run() {
    const logger = logger_1.Logger.getLogger("main");
    const { args, flags } = this.parse(DevfestToolkit);
    const tool = tools_1.commands.find(it => it.name == args.command);
    if (!tool) {
      logger.error("Command not found!", { args, flags });
      this.error(new Error("Command not found: " + args.command));
      return;
    }
    logger.info(tool.description);
    const config = flags;
    logger.debug("Configuration", config);
    await tool.run(config);
    logger.info("✅ all done");
  }
}
DevfestToolkit.description =
  "Tools for working with [Confrerence Hall](Tools for working with ConfrerenceHall data, and publish these data to a Web Site or Konfetti) data, and publish these data to a Web Site";
DevfestToolkit.flags = {
  version: command_1.flags.version({ char: "v" }),
  help: command_1.flags.help({ char: "h" }),
  force: command_1.flags.boolean({ description: "override file if required" }),
  eventId: command_1.flags.string({
    description: "the event id in conference hall",
    required: true
  }),
  apiKey: command_1.flags.string({
    description: "the conference hall api key",
    required: true
  }),
  siteDir: command_1.flags.string({
    char: "s",
    description: "the conference hall api key",
    required: true
  }),
  patchDir: command_1.flags.string({
    description: "the patch directory",
    default: "./patches"
  }),
  addonDir: command_1.flags.string({
    description: "the add-on directory",
    default: "./add-on"
  })
};
DevfestToolkit.args = [
  {
    name: "command",
    description: "the command to run",
    options: tools_1.commands.map(it => it.name)
  }
];
exports.default = DevfestToolkit;
