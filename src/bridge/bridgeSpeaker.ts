import { SpeakerKey } from "../site/models/speaker";
import { readFileCache } from "../cache";
import * as path from "path";
import { AddOnConfig } from "../config";

interface SpeakersAddOn {
  featured: SpeakerKey[];
  add: {
    [index: string]: { company?: string; city?: string };
  };
}

// FIXME create PR on conference-hall
export interface SiteSpeakerMissing {
  isFeatured: boolean;
  company?: string;
  city?: string;
}

export async function bridgeSpeaker(
  config: AddOnConfig,
  key: SpeakerKey
): Promise<SiteSpeakerMissing> {
  const speakerAddOnFile = path.join(config.addonDir, "speakers.json");
  let speakersAddOn = await readFileCache.getAsJson<SpeakersAddOn>(
    speakerAddOnFile
  );
  const result: SiteSpeakerMissing = {
    isFeatured: speakersAddOn.featured.includes(key)
  };
  const extra = speakersAddOn.add[key];
  if (extra && extra.company) {
    result.company = extra.company;
  }
  if (extra && extra.city) {
    result.city = extra.city;
  }
  return result;
}
