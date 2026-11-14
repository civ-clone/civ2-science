import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import Requirements from '@civ-clone/core-science/Rules/Requirements';
export {
  deriveRequirementsRules,
  requirementsRulesFor,
} from '@civ-clone/base-science-research/lib/requirements';
/** Plumbing's prerequisites are `no`: Civilization II never makes it available (decision 11 of the M2 plan). */
export declare const plumbing: () => Requirements;
/**
 * The hidden choice (`lib/hiddenChoice`): a person is never offered every third advance they could research. A
 * `Requirements` rule is only given the advance and the completed advances, so the player is the one whose research
 * holds that same list (`PlayerResearch.available()` passes its own). What's offered depends only on that list, the
 * level and whether a person plays, so it is worked out once for each and kept until one of them changes (a list only
 * grows).
 */
export declare const hiddenChoice: (
  playerResearchRegistry?: PlayerResearchRegistry,
  clientRegistry?: ClientRegistry,
  gameDifficultyRegistry?: GameDifficultyRegistry
) => Requirements;
/**
 * Every rule about which advances a player can research, as `registerRules` registers them: one for each of
 * `Requirements`' entries, then Plumbing's and the hidden choice. For a rule registry without a game's `requirements`
 * (tests, and rulesets that build on these).
 */
export declare const getRules: (
  playerResearchRegistry?: PlayerResearchRegistry,
  clientRegistry?: ClientRegistry,
  gameDifficultyRegistry?: GameDifficultyRegistry
) => Requirements[];
export default getRules;
