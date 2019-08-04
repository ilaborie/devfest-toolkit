"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cache_1 = require("../cache");
const path = tslib_1.__importStar(require("path"));
async function bridgeSpeaker(config, key) {
  const speakerAddOnFile = path.join(config.addonDir, "speakers.json");
  let speakersAddOn = await cache_1.readFileCache.getAsJson(speakerAddOnFile);
  const result = {
    isFeatured: speakersAddOn.featured.includes(key)
  };
  const extra = speakersAddOn.add[key];
  if (extra && extra.company) {
    result.company = extra.company;
  }
  if (extra && extra.city) {
    result.city = extra.city;
  }
  return result;
}
exports.bridgeSpeaker = bridgeSpeaker;
