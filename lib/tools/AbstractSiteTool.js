"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Tool_1 = require("./Tool");
const event_1 = require("../conference-hall/model/event");
const strings_1 = require("../strings");
const patch_1 = require("../patch");
const cache_1 = require("../cache");
const path = tslib_1.__importStar(require("path"));
const bridgeSchedule_1 = require("../bridge/bridgeSchedule");
const api_1 = require("../conference-hall/api");
const models_1 = require("../site/models");
class AbstractSiteTool extends Tool_1.Tool {
  async generateSessions(config, event) {
    const keepStatus = ["confirmed", "accepted"];
    const selected = event.talks.filter(talk =>
      keepStatus.includes(talk.state)
    );
    const sessions = selected.map(talk => event_1.talkToSession(event, talk));
    let patchedSession = await patch_1.applyAllPatch(
      config,
      "sessions",
      sessions
    );
    patchedSession.sort(models_1.compareKey);
    this.logger.info("Found", () => `${patchedSession.length} session(s)`);
    return { talks: selected, site: patchedSession };
  }
  async generateSpeakers(config, event, talks) {
    const speakerIds = talks.reduce((acc, session) => {
      session.speakers.forEach(id => acc.add(id));
      return acc;
    }, new Set());
    this.logger.info("Found", () => `${speakerIds.size} speaker(s)`);
    const speakersPromise = event.speakers
      .filter(speaker => speakerIds.has(speaker.uid))
      .map(speakers => event_1.toSiteSpeaker(config, speakers));
    const speakers = await Promise.all(speakersPromise);
    const result = await patch_1.applyAllPatch(config, "speakers", speakers);
    result.sort(models_1.compareKey);
    return result;
  }
  async generateCategories(config, event) {
    const categories = event.categories.map(c => {
      const key = strings_1.buildKey(c.name);
      return Object.assign({}, c, { key });
    });
    this.logger.info("Found", () => `${categories.length} categories`);
    const result = await patch_1.applyAllPatch(
      config,
      "categories",
      categories
    );
    result.sort(models_1.compareKey);
    return result;
  }
  async generateFormats(config, event) {
    const formats = event.formats.map(f => {
      const key = strings_1.buildKey(f.name);
      return Object.assign({}, f, { key });
    });
    this.logger.info("Found", () => `${formats.length} format(s)`);
    const result = await patch_1.applyAllPatch(config, "formats", formats);
    result.sort(models_1.compareKey);
    return result;
  }
  async generateDataFromEvent(config, event) {
    const { site: sessions, talks } = await this.generateSessions(
      config,
      event
    );
    const speakers = await this.generateSpeakers(config, event, talks);
    const categories = await this.generateCategories(config, event);
    const formats = await this.generateFormats(config, event);
    return { sessions, speakers, categories, formats };
  }
  async generateSchedule(config) {
    // Rooms
    const roomsFile = path.join(config.addonDir, "rooms.json");
    const rooms = await cache_1.readFileCache.getAsJson(roomsFile);
    this.logger.info("Found", () => `${rooms.length} room(s)`);
    // Slots
    const slotsFile = path.join(config.addonDir, "slots.json");
    const slotBases = await cache_1.readFileCache.getAsJson(slotsFile);
    const slots = bridgeSchedule_1.toSiteSlot(slotBases);
    this.logger.info("Found", () => `${slots.length} slot(s)`);
    // schedule
    const scheduleFile = path.join(config.addonDir, "schedule.json");
    const schedule = await cache_1.readFileCache.getAsJson(scheduleFile);
    this.logger.info("Found some schedule", () => `${schedule.length} day(s)`);
    return { rooms, slots, schedule };
  }
  async generateSponsors(config) {
    const sponsorsFile = path.join(config.addonDir, "sponsors.json");
    const sponsors = await cache_1.readFileCache.getAsJson(sponsorsFile);
    this.logger.info("Found", () => `${sponsors.length} sponsor(s)`);
    sponsors.sort(models_1.compareKey);
    return sponsors;
  }
  async generateTeam(config) {
    const teamFile = path.join(config.addonDir, "team.json");
    const team = await cache_1.readFileCache.getAsJson(teamFile);
    this.logger.info("Found", () => `${team.length} member(s)`);
    team.sort(models_1.compareKey);
    return team;
  }
  async generateSite(config) {
    const id = config.eventId;
    const event = await api_1.getEvent(config);
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
exports.AbstractSiteTool = AbstractSiteTool;
