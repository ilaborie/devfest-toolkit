"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../cache");
const logger_1 = require("../logger");
const logger = logger_1.Logger.getLogger("conference-hall.api");
async function getEvent(config) {
  const { eventId, apiKey } = config;
  logger.info("Get event", eventId);
  const url = `https://conference-hall.io/api/v1/event/${eventId}?key=${apiKey}`;
  let result = await cache_1.fetchCache.get(url);
  logger.info("Event loaded", result.name);
  return result;
}
exports.getEvent = getEvent;
// Export api require auth bearer to work
// export function exportEvent(config: ApiConfiguration, bearer: string): Promise<Event> {
//     const {eventId} = config;
//     const sortOrder = 'newest';
//     const state = 'submitted';
//     const search = '';
//     const output = 'json';
//     const url = `https://conference-hall.io/api/private/export/${eventId}?`;
//
// }
