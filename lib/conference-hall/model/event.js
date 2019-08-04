"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strings_1 = require("../../strings");
const logger_1 = require("../../logger");
const bridgeSpeaker_1 = require("../../bridge/bridgeSpeaker");
const logger = logger_1.Logger.getLogger("conference-hall.event");
function findSessionType(event, id) {
  const found = event.formats.find(elt => elt.id == id);
  return found ? strings_1.buildKey(found.name) : null;
}
function findCategoryKey(event, id) {
  const found = event.categories.find(elt => elt.id == id);
  return found ? strings_1.buildKey(found.name) : null;
}
function findSpeakerKey(event, id) {
  const found = event.speakers.find(elt => elt.uid == id);
  return found ? strings_1.buildKey(found.displayName || found.uid) : null;
}
function talkToSession(event, talk) {
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
  const key = strings_1.buildKey(talk.title);
  // type
  let type = findSessionType(event, formats);
  if (!type) {
    logger.warn(() => "Format not found", `talk ${key}, format: '${formats}'`);
    type = "";
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
    .filter(elt => elt !== null);
  const session = {
    id,
    key: strings_1.buildKey(talk.title),
    title,
    level,
    type,
    tags: category ? [category] : [],
    speakers: siteSpeakers,
    draft: !(state == "confirmed"),
    description: (abstract || "").trim(),
    videoId: "",
    presentation: ""
  };
  if (language) {
    session.language = language;
  }
  return session;
}
exports.talkToSession = talkToSession;
async function toSiteSpeaker(config, speaker) {
  const name = speaker.displayName || speaker.uid;
  const key = strings_1.buildKey(name);
  let siteSpeakerMissing = await bridgeSpeaker_1.bridgeSpeaker(config, key);
  const { isFeatured, company, city } = siteSpeakerMissing;
  const socials = [];
  if (speaker.twitter) {
    socials.push({
      icon: "twitter",
      link: `https://twitter.com/${strings_1.cleanSocialKey(speaker.twitter)}`,
      name: strings_1.cleanSocialKey(speaker.twitter)
    });
  }
  if (speaker.github) {
    socials.push({
      icon: "github",
      link: `https://github.com/${strings_1.cleanSocialKey(speaker.github)}`,
      name: strings_1.cleanSocialKey(speaker.github)
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
exports.toSiteSpeaker = toSiteSpeaker;
