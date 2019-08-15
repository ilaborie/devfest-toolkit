export type Markdown = string;

export interface KeyElement {
  key: string;
}

export interface DescriptionElement {
  description: Markdown;
}

export const compareKey = <T extends KeyElement>(a: T, b: T): number => {
  if (a.key > b.key) return 1;
  else if (a.key < b.key) return -1;
  else return 0;
};
