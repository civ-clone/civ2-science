"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.hiddenChoice = exports.plumbing = exports.requirementsRulesFor = exports.deriveRequirementsRules = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const advanceIndex_1 = require("../../lib/advanceIndex");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Advances_1 = require("../../Advances");
const Requirements_1 = require("@civ-clone/core-science/Rules/Requirements");
const isHuman_1 = require("@civ-clone/base-difficulty/lib/isHuman");
const level_1 = require("@civ-clone/civ2-difficulty/level");
const cost_1 = require("./cost");
const hiddenChoice_1 = require("../../lib/hiddenChoice");
const Requirements_2 = require("../../Requirements");
const requirements_1 = require("@civ-clone/base-science-research/lib/requirements");
var requirements_2 = require("@civ-clone/base-science-research/lib/requirements");
Object.defineProperty(exports, "deriveRequirementsRules", { enumerable: true, get: function () { return requirements_2.deriveRequirementsRules; } });
Object.defineProperty(exports, "requirementsRulesFor", { enumerable: true, get: function () { return requirements_2.requirementsRulesFor; } });
/** Plumbing's prerequisites are `no`: Civilization II never makes it available (decision 11 of the M2 plan). */
const plumbing = () => new Requirements_1.default('civ2-science:research/requirements/Plumbing', new Criterion_1.default((CheckAdvance) => CheckAdvance === Advances_1.Plumbing), new Effect_1.default(() => false));
exports.plumbing = plumbing;
/**
 * The hidden choice (`lib/hiddenChoice`): a person is never offered every third advance they could research. A
 * `Requirements` rule is only given the advance and the completed advances, so the player is the one whose research
 * holds that same list (`PlayerResearch.available()` passes its own). What's offered depends only on that list, the
 * level and whether a person plays, so it is worked out once for each and kept until one of them changes (a list only
 * grows).
 */
const hiddenChoice = (playerResearchRegistry = PlayerResearchRegistry_1.instance, clientRegistry = ClientRegistry_1.instance, gameDifficultyRegistry = GameDifficultyRegistry_1.instance) => {
    const cache = new WeakMap(), researchOf = (completed) => {
        var _a;
        return (_a = playerResearchRegistry
            .entries()
            .find((playerResearch) => playerResearch.complete() === completed)) !== null && _a !== void 0 ? _a : null;
    }, hidden = (completed) => {
        const playerResearch = researchOf(completed);
        // Asked about advances that aren't a player's (no research holds the list): nothing is hidden.
        if (playerResearch === null) {
            return new Set();
        }
        const human = (0, isHuman_1.default)(playerResearch.player(), clientRegistry), level = (0, level_1.levelOf)(gameDifficultyRegistry), cached = cache.get(completed);
        if (cached &&
            cached.length === completed.length &&
            cached.human === human &&
            cached.level === level) {
            return cached.hidden;
        }
        const known = (0, advanceIndex_1.knownIndices)(completed), candidates = (0, advanceIndex_1.researchCandidates)((index) => known.has(index)), offered = (0, hiddenChoice_1.default)(candidates, (0, cost_1.numberOfAdvances)(playerResearch), level, human), 
        // Only a candidate left out is hidden: whether any other advance can be researched is the other rules' to say.
        hiddenIndices = new Set(candidates.filter((index) => !offered.includes(index)));
        cache.set(completed, {
            length: completed.length,
            human,
            level,
            hidden: hiddenIndices,
        });
        return hiddenIndices;
    };
    return new Requirements_1.default('civ2-science:research/requirements/hidden-choice', new Criterion_1.default((CheckAdvance) => (0, advanceIndex_1.advanceIndex)(CheckAdvance) >= 0), new Effect_1.default((CheckAdvance, completed) => !hidden(completed).has((0, advanceIndex_1.advanceIndex)(CheckAdvance))));
};
exports.hiddenChoice = hiddenChoice;
/**
 * Every rule about which advances a player can research, as `registerRules` registers them: one for each of
 * `Requirements`' entries, then Plumbing's and the hidden choice. For a rule registry without a game's `requirements`
 * (tests, and rulesets that build on these).
 */
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance, clientRegistry = ClientRegistry_1.instance, gameDifficultyRegistry = GameDifficultyRegistry_1.instance) => [
    ...Requirements_2.default.flatMap(requirements_1.requirementsRulesFor),
    (0, exports.plumbing)(),
    (0, exports.hiddenChoice)(playerResearchRegistry, clientRegistry, gameDifficultyRegistry),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=requirements.js.map