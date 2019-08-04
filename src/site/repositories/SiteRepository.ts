import * as path from "path";
import { Logger } from "../../logger";
import { mkdir, writeFile } from "../../fs-utils";
import { Site } from "../models/site";
import {
  CategoryRepository,
  FormatRepository,
  InfoRepository,
  Repository,
  RoomRepository,
  ScheduleRepository,
  SessionRepository,
  SlotRepository,
  SpeakerRepository,
  SponsorRepository,
  TeamRepository
} from "./index";
import { SiteConfig } from "../../config";

export class SiteRepository implements Repository<Site> {
  private logger: Logger = Logger.getLogger("site.repo.site");

  constructor(readonly config: SiteConfig) {}

  async readAll(): Promise<Site> {
    this.logger.info("read all", this.config);

    // Base
    const repoSessions = new SessionRepository(this.config);
    const repoSpeaker = new SpeakerRepository(this.config);
    const repoCategories = new CategoryRepository(this.config);
    const repoFormats = new FormatRepository(this.config);

    const sessions = await repoSessions.readAll();
    const speakers = await repoSpeaker.readAll();
    const categories = await repoCategories.readAll();
    const formats = await repoFormats.readAll();

    // Schedule
    const repoRooms = new RoomRepository(this.config);
    const repoSlots = new SlotRepository(this.config);
    const repoSchedule = new ScheduleRepository(this.config);

    const rooms = await repoRooms.readAll();
    const slots = await repoSlots.readAll();
    const schedule = await repoSchedule.readAll();

    // Sponsors
    const repoSponsors = new SponsorRepository(this.config);
    const sponsors = await repoSponsors.readAll();

    // Team
    const repoTeam = new TeamRepository(this.config);
    const team = await repoTeam.readAll();

    // Info
    const repoInfo = new InfoRepository(this.config);
    const info = await repoInfo.readAll();

    return {
      sessions,
      speakers,
      categories,
      formats,
      rooms,
      slots,
      schedule,
      sponsors,
      team,
      info
    };
  }

  async saveAll(site: Site, force: boolean): Promise<void> {
    this.logger.info("save all");
    // Base
    const repoSessions = new SessionRepository(this.config);
    const repoSpeaker = new SpeakerRepository(this.config);
    const repoCategories = new CategoryRepository(this.config);
    const repoFormats = new FormatRepository(this.config);

    await repoSessions.saveAll(site.sessions, force);
    await repoSpeaker.saveAll(site.speakers, force);
    await repoCategories.saveAll(site.categories, force);
    await repoFormats.saveAll(site.formats, force);

    // Schedule
    const repoRooms = new RoomRepository(this.config);
    const repoSlots = new SlotRepository(this.config);
    const repoSchedule = new ScheduleRepository(this.config);

    await repoRooms.saveAll(site.rooms, force);
    await repoSlots.saveAll(site.slots, force);
    await repoSchedule.saveAll(site.schedule, force);

    // Sponsors
    const repoSponsors = new SponsorRepository(this.config);
    await repoSponsors.saveAll(site.sponsors, force);

    // Team
    const repoTeam = new TeamRepository(this.config);
    await repoTeam.saveAll(site.team, force);

    // Info
    const repoInfo = new InfoRepository(this.config);
    await repoInfo.saveAll(site.info, force);

    // Site as JSON
    const siteFile = path.join(this.config.siteDir, "static/api/site.json");
    await mkdir(path.dirname(siteFile), { recursive: true });
    await writeFile(siteFile, JSON.stringify(site, null, 2));
    return;
  }
}
