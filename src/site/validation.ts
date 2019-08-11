import { ok, ValidationResult, ValidationService, warn } from "../validation";
import { Site } from "./models/site";
import { Sponsors } from "./models/sponsor";
import { Speakers } from "./models/speaker";
import { SiteConfig } from "../config";
import * as path from "path";
import { canRead, isFileEmpty } from "../fs-utils";

export class SiteValidator extends ValidationService<Site> {
  constructor(private config: SiteConfig) {
    super("site");
  }

  validate(site: Site): ValidationResult<Site>[] {
    this.logger.info("Validate site", site.info.name);
    return [
      ...this.validateSpeaker(site.speakers),
      ...this.validateSession(site),
      ...this.validateSchedule(site),
      ...this.validateSponsors(site.sponsors)
    ];
  }

  private validateSponsors(sponsors: Sponsors): ValidationResult<Site>[] {
    const result: ValidationResult<Site>[] = [];
    sponsors.forEach(sponsor => {
      const logoFile = path.join(this.config.siteDir, "static", sponsor.logo);
      if (!canRead(logoFile)) {
        result.push(warn("sponsors", "Logo not found", sponsor.logo));
      } else if (isFileEmpty(logoFile)) {
        result.push(warn("sponsors", "Logo is empty", sponsor.logo));
      }
    });
    return result.length ? result : [ok<Site>("sponsors", "✅")];
  }

  private validateSpeaker(speakers: Speakers): ValidationResult<Site>[] {
    const result: ValidationResult<Site>[] = [];
    // need to have a photo, none empty
    speakers.forEach(speaker => {
      if (!speaker.photoURL) {
        result.push(warn("speakers", "speaker without photo", speaker.key));
      } else {
        const photoFile = path.join(
          this.config.siteDir,
          "static",
          speaker.photoURL
        );
        if (!canRead(photoFile)) {
          result.push(warn("speakers", "Photo not found", speaker.photoURL));
        } else if (isFileEmpty(photoFile)) {
          result.push(warn("speakers", "Photo is empty", speaker.photoURL));
        }
      }
    });
    return result.length ? result : [ok<Site>("speakers", "✅")];
  }

  private validateSession(site: Site): ValidationResult<Site>[] {
    const result: ValidationResult<Site>[] = [];
    site.sessions.forEach(session => {
      // speakers
      session.speakers.forEach(speaker => {
        if (!site.speakers.some(it => it.key === speaker)) {
          result.push(
            warn<Site>(
              "sessions",
              "Unknown speaker for " + session.key,
              speaker
            )
          );
        }
      });

      // categories
      session.tags.forEach(cat => {
        if (!site.categories.some(it => it.key === cat)) {
          result.push(
            warn<Site>("sessions", "Unknown category for " + session.key, cat)
          );
        }
      });

      // format
      if (!site.formats.some(it => it.key === session.format)) {
        result.push(
          warn<Site>(
            "sessions",
            "Unknown format for " + session.key,
            session.format
          )
        );
      }
    });
    return result.length ? result : [ok<Site>("sessions", "✅")];
  }

  private validateSchedule(site: Site): ValidationResult<Site>[] {
    const result: ValidationResult<Site>[] = [];
    site.schedule.forEach(day =>
      day.rooms.forEach(schRoom => {
        // check rooms
        if (!site.rooms.some(it => it.key === schRoom.room)) {
          result.push(warn<Site>("schedule", "Unknown room", schRoom.room));
        }
        schRoom.slots.forEach(slotTalk => {
          // check slot
          if (!site.slots.some(it => it.key == slotTalk.slot)) {
            result.push(warn<Site>("schedule", "Unknown slot", slotTalk.slot));
          }
          // check sessions
          if (!site.sessions.some(it => it.key == slotTalk.talk)) {
            result.push(
              warn<Site>("schedule", "Unknown session", slotTalk.talk)
            );
          }
        });
      })
    );
    return result.length ? result : [ok<Site>("schedule", "✅")];
  }
}
