import { Tool } from "./Tool";
import { Config } from "../config";
import {
  Event,
  talkToSession,
  toSiteSpeaker
} from "../conference-hall/model/event";
import { Talk, TalkStatus } from "../conference-hall/model/talk";
import { Session as SiteSession } from "../site/models/session";
import { Speaker as SiteSpeaker } from "../site/models/speaker";
import { Format as SiteFormat } from "../site/models/format";
import { Category as SiteCategory } from "../site/models/category";
import { SpeakerId } from "../conference-hall/model/speaker";
import { buildKey } from "../strings";
import { applyAllPatch } from "../patch";
import { Site } from "../site/models/site";
import { readFileCache } from "../cache";
import * as path from "path";
import { Room } from "../site/models/room";
import { Schedule } from "../site/models/schedule";
import { LocalSlot, toSiteSlot } from "../bridge/bridgeSchedule";
import { Sponsor } from "../site/models/sponsor";
import { Member } from "../site/models/member";
import { getEvent } from "../conference-hall/api";
import { compareKey } from "../site/models";
import { downloadToFile } from "../fs-utils";

export abstract class AbstractSiteTool extends Tool {
  protected async generateSessions(
    config: Config,
    event: Event
  ): Promise<{ site: SiteSession[]; talks: Talk[] }> {
    const keepStatus: TalkStatus[] = ["confirmed", "accepted"];
    const selected = event.talks.filter(talk =>
      keepStatus.includes(talk.state)
    );

    const sessions: SiteSession[] = selected.map(talk =>
      talkToSession(event, talk)
    );
    const patchedSession = await applyAllPatch(config, "sessions", sessions);
    patchedSession.sort(compareKey);
    this.logger.info("Found", () => `${patchedSession.length} session(s)`);
    return { talks: selected, site: patchedSession };
  }

  protected async generateSpeakers(
    config: Config,
    event: Event,
    talks: Talk[]
  ): Promise<SiteSpeaker[]> {
    const speakerIds: Set<SpeakerId> = talks.reduce((acc, session) => {
      session.speakers.forEach(id => acc.add(id));
      return acc;
    }, new Set<SpeakerId>());
    this.logger.info("Found", () => `${speakerIds.size} speaker(s)`);

    const speakersPromise: Promise<SiteSpeaker>[] = event.speakers
      .filter(speaker => speakerIds.has(speaker.uid))
      .map(speakers => toSiteSpeaker(config, speakers));

    const speakers = await Promise.all(speakersPromise);
    const result = await applyAllPatch(config, "speakers", speakers);
    result.sort(compareKey);

    const withPhoto = result.map(speaker =>
      AbstractSiteTool.downloadPhoto(config, speaker)
    );
    return await Promise.all(withPhoto);
  }

  private static async downloadPhoto(
    config: Config,
    speaker: SiteSpeaker
  ): Promise<SiteSpeaker> {
    try {
      if (!speaker.photoURL) {
        return speaker;
      }
      const imgDest = path.join(
        config.siteDir,
        "static",
        "images",
        "speakers",
        speaker.key
      );
      const file = await downloadToFile(speaker.photoURL, imgDest);
      const photoURL = ["", "images", "speakers", file].join("/");
      return { ...speaker, photoURL };
    } catch (_) {
      return speaker;
    }
  }

  protected async generateCategories(
    config: Config,
    event: Event
  ): Promise<SiteCategory[]> {
    const categories = event.categories.map(c => {
      const { id, name, description } = c;
      const key = buildKey(c.name);
      return { key, name, description, id };
    });
    this.logger.info("Found", () => `${categories.length} categories`);
    const result = await applyAllPatch(config, "categories", categories);
    result.sort(compareKey);
    return result;
  }

  protected async generateFormats(
    config: Config,
    event: Event
  ): Promise<SiteFormat[]> {
    const formats = event.formats.map(f => {
      const { id, name, description } = f;
      const key = buildKey(f.name);
      return { key, name, description, id };
    });
    this.logger.info("Found", () => `${formats.length} format(s)`);
    const result = await applyAllPatch(config, "formats", formats);
    result.sort(compareKey);
    return result;
  }

  protected async generateDataFromEvent(
    config: Config,
    event: Event
  ): Promise<Partial<Site>> {
    const { site: sessions, talks } = await this.generateSessions(
      config,
      event
    );
    const speakers = await this.generateSpeakers(config, event, talks);
    const categories = await this.generateCategories(config, event);
    const formats = await this.generateFormats(config, event);
    return { sessions, speakers, categories, formats };
  }

  protected async generateSchedule(config: Config): Promise<Partial<Site>> {
    // Rooms
    const roomsFile = path.join(config.addonDir, "rooms.json");
    const rooms = await readFileCache.getAsJson<Room[]>(roomsFile);
    this.logger.info("Found", () => `${rooms.length} room(s)`);

    // Slots
    const slotsFile = path.join(config.addonDir, "slots.json");
    const slotBases = await readFileCache.getAsJson<LocalSlot[]>(slotsFile);
    const slots = toSiteSlot(slotBases);
    this.logger.info("Found", () => `${slots.length} slot(s)`);

    // schedule
    const scheduleFile = path.join(config.addonDir, "schedule.json");
    const schedule = await readFileCache.getAsJson<Schedule>(scheduleFile);
    this.logger.info("Found some schedule", () => `${schedule.length} day(s)`);

    return { rooms, slots, schedule };
  }

  protected async generateSponsors(config: Config): Promise<Sponsor[]> {
    const sponsorsFile = path.join(config.addonDir, "sponsors.json");
    const sponsors = await readFileCache.getAsJson<Sponsor[]>(sponsorsFile);
    this.logger.info("Found", () => `${sponsors.length} sponsor(s)`);
    sponsors.sort(compareKey);
    return sponsors;
  }

  protected async generateTeam(config: Config): Promise<Member[]> {
    const teamFile = path.join(config.addonDir, "team.json");
    const team = await readFileCache.getAsJson<Member[]>(teamFile);
    this.logger.info("Found", () => `${team.length} member(s)`);
    team.sort(compareKey);
    return team;
  }

  protected async generateSite(config: Config): Promise<Site> {
    const id = config.eventId;

    const event = await getEvent(config);
    const { name, address, conferenceDates: dates } = event;
    const info = { id, name, address, dates };

    const {
      sessions,
      speakers,
      categories,
      formats
    } = await this.generateDataFromEvent(config, event);
    const { rooms, slots, schedule } = await this.generateSchedule(config);
    const sponsors = await this.generateSponsors(config);
    const team = await this.generateTeam(config);

    return {
      info,
      sessions: sessions || [],
      speakers: speakers || [],
      categories: categories || [],
      formats: formats || [],
      rooms: rooms || [],
      slots: slots || [],
      schedule: schedule || [],
      sponsors,
      team
    };
  }
}
