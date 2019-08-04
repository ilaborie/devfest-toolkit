"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fast_json_patch_1 = require("fast-json-patch");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const AbstractSiteTool_1 = require("./AbstractSiteTool");
const repositories_1 = require("../site/repositories");
const site_1 = require("../site/models/site");
const logger_1 = require("../logger");
const strings_1 = require("../strings");
const changes_1 = require("../changes");
class DiffSiteTool extends AbstractSiteTool_1.AbstractSiteTool {
  constructor() {
    super("diff", "Compare with site from conference hall and extra data");
  }
  displayChanges(attribute, changes) {
    const logger = logger_1.Logger.getLogger(
      this.logger.name + "." + attribute
    );
    if (changes.length) {
      logger.info("Changes for", attribute);
      changes.forEach(change => changes_1.displayChange(logger, change));
    } else {
      logger.info("No changes for", attribute);
    }
  }
  displayArrayChanges(attribute, changes) {
    const logger = logger_1.Logger.getLogger(
      this.logger.name + "." + attribute
    );
    if (changes.removed.length + changes.added.length) {
      const msgBuilder = () => {
        return (
          "Changes for all" +
          [
            ...changes.added.map(it =>
              strings_1.indent(chalk_1.default.green(it), changes_1.indentPlus)
            ),
            ...changes.removed.map(it =>
              strings_1.indent(chalk_1.default.red(it), changes_1.indentMinus)
            )
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
        value.forEach(change => changes_1.displayChange(logger, change));
      }
    });
  }
  operationToChange(source, target, operation) {
    const { path, op } = operation;
    const oldValue = fast_json_patch_1.getValueByPointer(source, path);
    const newValue = fast_json_patch_1.getValueByPointer(target, path);
    switch (op) {
      case "replace":
        return { path, type: changes_1.ChangeType.UPDATED, oldValue, newValue };
      case "remove":
        return { path, type: changes_1.ChangeType.REMOVED, oldValue };
      case "add":
        return { path, type: changes_1.ChangeType.ADDED, newValue };
      default:
        this.logger.error("Unhandled operation type", op);
        throw new Error("Unhandled operation type: " + op);
    }
  }
  diffObject(source, target) {
    return fast_json_patch_1
      .compare(source || {}, target || {})
      .map(operation =>
        this.operationToChange(source || {}, target || {}, operation)
      );
  }
  diffDataArrayObject(keyAttribute, source, target) {
    const sourceKeys = source.map(it => "" + it[keyAttribute]);
    const targetKeys = target.map(it => "" + it[keyAttribute]);
    const commonKeys = Array.from(new Set([...sourceKeys, ...targetKeys]));
    const added = targetKeys.filter(it => !commonKeys.includes(it));
    const removed = sourceKeys.filter(it => !commonKeys.includes(it));
    const updated = commonKeys.reduce(
      (acc, key) => {
        const src = source.find(it => "" + it[keyAttribute] === key);
        const trg = target.find(it => "" + it[keyAttribute] === key);
        acc[key] = this.diffObject(src, trg);
        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      {}
    );
    return { added, removed, updated };
  }
  displayDataArrayDiff(attributeKey, sourceSite, targetSite) {
    const { attribute, key } = attributeKey;
    const changes = this.diffDataArrayObject(
      // @ts-ignore
      key,
      sourceSite[attribute],
      targetSite[attribute]
    );
    this.displayArrayChanges(attribute, changes);
  }
  async run(config) {
    this.logger.debug("site input dir", config.siteDir);
    const siteRepo = new repositories_1.SiteRepository(config);
    const current = await siteRepo.readAll();
    const generated = await this.generateSite(config);
    site_1.siteValidator.validateAndLog(generated);
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
    ];
    attributes.forEach(attribute =>
      this.displayDataArrayDiff(attribute, current, generated)
    );
  }
}
exports.DiffSiteTool = DiffSiteTool;
