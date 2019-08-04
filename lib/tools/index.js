"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GenerateSiteTool_1 = require("./GenerateSiteTool");
const DiffSiteTool_1 = require("./DiffSiteTool");
exports.commands = [
  new GenerateSiteTool_1.GenerateSiteTool(),
  new DiffSiteTool_1.DiffSiteTool()
];
