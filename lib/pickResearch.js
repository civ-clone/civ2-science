"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advanceValue = exports.pickResearch = exports.cRand = void 0;
const advances_1 = require("../data/advances");
const hiddenChoice_1 = require("./hiddenChoice");
/** C's `rand()`: a whole number from 0 to 32767, from a generator of numbers in [0, 1). */
const cRand = (randomNumberGenerator) => Math.floor(randomNumberGenerator() * 32768);
exports.cRand = cRand;
/**
 * The advance the game picks for a player to research, or `-1` when there is none (OpenCiv2 `src/auto/civ.cpp`
 *  `civ_pick_research_advance`, richardpenman/civ2@49f26ec). It picks for the computer players, for a person's free
 *  advances before the first turn, and as the suggestion a person is shown.
 *
 * Every candidate gets a score and the first highest wins. A person's candidates leave out the hidden choices, as the
 *  list they are offered does (`offeredChoices`), and each scores `rand() % 3 + value − 1`. A computer player's score
 *  `rand() % value`, or 0 without a draw when the value is 1.
 */
const pickResearch = ({ candidates, human, numberOfAdvances, level, value, randomNumberGenerator, }) => {
    let bestScore = -1, best = -1, counted = 0;
    candidates.forEach((index) => {
        if (human &&
            counted !== 0 &&
            level !== hiddenChoice_1.CHIEFTAIN &&
            (index - numberOfAdvances) % 3 === 0) {
            return;
        }
        counted++;
        let score;
        if (!human) {
            const worth = value(index);
            score = worth <= 1 ? 0 : (0, exports.cRand)(randomNumberGenerator) % worth;
        }
        else {
            score = ((0, exports.cRand)(randomNumberGenerator) % 3) + value(index) - 1;
        }
        if (bestScore < score) {
            bestScore = score;
            best = index;
        }
    });
    return best;
};
exports.pickResearch = pickResearch;
/**
 * What an advance is worth to a player, from the parts of OpenCiv2's `ai_advance_value` (`src/auto/ai.cpp`,
 *  richardpenman/civ2@49f26ec) that need only the advances: its @CIVILIZE value plus its civilized modifier times the
 *  leader's civilize attitude, 1 more if nobody knows it yet, 1 less for each known advance it leads to, and at least
 *  1. Not here yet (see the README): the terms for the units it leads to (expansion by sea), the tribe's own
 *  preferences, the Port Facility, Aqueduct and Sewer, University and Invention terms, and the computer players' terms
 *  for a human lead and wonders. With no cities, units or wonders (before the first turn) the last ones add nothing.
 */
const advanceValue = ({ civilize, known, knownByAnyone, }) => (index) => {
    const [, , , aiValue, civilizedModifier] = advances_1.advances[index];
    let worth = civilizedModifier * civilize + aiValue;
    if (!knownByAnyone(index)) {
        worth++;
    }
    advances_1.advances.forEach(([, first, second], other) => {
        if ((first === index || second === index) && known(other)) {
            worth--;
        }
    });
    return worth < 2 ? 1 : worth;
};
exports.advanceValue = advanceValue;
//# sourceMappingURL=pickResearch.js.map