import { SpeakerKey } from "../site/models/speaker";
import { AddOnConfig } from "../config";
export interface SiteSpeakerMissing {
  isFeatured: boolean;
  company?: string;
  city?: string;
}
export declare function bridgeSpeaker(
  config: AddOnConfig,
  key: SpeakerKey
): Promise<SiteSpeakerMissing>;
