import { compare, getValueByPointer, Operation } from "fast-json-patch";
import colors from "ansi-colors";
import { Logger } from "plop-logger";

import { Config } from "../config";
import { AbstractSiteTool } from "./AbstractSiteTool";
import { SiteRepository } from "../site/repositories";
import { Site } from "../site/models/site";
import { indent } from "../strings";
import {
  ArrayChanges,
  ChangeObject,
  Changes,
  ChangeType,
  displayChange,
  indentMinus,
  indentPlus,
  KeyChanges
} from "../changes";
import { SiteValidator } from "../site/validation";

interface AttributeKey<T> {
  attribute: keyof T;
  key: string;
}

export class DiffSiteTool extends AbstractSiteTool {
  constructor() {
    super("diff", "Compare with site from conference hall and extra data");
  }

  private displayChanges(attribute: string, changes: Changes): void {
    const logger = Logger.getLogger(this.logger.name + "." + attribute);
    if (changes.length) {
      logger.info("Changes for", attribute);
      changes.forEach(change => displayChange(logger, change));
    } else {
      logger.info("No changes for", attribute);
    }
  }

  private displayArrayChanges<T>(
    attribute: string,
    changes: ArrayChanges<T>
  ): void {
    const logger = Logger.getLogger(this.logger.name + "." + attribute);
    if (changes.removed.length + changes.added.length) {
      const msgBuilder = (): string => {
        return (
          "Changes for all" +
          [
            ...changes.added.map(it => indent(colors.green(it), indentPlus)),
            ...changes.removed.map(it => indent(colors.red(it), indentMinus))
          ].join("\n")
        );
      };
      logger.info(msgBuilder, attribute);
    } else {
      logger.info("No add/remove for", attribute);
    }
    Object.entries(changes.updated).map(([key, value]) => {
      if (value.length) {
        logger.info("  for", () => `${attribute}/${key}`);
        value.forEach(change => displayChange(logger, change));
      }
    });
  }

  private operationToChange(
    source: any,
    target: any,
    operation: Operation
  ): ChangeObject {
    const { path, op } = operation;
    const oldValue = getValueByPointer(source, path);
    const newValue = getValueByPointer(target, path);
    switch (op) {
      case "replace":
        return { path, type: ChangeType.UPDATED, oldValue, newValue };
      case "remove":
        return { path, type: ChangeType.REMOVED, oldValue };
      case "add":
        return { path, type: ChangeType.ADDED, newValue };
      default:
        this.logger.error("Unhandled operation type", op);
        throw new Error("Unhandled operation type: " + op);
    }
  }

  private diffObject<T>(source: T, target: T): Changes {
    return compare(source || {}, target || {}).map(operation =>
      this.operationToChange(source || {}, target || {}, operation)
    );
  }

  private diffDataArrayObject<T>(
    keyAttribute: keyof T,
    source: T[],
    target: T[]
  ): ArrayChanges<T> {
    const sourceKeys = source.map(it => "" + it[keyAttribute]);
    const targetKeys = target.map(it => "" + it[keyAttribute]);
    const commonKeys = Array.from(
      new Set<string>([...sourceKeys, ...targetKeys])
    );

    const added = targetKeys.filter(it => !commonKeys.includes(it));
    const removed = sourceKeys.filter(it => !commonKeys.includes(it));
    const updated = commonKeys.reduce(
      (acc, key) => {
        const src = source.find(it => "" + it[keyAttribute] === key);
        const trg = target.find(it => "" + it[keyAttribute] === key);
        acc[key] = this.diffObject(src, trg);
        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {} as KeyChanges
    );

    return { added, removed, updated };
  }

  private displayDataArrayDiff(
    attributeKey: AttributeKey<Site>,
    sourceSite: Site,
    targetSite: Site
  ): void {
    const { attribute, key } = attributeKey;
    const changes = this.diffDataArrayObject(
      // @ts-ignore
      key,
      sourceSite[attribute],
      targetSite[attribute]
    );
    this.displayArrayChanges(attribute, changes);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const keyChanges = (Object.values(changes.updated) as Changes[]).reduce(
      (acc, elt) => acc + elt.length,
      0
    );
    if (keyChanges == 0) {
      this.logger.info("No attribute change for", attribute);
    }
  }

  async run(config: Config): Promise<void> {
    this.logger.debug("site input dir", config.siteDir);
    const siteRepo = new SiteRepository(config);
    const current = await siteRepo.readAll();
    const generated = await this.generateSite(config);

    const siteValidator = new SiteValidator(config);
    siteValidator.validateAndLog(generated);

    // Info
    const infoChanges = this.diffObject(current.info, generated.info);
    this.displayChanges("info", infoChanges);

    const attributes = [
      { attribute: "categories", key: "key" },
      { attribute: "formats", key: "key" },
      { attribute: "speakers", key: "key" },
      { attribute: "sessions", key: "key" },
      { attribute: "rooms", key: "key" },
      { attribute: "slots", key: "key" },
      { attribute: "schedule", key: "day" },
      { attribute: "team", key: "key" },
      { attribute: "sponsors", key: "key" }
    ] as AttributeKey<Site>[];
    attributes.forEach(attribute =>
      this.displayDataArrayDiff(attribute, current, generated)
    );
  }
}
