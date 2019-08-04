import { RoomKey } from "./room";
import { SlotKey } from "./slot";
import { SessionKey } from "./session";
import { Day, Time } from "../../times";

export interface ScheduleRoomSlot {
  slot: SlotKey;
  talk: SessionKey;
}

export interface ScheduleRoom {
  room: RoomKey;
  slots: ScheduleRoomSlot[];
}

export interface ScheduleDay {
  day: Day;
  start: Time;
  rooms: ScheduleRoom[];
}

export type Schedule = ScheduleDay[];
