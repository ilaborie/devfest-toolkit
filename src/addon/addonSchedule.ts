import { Logger } from "plop-logger";

import { Slot, SlotKey } from "../site/models/slot";
import { Time, timePlusDuration } from "../times";
import { AddOnConfig } from "../config";
import { Site } from "../site/models/site";
import * as path from "path";
import { readFileCache } from "../cache";
import { Room } from "../site/models/room";
import { Schedule } from "../site/models/schedule";

export interface LocalSlot {
  key: SlotKey;
  start: string;
  duration: number;
  weight: number;
}

class MapRow {
  private map = new Map<Time, number>();
  private logger: Logger = Logger.getLogger("addon.schedule.slot");

  private update(
    time: Time,
    start: number,
    duration: number,
    weight: number
  ): void {
    // start
    if (start === -1) {
      throw new Error(`Invalid start '${start}' for time ${time}`);
    }
    if (!this.map.has(time)) {
      this.logger.debug(() => `Update start for ${time}`, start);
      this.map.set(time, start);
    } else if (this.map.get(time) !== start) {
      throw new Error(
        `Invalid start '${start}' for time ${time}, should be ${this.map.get(
          time
        )}`
      );
    }
    // end
    const next = timePlusDuration(time, duration);
    const end = start + weight;
    if (!this.map.has(next)) {
      this.logger.debug(() => `Update end for ${next}`, end);
      this.map.set(next, end);
    } else if (this.map.get(next) !== end) {
      throw new Error(
        `Invalid end '${end}' for time ${next}, should be ${this.map.get(next)}`
      );
    }
  }

  getRowStart(time: Time, duration: number, weight: number): number {
    let start = -1;
    if (this.map.size == 0) {
      this.logger.trace("no data yet");
      start = 1;
    } else if (this.map.has(time)) {
      const cacheValue = this.map.get(time);
      this.logger.trace(() => `found cached start for ${time}`, cacheValue);
      start = cacheValue || 1;
    } else {
      const times = Array.from(this.map.keys());
      times.sort();
      this.logger.trace(
        () => `lookup ${time}`,
        () => times.reduce((acc, elt) => acc + ", " + elt, "")
      );
      start = times.reduce(
        (acc, elt) => (elt < time ? (this.map.get(elt) || 0) + 1 : acc),
        -1
      );
      this.logger.debug(() => `start not found for ${time}, use`, start);
    }
    this.update(time, start, duration, weight);
    return start;
  }
}

function toSiteSlot(input: LocalSlot[]): Slot[] {
  const mapRow = new MapRow();

  return input.map(local => {
    const { key, start, duration, weight } = local;
    const rowStart = mapRow.getRowStart(start, duration, weight);
    const end = rowStart + weight;
    return { key, start, duration, row: { start: rowStart, end } };
  });
}

export async function loadSchedule(
  config: AddOnConfig
): Promise<Pick<Site, "rooms" | "slots" | "schedule">> {
  const logger = Logger.getLogger("addon.schedule");

  // Rooms
  const roomsFile = path.join(config.addonDir, "rooms.json");
  const rooms = await readFileCache.getAsJson<Room[]>(roomsFile);
  logger.info("Found", () => `${rooms.length} room(s)`);

  // Slots
  const slotsFile = path.join(config.addonDir, "slots.json");
  const slotBases = await readFileCache.getAsJson<LocalSlot[]>(slotsFile);
  const slots = toSiteSlot(slotBases);
  logger.info("Found", () => `${slots.length} slot(s)`);

  // schedule
  const scheduleFile = path.join(config.addonDir, "schedule.json");
  const schedule = await readFileCache.getAsJson<Schedule>(scheduleFile);
  logger.info("Found some schedule", () => `${schedule.length} day(s)`);

  return { rooms, slots, schedule };
}
