import { Config } from "../config";
import { AbstractSiteTool } from "./AbstractSiteTool";
export declare class GenerateSiteTool extends AbstractSiteTool {
  constructor();
  run(config: Config): Promise<void>;
}
