import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  advanceIndex,
  knownIndices,
  researchCandidates,
} from '../../lib/advanceIndex';
import Advance from '@civ-clone/core-science/Advance';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { Plumbing } from '../../Advances';
import Requirements from '@civ-clone/core-science/Rules/Requirements';
import isHuman from '@civ-clone/base-difficulty/lib/isHuman';
import { levelOf } from '@civ-clone/civ2-difficulty/level';
import { numberOfAdvances } from './cost';
import offeredChoices from '../../lib/hiddenChoice';
import requiresAdvances from '../../Requirements';
import { requirementsRulesFor } from '@civ-clone/base-science-research/lib/requirements';

export {
  deriveRequirementsRules,
  requirementsRulesFor,
} from '@civ-clone/base-science-research/lib/requirements';

/** Plumbing's prerequisites are `no`: Civilization II never makes it available (decision 11 of the M2 plan). */
export const plumbing = (): Requirements =>
  new Requirements(
    'civ2-science:research/requirements/Plumbing',
    new Criterion(
      (CheckAdvance: typeof Advance): boolean => CheckAdvance === Plumbing
    ),
    new Effect((): boolean => false)
  );

type Hidden = {
  length: number;
  human: boolean;
  level: number;
  hidden: Set<number>;
};

/**
 * The hidden choice (`lib/hiddenChoice`): a person is never offered every third advance they could research. A
 * `Requirements` rule is only given the advance and the completed advances, so the player is the one whose research
 * holds that same list (`PlayerResearch.available()` passes its own). What's offered depends only on that list, the
 * level and whether a person plays, so it is worked out once for each and kept until one of them changes (a list only
 * grows).
 */
export const hiddenChoice = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  clientRegistry: ClientRegistry = clientRegistryInstance,
  gameDifficultyRegistry: GameDifficultyRegistry = gameDifficultyRegistryInstance
): Requirements => {
  const cache: WeakMap<Advance[], Hidden> = new WeakMap(),
    researchOf = (completed: Advance[]): PlayerResearch | null =>
      playerResearchRegistry
        .entries()
        .find(
          (playerResearch: PlayerResearch): boolean =>
            playerResearch.complete() === completed
        ) ?? null,
    hidden = (completed: Advance[]): Set<number> => {
      const playerResearch = researchOf(completed);

      // Asked about advances that aren't a player's (no research holds the list): nothing is hidden.
      if (playerResearch === null) {
        return new Set();
      }

      const human = isHuman(playerResearch.player(), clientRegistry),
        level = levelOf(gameDifficultyRegistry),
        cached = cache.get(completed);

      if (
        cached &&
        cached.length === completed.length &&
        cached.human === human &&
        cached.level === level
      ) {
        return cached.hidden;
      }

      const known = knownIndices(completed),
        candidates = researchCandidates((index: number): boolean =>
          known.has(index)
        ),
        offered = offeredChoices(
          candidates,
          numberOfAdvances(playerResearch),
          level,
          human
        ),
        // Only a candidate left out is hidden: whether any other advance can be researched is the other rules' to say.
        hiddenIndices = new Set(
          candidates.filter(
            (index: number): boolean => !offered.includes(index)
          )
        );

      cache.set(completed, {
        length: completed.length,
        human,
        level,
        hidden: hiddenIndices,
      });

      return hiddenIndices;
    };

  return new Requirements(
    'civ2-science:research/requirements/hidden-choice',
    new Criterion(
      (CheckAdvance: typeof Advance): boolean => advanceIndex(CheckAdvance) >= 0
    ),
    new Effect(
      (CheckAdvance: typeof Advance, completed: Advance[]): boolean =>
        !hidden(completed).has(advanceIndex(CheckAdvance))
    )
  );
};

/**
 * Every rule about which advances a player can research, as `registerRules` registers them: one for each of
 * `Requirements`' entries, then Plumbing's and the hidden choice. For a rule registry without a game's `requirements`
 * (tests, and rulesets that build on these).
 */
export const getRules: (
  playerResearchRegistry?: PlayerResearchRegistry,
  clientRegistry?: ClientRegistry,
  gameDifficultyRegistry?: GameDifficultyRegistry
) => Requirements[] = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  clientRegistry: ClientRegistry = clientRegistryInstance,
  gameDifficultyRegistry: GameDifficultyRegistry = gameDifficultyRegistryInstance
): Requirements[] => [
  ...requiresAdvances.flatMap(requirementsRulesFor),
  plumbing(),
  hiddenChoice(playerResearchRegistry, clientRegistry, gameDifficultyRegistry),
];

export default getRules;
