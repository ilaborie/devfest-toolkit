export type RoomKey = string;

export interface Room {
  key: RoomKey;
  label: string;
  skip: boolean;
}

export type Rooms = Room[];
