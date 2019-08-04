import { Socials } from "./socials";
import { Markdown } from "./index";

// TLS: core, cfp, volunteers
export type MemberType = string;

export type MemberKey = string;

export interface Member {
  key: MemberKey;
  type: MemberType;
  title: string;
  subtitle?: string;
  photo: string;
  socials: Socials;

  description: Markdown;
}

export type Members = Member[];
