import { flags } from "@oclif/command";
import { Logger } from "plop-logger";
import { Config } from "../config";
import { commonsFlags, DevfestToolkitCommand, generateSite } from "../commons";
import { getEvent } from "../conference-hall/api";
import colors from "ansi-colors";

interface Distribution {
  [index: string]: number;
}

export default class Stats extends DevfestToolkitCommand {
  static description = "Some statistics";

  static flags: flags.Input<any> = {
    ...commonsFlags
  };

  get configuration(): Config {
    const { flags } = this.parse(Stats);
    return flags as Config;
  }

  private stats<T, A extends keyof T>(
    logger: Logger,
    label: string,
    elements: T[],
    groups: A[]
  ): void {
    const count = elements.length;
    logger.info(() => label + ":", count);

    groups.forEach(group =>
      this.statsGroup(logger, label, elements, group, elt => `${elt[group]}`)
    );
  }

  private statsGroup<T, A extends keyof T>(
    logger: Logger,
    label: string,
    elements: T[],
    group: A,
    mapper: (elt: T) => string
  ): void {
    const distribution: Distribution = elements.reduce(
      (acc: Distribution, elt) => {
        const value = mapper(elt);
        acc[value] = (acc[value] | 0) + 1;
        return acc;
      },
      {}
    );

    Object.entries(distribution).forEach(([value, count]) =>
      logger.info(() => `${label}/${group}: ${colors.yellow(value)}`, count)
    );
  }

  async runWithConfig(config: Config): Promise<void> {
    // Submitted talks
    const { talks } = await getEvent(config);
    this.stats(this.logger, "total talks", talks, ["formats", "categories"]);

    const { speakers, sessions } = await generateSite(this.logger, config);
    // Accepted talks
    this.stats(this.logger, "accepted talks", sessions, [
      "format",
      "tags",
      "level"
    ]);

    // Accepted speakers
    this.stats(this.logger, "speakers", speakers, ["city", "company"]);
  }
}
