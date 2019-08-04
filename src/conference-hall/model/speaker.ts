export type SpeakerId = string;

export interface Speaker {
  uid: SpeakerId;
  displayName: string;
  bio: string;
  company?: string;
  photoURL: string;
  twitter?: string;
  github?: string;
}
