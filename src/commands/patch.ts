import { flags } from "@oclif/command";
import { Config } from "../config";
import { commonsFlags, DevfestToolkitCommand, generateSite } from "../commons";
import { compare, Operation } from "fast-json-patch";
import { SiteRepository } from "../site/repositories";
import { SiteValidator } from "../site/validation";
import * as path from "path";
import { isFileExist, writeFile } from "../fs-utils";
import { readFileCache } from "../cache";

interface KeyElement {
  key: string;
}

export default class Patch extends DevfestToolkitCommand {
  static description =
    "Compare with site with conference hall and create path (reverse generate)";

  static flags: flags.Input<any> = {
    ...commonsFlags
  };

  get configuration(): Config {
    const { flags } = this.parse(Patch);
    return flags as Config;
  }

  private diffDataArrayObject<T extends KeyElement>(
    config: Config,
    base: string,
    source: T[],
    target: T[]
  ): void {
    const sourceKeys = source.map(it => "" + it.key);
    const targetKeys = target.map(it => "" + it.key);
    const commonKeys = Array.from(
      new Set<string>([...sourceKeys, ...targetKeys])
    );

    commonKeys.forEach(key => {
      const src = source.find(it => "" + it.key === key);
      const trg = target.find(it => "" + it.key === key);
      const diff = compare(trg || {}, src || {}).filter(
        it => it.op === "replace"
      );

      if (diff.length) {
        const file = path.join(config.patchDir, base, `patch-0-${key}.json`);
        this.createOrUpdatePatch(file, key, diff);
      }
    });
  }

  private async createOrUpdatePatch(
    file: string,
    key: string,
    diff: Operation[]
  ): Promise<any> {
    let patchStart: Operation[];
    let update;
    if (isFileExist(file)) {
      patchStart = await readFileCache.getAsJson<Operation[]>(file);
      update = true;
    } else {
      patchStart = [{ op: "test", path: "/key", value: key }];
      update = false;
    }

    const patch = [...patchStart, ...diff];
    this.logger.info(
      `${update ? "update existing" : "create new"} patch`,
      file
    );
    return await writeFile(file, JSON.stringify(patch, null, 2), "utf-8");
  }

  async runWithConfig(config: Config): Promise<void> {
    this.logger.debug("Configuration", config);
    this.logger.debug("site input dir", config.siteDir);
    const siteRepo = new SiteRepository(config);
    const current = await siteRepo.readAll();
    const generated = await generateSite(this.logger, config);

    const siteValidator = new SiteValidator(config);
    siteValidator.validateAndLog(generated);

    this.diffDataArrayObject(
      config,
      "sessions",
      current.sessions,
      generated.sessions
    );
    this.diffDataArrayObject(
      config,
      "speakers",
      current.speakers,
      generated.speakers
    );
  }
}
