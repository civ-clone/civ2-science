"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateMultiplier = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * What a player's research cost is multiplied by now, for a rule set that changes Civilization II's (as
 * `civ2-enhanced`'s cost by age does, civ-clone/web-renderer#1077). Civilization II has no such factor, so this
 * package registers none: the first rule that applies decides, and with none the cost is Civilization II's own.
 */
class RateMultiplier extends Rule_1.default {
}
exports.RateMultiplier = RateMultiplier;
exports.default = RateMultiplier;
//# sourceMappingURL=RateMultiplier.js.map