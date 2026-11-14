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
export declare const researchCost: ({
  advances,
  reference,
  level,
  human,
  turn,
  techParadigm,
  enabledAdvances,
  mapSize,
}: ResearchCostInputs) => number;
export default researchCost;
