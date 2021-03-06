import * as path from "path";
import { applyPatch, Operation } from "fast-json-patch";
import { Logger } from "plop-logger";

import { KeyElement } from "../site/models";
import { createParentDir, readdir } from "../fs-utils";
import { readFileCache } from "../cache";
import { PatchConfig } from "../config";

export interface Patch {
  file: string;
  operations: Operation[];
}

async function loadPatch(
  dir: string,
  file: string
): Promise<{ file: string; operations: Operation[] }> {
  const patchFile = path.join(dir, file);
  const operations = await readFileCache.getAsJson<Operation[]>(patchFile);
  return { file, operations };
}

async function loadPatches(
  logger: Logger,
  config: PatchConfig,
  type: string
): Promise<Patch[]> {
  logger.trace(() => "Lookup patches", type);
  const dir = path.join(config.patchDir, type);
  try {
    const files = (await readdir(dir))
      .filter(f => f.startsWith("patch"))
      .filter(f => f.endsWith(".json"));
    const patches = await Promise.all(files.map(file => loadPatch(dir, file)));
    logger.info("Found patches", patches.length);
    return patches;
  } catch (err) {
    logger.warn("Oops", err);
    return [];
  }
}

interface ListPatch<T extends KeyElement> {
  add: T[];
  remove: string[];
}

async function loadListPatches<T extends KeyElement>(
  logger: Logger,
  config: PatchConfig,
  type: string
): Promise<ListPatch<T>> {
  const file = path.join(config.patchDir, type, "listdiff.json");
  await createParentDir(file);
  logger.trace("Load list patch", type);
  try {
    const result = await readFileCache.getAsJson<ListPatch<T>>(file);
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

export async function applyAllPatch<T extends KeyElement>(
  config: PatchConfig,
  type: string,
  data: T[]
): Promise<T[]> {
  const logger = Logger.getLogger("patch." + type);
  const listPatch = await loadListPatches<T>(logger, config, type);
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
  const list: T[] = result;
  const patches = await loadPatches(logger, config, type);
  return list.map(elt =>
    patches.reduce((acc, patch) => {
      try {
        const { file, operations } = patch;
        logger.trace("apply patch", file);
        const patchResult = applyPatch(acc, operations);
        logger.debug(() => `applied patch for '${acc.key}'`, file);
        return patchResult.newDocument;
      } catch (e) {
        logger.trace("applied patch fail");
        return acc;
      }
    }, elt)
  );
}
