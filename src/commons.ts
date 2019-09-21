import { Command, flags } from "@oclif/command";
import { Logger, LoggerLevels } from "plop-logger";
import { canRead, downloadToFile } from "./fs-utils";
import { readFileSync } from "fs";
import { Config } from "./config";
import {
  Event,
  talkToSession,
  toSiteSpeaker
} from "./conference-hall/model/event";
import {
  Session,
  Session as SiteSession,
  SessionKey
} from "./site/models/session";
import { Talk, TalkStatus } from "./conference-hall/model/talk";
import { loadExtraSessions } from "./addon/addonSession";
import { applyAllPatch } from "./patch";
import { compareKey } from "./site/models";
import { Speaker as SiteSpeaker } from "./site/models/speaker";
import { SpeakerId } from "./conference-hall/model/speaker";
import { loadExtraSpeakers } from "./addon/addonSpeaker";
import * as path from "path";
import { Category as SiteCategory } from "./site/models/category";
import { buildKey } from "./strings";
import { Format as SiteFormat } from "./site/models/format";
import { Site } from "./site/models/site";
import { Member } from "./site/models/member";
import { readFileCache } from "./cache";
import { getEvent } from "./conference-hall/api";
import { loadSchedule } from "./addon/addonSchedule";
import { loadSponsors } from "./addon/addonSponsor";
import { colorEmojiConfig } from "plop-logger/lib/extra/colorEmojiConfig";
import { Slot, SlotKey } from "./site/models/slot";

function readLoggerLevels(): LoggerLevels {
  if (canRead("logger.json")) {
    const data = readFileSync("logger.json", "UTF-8");
    return JSON.parse(data) as LoggerLevels;
  } else {
    return {};
  }
}

export const loggerLevels: LoggerLevels = readLoggerLevels();

export const commonsFlags: flags.Input<any> = {
  eventId: flags.string({
    description: "the event id in conference hall",
    required: true
  }),
  apiKey: flags.string({
    description: "the conference hall api key",
    required: true
  }),
  siteDir: flags.string({
    description: "the conference hall api key",
    required: true
  }),
  patchDir: flags.string({
    description: "the patch directory",
    default: "./patches"
  }),
  addonDir: flags.string({
    description: "the add-on directory",
    default: "./add-on"
  })
};

export abstract class DevfestToolkitCommand extends Command {
  // Logger
  private _logger: Logger | null = null;
  get logger(): Logger {
    if (this._logger === null) {
      this._logger = Logger.getLogger("main");
    }
    return this._logger;
  }

  abstract configuration: Config;

  async run(): Promise<void> {
    Logger.config = {
      ...colorEmojiConfig,
      levels: loggerLevels
    };

    await this.runWithConfig(this.configuration);

    this.logger.info("✅ all done");
  }

  abstract async runWithConfig(config: Config): Promise<any>;
}

export async function generateSessions(
  logger: Logger,
  config: Config,
  event: Event
): Promise<{ site: SiteSession[]; talks: Talk[] }> {
  const keepStatus: TalkStatus[] = ["confirmed", "accepted"];
  const selected = event.talks.filter(talk => keepStatus.includes(talk.state));

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

  logger.info("Found", () => `${result.length} session(s)`);
  return { talks: selected, site: result };
}

export async function generateSpeakers(
  logger: Logger,
  config: Config,
  event: Event,
  talks: Talk[]
): Promise<SiteSpeaker[]> {
  const speakerIds: Set<SpeakerId> = talks.reduce((acc, session) => {
    session.speakers.forEach(id => acc.add(id));
    return acc;
  }, new Set<SpeakerId>());
  logger.info("Found", () => `${speakerIds.size} speaker(s)`);

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

  const withPhoto = result.map(speaker => downloadPhoto(config, speaker));
  return await Promise.all(withPhoto);
}

async function downloadPhoto(
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

export async function generateCategories(
  logger: Logger,
  config: Config,
  event: Event
): Promise<SiteCategory[]> {
  const categories = event.categories.map(c => {
    const { id, name } = c;
    const key = buildKey(c.name);
    return { key, name, id };
  });
  logger.info("Found", () => `${categories.length} categories`);
  const result = await applyAllPatch(config, "categories", categories);
  result.sort(compareKey);
  return result;
}

export async function generateFormats(
  logger: Logger,
  config: Config,
  event: Event
): Promise<SiteFormat[]> {
  const formats = event.formats.map(f => {
    const { id, name } = f;
    const key = buildKey(f.name);
    return { key, name, id };
  });
  logger.info("Found", () => `${formats.length} format(s)`);
  const result = await applyAllPatch(config, "formats", formats);
  result.sort(compareKey);
  return result;
}

export async function generateDataFromEvent(
  logger: Logger,
  config: Config,
  event: Event
): Promise<Pick<Site, "sessions" | "speakers" | "categories" | "formats">> {
  const { site: sessions, talks } = await generateSessions(
    logger,
    config,
    event
  );
  const speakers = await generateSpeakers(logger, config, event, talks);
  const categories = await generateCategories(logger, config, event);
  const formats = await generateFormats(logger, config, event);
  return { sessions, speakers, categories, formats };
}

export async function generateTeam(
  logger: Logger,
  config: Config
): Promise<Member[]> {
  const teamFile = path.join(config.addonDir, "team.json");
  const team = await readFileCache.getAsJson<Member[]>(teamFile);
  logger.info("Found", () => `${team.length} member(s)`);
  team.sort(compareKey);
  return team;
}

export async function generateSite(
  logger: Logger,
  config: Config
): Promise<Site> {
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
  } = await generateDataFromEvent(logger, config, event);
  const { rooms, slots, schedule } = await loadSchedule(config);
  const sponsors = await loadSponsors(config);
  const team = await generateTeam(logger, config);

  const site = {
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

  // FIXME compute OfficeHours
  site.sessions
    .filter(it => it.tags.includes("office-hours"))
    .forEach(ohSession => computeOfficeHour(ohSession, site));

  return site;
}

function findSlotForSessions(key: SessionKey, site: Site): Slot | null {
  for (const day of site.schedule) {
    for (const room of day.rooms) {
      for (const slot of room.slots) {
        if (slot.talk == key) {
          return site.slots.find(it => it.key == slot.slot) || null;
        }
      }
    }
  }
  return null;
}

function findSessionsForSlot(key: SlotKey, site: Site): SessionKey[] {
  const result: SessionKey[] = [];
  for (const day of site.schedule) {
    for (const room of day.rooms) {
      for (const slot of room.slots) {
        if (slot.slot == key) {
          result.push(slot.talk);
        }
      }
    }
  }
  return result;
}

const computeOfficeHour = (ohSession: Session, site: Site): void => {
  const ohSlot = findSlotForSessions(ohSession.key, site);
  if (ohSlot) {
    const relatedSessions: SessionKey[] = site.slots
      // find previous slot
      .filter(it => it.row.end === ohSlot.row.start)
      // find sessions for slot
      .map(it => findSessionsForSlot(it.key, site))
      .flat(1);
    const sessions = site.sessions.filter(it =>
      relatedSessions.includes(it.key)
    );

    ohSession.officeHours = relatedSessions;
    ohSession.speakers = sessions.map(it => it.speakers).flat(1);
    ohSession.description =
      "Venez poser vos questions aux speakers de manière plus calme et détendue.\n\n" +
      site.sessions
        .filter(it => relatedSessions.includes(it.key))
        .map(it => `* [${it.title}](../${it.key})`)
        .join("\n");
  }
};
