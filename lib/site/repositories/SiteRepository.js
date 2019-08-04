"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const logger_1 = require("../../logger");
const fs_utils_1 = require("../../fs-utils");
const index_1 = require("./index");
class SiteRepository {
  constructor(config) {
    this.config = config;
    this.logger = logger_1.Logger.getLogger("site.repo.site");
  }
  async readAll() {
    this.logger.info("read all", this.config);
    // Base
    const repoSessions = new index_1.SessionRepository(this.config);
    const repoSpeaker = new index_1.SpeakerRepository(this.config);
    const repoCategories = new index_1.CategoryRepository(this.config);
    const repoFormats = new index_1.FormatRepository(this.config);
    const sessions = await repoSessions.readAll();
    const speakers = await repoSpeaker.readAll();
    const categories = await repoCategories.readAll();
    const formats = await repoFormats.readAll();
    // Schedule
    const repoRooms = new index_1.RoomRepository(this.config);
    const repoSlots = new index_1.SlotRepository(this.config);
    const repoSchedule = new index_1.ScheduleRepository(this.config);
    const rooms = await repoRooms.readAll();
    const slots = await repoSlots.readAll();
    const schedule = await repoSchedule.readAll();
    // Sponsors
    const repoSponsors = new index_1.SponsorRepository(this.config);
    const sponsors = await repoSponsors.readAll();
    // Team
    const repoTeam = new index_1.TeamRepository(this.config);
    const team = await repoTeam.readAll();
    // Info
    const repoInfo = new index_1.InfoRepository(this.config);
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
  async saveAll(site, force) {
    this.logger.info("save all");
    // Base
    const repoSessions = new index_1.SessionRepository(this.config);
    const repoSpeaker = new index_1.SpeakerRepository(this.config);
    const repoCategories = new index_1.CategoryRepository(this.config);
    const repoFormats = new index_1.FormatRepository(this.config);
    await repoSessions.saveAll(site.sessions, force);
    await repoSpeaker.saveAll(site.speakers, force);
    await repoCategories.saveAll(site.categories, force);
    await repoFormats.saveAll(site.formats, force);
    // Schedule
    const repoRooms = new index_1.RoomRepository(this.config);
    const repoSlots = new index_1.SlotRepository(this.config);
    const repoSchedule = new index_1.ScheduleRepository(this.config);
    await repoRooms.saveAll(site.rooms, force);
    await repoSlots.saveAll(site.slots, force);
    await repoSchedule.saveAll(site.schedule, force);
    // Sponsors
    const repoSponsors = new index_1.SponsorRepository(this.config);
    await repoSponsors.saveAll(site.sponsors, force);
    // Team
    const repoTeam = new index_1.TeamRepository(this.config);
    await repoTeam.saveAll(site.team, force);
    // Info
    const repoInfo = new index_1.InfoRepository(this.config);
    await repoInfo.saveAll(site.info, force);
    // Site as JSON
    const siteFile = path.join(this.config.siteDir, "static/api/site.json");
    await fs_utils_1.mkdir(path.dirname(siteFile), { recursive: true });
    await fs_utils_1.writeFile(siteFile, JSON.stringify(site, null, 2));
    return;
  }
}
exports.SiteRepository = SiteRepository;
