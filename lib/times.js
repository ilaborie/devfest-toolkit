"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function timePlusDuration(time, duration) {
  const split = time.split(":");
  let hh = parseInt(split[0], 10);
  let mm = parseInt(split[1], 10);
  mm += duration;
  hh += Math.floor(mm / 60);
  mm = mm % 60;
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}
exports.timePlusDuration = timePlusDuration;
