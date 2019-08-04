// TLS: 'Conference', 'Quickie', 'Keynote', 'Office Hours', 'open', 'party', 'pause', 'lunch'
import { CategoryId } from "../../conference-hall/model/category";
import { Markdown } from "./index";

export type CategoryKey = string;

export interface Category {
  id?: CategoryId;
  key: CategoryKey;
  name: string;
  description?: Markdown;
}
