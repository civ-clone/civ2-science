"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiresAdvances = void 0;
const advances_1 = require("./data/advances");
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
/**
 * The advances each of Civilization II's advances needs before a player can research it, from `data/advances`: one
 * rule each, made by `Rules/Research/requirements`. `registerRules` adds them to the game's `requirements`. An advance
 * whose prerequisites are both `nil` needs none and isn't listed. Plumbing, whose prerequisites are `no`, is never
 * available: a rule of its own, as an entry can't say "never".
 */
exports.requiresAdvances = (0, Requirement_1.table)('civ2-science:research/requirements', 'requires', advances_1.advances
    .filter(([, first, second]) => first !== advances_1.NEVER && (first !== advances_1.NONE || second !== advances_1.NONE))
    .map(([AdvanceType, first, second]) => [
    AdvanceType,
    ...[first, second]
        .filter((index) => index >= 0)
        .map((index) => advances_1.advances[index][0]),
]));
exports.default = exports.requiresAdvances;
//# sourceMappingURL=Requirements.js.map