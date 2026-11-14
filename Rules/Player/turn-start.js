"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.researchCostPriority = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const TurnStart_1 = require("@civ-clone/core-player/Rules/TurnStart");
const progress_1 = require("@civ-clone/base-science-research/lib/progress");
// What an advance costs depends on the turn and on the reference player's advances (see `Rules/Research/cost`), and
//  Civilization II works it out each time research is added (`civ_add_research_points`), so the cost set when research
//  began is worked out again each turn. Only the cost: `research()` would also start the advance over.
//
// Ahead of `High`, which is when `civ2-player` processes the cities' yields and so adds the turn's research: completion
//  is checked as it's added, so a cost worked out after that would complete an advance at the last turn's price.
exports.researchCostPriority = new Priority_1.default(900);
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    new TurnStart_1.default('civ2-science:player/turn-start/research-cost', exports.researchCostPriority, new Effect_1.default((0, progress_1.updateResearchCost)(playerResearchRegistry, ruleRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=turn-start.js.map