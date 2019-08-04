export interface Config {
  eventId: string;
  apiKey: string;
  siteDir: string;
  patchDir: string;
  addonDir: string;
  force: boolean;
}
export declare type SiteConfig = Pick<Config, "siteDir">;
export declare type PatchConfig = Pick<Config, "patchDir">;
export declare type AddOnConfig = Pick<Config, "addonDir">;
export declare type ConferenceHallConfig = Pick<Config, "eventId" | "apiKey">;
