"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const AdvanceRegistry_1 = require("@civ-clone/core-science/AdvanceRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Added_1 = require("@civ-clone/core-player/Rules/Added");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const playerResearch_1 = require("@civ-clone/base-science-research/lib/playerResearch");
// Every civilization starts knowing nothing (OpenCiv2 `src/auto/civ.cpp` `civ_create_reset_civ`,
//  richardpenman/civ2@49f26ec, clears its advances, and grants none before the first turn). The only advances given
//  before the first turn are the start balancing's (`civ2-player`).
const getRules = (advanceRegistry = AdvanceRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    new Added_1.default('civ2-science:player/added/register-player-research', new Effect_1.default((player) => (0, playerResearch_1.addPlayerResearch)(player, advanceRegistry, playerResearchRegistry, ruleRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=added.js.map