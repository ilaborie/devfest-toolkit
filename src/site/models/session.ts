import { SpeakerKey } from "./speaker";
import { TalkId } from "../../conference-hall/model/talk";
import { Markdown } from "./index";
import { CategoryKey } from "./category";
import { FormatKey } from "./format";

export type SessionKey = string;

// TLS: beginner, advanced, expert
export type SessionLevel = string;

export interface Session {
  id?: TalkId;
  key: SessionKey;
  title: string;
  level?: SessionLevel;
  type: FormatKey;
  speakers: SpeakerKey[];
  tags: CategoryKey[];
  language?: string;
  videoId?: string;
  presentation?: string;
  draft?: boolean;

  description: Markdown;
}

export type Sessions = Session[];
