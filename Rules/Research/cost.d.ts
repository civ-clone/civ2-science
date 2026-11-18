import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import { MapSize } from '@civ-clone/civ2-rules/lib/mapSize';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Cost from '@civ-clone/core-science/Rules/Cost';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { ResearchCostInputs } from '../../lib/cost';
/** What `num_advances` is for a civilization knowing nothing: see `numberOfAdvances`. */
export declare const STARTING_NUMBER_OF_ADVANCES = 1;
/**
 * Civilization II's `num_advances` for a player: 1 to start with, then 1 more for each advance gained, each Future
 * Technology included (OpenCiv2 `src/auto/civ.cpp`, richardpenman/civ2@49f26ec: `civ_create_reset_civ` sets it to 0,
 * then `civ_create_place_units`, as the civilization is placed on the map, to 1, and `civ_give_advance` adds 1 from
 * the first turn on). Civ2 doesn't count the advances given before the first turn, by the start balancing; these do
 * (see the README).
 */
export declare const numberOfAdvances: (
  playerResearch: PlayerResearch
) => number;
/**
 * The reference count the research cost compares with: the most advances any person's player has, or, with no person
 * playing (an all-computer game, such as one only watched), the most any player has, barbarians left out.
 *
 * Civilization II reads `civs[game.best_human_rank]`, the civilization in the slot numbered by the best-placed human's
 * power rank (OpenCiv2's `civ2types.h` notes the rank-as-civilization mix-up). This engine has no fixed civilization
 * slots, so that can't be followed; this is the M2 survey's Q25 reading, the leading human. The original always has a
 * person; with none, the leading player stands in, so that research is priced as if a person kept pace with it rather
 * than against a person knowing nothing, which made every computer player a whole count ahead.
 */
export declare const referenceAdvances: (
  playerResearchRegistry: PlayerResearchRegistry,
  clientRegistry: ClientRegistry
) => number;
/** The size class of the game's map, from the squares every player sees: `normal` before there's a world. */
export declare const mapSizeOf: (
  playerWorldRegistry: PlayerWorldRegistry
) => MapSize;
/** What the research cost is read from: the game's difficulty, its players' clients and research, the turn and the map. */
export interface CostContext {
  gameDifficultyRegistry: GameDifficultyRegistry;
  clientRegistry: ClientRegistry;
  playerResearchRegistry: PlayerResearchRegistry;
  turn: Turn;
  playerWorldRegistry: PlayerWorldRegistry;
  /**
   * The game's rules, for its `RateMultiplier` rules (civ-clone/web-renderer#1077). Without them, or with none in
   * force, the cost is Civilization II's own.
   */
  ruleRegistry?: RuleRegistry;
}
/**
 * What `playerResearch`'s research cost is multiplied by now: by the game's `RateMultiplier` rules, or 1, Civilization
 * II's own, with none in force or no rules to ask.
 */
export declare const rateMultiplier: (
  { ruleRegistry }: Pick<CostContext, 'ruleRegistry'>,
  playerResearch: PlayerResearch
) => number;
/** `lib/cost`'s inputs for `playerResearch` now. */
export declare const costInputs: (
  {
    gameDifficultyRegistry,
    clientRegistry,
    playerResearchRegistry,
    turn,
    playerWorldRegistry,
  }: CostContext,
  playerResearch: PlayerResearch
) => ResearchCostInputs;
export declare const getRules: (
  gameDifficultyRegistry?: GameDifficultyRegistry,
  clientRegistry?: ClientRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  turn?: Turn,
  playerWorldRegistry?: PlayerWorldRegistry,
  ruleRegistry?: RuleRegistry
) => Cost[];
export default getRules;
