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

const DEITY = 5,
  // The research cost stops at this.
  MAXIMUM_COST = 32000;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** A cost below 1 or above 32000 is 32000, as Civilization II's is: also for a cost fixed per advance. */
export const capped = (cost: number): number =>
  cost < 1 || cost > MAXIMUM_COST ? MAXIMUM_COST : cost;

/** Which of the rate's parts that follow the advances known `researchRate` leaves in. */
export interface ResearchRateOptions {
  /**
   * The three quarters more: scaled down while `n` is under 20 (`true`, Civilization II's), whole whatever `n` is
   * (`'full'`, as from the twentieth on), or left out (`false`). A cost fixed per advance (civ-clone/web-renderer#1072)
   * takes it whole, as the rounding then falls as Civilization II's does, and its weights carry the rest of the ramp
   * (`fullRampStep`).
   */
  ramp?: boolean | 'full';
  /** For a person, never below 11 − n. A cost fixed per advance leaves it out, as Civilization's does. */
  floor?: boolean;
}

/**
 * The ratio each advance known is multiplied by: everything in `researchCost` but the advances known themselves (OpenCiv2
 *  `src/auto/civ.cpp` `civ_research_cost`, richardpenman/civ2@49f26ec). C's integer division rounds towards zero, hence
 *  `Math.trunc`.
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
export const researchRate = (
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
  { ramp = true, floor = true }: ResearchRateOptions = {}
): number => {
  const known = Math.max(advances, 0),
    techCount = known < 2 ? 1 : known,
    clampedLevel = clamp(level, 0, 4);

  let ratio = human ? clampedLevel * 2 + 6 : 14 - clampedLevel;

  if (techCount < reference) {
    if (level !== 0) {
      ratio--;
    }

    if (level === DEITY && techCount + 4 < reference && turn > 150) {
      ratio--;
    }
  } else {
    ratio += Math.trunc((techCount - reference) / 3);
  }

  if (techCount > 19) {
    ratio += clamp(techCount - Math.trunc(turn / 8), 0, 6);
  }

  if (techParadigm !== 10) {
    ratio = Math.trunc((techParadigm * ratio) / 10);
  }

  if (ramp !== false) {
    let extra = Math.floor((ratio * 3) / 4);

    if (ramp !== 'full' && known < 20) {
      extra = Math.trunc((known * extra) / 20);
    }

    ratio += extra;
  }

  if (enabledAdvances > 67) {
    ratio = Math.trunc((ratio * 67) / enabledAdvances);
  }

  if (mapSize === 'large') {
    ratio = Math.trunc((ratio * 5) / 4);
  }

  if (mapSize === 'small') {
    ratio = Math.trunc((ratio * 4) / 5);
  }

  if (floor && human && ratio < 11 - techCount) {
    ratio = 11 - techCount;
  }

  return ratio;
};

/**
 * What the n-th advance costs in steps of the rate without its ramp: n, and three quarters more by the twentieth, as
 *  `researchRate`'s ramp has it (unrounded). For the weights of a cost fixed per advance (civ-clone/web-renderer#1072).
 */
export const rampedStep = (n: number): number =>
  n * (1 + (0.75 * Math.min(n, 20)) / 20);

/** The whole ramp: three quarters more. */
export const FULL_RAMP = 1.75;

/**
 * What the n-th advance costs in steps of the ratio with the whole ramp (`researchRate`'s `ramp: 'full'`): `rampedStep`
 *  over the whole ramp, so n from the twentieth on and a little less before it. For the weights of a cost fixed per
 *  advance (civ-clone/web-renderer#1072).
 */
export const fullRampStep = (n: number): number => rampedStep(n) / FULL_RAMP;

/**
 * The bulbs the next advance costs (OpenCiv2 `src/auto/civ.cpp` `civ_research_cost`, richardpenman/civ2@49f26ec), for a
 *  game that isn't a scenario: `n`, the advances gained (at least 1), times the ratio (`researchRate`), stopping at
 *  32000.
 */
export const researchCost = (inputs: ResearchCostInputs): number => {
  const known = Math.max(inputs.advances, 0);

  return capped(researchRate(inputs) * (known < 2 ? 1 : known));
};

export default researchCost;
