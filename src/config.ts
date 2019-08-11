export interface Config {
  eventId: string;
  apiKey: string;
  siteDir: string;
  patchDir: string;
  addonDir: string;
  force: boolean;
  // Add list
  sponsorTypes: string[];
  sponsorLangs: string[];
}

export type SiteConfig = Pick<Config, "siteDir">;
export type PatchConfig = Pick<Config, "patchDir">;
export type AddOnConfig = Pick<Config, "addonDir" | "siteDir">;
export type ConferenceHallConfig = Pick<Config, "eventId" | "apiKey">;
