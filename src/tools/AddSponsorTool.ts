import { Config } from "../config";
import { prompt } from "enquirer";

import { AbstractSiteTool } from "./AbstractSiteTool";
import { Sponsor } from "../site/models/sponsor";
import * as path from "path";
import { writeFile } from "../fs-utils";
import { buildKey } from "../strings";

export class AddSponsorTool extends AbstractSiteTool {
  constructor() {
    super(
      "add-sponsor",
      "Append a new sponsors to add-on (require a generation after)"
    );
  }

  async run(config: Config): Promise<void> {
    const sponsorsFile = path.join(config.addonDir, "sponsors.json");
    const sponsors = await this.generateSponsors(config);

    const newSponsor = await this.createNewSponsor(config, sponsors);
    sponsors.push(newSponsor);

    const confirm =
      config.force ||
      (await prompt([
        { type: "confirm", name: "question", message: "Confirm creation?" }
      ]));

    if (confirm) {
      this.logger.info("store all sponsors", sponsorsFile);
      await writeFile(sponsorsFile, JSON.stringify(sponsors, null, 2), "utf-8");
    } else {
      this.logger.warn("Cancel sponsor creation");
    }
  }

  private async createNewSponsor(
    config: Config,
    sponsors: Sponsor[]
  ): Promise<Sponsor> {
    const partial = await prompt<Omit<Sponsor, "key" | "order">>([
      { type: "input", name: "title", message: "Sponsor name?" },
      {
        type: "select",
        name: "type",
        message: "Type?",
        choices: config.sponsorTypes
      },
      { type: "input", name: "logo", message: "Logo URL? " }, //  FIXME check url
      { type: "input", name: "website", message: "Website URL? " }, //  FIXME check url
      {
        type: "select",
        name: "lang",
        message: "Sponsor choose to communicate in?",
        choices: config.sponsorLangs
      },
      { type: "input", name: "why", message: "Why?", multiline: true },
      {
        type: "input",
        name: "description",
        message: "Description?",
        multiline: true
      }
    ]);
    const key = buildKey(partial.title);
    const order =
      1 + sponsors.reduce((acc, elt) => Math.max(elt.order || 0, acc), 0);
    return {
      ...partial,
      key,
      order
    };
  }
}
