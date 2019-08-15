import { Config } from "../config";
import { prompt } from "enquirer";

import { AbstractSiteTool } from "./AbstractSiteTool";
import * as path from "path";
import { writeFile } from "../fs-utils";
import { buildKey } from "../strings";
import { Speaker } from "../site/models/speaker";
import { loadExtraSpeakers } from "../addon/addonSpeaker";
import { loadExtraSessions } from "../addon/addonSession";
import { Session } from "../site/models/session";
import { Format } from "../site/models/format";
import { Category, CategoryKey } from "../site/models/category";
import { getEvent } from "../conference-hall/api";
import { config } from "cli-ux";

interface SessionPrompt extends Omit<Session, "key" | "tags"> {
  category: CategoryKey;
}

export class AddSessionTool extends AbstractSiteTool {
  constructor() {
    super(
      "add-session",
      "Append a new speaker to add-on (require a generation after)"
    );
  }

  async run(config: Config): Promise<void> {
    const sessionsFile = path.join(config.addonDir, "sessions.json");
    const sessions = await loadExtraSessions(config);
    const speakers = await loadExtraSpeakers(config);

    const event = await getEvent(config);
    const formats = await this.generateFormats(config, event);
    const categories = await this.generateCategories(config, event);

    const newSession = await this.createNewSession(
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

  private async createNewSession(
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
