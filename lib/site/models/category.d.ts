import { CategoryId } from "../../conference-hall/model/category";
import { Markdown } from "./index";
export declare type CategoryKey = string;
export interface Category {
  id?: CategoryId;
  key: CategoryKey;
  name: string;
  description?: Markdown;
}
