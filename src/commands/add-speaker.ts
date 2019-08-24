import { Command, flags } from "@oclif/command";
import { Logger } from "plop-logger";
import { colorEmojiConfig } from "plop-logger/lib/extra/colorEmojiConfig";
import { Config } from "../config";
import { commonsFlags, loggerLevels } from "../commons";
import * as path from "path";
import { loadExtraSpeakers } from "../addon/addonSpeaker";
import { prompt } from "enquirer";
import { writeFile } from "../fs-utils";
import { Speaker } from "../site/models/speaker";
import { buildKey, isUrl } from "../strings";
import { Social } from "../site/models/socials";

interface SpeakerPrompt extends Omit<Speaker, "key" | "socials"> {
  twitter?: string;
}

export default class AddSpeaker extends Command {
  static description =
    "Append a new speaker to add-on (require a generation after)";

  static flags: flags.Input<any> = {
    addonDir: commonsFlags.addonDir,
    force: flags.boolean({ description: "override file if required" })
  };

  async run(): Promise<void> {
    Logger.config = {
      ...colorEmojiConfig,
      levels: loggerLevels
    };

    const logger = Logger.getLogger("main");
    const { flags } = this.parse(AddSpeaker);
    logger.info(AddSpeaker.description);
    const config = flags as Config;

    await this.runConfig(logger, config);

    logger.info("✅ all done");
  }

  async runConfig(logger: Logger, config: Config): Promise<void> {
    const speakersFile = path.join(config.addonDir, "speakers.json");
    const speakers = await loadExtraSpeakers(config);

    const newSpeaker = await AddSpeaker.createNewSpeaker();
    speakers.push(newSpeaker);

    logger.info("Going to add", newSpeaker);
    const confirm =
      config.force ||
      (await prompt<{ question: boolean }>([
        { type: "confirm", name: "question", message: "Confirm creation?" }
      ])).question;

    if (confirm) {
      logger.info("store all extra speakers", speakersFile);
      await writeFile(speakersFile, JSON.stringify(speakers, null, 2), "utf-8");
    } else {
      logger.warn("Cancel speaker creation");
    }
  }

  private static async createNewSpeaker(): Promise<Speaker> {
    const partial = await prompt<SpeakerPrompt>([
      {
        type: "input",
        name: "name",
        message: "Speaker full name?",
        required: true
      },
      {
        type: "confirm",
        name: "feature",
        message: "Is a featured speaker?"
      },
      {
        type: "input",
        name: "company",
        message: "Company?",
        required: false
      },
      {
        type: "input",
        name: "city",
        message: "City, Country?",
        required: false
      },
      {
        type: "input",
        name: "photoURL",
        message: "Photo URL? ",
        validate: isUrl,
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
        name: "description",
        message: "Description?",
        multiline: true,
        required: true
      }
    ]);
    const key = buildKey(partial.name);

    const { name, company, city, feature, photoURL, description } = partial;
    const socials: Social[] = [];
    if (partial.twitter) {
      socials.push({ icon: "twitter", link: partial.twitter.trim() });
    }

    return {
      key,
      name,
      company,
      city,
      feature,
      photoURL: (photoURL || "").trim(),
      socials,
      description
    };
  }
}
