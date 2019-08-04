import { CategoryId } from "./category";
import { FormatId } from "./format";
import { SpeakerId } from "./speaker";
export declare type TalkId = string;
export declare type TalkStatus =
  | "submitted"
  | "accepted"
  | "rejected"
  | "declined"
  | "confirmed";
export declare type TalkLevel = "beginner" | "intermediate" | "advanced";
export interface Talk {
  id: TalkId;
  title: string;
  state: TalkStatus;
  level: TalkLevel;
  abstract: string;
  categories: CategoryId;
  formats: FormatId;
  speakers: SpeakerId[];
  language: string;
}
