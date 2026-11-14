import { advances } from '../data/advances';
import { CHIEFTAIN } from './hiddenChoice';

/** C's `rand()`: a whole number from 0 to 32767, from a generator of numbers in [0, 1). */
export const cRand = (randomNumberGenerator: () => number): number =>
  Math.floor(randomNumberGenerator() * 32768);

export interface PickResearchOptions {
  /** The indices the player could research, lowest first (`researchCandidates`). */
  candidates: number[];
  /** Whether a person plays the player. */
  human: boolean;
  /** The game's `num_advances` for the player, for the hidden choice. */
  numberOfAdvances: number;
  /** The difficulty level, 0 (Chieftain) to 5 (Deity). */
  level: number;
  /** What the advance at an index is worth to the player (OpenCiv2's `ai_advance_value`, at least 1). */
  value: (index: number) => number;
  randomNumberGenerator: () => number;
}

/**
 * The advance the game picks for a player to research, or `-1` when there is none (OpenCiv2 `src/auto/civ.cpp`
 *  `civ_pick_research_advance`, richardpenman/civ2@49f26ec). It picks for the computer players, for a person's free
 *  advances before the first turn, and as the suggestion a person is shown.
 *
 * Every candidate gets a score and the first highest wins. A person's candidates leave out the hidden choices, as the
 *  list they are offered does (`offeredChoices`), and each scores `rand() % 3 + value − 1`. A computer player's score
 *  `rand() % value`, or 0 without a draw when the value is 1.
 */
export const pickResearch = ({
  candidates,
  human,
  numberOfAdvances,
  level,
  value,
  randomNumberGenerator,
}: PickResearchOptions): number => {
  let bestScore = -1,
    best = -1,
    counted = 0;

  candidates.forEach((index: number): void => {
    if (
      human &&
      counted !== 0 &&
      level !== CHIEFTAIN &&
      (index - numberOfAdvances) % 3 === 0
    ) {
      return;
    }

    counted++;

    let score: number;

    if (!human) {
      const worth = value(index);

      score = worth <= 1 ? 0 : cRand(randomNumberGenerator) % worth;
    } else {
      score = (cRand(randomNumberGenerator) % 3) + value(index) - 1;
    }

    if (bestScore < score) {
      bestScore = score;
      best = index;
    }
  });

  return best;
};

export interface AdvanceValueOptions {
  /** The leader's civilize attitude: 1 civilized, 0, −1 militaristic. */
  civilize: number;
  /** Whether the player knows the advance at an index. */
  known: (index: number) => boolean;
  /** Whether any player knows the advance at an index. */
  knownByAnyone: (index: number) => boolean;
}

/**
 * What an advance is worth to a player, from the parts of OpenCiv2's `ai_advance_value` (`src/auto/ai.cpp`,
 *  richardpenman/civ2@49f26ec) that need only the advances: its @CIVILIZE value plus its civilized modifier times the
 *  leader's civilize attitude, 1 more if nobody knows it yet, 1 less for each known advance it leads to, and at least
 *  1. Not here yet (see the README): the terms for the units it leads to (expansion by sea), the tribe's own
 *  preferences, the Port Facility, Aqueduct and Sewer, University and Invention terms, and the computer players' terms
 *  for a human lead and wonders. With no cities, units or wonders (before the first turn) the last ones add nothing.
 */
export const advanceValue =
  ({
    civilize,
    known,
    knownByAnyone,
  }: AdvanceValueOptions): ((index: number) => number) =>
  (index: number): number => {
    const [, , , aiValue, civilizedModifier] = advances[index];

    let worth = civilizedModifier * civilize + aiValue;

    if (!knownByAnyone(index)) {
      worth++;
    }

    advances.forEach(([, first, second], other: number): void => {
      if ((first === index || second === index) && known(other)) {
        worth--;
      }
    });

    return worth < 2 ? 1 : worth;
  };
