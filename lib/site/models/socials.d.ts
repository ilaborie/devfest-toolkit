export declare type SocialIcon =
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
export declare type Socials = Social[];
