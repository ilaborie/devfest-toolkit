import { Members } from "./member";
import { Rooms } from "./room";
import { Schedule } from "./schedule";
import { Slots } from "./slot";
import { Sessions } from "./session";
import { Speakers } from "./speaker";
import { Sponsors } from "./sponsor";
import { Category } from "./category";
import { Format } from "./format";
import {
  Address,
  ConferenceDates,
  EventId
} from "../../conference-hall/model/event";
import {
  ok,
  ValidationResult,
  ValidationService,
  warn
} from "../../validation";

export interface SiteInfo {
  id: EventId;
  name: string;
  address: Address;
  dates: ConferenceDates;
}

export interface Site {
  info: SiteInfo;

  sessions: Sessions;
  speakers: Speakers;
  categories: Category[];
  formats: Format[];

  rooms: Rooms;
  slots: Slots;
  schedule: Schedule;

  team: Members;
  sponsors: Sponsors;
}

// Validation

class SiteValidator extends ValidationService<Site> {
  constructor() {
    super("site");
  }

  validate(site: Site): ValidationResult<Site>[] {
    this.logger.info("Validate site", site.info.name);
    return [...this.validateSession(site), ...this.validateSchedule(site)];
  }

  private validateSession(site: Site): ValidationResult<Site>[] {
    const res = site.sessions
      .map(session => {
        const result: ValidationResult<Site>[] = [];
        // speakers
        session.speakers.forEach(speaker => {
          if (!site.speakers.some(it => it.key === speaker)) {
            result.push(warn<Site>("sessions", "Unknown speaker", speaker));
          }
        });

        // categories
        session.tags.forEach(cat => {
          if (!site.categories.some(it => it.key === cat)) {
            result.push(warn<Site>("sessions", "Unknown category", cat));
          }
        });

        // format
        if (!site.formats.some(it => it.key === session.type)) {
          result.push(warn<Site>("sessions", "Unknown format", session.type));
        }

        return result;
      })
      .flat();
    return res.length ? res : [ok<Site>("schedule", "✅ sessions")];
  }

  private validateSchedule(site: Site): ValidationResult<Site>[] {
    const res = site.schedule
      .map(day =>
        day.rooms
          .map(schRoom => {
            const result: ValidationResult<Site>[] = [];
            // check rooms
            if (!site.rooms.some(it => it.key === schRoom.room)) {
              result.push(warn<Site>("schedule", "Unknown room", schRoom.room));
            }
            schRoom.slots.forEach(slotTalk => {
              // check slot
              if (!site.slots.some(it => it.key == slotTalk.slot)) {
                result.push(
                  warn<Site>("schedule", "Unknown slot", slotTalk.slot)
                );
              }
              // check sessions
              if (!site.sessions.some(it => it.key == slotTalk.talk)) {
                result.push(
                  warn<Site>("schedule", "Unknown session", slotTalk.talk)
                );
              }
            });
            return result;
          })
          .flat()
      )
      .flat();
    return res.length ? res : [ok<Site>("schedule", "✅ schedule")];
  }
}

export const siteValidator = new SiteValidator();
