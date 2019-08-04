import { Time } from "../../times";
export interface SlotRow {
  start: number;
  end: number;
}
export declare type SlotKey = string;
export interface Slot {
  key: SlotKey;
  start: Time;
  row: SlotRow;
}
export declare type Slots = Slot[];
