import { Tool } from "./Tool";
import { GenerateSiteTool } from "./GenerateSiteTool";
import { DiffSiteTool } from "./DiffSiteTool";

export const commands: Tool[] = [new GenerateSiteTool(), new DiffSiteTool()];
