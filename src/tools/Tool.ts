import { Logger } from "../logger";
import { Config } from "../config";

export abstract class Tool {
  logger: Logger;

  protected constructor(readonly name: string, readonly description: string) {
    this.logger = Logger.getLogger("command." + name);
  }

  abstract run(config: Config): Promise<void>;
}
