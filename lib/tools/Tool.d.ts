import { Logger } from "../logger";
import { Config } from "../config";
export declare abstract class Tool {
  readonly name: string;
  readonly description: string;
  logger: Logger;
  protected constructor(name: string, description: string);
  abstract run(config: Config): Promise<void>;
}
