import {CategoryId} from './category';
import {FormatId} from './format';
import {SpeakerId} from './speaker';

export type TalkId = string;

export type TalkStatus =
    | 'submitted'
    | 'accepted'
    | 'rejected'
    | 'declined'
    | 'confirmed';

export type TalkLevel = 'beginner' | 'intermediate' | 'advanced';

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
