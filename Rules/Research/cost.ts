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
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import mapSize, { MapSize } from '@civ-clone/civ2-rules/lib/mapSize';
import Advance from '@civ-clone/core-science/Advance';
import Cost from '@civ-clone/core-science/Rules/Cost';
import Effect from '@civ-clone/core-rule/Effect';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import cosmic from '@civ-clone/civ2-rules/data/cosmic';
import { enabledAdvances } from '../../lib/advanceIndex';
import isHuman from '@civ-clone/base-difficulty/lib/isHuman';
import { levelOf } from '@civ-clone/civ2-difficulty/level';
import researchCost from '../../lib/cost';

/** What `num_advances` is for a civilization knowing nothing: see `numberOfAdvances`. */
export const STARTING_NUMBER_OF_ADVANCES = 1;

/**
 * Civilization II's `num_advances` for a player: 1 to start with, then 1 more for each advance gained, each Future
 * Technology included (OpenCiv2 `src/auto/civ.cpp`, richardpenman/civ2@49f26ec: `civ_create_reset_civ` sets it to 0,
 * then `civ_create_place_units`, as the civilization is placed on the map, to 1, and `civ_give_advance` adds 1 from
 * the first turn on). Civ2 doesn't count the advances given before the first turn, by the start balancing; these do
 * (see the README).
 */
export const numberOfAdvances = (playerResearch: PlayerResearch): number =>
  playerResearch.complete().length + STARTING_NUMBER_OF_ADVANCES;

/**
 * The reference count the research cost compares with: the most advances any person's player has, 0 with no person
 * playing (an all-computer game).
 *
 * Civilization II reads `civs[game.best_human_rank]`, the civilization in the slot numbered by the best-placed human's
 * power rank (OpenCiv2's `civ2types.h` notes the rank-as-civilization mix-up). This engine has no fixed civilization
 * slots, so that can't be followed; this is the M2 survey's Q25 reading, the leading human.
 */
export const referenceAdvances = (
  playerResearchRegistry: PlayerResearchRegistry,
  clientRegistry: ClientRegistry
): number =>
  playerResearchRegistry
    .entries()
    .filter((playerResearch: PlayerResearch): boolean =>
      isHuman(playerResearch.player(), clientRegistry)
    )
    .reduce(
      (most: number, playerResearch: PlayerResearch): number =>
        Math.max(most, numberOfAdvances(playerResearch)),
      0
    );

/** The size class of the game's map, from the squares every player sees: `normal` before there's a world. */
export const mapSizeOf = (
  playerWorldRegistry: PlayerWorldRegistry
): MapSize => {
  const [playerWorld]: PlayerWorld[] = playerWorldRegistry.entries();

  return playerWorld
    ? mapSize(playerWorld.width() * playerWorld.height())
    : 'normal';
};

// Civilization II's research cost (`lib/cost`): the same for every advance, from the player's advances, the level,
//  whether a person plays it, the reference player's advances, the turn and the map's size.
export const getRules: (
  gameDifficultyRegistry?: GameDifficultyRegistry,
  clientRegistry?: ClientRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  turn?: Turn,
  playerWorldRegistry?: PlayerWorldRegistry
) => Cost[] = (
  gameDifficultyRegistry: GameDifficultyRegistry = gameDifficultyRegistryInstance,
  clientRegistry: ClientRegistry = clientRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  turn: Turn = turnInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance
): Cost[] => [
  new Cost(
    'civ2-science:research/cost',
    new Effect(
      (CostAdvance: typeof Advance, playerResearch: PlayerResearch): number =>
        researchCost({
          advances: numberOfAdvances(playerResearch),
          reference: referenceAdvances(playerResearchRegistry, clientRegistry),
          level: levelOf(gameDifficultyRegistry),
          human: isHuman(playerResearch.player(), clientRegistry),
          turn: turn.value(),
          techParadigm: cosmic.techParadigm,
          enabledAdvances,
          mapSize: mapSizeOf(playerWorldRegistry),
        })
    )
  ),
];

export default getRules;
