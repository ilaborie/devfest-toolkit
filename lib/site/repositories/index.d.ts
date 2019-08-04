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
export declare class SpeakerRepository extends ContentRepository<Speaker> {
  constructor(config: SiteConfig);
}
export declare class SessionRepository extends ContentRepository<Session> {
  constructor(config: SiteConfig);
}
export declare class SponsorRepository extends TypeContentRepository<Sponsor> {
  constructor(config: SiteConfig);
  getAllTypes(): string[];
}
export declare class TeamRepository extends DataArrayRepository<Member> {
  constructor(config: SiteConfig);
}
export declare class CategoryRepository extends DataArrayRepository<Category> {
  constructor(config: SiteConfig);
}
export declare class FormatRepository extends DataArrayRepository<Format> {
  constructor(config: SiteConfig);
}
export declare class RoomRepository extends DataArrayRepository<Room> {
  constructor(config: SiteConfig);
}
export declare class SlotRepository extends DataArrayRepository<Slot> {
  constructor(config: SiteConfig);
}
export declare class ScheduleRepository extends DataRepository<Schedule> {
  constructor(config: SiteConfig);
}
export declare class InfoRepository extends DataRepository<SiteInfo> {
  constructor(config: SiteConfig);
}
