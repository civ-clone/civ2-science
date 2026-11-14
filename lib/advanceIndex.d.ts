import { AdvanceRow, NEVER, NONE } from '../data/advances';
import Advance from '@civ-clone/core-science/Advance';
/** Future Technology's index (OpenCiv2 `ADV_FUTURE_TECH`): never counted as known, so it can always be researched again. */
export declare const FUTURE_TECHNOLOGY = 89;
/** The advance's index in RULES.TXT's @CIVILIZE, or `-1` for one Civilization II doesn't have. */
export declare const advanceIndex: (AdvanceType: typeof Advance) => number;
/** The advance at `index`. */
export declare const advanceAt: (index: number) => typeof Advance;
/** The row for `index`. */
export declare const rowAt: (index: number) => AdvanceRow;
/** Whether the game makes the advance available at all: its first prerequisite isn't `no` (`rules_load_advances`). */
export declare const isEnabled: (index: number) => boolean;
/** How many advances are available: the research cost scales by it (`game.num_advances`). */
export declare const enabledAdvances: number;
/**
 * Whether a player knows the advance at `index`, as `civ_has_advance` answers: `nil` is always known, `no` never, and
 *  Future Technology never (so it stays researchable).
 */
export declare const knows: (
  index: number,
  known: (index: number) => boolean
) => boolean;
/**
 * The indices a player could research next, lowest first, as `civ_pick_research_advance` and
 *  `civ_choose_research_dialog` list them: available, not known, both prerequisites known, and not marked `no, no`.
 */
export declare const researchCandidates: (
  known: (index: number) => boolean
) => number[];
/** The indices known among `completed` advances (Future Technology, never counted as known, left out). */
export declare const knownIndices: (completed: Advance[]) => Set<number>;
export { NEVER, NONE };
