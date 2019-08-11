import { Config } from "../config";
import { prompt } from "enquirer";

import { AbstractSiteTool } from "./AbstractSiteTool";
import { Sponsor } from "../site/models/sponsor";
import * as path from "path";
import { writeFile } from "../fs-utils";
import { buildKey, isUrl } from "../strings";
import { Social } from "../site/models/socials";

interface SponsorPrompt extends Omit<Sponsor, "key" | "order" | "socials"> {
  twitter?: string;
  linkedin?: string;
  facebook?: string;
}

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

    this.logger.info("Going to add", newSponsor);
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
    const partial = await prompt<SponsorPrompt>([
      {
        type: "input",
        name: "title",
        message: "Sponsor name?",
        required: true
      },
      {
        type: "select",
        name: "type",
        message: "Type?",
        choices: config.sponsorTypes,
        required: true
      },
      {
        type: "input",
        name: "logo",
        message: "Logo URL? ",
        validate: isUrl,
        required: true
      },
      {
        type: "input",
        name: "website",
        message: "Website URL? ",
        validate: isUrl,
        required: true
      },
      {
        type: "select",
        name: "lang",
        message: "Sponsor choose to communicate in?",
        choices: config.sponsorLangs,
        required: true
      },
      {
        type: "input",
        name: "twitter",
        message: "Twitter URL? (https://twitter.com/...)",
        required: false,
        validate: isUrl
      },
      {
        type: "input",
        name: "linkedin",
        message: "LinkedIn URL? (https://linkedin.com/company/...)",
        required: false,
        validate: isUrl
      },
      {
        type: "input",
        name: "facebook",
        message: "Facebook URL? (https://facebook.com/...)",
        required: false,
        validate: isUrl
      },
      {
        type: "input",
        name: "why",
        message: "Why?",
        multiline: true,
        required: true
      },
      {
        type: "input",
        name: "description",
        message: "Description?",
        multiline: true,
        required: true
      }
    ]);
    const key = buildKey(partial.title);
    const order =
      1 + sponsors.reduce((acc, elt) => Math.max(elt.order || 0, acc), 0);

    const { title, type, logo, website, lang, why, description } = partial;
    const socials: Social[] = [];
    if (partial.twitter) {
      socials.push({ icon: "twitter", link: partial.twitter });
    }
    if (partial.linkedin) {
      socials.push({ icon: "linkedin", link: partial.linkedin });
    }
    if (partial.facebook) {
      socials.push({ icon: "facebook", link: partial.facebook });
    }

    return {
      title,
      type,
      logo,
      website,
      lang,
      why,
      description,
      key,
      order,
      socials
    };
  }
}
