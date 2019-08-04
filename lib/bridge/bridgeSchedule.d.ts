import { Slot, SlotKey } from "../site/models/slot";
export interface LocalSlot {
  key: SlotKey;
  start: string;
  duration: number;
  weight: number;
}
export declare function toSiteSlot(input: LocalSlot[]): Slot[];
