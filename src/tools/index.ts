import { Tool } from "./Tool";
import { GenerateSiteTool } from "./GenerateSiteTool";
import { DiffSiteTool } from "./DiffSiteTool";
import { StatsTool } from "./StatsTool";
import { AddSponsorTool } from "./AddSponsorTool";

export const commands: Tool[] = [
  new GenerateSiteTool(),
  new DiffSiteTool(),
  new StatsTool(),
  new AddSponsorTool()
];
