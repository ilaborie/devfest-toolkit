import { ContentRepository } from "./ContentRepository";
import { DescriptionElement, KeyElement, TypeElement } from "../models";
import { SiteConfig } from "../../config";
export declare abstract class TypeContentRepository<
  T extends TypeElement & KeyElement & DescriptionElement
> extends ContentRepository<T> {
  protected constructor(config: SiteConfig, name: string);
  read(key: string): Promise<T>;
  abstract getAllTypes(): string[];
  private readTypeContentFile;
  private typeTransform;
  private getAllTypeFiles;
  readAll(): Promise<T[]>;
  private getAllTypeData;
  save(value: T, force?: boolean): Promise<void>;
}
