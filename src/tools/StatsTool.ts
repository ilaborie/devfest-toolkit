import colors from "ansi-colors";

import { Config } from "../config";
import { AbstractSiteTool } from "./AbstractSiteTool";
import { getEvent } from "../conference-hall/api";

interface Distribution {
  [index: string]: number;
}

export class StatsTool extends AbstractSiteTool {
  constructor() {
    super("stats", "Some statistics");
  }

  private stats<T, A extends keyof T>(
    label: string,
    elements: T[],
    groups: A[]
  ): void {
    const count = elements.length;
    this.logger.info(() => label + ":", count);

    groups.forEach(group =>
      this.statsGroup(label, elements, group, elt => `${elt[group]}`)
    );
  }

  private statsGroup<T, A extends keyof T>(
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
      this.logger.info(
        () => `${label}/${group}: ${colors.yellow(value)}`,
        count
      )
    );
  }

  async run(config: Config): Promise<void> {
    // Submitted talks
    const { talks } = await getEvent(config);
    this.stats("total talks", talks, ["formats", "categories"]);

    const { speakers, sessions } = await this.generateSite(config);
    // Accepted talks
    this.stats("accepted talks", sessions, ["format", "tags", "level"]);

    // Accepted speakers
    this.stats("speakers", speakers, ["city", "company"]);
  }
}
