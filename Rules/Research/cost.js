"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.mapSizeOf = exports.referenceAdvances = exports.numberOfAdvances = exports.STARTING_NUMBER_OF_ADVANCES = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const mapSize_1 = require("@civ-clone/civ2-rules/lib/mapSize");
const Cost_1 = require("@civ-clone/core-science/Rules/Cost");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
const advanceIndex_1 = require("../../lib/advanceIndex");
const isHuman_1 = require("@civ-clone/base-difficulty/lib/isHuman");
const level_1 = require("@civ-clone/civ2-difficulty/level");
const cost_1 = require("../../lib/cost");
/** What `num_advances` is for a civilization knowing nothing: see `numberOfAdvances`. */
exports.STARTING_NUMBER_OF_ADVANCES = 1;
/**
 * Civilization II's `num_advances` for a player: 1 to start with, then 1 more for each advance gained, each Future
 * Technology included (OpenCiv2 `src/auto/civ.cpp`, richardpenman/civ2@49f26ec: `civ_create_reset_civ` sets it to 0,
 * then `civ_create_place_units`, as the civilization is placed on the map, to 1, and `civ_give_advance` adds 1 from
 * the first turn on). Civ2 doesn't count the advances given before the first turn, by the start balancing; these do
 * (see the README).
 */
const numberOfAdvances = (playerResearch) => playerResearch.complete().length + exports.STARTING_NUMBER_OF_ADVANCES;
exports.numberOfAdvances = numberOfAdvances;
/**
 * The reference count the research cost compares with: the most advances any person's player has, 0 with no person
 * playing (an all-computer game).
 *
 * Civilization II reads `civs[game.best_human_rank]`, the civilization in the slot numbered by the best-placed human's
 * power rank (OpenCiv2's `civ2types.h` notes the rank-as-civilization mix-up). This engine has no fixed civilization
 * slots, so that can't be followed; this is the M2 survey's Q25 reading, the leading human.
 */
const referenceAdvances = (playerResearchRegistry, clientRegistry) => playerResearchRegistry
    .entries()
    .filter((playerResearch) => (0, isHuman_1.default)(playerResearch.player(), clientRegistry))
    .reduce((most, playerResearch) => Math.max(most, (0, exports.numberOfAdvances)(playerResearch)), 0);
exports.referenceAdvances = referenceAdvances;
/** The size class of the game's map, from the squares every player sees: `normal` before there's a world. */
const mapSizeOf = (playerWorldRegistry) => {
    const [playerWorld] = playerWorldRegistry.entries();
    return playerWorld
        ? (0, mapSize_1.default)(playerWorld.width() * playerWorld.height())
        : 'normal';
};
exports.mapSizeOf = mapSizeOf;
// Civilization II's research cost (`lib/cost`): the same for every advance, from the player's advances, the level,
//  whether a person plays it, the reference player's advances, the turn and the map's size.
const getRules = (gameDifficultyRegistry = GameDifficultyRegistry_1.instance, clientRegistry = ClientRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, turn = Turn_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance) => [
    new Cost_1.default('civ2-science:research/cost', new Effect_1.default((CostAdvance, playerResearch) => (0, cost_1.default)({
        advances: (0, exports.numberOfAdvances)(playerResearch),
        reference: (0, exports.referenceAdvances)(playerResearchRegistry, clientRegistry),
        level: (0, level_1.levelOf)(gameDifficultyRegistry),
        human: (0, isHuman_1.default)(playerResearch.player(), clientRegistry),
        turn: turn.value(),
        techParadigm: cosmic_1.default.techParadigm,
        enabledAdvances: advanceIndex_1.enabledAdvances,
        mapSize: (0, exports.mapSizeOf)(playerWorldRegistry),
    }))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=cost.js.map