import { flags } from "@oclif/command";
import { Config } from "../config";
import {
  commonsFlags,
  DevfestToolkitCommand,
  generateCategories,
  generateFormats
} from "../commons";
import * as path from "path";
import { loadExtraSessions } from "../addon/addonSession";
import { loadExtraSpeakers } from "../addon/addonSpeaker";
import { getEvent } from "../conference-hall/api";
import { prompt } from "enquirer";
import { writeFile } from "../fs-utils";
import { Speaker } from "../site/models/speaker";
import { Format } from "../site/models/format";
import { Category, CategoryKey } from "../site/models/category";
import { Session } from "../site/models/session";
import { buildKey } from "../strings";

interface SessionPrompt extends Omit<Session, "key" | "tags"> {
  category: CategoryKey;
}

export default class AddSession extends DevfestToolkitCommand {
  static description =
    "Append a new session to add-on (require a generation after)";

  static flags: flags.Input<any> = {
    ...commonsFlags,
    languages: flags.build<string[]>({
      description: "the session lang (en, fr, ...)",
      parse: input => input.split(",").map(it => it.trim()),
      default: ["English", "Français"]
    })(),
    force: flags.boolean({ description: "override file if required" })
  };

  get configuration(): Config {
    const { flags } = this.parse(AddSession);
    return flags as Config;
  }

  async runWithConfig(config: Config): Promise<void> {
    const sessionsFile = path.join(config.addonDir, "sessions.json");
    const sessions = await loadExtraSessions(config);
    const speakers = await loadExtraSpeakers(config);

    const event = await getEvent(config);
    const formats = await generateFormats(this.logger, config, event);
    const categories = await generateCategories(this.logger, config, event);

    const newSession = await AddSession.createNewSession(
      config,
      speakers,
      formats,
      categories
    );
    sessions.push(newSession);

    this.logger.info("Going to add", newSession);
    const confirm =
      config.force ||
      (await prompt<{ question: boolean }>([
        { type: "confirm", name: "question", message: "Confirm creation?" }
      ])).question;

    if (confirm) {
      this.logger.info("store all extra sessions", sessionsFile);
      await writeFile(sessionsFile, JSON.stringify(sessions, null, 2), "utf-8");
    } else {
      this.logger.warn("Cancel session creation");
    }
  }

  private static async createNewSession(
    config: Config,
    extraSpeakers: Speaker[],
    formats: Format[],
    categories: Category[]
  ): Promise<Session> {
    const partial = await prompt<SessionPrompt>([
      {
        type: "input",
        name: "title",
        message: "Session title?",
        required: true
      },
      {
        type: "select",
        name: "category",
        message: "Category? ",
        choices: categories.map(it => it.key),
        required: true
      },
      {
        type: "select",
        name: "format",
        message: "Format? ",
        choices: formats.map(it => it.key),
        required: true
      },
      {
        type: "select",
        name: "level",
        message: "Level? ",
        choices: ["beginner", "advanced", "expert"],
        required: true
      },
      {
        type: "multiselect",
        name: "speakers",
        message: "Speakers?",
        choices: extraSpeakers.map(it => it.key),
        required: true
      },
      {
        type: "select",
        name: "language",
        message: "Lang? ",
        choices: config.languages,
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
    const tags = [partial.category];

    const { title, language, format, level, speakers, description } = partial;

    return {
      key,
      title,
      tags,
      language,
      format,
      level,
      speakers,
      description
    };
  }
}
