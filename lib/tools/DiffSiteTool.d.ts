import { Config } from "../config";
import { AbstractSiteTool } from "./AbstractSiteTool";
export declare class DiffSiteTool extends AbstractSiteTool {
  constructor();
  private displayChanges;
  private displayArrayChanges;
  private operationToChange;
  private diffObject;
  private diffDataArrayObject;
  private displayDataArrayDiff;
  run(config: Config): Promise<void>;
}
