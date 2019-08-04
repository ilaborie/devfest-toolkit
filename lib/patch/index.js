"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const fast_json_patch_1 = require("fast-json-patch");
const fs_utils_1 = require("../fs-utils");
const cache_1 = require("../cache");
const logger_1 = require("../logger");
async function loadPatch(dir, file) {
  const patchFile = path.join(dir, file);
  const operations = await cache_1.readFileCache.getAsJson(patchFile);
  return { file, operations };
}
async function loadPatches(config, type) {
  const logger = logger_1.Logger.getLogger("patch." + type);
  logger.trace(() => "Lookup patches", type);
  const dir = path.join(config.patchDir, type);
  try {
    let files = (await fs_utils_1.readdir(dir))
      .filter(f => f.startsWith("patch"))
      .filter(f => f.endsWith(".json"));
    let patches = await Promise.all(files.map(file => loadPatch(dir, file)));
    logger.trace("Found patches", patches.length);
    return patches;
  } catch (err) {
    logger.warn("Oops", err);
    return [];
  }
}
async function loadListPatches(config, type) {
  const file = path.join(config.patchDir, type, "listdiff.json");
  const logger = logger_1.Logger.getLogger("patch." + type);
  logger.trace("Load list patch", type);
  try {
    let result = await cache_1.readFileCache.getAsJson(file);
    if (result.add.length) {
      logger.trace("Found list patch add", result.add.length);
    }
    if (result.remove.length) {
      logger.trace("Found list patch remove", result.remove.length);
    }
    return result;
  } catch (err) {
    logger.warn("Oops", err);
    return { add: [], remove: [] };
  }
}
async function applyAllPatch(config, type, data) {
  const logger = logger_1.Logger.getLogger("patch." + type);
  let listPatch = await loadListPatches(config, type);
  let result = [...data];
  if (listPatch.remove.length) {
    result = result.filter(it => !listPatch.remove.includes(it.key));
    logger.info(
      () => "Removed some " + type,
      () => listPatch.remove.join(", ")
    );
  }
  if (listPatch.add.length) {
    result = result.concat(listPatch.add);
    logger.info(
      () => "Add some " + type,
      () => listPatch.add.map(it => it.key).join(", ")
    );
  }
  let list = result;
  let patches = await loadPatches(config, type);
  return list.map(elt =>
    patches.reduce((acc, patch) => {
      try {
        const { file, operations } = patch;
        logger.trace("apply patch", file);
        const patchResult = fast_json_patch_1.applyPatch(acc, operations);
        logger.debug(
          () => `applied patch for '${acc.key}'`,
          JSON.stringify(operations)
        );
        return patchResult.newDocument;
      } catch (e) {
        logger.trace("applied patch fail");
        return acc;
      }
    }, elt)
  );
}
exports.applyAllPatch = applyAllPatch;
