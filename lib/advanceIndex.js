"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NONE = exports.NEVER = exports.knownIndices = exports.researchCandidates = exports.knows = exports.enabledAdvances = exports.isEnabled = exports.rowAt = exports.advanceAt = exports.advanceIndex = exports.FUTURE_TECHNOLOGY = void 0;
const advances_1 = require("../data/advances");
Object.defineProperty(exports, "NEVER", { enumerable: true, get: function () { return advances_1.NEVER; } });
Object.defineProperty(exports, "NONE", { enumerable: true, get: function () { return advances_1.NONE; } });
// Civilization II's rules compare advances by their index in RULES.TXT, not by the order a registry holds them in. The
//  66 advances it shares with Civilization register themselves as their packages load, in package-name order, so
//  `advanceRegistry.entries()` is never this order: everything here asks `data/advances`.
/** Future Technology's index (OpenCiv2 `ADV_FUTURE_TECH`): never counted as known, so it can always be researched again. */
exports.FUTURE_TECHNOLOGY = 89;
const indices = new Map(advances_1.advances.map(([AdvanceType], index) => [
    AdvanceType,
    index,
]));
/** The advance's index in RULES.TXT's @CIVILIZE, or `-1` for one Civilization II doesn't have. */
const advanceIndex = (AdvanceType) => { var _a; return (_a = indices.get(AdvanceType)) !== null && _a !== void 0 ? _a : -1; };
exports.advanceIndex = advanceIndex;
/** The advance at `index`. */
const advanceAt = (index) => advances_1.advances[index][0];
exports.advanceAt = advanceAt;
/** The row for `index`. */
const rowAt = (index) => advances_1.advances[index];
exports.rowAt = rowAt;
/** Whether the game makes the advance available at all: its first prerequisite isn't `no` (`rules_load_advances`). */
const isEnabled = (index) => advances_1.advances[index][1] !== advances_1.NEVER;
exports.isEnabled = isEnabled;
/** How many advances are available: the research cost scales by it (`game.num_advances`). */
exports.enabledAdvances = advances_1.advances.filter((row, index) => (0, exports.isEnabled)(index)).length;
/**
 * Whether a player knows the advance at `index`, as `civ_has_advance` answers: `nil` is always known, `no` never, and
 *  Future Technology never (so it stays researchable).
 */
const knows = (index, known) => index === advances_1.NEVER
    ? false
    : index < 0
        ? true
        : index === exports.FUTURE_TECHNOLOGY
            ? false
            : known(index);
exports.knows = knows;
/**
 * The indices a player could research next, lowest first, as `civ_pick_research_advance` and
 *  `civ_choose_research_dialog` list them: available, not known, both prerequisites known, and not marked `no, no`.
 */
const researchCandidates = (known) => advances_1.advances
    .map((row, index) => index)
    .filter((index) => {
    const [, first, second] = advances_1.advances[index];
    return ((0, exports.isEnabled)(index) &&
        !(0, exports.knows)(index, known) &&
        (0, exports.knows)(first, known) &&
        (0, exports.knows)(second, known) &&
        (first !== advances_1.NEVER || second !== advances_1.NEVER));
});
exports.researchCandidates = researchCandidates;
/** The indices known among `completed` advances (Future Technology, never counted as known, left out). */
const knownIndices = (completed) => {
    const known = new Set();
    completed.forEach((advance) => {
        const index = (0, exports.advanceIndex)(advance.constructor);
        if (index >= 0 && index !== exports.FUTURE_TECHNOLOGY) {
            known.add(index);
        }
    });
    return known;
};
exports.knownIndices = knownIndices;
//# sourceMappingURL=advanceIndex.js.map