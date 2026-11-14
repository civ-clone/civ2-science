"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.researchCost = void 0;
const DEITY = 5, 
// The research cost stops at this.
MAXIMUM_COST = 32000;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
/**
 * The bulbs the next advance costs (OpenCiv2 `src/auto/civ.cpp` `civ_research_cost`, richardpenman/civ2@49f26ec), for a
 *  game that isn't a scenario. C's integer division rounds towards zero, hence `Math.trunc`.
 *
 * - `n`, the advances gained (at least 1), times a ratio.
 * - The ratio starts at 6 + 2 × level for a person (levels above Emperor count as Emperor) and 14 − level for the
 *   computer.
 * - Behind the reference player it is 1 lower (not on Chieftain), and 1 lower again on Deity after turn 150 when 5 or
 *   more behind. Level with or ahead of it, it is a third of the lead higher.
 * - Past 19 advances it rises by the advances less an eighth of the turn, 0 to 6.
 * - Then the tech paradigm (tenths), then three quarters of the ratio more, scaled down while `n` is under 20.
 * - Then scaled to 67 advances, by the map's size (large × 5/4, small × 4/5), and for a person never below 11 − n.
 */
const researchCost = ({ advances, reference, level, human, turn, techParadigm, enabledAdvances, mapSize, }) => {
    const known = Math.max(advances, 0), techCount = known < 2 ? 1 : known, clampedLevel = clamp(level, 0, 4);
    let ratio = human ? clampedLevel * 2 + 6 : 14 - clampedLevel;
    if (techCount < reference) {
        if (level !== 0) {
            ratio--;
        }
        if (level === DEITY && techCount + 4 < reference && turn > 150) {
            ratio--;
        }
    }
    else {
        ratio += Math.trunc((techCount - reference) / 3);
    }
    if (techCount > 19) {
        ratio += clamp(techCount - Math.trunc(turn / 8), 0, 6);
    }
    if (techParadigm !== 10) {
        ratio = Math.trunc((techParadigm * ratio) / 10);
    }
    let extra = Math.floor((ratio * 3) / 4);
    if (known < 20) {
        extra = Math.trunc((known * extra) / 20);
    }
    ratio += extra;
    if (enabledAdvances > 67) {
        ratio = Math.trunc((ratio * 67) / enabledAdvances);
    }
    if (mapSize === 'large') {
        ratio = Math.trunc((ratio * 5) / 4);
    }
    if (mapSize === 'small') {
        ratio = Math.trunc((ratio * 4) / 5);
    }
    if (human && ratio < 11 - techCount) {
        ratio = 11 - techCount;
    }
    const cost = ratio * techCount;
    return cost < 1 || cost > MAXIMUM_COST ? MAXIMUM_COST : cost;
};
exports.researchCost = researchCost;
exports.default = exports.researchCost;
//# sourceMappingURL=cost.js.map