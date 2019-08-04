"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const TypeContentRepository_1 = require("./TypeContentRepository");
const ContentRepository_1 = require("./ContentRepository");
const DataRepository_1 = require("./DataRepository");
const DataArrayRepository_1 = require("./DataArrayRepository");
tslib_1.__exportStar(require("./SiteRepository"), exports);
class SpeakerRepository extends ContentRepository_1.ContentRepository {
  constructor(config) {
    super(config, "speakers");
  }
}
exports.SpeakerRepository = SpeakerRepository;
class SessionRepository extends ContentRepository_1.ContentRepository {
  constructor(config) {
    super(config, "sessions");
  }
}
exports.SessionRepository = SessionRepository;
class SponsorRepository extends TypeContentRepository_1.TypeContentRepository {
  constructor(config) {
    super(config, "partners");
  }
  getAllTypes() {
    return ["platinium", "gold", "soutien", "startup", "media", "communautes"];
  }
}
exports.SponsorRepository = SponsorRepository;
class TeamRepository extends DataArrayRepository_1.DataArrayRepository {
  constructor(config) {
    super(config, "team");
  }
}
exports.TeamRepository = TeamRepository;
class CategoryRepository extends DataArrayRepository_1.DataArrayRepository {
  constructor(config) {
    super(config, "categories");
  }
}
exports.CategoryRepository = CategoryRepository;
class FormatRepository extends DataArrayRepository_1.DataArrayRepository {
  constructor(config) {
    super(config, "formats");
  }
}
exports.FormatRepository = FormatRepository;
class RoomRepository extends DataArrayRepository_1.DataArrayRepository {
  constructor(config) {
    super(config, "rooms");
  }
}
exports.RoomRepository = RoomRepository;
class SlotRepository extends DataArrayRepository_1.DataArrayRepository {
  constructor(config) {
    super(config, "slots");
  }
}
exports.SlotRepository = SlotRepository;
class ScheduleRepository extends DataRepository_1.DataRepository {
  constructor(config) {
    super(config, "schedule");
  }
}
exports.ScheduleRepository = ScheduleRepository;
class InfoRepository extends DataRepository_1.DataRepository {
  constructor(config) {
    super(config, "info");
  }
}
exports.InfoRepository = InfoRepository;
