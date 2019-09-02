import { Speaker } from "../site/models/speaker";
import { readFileCache } from "../cache";
import * as path from "path";
import { AddOnConfig } from "../config";
import { Logger } from "plop-logger";
import { compareKey } from "../site/models";

// FIXME create PR on conference-hall

export async function loadExtraSpeakers(
  config: AddOnConfig
): Promise<Speaker[]> {
  const logger = Logger.getLogger("addon.speakers");
  const speakersFile = path.join(config.addonDir, "speakers.json");
  const speakers = await readFileCache.getAsJson<Speaker[]>(speakersFile);
  logger.info("Found", () => `${speakers.length} extra speakers(s)`);

  const result = speakers.map(speaker => {
    const {
      key,
      name,
      id,
      feature,
      company,
      city,
      photoURL,
      socials,
      draft,
      description
    } = speaker;
    return {
      key,
      name,
      id,
      feature,
      company,
      city,
      photoURL,
      socials,
      draft,
      description
    };
  });
  result.sort(compareKey);
  return result;
}
