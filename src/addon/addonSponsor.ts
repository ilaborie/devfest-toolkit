import { readFileCache } from "../cache";
import * as path from "path";
import { AddOnConfig } from "../config";
import { Sponsor } from "../site/models/sponsor";
import { compareKey } from "../site/models";
import { Logger } from "plop-logger";

export async function loadSponsors(config: AddOnConfig): Promise<Sponsor[]> {
  const logger = Logger.getLogger("addon.sponsors");
  const sponsorsFile = path.join(config.addonDir, "sponsors.json");
  const sponsors = await readFileCache.getAsJson<Sponsor[]>(sponsorsFile);
  logger.info("Found", () => `${sponsors.length} sponsor(s)`);

  const result = sponsors.map(sponsor => {
    const {
      title,
      category,
      order,
      logo,
      website,
      lang,
      why,
      socials,
      key,
      description
    } = sponsor;
    return {
      key,
      title,
      category,
      order,
      logo,
      website,
      lang,
      why,
      socials,
      description
    };
  });
  result.sort(compareKey);
  return result;
}
