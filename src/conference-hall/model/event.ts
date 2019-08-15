import { Logger } from "plop-logger";

import { Category, CategoryId } from "./category";
import { Format, FormatId } from "./format";
import { Talk } from "./talk";
import { Speaker, SpeakerId } from "./speaker";
import { buildKey, cleanSocialKey, compareString } from "../../strings";
import { Session as SiteSession } from "../../site/models/session";
import { Speaker as SiteSpeaker, SpeakerKey } from "../../site/models/speaker";
import { bridgeSpeaker } from "../../bridge/bridgeSpeaker";
import { Socials } from "../../site/models/socials";
import { AddOnConfig } from "../../config";

export type EventId = string;

export interface Name {
  long_name: string;
  short_name: string;
}

export interface Geoloc {
  lat: number;
  lng: number;
}

export interface Address {
  formattedAddress: string;
  locality: Name;
  country: Name;
  latLng: Geoloc;
}

export interface ConferenceDates {
  start: string; // ISO date
  end: string; // ISO date
}

export interface Event {
  id: EventId;
  name: string;
  categories: Category[];
  formats: Format[];
  address: Address;
  conferenceDates: ConferenceDates;
  talks: Talk[];
  speakers: Speaker[];
}

const logger = Logger.getLogger("conference-hall.event");

function findSessionFormat(event: Event, id: FormatId): string | null {
  const found = event.formats.find(elt => elt.id == id);
  return found ? buildKey(found.name) : null;
}

function findCategoryKey(event: Event, id: CategoryId): string | null {
  const found = event.categories.find(elt => elt.id == id);
  return found ? buildKey(found.name) : null;
}

function findSpeakerKey(event: Event, id: SpeakerId): string | null {
  const found = event.speakers.find(elt => elt.uid == id);
  return found ? buildKey(found.displayName || found.uid) : null;
}

export function talkToSession(event: Event, talk: Talk): SiteSession {
  const {
    id,
    title,
    state,
    level,
    abstract,
    categories,
    formats,
    speakers,
    language
  } = talk;
  const key = buildKey(talk.title);

  // type
  let format = findSessionFormat(event, formats);
  if (!format) {
    logger.warn(() => "Format not found", `talk ${key}, format: '${formats}'`);
    format = "";
  }

  // category
  const category = findCategoryKey(event, categories);
  if (!category) {
    logger.warn(
      () => "Category not found",
      `talk ${key}, category: '${categories}'`
    );
  }

  // speaker
  const siteSpeakers = speakers
    .map(id => {
      const speaker = findSpeakerKey(event, id);
      if (!speaker) {
        logger.warn(() => "Speaker not found", `talk ${key}, speaker: '${id}'`);
      }
      return speaker;
    })
    .filter(elt => elt !== null) as SpeakerKey[];
  siteSpeakers.sort(compareString);

  const session: SiteSession = {
    id,
    key: buildKey(talk.title),
    title,
    level,
    format,
    tags: category ? [category] : [],
    speakers: siteSpeakers,
    draft: !(state == "confirmed"),
    description: (abstract || "").trim(),
    videoId: null,
    presentation: null
  };
  if (language) {
    session.language = language;
  }
  return session;
}

export async function toSiteSpeaker(
  config: AddOnConfig,
  speaker: Speaker
): Promise<SiteSpeaker> {
  const name = speaker.displayName || speaker.uid;
  const key = buildKey(name);

  const siteSpeakerMissing = await bridgeSpeaker(config, key);
  const { isFeatured, company, city } = siteSpeakerMissing;
  const socials: Socials = [];
  if (speaker.twitter) {
    socials.push({
      icon: "twitter",
      link: `https://twitter.com/${cleanSocialKey(speaker.twitter)}`,
      name: cleanSocialKey(speaker.twitter)
    });
  }
  if (speaker.github) {
    socials.push({
      icon: "github",
      link: `https://github.com/${cleanSocialKey(speaker.github)}`,
      name: cleanSocialKey(speaker.github)
    });
  }
  return {
    key,
    id: speaker.uid,
    feature: isFeatured,
    name,
    company,
    city,
    photoURL: speaker.photoURL,
    socials,
    description: (speaker.bio || "").trim()
  };
}
