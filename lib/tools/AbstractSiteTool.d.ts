import { Tool } from "./Tool";
import { Config } from "../config";
import { Event } from "../conference-hall/model/event";
import { Talk } from "../conference-hall/model/talk";
import { Session as SiteSession } from "../site/models/session";
import { Speaker as SiteSpeaker } from "../site/models/speaker";
import { Format as SiteFormat } from "../site/models/format";
import { Category as SiteCategory } from "../site/models/category";
import { Site } from "../site/models/site";
import { Sponsor } from "../site/models/sponsor";
import { Member } from "../site/models/member";
export declare abstract class AbstractSiteTool extends Tool {
  protected generateSessions(
    config: Config,
    event: Event
  ): Promise<{
    site: SiteSession[];
    talks: Talk[];
  }>;
  protected generateSpeakers(
    config: Config,
    event: Event,
    talks: Talk[]
  ): Promise<SiteSpeaker[]>;
  protected generateCategories(
    config: Config,
    event: Event
  ): Promise<SiteCategory[]>;
  protected generateFormats(
    config: Config,
    event: Event
  ): Promise<SiteFormat[]>;
  protected generateDataFromEvent(
    config: Config,
    event: Event
  ): Promise<Partial<Site>>;
  protected generateSchedule(config: Config): Promise<Partial<Site>>;
  protected generateSponsors(config: Config): Promise<Sponsor[]>;
  protected generateTeam(config: Config): Promise<Member[]>;
  protected generateSite(config: Config): Promise<Site>;
}
