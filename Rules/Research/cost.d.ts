import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import { MapSize } from '@civ-clone/civ2-rules/lib/mapSize';
import Cost from '@civ-clone/core-science/Rules/Cost';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
/**
 * The advances a player has gained, as Civilization II's `num_advances` counts them: every advance completed, each
 * Future Technology included. (Civ2 doesn't count the advances given before the first turn, by the start balancing;
 * these do. See the README.)
 */
export declare const numberOfAdvances: (
  playerResearch: PlayerResearch
) => number;
/**
 * The reference count the research cost compares with: the most advances any person's player has, 0 with no person
 * playing (an all-computer game).
 *
 * Civilization II reads `civs[game.best_human_rank]`, the civilization in the slot numbered by the best-placed human's
 * power rank (OpenCiv2's `civ2types.h` notes the rank-as-civilization mix-up). This engine has no fixed civilization
 * slots, so that can't be followed; this is the M2 survey's Q25 reading, the leading human.
 */
export declare const referenceAdvances: (
  playerResearchRegistry: PlayerResearchRegistry,
  clientRegistry: ClientRegistry
) => number;
/** The size class of the game's map, from the squares every player sees: `normal` before there's a world. */
export declare const mapSizeOf: (
  playerWorldRegistry: PlayerWorldRegistry
) => MapSize;
export declare const getRules: (
  gameDifficultyRegistry?: GameDifficultyRegistry,
  clientRegistry?: ClientRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  turn?: Turn,
  playerWorldRegistry?: PlayerWorldRegistry
) => Cost[];
export default getRules;
