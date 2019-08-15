import { TypeContentRepository } from "./TypeContentRepository";
import { ContentRepository } from "./ContentRepository";
import { DataRepository } from "./DataRepository";
import { Speaker } from "../models/speaker";
import { Session } from "../models/session";
import { Sponsor } from "../models/sponsor";
import { Room } from "../models/room";
import { Slot } from "../models/slot";
import { Schedule } from "../models/schedule";
import { SiteInfo } from "../models/site";
import { Category } from "../models/category";
import { Format } from "../models/format";
import { Member } from "../models/member";
import { DataArrayRepository } from "./DataArrayRepository";
import { SiteConfig } from "../../config";

export * from "./SiteRepository";

export interface Repository<T> {
  readAll: () => Promise<T>;
  saveAll: (values: T, force: boolean) => Promise<void>;
}

export class SpeakerRepository extends ContentRepository<Speaker> {
  constructor(config: SiteConfig) {
    super(config, "speakers");
  }
}

export class SessionRepository extends ContentRepository<Session> {
  constructor(config: SiteConfig) {
    super(config, "sessions");
  }
}

export class SponsorRepository extends TypeContentRepository<Sponsor> {
  constructor(config: SiteConfig) {
    super(config, "partners");
  }

  getAllTypes(): string[] {
    return ["platinium", "gold", "soutien", "startup", "media", "communautes"];
  }

  getTypeKey(): keyof Sponsor {
    return "category";
  }
}

export class TeamRepository extends DataArrayRepository<Member> {
  constructor(config: SiteConfig) {
    super(config, "team");
  }
}

export class CategoryRepository extends DataArrayRepository<Category> {
  constructor(config: SiteConfig) {
    super(config, "categories");
  }
}

export class FormatRepository extends DataArrayRepository<Format> {
  constructor(config: SiteConfig) {
    super(config, "formats");
  }
}

export class RoomRepository extends DataArrayRepository<Room> {
  constructor(config: SiteConfig) {
    super(config, "rooms");
  }
}

export class SlotRepository extends DataArrayRepository<Slot> {
  constructor(config: SiteConfig) {
    super(config, "slots");
  }
}

export class ScheduleRepository extends DataRepository<Schedule> {
  constructor(config: SiteConfig) {
    super(config, "schedule");
  }
}

export class InfoRepository extends DataRepository<SiteInfo> {
  constructor(config: SiteConfig) {
    super(config, "info");
  }
}
