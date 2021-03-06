import { SpeakerId } from "../../conference-hall/model/speaker";
import { Socials } from "./socials";
import { Markdown } from "./index";

export type SpeakerKey = string;

export interface Speaker {
  key: SpeakerKey;
  id?: SpeakerId;
  feature: boolean;
  name: string;
  company?: string;
  city?: string;
  photoURL?: string;
  socials: Socials;
  draft?: boolean;

  description: Markdown;
}

export type Speakers = Speaker[];
