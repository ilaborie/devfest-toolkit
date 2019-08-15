import { Tool } from "./Tool";
import { GenerateSiteTool } from "./GenerateSiteTool";
import { DiffSiteTool } from "./DiffSiteTool";
import { StatsTool } from "./StatsTool";
import { AddSponsorTool } from "./AddSponsorTool";
import { AddSpeakerTool } from "./AddSpeakerTool";
import { AddSessionTool } from "./AddSessionTool";

export const commands: Tool[] = [
  new GenerateSiteTool(),
  new DiffSiteTool(),
  new StatsTool(),
  new AddSponsorTool(),
  new AddSpeakerTool(),
  new AddSessionTool()
];
