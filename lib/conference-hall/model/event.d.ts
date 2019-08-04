import { Category } from "./category";
import { Format } from "./format";
import { Talk } from "./talk";
import { Speaker } from "./speaker";
import { Session as SiteSession } from "../../site/models/session";
import { Speaker as SiteSpeaker } from "../../site/models/speaker";
import { AddOnConfig } from "../../config";
export declare type EventId = string;
export interface Name {
  long_name: string;
  short_name: string;
}
export interface Geoloc {
  lat: number;
  lng: number;
}
export interface Address {
  formattedAddress: string;
  locality: Name;
  country: Name;
  latLng: Geoloc;
}
export interface ConferenceDates {
  start: string;
  end: string;
}
export interface Event {
  id: EventId;
  name: string;
  categories: Category[];
  formats: Format[];
  address: Address;
  conferenceDates: ConferenceDates;
  talks: Talk[];
  speakers: Speaker[];
}
export declare function talkToSession(event: Event, talk: Talk): SiteSession;
export declare function toSiteSpeaker(
  config: AddOnConfig,
  speaker: Speaker
): Promise<SiteSpeaker>;
