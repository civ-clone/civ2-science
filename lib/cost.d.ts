import { MapSize } from '@civ-clone/civ2-rules/lib/mapSize';
/** What an advance's cost depends on. */
export interface ResearchCostInputs {
  /** The advances the player has gained (`num_advances`), every Future Technology included. */
  advances: number;
  /** The advances the reference player has gained: see `Rules/Research/cost`. */
  reference: number;
  /** The difficulty level, 0 (Chieftain) to 5 (Deity). */
  level: number;
  /** Whether a person plays the player. */
  human: boolean;
  /** The game's turn. */
  turn: number;
  /** @COSMIC's tech paradigm, in tenths (civ2-rules `cosmic.techParadigm`). */
  techParadigm: number;
  /** How many advances the game makes available (`game.num_advances`). */
  enabledAdvances: number;
  /** The map's size class. */
  mapSize: MapSize;
}
/** A cost below 1 or above 32000 is 32000, as Civilization II's is: also for a cost fixed per advance. */
export declare const capped: (cost: number) => number;
/** Which of the rate's parts that follow the advances known `researchRate` leaves in. */
export interface ResearchRateOptions {
  /**
   * The three quarters more: scaled down while `n` is under 20 (`true`, Civilization II's), whole whatever `n` is
   * (`'full'`, as from the twentieth on), or left out (`false`). A cost fixed per advance (civ-clone/web-renderer#1072)
   * takes it whole, as the rounding then falls as Civilization II's does, and its weights carry the rest of the ramp
   * (`fullRampStep`).
   */
  ramp?: boolean | 'full';
  /**
   * For a person, never below 11 − n. A cost fixed per advance leaves it out, as `civ1-enhanced`'s leaves out
   * Civilization's.
   */
  floor?: boolean;
}
/**
 * The ratio each advance known is multiplied by: everything in `researchCost` but the advances known themselves
 *  (OpenCiv2 `src/auto/civ.cpp` `civ_research_cost`, richardpenman/civ2@49f26ec). C's integer division rounds towards
 *  zero, hence `Math.trunc`.
 *
 * - The ratio starts at 6 + 2 × level for a person (levels above Emperor count as Emperor) and 14 − level for the
 *   computer.
 * - Behind the reference player it is 1 lower (not on Chieftain), and 1 lower again on Deity after turn 150 when 5 or
 *   more behind. Level with or ahead of it, it is a third of the lead higher.
 * - Past 19 advances it rises by the advances less an eighth of the turn, 0 to 6.
 * - Then the tech paradigm (tenths), then three quarters of the ratio more, scaled down while `n` is under 20 (`ramp`).
 * - Then scaled to 67 advances, by the map's size (large × 5/4, small × 4/5), and for a person never below 11 − n
 *   (`floor`).
 */
export declare const researchRate: (
  {
    advances,
    reference,
    level,
    human,
    turn,
    techParadigm,
    enabledAdvances,
    mapSize,
  }: ResearchCostInputs,
  { ramp, floor }?: ResearchRateOptions
) => number;
/**
 * What the n-th advance costs in steps of the rate without its ramp: n, and three quarters more by the twentieth, as
 *  `researchRate`'s ramp has it (unrounded). For the weights of a cost fixed per advance (civ-clone/web-renderer#1072).
 */
export declare const rampedStep: (n: number) => number;
/** The whole ramp: three quarters more. */
export declare const FULL_RAMP = 1.75;
/**
 * What the n-th advance costs in steps of the ratio with the whole ramp (`researchRate`'s `ramp: 'full'`): `rampedStep`
 *  over the whole ramp, so n from the twentieth on and a little less before it. For the weights of a cost fixed per
 *  advance (civ-clone/web-renderer#1072).
 */
export declare const fullRampStep: (n: number) => number;
/**
 * `bulbs` times `multiplier`, to the nearest whole bulb, then `capped`: for a rule set that multiplies the research
 *  cost (`Rules/Research/RateMultiplier`). A multiplier of 1, Civilization II's, leaves `bulbs` as they are, rounding
 *  nothing.
 */
export declare const multipliedCost: (
  bulbs: number,
  multiplier?: number
) => number;
/**
 * The bulbs the next advance costs (OpenCiv2 `src/auto/civ.cpp` `civ_research_cost`, richardpenman/civ2@49f26ec), for a
 *  game that isn't a scenario: `n`, the advances gained (at least 1), times the ratio (`researchRate`), stopping at
 *  32000. `multiplier` is a rule set's (`multipliedCost`): 1, Civilization II's own, unless told otherwise.
 */
export declare const researchCost: (
  inputs: ResearchCostInputs,
  multiplier?: number
) => number;
export default researchCost;
