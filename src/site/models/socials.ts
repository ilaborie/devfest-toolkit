export type SocialIcon =
  | "facebook"
  | "twitter"
  | "linkedin"
  | "website"
  | "github";

export interface Social {
  icon: SocialIcon;
  link: string;
  name?: string;
}

export type Socials = Social[];
