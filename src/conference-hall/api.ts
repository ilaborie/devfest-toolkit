import { Logger } from "plop-logger";
import { cli } from "cli-ux";

import { Event } from "./model/event";
import { fetchCache } from "../cache";
import { ConferenceHallConfig } from "../config";

const logger = Logger.getLogger("conference-hall.api");

export async function getEvent(config: ConferenceHallConfig): Promise<Event> {
  const { eventId, apiKey } = config;
  logger.info("Get event", eventId);
  cli.action.start("Fetching from conference-hall");
  const url = `https://conference-hall.io/api/v1/event/${eventId}?key=${apiKey}`;
  const result: Event = await fetchCache.get(url);
  cli.action.stop();
  logger.info("Event loaded", result.name);
  return result;
}

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
