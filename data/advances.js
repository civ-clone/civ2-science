"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advances = exports.NEVER = exports.NONE = void 0;
const Advances_1 = require("../Advances");
// Civilization II's advances, RULES.TXT's @CIVILIZE rows in file order (OpenCiv2 `src/auto/civ.cpp`
//  `rules_load_advances`, richardpenman/civ2@49f26ec). Numbers only. A row's index is the advance's id in the game
//  (OpenCiv2 `src/include/enums.h` `AdvanceId`), which several rules compare: the hidden choice of research, for one.
//  The rows after Future Technology (user-defined and extra slots) are all unavailable and left out.
//
//  Each row: the advance, its two prerequisites (indices: row n is n − 1; `NONE` for none, `NEVER` for never available), the
//  computer players' value, the civilized modifier (added to the value for a civilized leader, taken off for a
//  militaristic one), the epoch (0 to 3) and the category (0 to 4). Epoch and category only choose its picture.
/** A prerequisite that is always met (`nil`). */
exports.NONE = -1;
/** A prerequisite that is never met (`no`): the advance is unavailable. */
exports.NEVER = -2;
exports.advances = [
    // @CIVILIZE row 1
    [Advances_1.AdvancedFlight, 66, 44, 4, -2, 3, 4],
    // @CIVILIZE row 2
    [Advances_1.Alphabet, -1, -1, 5, 1, 0, 3],
    // @CIVILIZE row 3
    [Advances_1.AmphibiousWarfare, 57, 81, 3, -2, 3, 0],
    // @CIVILIZE row 4
    [Advances_1.Astronomy, 56, 49, 4, 1, 1, 3],
    // @CIVILIZE row 5
    [Advances_1.AtomicTheory, 83, 61, 4, -1, 2, 3],
    // @CIVILIZE row 6
    [Advances_1.Automobile, 14, 79, 6, -1, 3, 4],
    // @CIVILIZE row 7
    [Advances_1.Banking, 84, 71, 4, 1, 1, 1],
    // @CIVILIZE row 8
    [Advances_1.BridgeBuilding, 39, 18, 4, 0, 0, 4],
    // @CIVILIZE row 9
    [Advances_1.BronzeWorking, -1, -1, 6, -1, 0, 4],
    // @CIVILIZE row 10
    [Advances_1.CeremonialBurial, -1, -1, 5, 0, 0, 2],
    // @CIVILIZE row 11
    [Advances_1.Chemistry, 85, 50, 5, -1, 1, 3],
    // @CIVILIZE row 12
    [Advances_1.Chivalry, 29, 36, 4, -2, 1, 0],
    // @CIVILIZE row 13
    [Advances_1.CodeOfLaws, 1, -1, 4, 1, 0, 2],
    // @CIVILIZE row 14
    [Advances_1.CombinedArms, 53, 0, 5, -1, 3, 0],
    // @CIVILIZE row 15
    [Advances_1.Combustion, 69, 28, 5, -1, 2, 4],
    // @CIVILIZE row 16
    [Advances_1.Communism, 60, 37, 5, 0, 2, 2],
    // @CIVILIZE row 17
    [Advances_1.Computers, 52, 48, 4, 1, 3, 4],
    // @CIVILIZE row 18
    [Advances_1.Conscription, 21, 51, 7, -1, 2, 0],
    // @CIVILIZE row 19
    [Advances_1.Construction, 47, 20, 4, 0, 0, 4],
    // @CIVILIZE row 20
    [Advances_1.Corporation, 37, 22, 4, 0, 2, 1],
    // @CIVILIZE row 21
    [Advances_1.Currency, 8, -1, 4, 1, 0, 1],
    // @CIVILIZE row 22
    [Advances_1.Democracy, 6, 38, 5, 1, 2, 2],
    // @CIVILIZE row 23
    [Advances_1.Economics, 85, 6, 4, 1, 2, 1],
    // @CIVILIZE row 24
    [Advances_1.Electricity, 51, 45, 4, 0, 2, 4],
    // @CIVILIZE row 25
    [Advances_1.Electronics, 23, 19, 4, 1, 3, 4],
    // @CIVILIZE row 26
    [Advances_1.Engineering, 87, 18, 4, 0, 0, 4],
    // @CIVILIZE row 27
    [Advances_1.Environmentalism, 68, 76, 3, 1, 3, 2],
    // @CIVILIZE row 28
    [Advances_1.Espionage, 15, 21, 2, -1, 3, 0],
    // @CIVILIZE row 29
    [Advances_1.Explosives, 35, 10, 5, 0, 2, 4],
    // @CIVILIZE row 30
    [Advances_1.Feudalism, 86, 54, 4, -1, 0, 0],
    // @CIVILIZE row 31
    [Advances_1.Flight, 14, 83, 4, -1, 2, 4],
    // @CIVILIZE row 32
    [Advances_1.Fundamentalism, 55, 17, 3, -2, 2, 2],
    // @CIVILIZE row 33
    [Advances_1.FusionPower, 59, 80, 3, 0, 3, 3],
    // @CIVILIZE row 34
    [Advances_1.GeneticEngineering, 50, 19, 3, 2, 3, 3],
    // @CIVILIZE row 35
    [Advances_1.GuerrillaWarfare, 15, 81, 4, 1, 3, 0],
    // @CIVILIZE row 36
    [Advances_1.Gunpowder, 38, 39, 8, -2, 1, 0],
    // @CIVILIZE row 37
    [Advances_1.HorsebackRiding, -1, -1, 4, -1, 0, 0],
    // @CIVILIZE row 38
    [Advances_1.Industrialization, 67, 6, 6, 0, 2, 1],
    // @CIVILIZE row 39
    [Advances_1.Invention, 25, 43, 6, 0, 1, 4],
    // @CIVILIZE row 40
    [Advances_1.IronWorking, 8, 86, 5, -1, 0, 4],
    // @CIVILIZE row 41
    [Advances_1.LaborUnion, 48, 34, 4, -1, 3, 2],
    // @CIVILIZE row 42
    [Advances_1.Laser, 59, 48, 4, 0, 3, 3],
    // @CIVILIZE row 43
    [Advances_1.Leadership, 11, 35, 5, -1, 1, 0],
    // @CIVILIZE row 44
    [Advances_1.Literacy, 88, 12, 5, 2, 0, 3],
    // @CIVILIZE row 45
    [Advances_1.MachineTools, 79, 81, 4, -2, 2, 4],
    // @CIVILIZE row 46
    [Advances_1.Magnetism, 61, 39, 4, -1, 1, 3],
    // @CIVILIZE row 47
    [Advances_1.MapMaking, 1, -1, 6, -1, 0, 1],
    // @CIVILIZE row 48
    [Advances_1.Masonry, -1, -1, 4, 1, 0, 4],
    // @CIVILIZE row 49
    [Advances_1.MassProduction, 5, 19, 5, 0, 3, 4],
    // @CIVILIZE row 50
    [Advances_1.Mathematics, 1, 47, 4, -1, 0, 3],
    // @CIVILIZE row 51
    [Advances_1.Medicine, 60, 84, 4, 0, 1, 1],
    // @CIVILIZE row 52
    [Advances_1.Metallurgy, 35, 85, 6, -2, 1, 0],
    // @CIVILIZE row 53
    [Advances_1.Miniaturization, 44, 24, 4, 1, 3, 4],
    // @CIVILIZE row 54
    [Advances_1.MobileWarfare, 5, 81, 8, -1, 3, 0],
    // @CIVILIZE row 55
    [Advances_1.Monarchy, 9, 12, 5, 1, 0, 2],
    // @CIVILIZE row 56
    [Advances_1.Monotheism, 60, 64, 5, 1, 1, 2],
    // @CIVILIZE row 57
    [Advances_1.Mysticism, 9, -1, 4, 0, 0, 2],
    // @CIVILIZE row 58
    [Advances_1.Navigation, 75, 3, 6, -1, 1, 1],
    // @CIVILIZE row 59
    [Advances_1.NuclearFission, 4, 48, 6, -2, 3, 3],
    // @CIVILIZE row 60
    [Advances_1.NuclearPower, 58, 24, 3, 0, 3, 3],
    // @CIVILIZE row 61
    [Advances_1.Philosophy, 56, 43, 6, 1, 1, 2],
    // @CIVILIZE row 62
    [Advances_1.Physics, 57, 43, 4, -1, 1, 3],
    // @CIVILIZE row 63
    [Advances_1.Plastics, 69, 76, 4, 1, 3, 4],
    // @CIVILIZE row 64
    [Advances_1.Plumbing, -2, -2, 4, 0, 1, 4],
    // @CIVILIZE row 65
    [Advances_1.Polytheism, 9, 36, 4, 0, 0, 2],
    // @CIVILIZE row 66
    [Advances_1.Pottery, -1, -1, 4, 1, 0, 1],
    // @CIVILIZE row 67
    [Advances_1.Radio, 30, 23, 5, -1, 3, 4],
    // @CIVILIZE row 68
    [Advances_1.Railroad, 78, 7, 6, 0, 2, 1],
    // @CIVILIZE row 69
    [Advances_1.Recycling, 48, 21, 2, 1, 3, 2],
    // @CIVILIZE row 70
    [Advances_1.Refining, 10, 19, 4, 0, 2, 4],
    // @CIVILIZE row 71
    [Advances_1.Refrigeration, 23, 74, 3, 1, 3, 1],
    // @CIVILIZE row 72
    [Advances_1.TheRepublic, 12, 43, 5, 1, 0, 2],
    // @CIVILIZE row 73
    [Advances_1.Robotics, 16, 53, 5, -2, 3, 0],
    // @CIVILIZE row 74
    [Advances_1.Rocketry, 0, 24, 6, -2, 3, 0],
    // @CIVILIZE row 75
    [Advances_1.Sanitation, 50, 25, 4, 2, 2, 1],
    // @CIVILIZE row 76
    [Advances_1.Seafaring, 46, 65, 4, 1, 0, 1],
    // @CIVILIZE row 77
    [Advances_1.SpaceFlight, 16, 73, 4, 1, 3, 3],
    // @CIVILIZE row 78
    [Advances_1.Stealth, 80, 72, 3, -2, 3, 0],
    // @CIVILIZE row 79
    [Advances_1.SteamEngine, 61, 38, 4, -1, 2, 3],
    // @CIVILIZE row 80
    [Advances_1.Steel, 23, 37, 4, -1, 2, 4],
    // @CIVILIZE row 81
    [Advances_1.Superconductor, 62, 41, 4, 1, 3, 3],
    // @CIVILIZE row 82
    [Advances_1.Tactics, 17, 42, 6, -1, 2, 0],
    // @CIVILIZE row 83
    [Advances_1.Theology, 55, 29, 3, 2, 1, 2],
    // @CIVILIZE row 84
    [Advances_1.TheoryOfGravity, 3, 85, 4, 0, 1, 3],
    // @CIVILIZE row 85
    [Advances_1.Trade, 20, 12, 4, 2, 0, 1],
    // @CIVILIZE row 86
    [Advances_1.University, 49, 60, 5, 1, 1, 3],
    // @CIVILIZE row 87
    [Advances_1.WarriorCode, -1, -1, 4, -1, 0, 0],
    // @CIVILIZE row 88
    [Advances_1.TheWheel, 36, -1, 4, -1, 0, 4],
    // @CIVILIZE row 89
    [Advances_1.Writing, 1, -1, 4, 2, 0, 3],
    // @CIVILIZE row 90
    [Advances_1.FutureTechnology, 32, 68, 1, 0, 3, 3],
];
exports.default = exports.advances;
//# sourceMappingURL=advances.js.map