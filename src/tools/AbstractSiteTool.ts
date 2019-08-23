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
import { loadSchedule } from "../addon/addonSchedule";
import { Member } from "../site/models/member";
import { getEvent } from "../conference-hall/api";
import { compareKey } from "../site/models";
import { downloadToFile } from "../fs-utils";
import { loadSponsors } from "../addon/addonSponsor";
import { loadExtraSessions } from "../addon/addonSession";
import { loadExtraSpeakers } from "../addon/addonSpeaker";

export abstract class AbstractSiteTool extends Tool {
  protected async generateSessions(
    config: Config,
    event: Event
  ): Promise<{ site: SiteSession[]; talks: Talk[] }> {
    const keepStatus: TalkStatus[] = ["confirmed", "accepted"];
    const selected = event.talks.filter(talk =>
      keepStatus.includes(talk.state)
    );

    const baseSessions = selected.map(talk => talkToSession(event, talk));
    const extraSessions = await loadExtraSessions(config);
    const sessions = [...baseSessions, ...extraSessions];

    const patchedSession = await applyAllPatch(config, "sessions", sessions);
    const result = patchedSession.map(session => {
      const {
        key,
        title,
        id,
        language,
        format,
        tags,
        level,
        speakers,
        videoId,
        presentation,
        draft,
        description
      } = session;
      return {
        key,
        title,
        id,
        language,
        format,
        tags,
        level,
        speakers,
        videoId,
        presentation,
        draft,
        description
      };
    });
    result.sort(compareKey);

    this.logger.info("Found", () => `${result.length} session(s)`);
    return { talks: selected, site: result };
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

    const baseSpeakers: SiteSpeaker[] = event.speakers
      .filter(speaker => speakerIds.has(speaker.uid))
      .map(speaker => toSiteSpeaker(speaker));
    const extraSpeakers = await loadExtraSpeakers(config);
    const speakers = [...baseSpeakers, ...extraSpeakers];

    const patched = await applyAllPatch(config, "speakers", speakers);
    const result = patched.map(speaker => {
      const {
        key,
        name,
        id,
        feature,
        company,
        city,
        photoURL,
        socials,
        draft,
        description
      } = speaker;
      return {
        key,
        name,
        id,
        feature,
        company,
        city,
        photoURL,
        socials,
        draft,
        description
      };
    });
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
      const { id, name } = c;
      const key = buildKey(c.name);
      return { key, name, id };
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
      const { id, name } = f;
      const key = buildKey(f.name);
      return { key, name, id };
    });
    this.logger.info("Found", () => `${formats.length} format(s)`);
    const result = await applyAllPatch(config, "formats", formats);
    result.sort(compareKey);
    return result;
  }

  protected async generateDataFromEvent(
    config: Config,
    event: Event
  ): Promise<Pick<Site, "sessions" | "speakers" | "categories" | "formats">> {
    const { site: sessions, talks } = await this.generateSessions(
      config,
      event
    );
    const speakers = await this.generateSpeakers(config, event, talks);
    const categories = await this.generateCategories(config, event);
    const formats = await this.generateFormats(config, event);
    return { sessions, speakers, categories, formats };
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
    const { formattedAddress, locality, country, latLng } = address;
    const { short_name, long_name } = locality;
    const { lat, lng } = latLng;
    const { start, end } = dates;
    const info = {
      id,
      name,
      address: {
        formattedAddress,
        locality: { short_name, long_name },
        country: {
          short_name: country.short_name,
          long_name: country.long_name
        },
        latLng: { lat, lng }
      },
      dates: { start, end }
    };

    const {
      sessions,
      speakers,
      categories,
      formats
    } = await this.generateDataFromEvent(config, event);
    const { rooms, slots, schedule } = await loadSchedule(config);
    const sponsors = await loadSponsors(config);
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
