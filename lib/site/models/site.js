"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../validation");
// Validation
class SiteValidator extends validation_1.ValidationService {
  constructor() {
    super("site");
  }
  validate(site) {
    this.logger.info("Validate site", site.info.name);
    return [...this.validateSession(site), ...this.validateSchedule(site)];
  }
  validateSession(site) {
    const res = site.sessions
      .map(session => {
        const result = [];
        // speakers
        session.speakers.forEach(speaker => {
          if (!site.speakers.some(it => it.key === speaker)) {
            result.push(
              validation_1.warn("sessions", "Unknown speaker", speaker)
            );
          }
        });
        // categories
        session.tags.forEach(cat => {
          if (!site.categories.some(it => it.key === cat)) {
            result.push(validation_1.warn("sessions", "Unknown category", cat));
          }
        });
        // format
        if (!site.formats.some(it => it.key === session.type)) {
          result.push(
            validation_1.warn("sessions", "Unknown format", session.type)
          );
        }
        return result;
      })
      .flat();
    return res.length ? res : [validation_1.ok("schedule", "✅ sessions")];
  }
  validateSchedule(site) {
    const res = site.schedule
      .map(day =>
        day.rooms
          .map(schRoom => {
            const result = [];
            // check rooms
            if (!site.rooms.some(it => it.key === schRoom.room)) {
              result.push(
                validation_1.warn("schedule", "Unknown room", schRoom.room)
              );
            }
            schRoom.slots.forEach(slotTalk => {
              // check slot
              if (!site.slots.some(it => it.key == slotTalk.slot)) {
                result.push(
                  validation_1.warn("schedule", "Unknown slot", slotTalk.slot)
                );
              }
              // check sessions
              if (!site.sessions.some(it => it.key == slotTalk.talk)) {
                result.push(
                  validation_1.warn(
                    "schedule",
                    "Unknown session",
                    slotTalk.talk
                  )
                );
              }
            });
            return result;
          })
          .flat()
      )
      .flat();
    return res.length ? res : [validation_1.ok("schedule", "✅ schedule")];
  }
}
exports.siteValidator = new SiteValidator();
