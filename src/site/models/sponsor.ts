import { Socials } from "./socials";
import { Markdown } from "./index";

export type Lang = "fr" | "en";

export type SponsorKey = string;

// TLS: platinium, gold, soutien, startup, media, communautes
export type SponsorCategory = string;

export interface Sponsor {
  key: SponsorKey;
  title: string;
  type: SponsorCategory;
  order?: number;
  logo: string;
  website?: string;
  lang: Lang;
  why?: string;
  socials: Socials;

  description: Markdown;
}

export type Sponsors = Sponsor[];
