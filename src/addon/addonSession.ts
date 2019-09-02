import { readFileCache } from "../cache";
import * as path from "path";
import { AddOnConfig } from "../config";
import { Session } from "../site/models/session";
import { compareKey } from "../site/models";
import { Logger } from "plop-logger";

export async function loadExtraSessions(
  config: AddOnConfig
): Promise<Session[]> {
  const logger = Logger.getLogger("addon.sessions");
  const sessionsFile = path.join(config.addonDir, "sessions.json");
  const sessions = await readFileCache.getAsJson<Session[]>(sessionsFile);
  logger.info("Found", () => `${sessions.length} extra session(s)`);

  const result = sessions.map(session => {
    const {
      key,
      title,
      id,
      language,
      format,
      tags,
      level,
      speakers,
      videoId,
      presentation,
      draft,
      description
    } = session;
    return {
      key,
      title,
      id,
      language,
      format,
      tags,
      level,
      speakers,
      videoId,
      presentation,
      draft,
      description
    };
  });
  result.sort(compareKey);
  return result;
}
