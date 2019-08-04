import { Socials } from "./socials";
import { Markdown } from "./index";
export declare type Lang = "fr" | "en";
export declare type SponsorKey = string;
export declare type SponsorCategory = string;
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
export declare type Sponsors = Sponsor[];
