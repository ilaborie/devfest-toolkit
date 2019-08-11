import { Tool } from "./Tool";
import { GenerateSiteTool } from "./GenerateSiteTool";
import { DiffSiteTool } from "./DiffSiteTool";
import { StatsTool } from "./StatsTool";

export const commands: Tool[] = [
  new GenerateSiteTool(),
  new DiffSiteTool(),
  new StatsTool()
];
