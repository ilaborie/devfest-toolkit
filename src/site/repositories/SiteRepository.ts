import * as path from "path";
import { Logger } from "plop-logger";
// @ts-ignore
import ICAL from "ical.js";

import { createParentDir, writeFile } from "../../fs-utils";
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
import { timePlusDuration } from "../../times";

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

  private generateICal(site: Site): any {
    const vcalendar = new ICAL.Component(["vcalendar", [], []]);
    vcalendar.addPropertyWithValue("version", "2.0");
    vcalendar.addPropertyWithValue("proid", `-//Devfest/${site.info.name}//FR`);
    vcalendar.addPropertyWithValue("x-wr-calDesc", site.info.name);
    vcalendar.addPropertyWithValue("x-wr-calName", site.info.name);
    vcalendar.addPropertyWithValue("x-wr-timezone", "Europe/Paris");
    //
    site.schedule.forEach(scheduleDay => {
      const { day } = scheduleDay;
      for (const scheduleRoom of scheduleDay.rooms) {
        const room = site.rooms.find(room => room.key === scheduleRoom.room);
        const roomLabel = room ? room.label : scheduleRoom.room;
        for (const slot of scheduleRoom.slots) {
          const session = site.sessions.find(
            session => session.key === slot.talk
          );
          const st = site.slots.find(s => s.key === slot.slot);
          if (session && st && session.speakers.length > 0) {
            const vevent = new ICAL.Component("vevent");
            const event = new ICAL.Event(vevent);

            event.description = session.description;
            event.startDate = ICAL.Time.fromDateTimeString(
              `${day}T${st.start}:00`
            );
            event.endDate = ICAL.Time.fromDateTimeString(
              `${day}T${timePlusDuration(st.start, st.duration)}:00`
            );
            event.duration = new ICAL.Duration({ minutes: st.duration });
            event.location = roomLabel;
            event.summary = session.title;
            event.uid = session.id || session.key;

            vevent.addPropertyWithValue(
              "url",
              `https://devfesttoulouse.fr/sessions/${session.key}`
            );
            vevent.addPropertyWithValue("transp", "TRANSPARENT");
            if (session.tags.length > 0) {
              vevent.addPropertyWithValue("categories", session.tags[0]);
            }
            vcalendar.addSubcomponent(vevent);
          }
        }
      }
    });

    return vcalendar;
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
    const siteFile = path.join(
      this.config.siteDir,
      "static",
      "api",
      "site.json"
    );
    await createParentDir(siteFile);
    await writeFile(siteFile, JSON.stringify(site, null, 2));

    // Generate iCal
    const icalFile = path.join(
      this.config.siteDir,
      "static",
      "schedule",
      "schedule.ics"
    );
    await createParentDir(icalFile);
    const ical = this.generateICal(site);
    await writeFile(icalFile, ical.toString());
    return;
  }
}
