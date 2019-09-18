export type RoomKey = string;

export interface Room {
  key: RoomKey;
  label: string;
  description?: string;
  skip: boolean;
}

export type Rooms = Room[];
