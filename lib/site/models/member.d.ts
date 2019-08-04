import { Socials } from "./socials";
import { Markdown } from "./index";
export declare type MemberType = string;
export declare type MemberKey = string;
export interface Member {
  key: MemberKey;
  type: MemberType;
  title: string;
  subtitle?: string;
  photo: string;
  socials: Socials;
  description: Markdown;
}
export declare type Members = Member[];
