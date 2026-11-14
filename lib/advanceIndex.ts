import { AdvanceRow, NEVER, NONE, advances } from '../data/advances';
import Advance from '@civ-clone/core-science/Advance';

// Civilization II's rules compare advances by their index in RULES.TXT, not by the order a registry holds them in. The
//  66 advances it shares with Civilization register themselves as their packages load, in package-name order, so
//  `advanceRegistry.entries()` is never this order: everything here asks `data/advances`.

/** Future Technology's index (OpenCiv2 `ADV_FUTURE_TECH`): never counted as known, so it can always be researched again. */
export const FUTURE_TECHNOLOGY = 89;

const indices: Map<typeof Advance, number> = new Map(
  advances.map(([AdvanceType], index): [typeof Advance, number] => [
    AdvanceType,
    index,
  ])
);

/** The advance's index in RULES.TXT's @CIVILIZE, or `-1` for one Civilization II doesn't have. */
export const advanceIndex = (AdvanceType: typeof Advance): number =>
  indices.get(AdvanceType) ?? -1;

/** The advance at `index`. */
export const advanceAt = (index: number): typeof Advance => advances[index][0];

/** The row for `index`. */
export const rowAt = (index: number): AdvanceRow => advances[index];

/** Whether the game makes the advance available at all: its first prerequisite isn't `no` (`rules_load_advances`). */
export const isEnabled = (index: number): boolean =>
  advances[index][1] !== NEVER;

/** How many advances are available: the research cost scales by it (`game.num_advances`). */
export const enabledAdvances: number = advances.filter((row, index) =>
  isEnabled(index)
).length;

/**
 * Whether a player knows the advance at `index`, as `civ_has_advance` answers: `nil` is always known, `no` never, and
 *  Future Technology never (so it stays researchable).
 */
export const knows = (
  index: number,
  known: (index: number) => boolean
): boolean =>
  index === NEVER
    ? false
    : index < 0
    ? true
    : index === FUTURE_TECHNOLOGY
    ? false
    : known(index);

/**
 * The indices a player could research next, lowest first, as `civ_pick_research_advance` and
 *  `civ_choose_research_dialog` list them: available, not known, both prerequisites known, and not marked `no, no`.
 */
export const researchCandidates = (
  known: (index: number) => boolean
): number[] =>
  advances
    .map((row, index) => index)
    .filter((index) => {
      const [, first, second] = advances[index];

      return (
        isEnabled(index) &&
        !knows(index, known) &&
        knows(first, known) &&
        knows(second, known) &&
        (first !== NEVER || second !== NEVER)
      );
    });

/** The indices known among `completed` advances (Future Technology, never counted as known, left out). */
export const knownIndices = (completed: Advance[]): Set<number> => {
  const known = new Set<number>();

  completed.forEach((advance: Advance): void => {
    const index = advanceIndex(advance.constructor as typeof Advance);

    if (index >= 0 && index !== FUTURE_TECHNOLOGY) {
      known.add(index);
    }
  });

  return known;
};

export { NEVER, NONE };
