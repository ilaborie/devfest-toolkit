export declare type Markdown = string;
export interface KeyElement {
  key: string;
}
export interface DescriptionElement {
  description: Markdown;
}
export interface TypeElement {
  type: string;
}
export declare const compareKey: <T extends KeyElement>(a: T, b: T) => number;
