"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offeredChoices = exports.CHIEFTAIN = void 0;
/** Chieftain, the easiest level, on which every choice is shown. */
exports.CHIEFTAIN = 0;
/**
 * Which of `candidates` (indices, lowest first) a person is offered to research next (OpenCiv2 `src/auto/civ.cpp`
 *  `civ_choose_research_dialog` and `civ_pick_research_advance`, richardpenman/civ2@49f26ec). The first is always
 *  offered; after it, every advance whose index less the number of advances the player has gained is a multiple of 3
 *  is left out, except on Chieftain. The computer players are offered every one.
 *
 * `numberOfAdvances` is the game's `num_advances`. C's `%` keeps the sign of the left side, as JavaScript's does, so an
 *  index below it is hidden only when the difference is an exact multiple of 3.
 */
const offeredChoices = (candidates, numberOfAdvances, level, human) => !human || level === exports.CHIEFTAIN
    ? candidates
    : candidates.filter((index, position) => position === 0 || (index - numberOfAdvances) % 3 !== 0);
exports.offeredChoices = offeredChoices;
exports.default = exports.offeredChoices;
//# sourceMappingURL=hiddenChoice.js.map