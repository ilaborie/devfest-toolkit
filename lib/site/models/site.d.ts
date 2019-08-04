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
import { ValidationResult, ValidationService } from "../../validation";
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
declare class SiteValidator extends ValidationService<Site> {
  constructor();
  validate(site: Site): ValidationResult<Site>[];
  private validateSession;
  private validateSchedule;
}
export declare const siteValidator: SiteValidator;
export {};
