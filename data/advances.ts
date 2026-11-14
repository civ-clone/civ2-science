import {
  AdvancedFlight,
  Alphabet,
  AmphibiousWarfare,
  Astronomy,
  AtomicTheory,
  Automobile,
  Banking,
  BridgeBuilding,
  BronzeWorking,
  CeremonialBurial,
  Chemistry,
  Chivalry,
  CodeOfLaws,
  CombinedArms,
  Combustion,
  Communism,
  Computers,
  Conscription,
  Construction,
  Corporation,
  Currency,
  Democracy,
  Economics,
  Electricity,
  Electronics,
  Engineering,
  Environmentalism,
  Espionage,
  Explosives,
  Feudalism,
  Flight,
  Fundamentalism,
  FusionPower,
  GeneticEngineering,
  GuerrillaWarfare,
  Gunpowder,
  HorsebackRiding,
  Industrialization,
  Invention,
  IronWorking,
  LaborUnion,
  Laser,
  Leadership,
  Literacy,
  MachineTools,
  Magnetism,
  MapMaking,
  Masonry,
  MassProduction,
  Mathematics,
  Medicine,
  Metallurgy,
  Miniaturization,
  MobileWarfare,
  Monarchy,
  Monotheism,
  Mysticism,
  Navigation,
  NuclearFission,
  NuclearPower,
  Philosophy,
  Physics,
  Plastics,
  Plumbing,
  Polytheism,
  Pottery,
  Radio,
  Railroad,
  Recycling,
  Refining,
  Refrigeration,
  TheRepublic,
  Robotics,
  Rocketry,
  Sanitation,
  Seafaring,
  SpaceFlight,
  Stealth,
  SteamEngine,
  Steel,
  Superconductor,
  Tactics,
  Theology,
  TheoryOfGravity,
  Trade,
  University,
  WarriorCode,
  TheWheel,
  Writing,
  FutureTechnology,
} from '../Advances';
import Advance from '@civ-clone/core-science/Advance';

// Civilization II's advances, RULES.TXT's @CIVILIZE rows in file order (OpenCiv2 `src/auto/civ.cpp`
//  `rules_load_advances`, richardpenman/civ2@49f26ec). Numbers only. A row's index is the advance's id in the game
//  (OpenCiv2 `src/include/enums.h` `AdvanceId`), which several rules compare: the hidden choice of research, for one.
//  The rows after Future Technology (user-defined and extra slots) are all unavailable and left out.
//
//  Each row: the advance, its two prerequisites (indices: row n is n − 1; `NONE` for none, `NEVER` for never available), the
//  computer players' value, the civilized modifier (added to the value for a civilized leader, taken off for a
//  militaristic one), the epoch (0 to 3) and the category (0 to 4). Epoch and category only choose its picture.

/** A prerequisite that is always met (`nil`). */
export const NONE = -1;
/** A prerequisite that is never met (`no`): the advance is unavailable. */
export const NEVER = -2;

export type AdvanceRow = [
  Advance: typeof Advance,
  first: number,
  second: number,
  aiValue: number,
  civilizedModifier: number,
  epoch: number,
  category: number
];

export const advances: AdvanceRow[] = [
  // @CIVILIZE row 1
  [AdvancedFlight, 66, 44, 4, -2, 3, 4],
  // @CIVILIZE row 2
  [Alphabet, -1, -1, 5, 1, 0, 3],
  // @CIVILIZE row 3
  [AmphibiousWarfare, 57, 81, 3, -2, 3, 0],
  // @CIVILIZE row 4
  [Astronomy, 56, 49, 4, 1, 1, 3],
  // @CIVILIZE row 5
  [AtomicTheory, 83, 61, 4, -1, 2, 3],
  // @CIVILIZE row 6
  [Automobile, 14, 79, 6, -1, 3, 4],
  // @CIVILIZE row 7
  [Banking, 84, 71, 4, 1, 1, 1],
  // @CIVILIZE row 8
  [BridgeBuilding, 39, 18, 4, 0, 0, 4],
  // @CIVILIZE row 9
  [BronzeWorking, -1, -1, 6, -1, 0, 4],
  // @CIVILIZE row 10
  [CeremonialBurial, -1, -1, 5, 0, 0, 2],
  // @CIVILIZE row 11
  [Chemistry, 85, 50, 5, -1, 1, 3],
  // @CIVILIZE row 12
  [Chivalry, 29, 36, 4, -2, 1, 0],
  // @CIVILIZE row 13
  [CodeOfLaws, 1, -1, 4, 1, 0, 2],
  // @CIVILIZE row 14
  [CombinedArms, 53, 0, 5, -1, 3, 0],
  // @CIVILIZE row 15
  [Combustion, 69, 28, 5, -1, 2, 4],
  // @CIVILIZE row 16
  [Communism, 60, 37, 5, 0, 2, 2],
  // @CIVILIZE row 17
  [Computers, 52, 48, 4, 1, 3, 4],
  // @CIVILIZE row 18
  [Conscription, 21, 51, 7, -1, 2, 0],
  // @CIVILIZE row 19
  [Construction, 47, 20, 4, 0, 0, 4],
  // @CIVILIZE row 20
  [Corporation, 37, 22, 4, 0, 2, 1],
  // @CIVILIZE row 21
  [Currency, 8, -1, 4, 1, 0, 1],
  // @CIVILIZE row 22
  [Democracy, 6, 38, 5, 1, 2, 2],
  // @CIVILIZE row 23
  [Economics, 85, 6, 4, 1, 2, 1],
  // @CIVILIZE row 24
  [Electricity, 51, 45, 4, 0, 2, 4],
  // @CIVILIZE row 25
  [Electronics, 23, 19, 4, 1, 3, 4],
  // @CIVILIZE row 26
  [Engineering, 87, 18, 4, 0, 0, 4],
  // @CIVILIZE row 27
  [Environmentalism, 68, 76, 3, 1, 3, 2],
  // @CIVILIZE row 28
  [Espionage, 15, 21, 2, -1, 3, 0],
  // @CIVILIZE row 29
  [Explosives, 35, 10, 5, 0, 2, 4],
  // @CIVILIZE row 30
  [Feudalism, 86, 54, 4, -1, 0, 0],
  // @CIVILIZE row 31
  [Flight, 14, 83, 4, -1, 2, 4],
  // @CIVILIZE row 32
  [Fundamentalism, 55, 17, 3, -2, 2, 2],
  // @CIVILIZE row 33
  [FusionPower, 59, 80, 3, 0, 3, 3],
  // @CIVILIZE row 34
  [GeneticEngineering, 50, 19, 3, 2, 3, 3],
  // @CIVILIZE row 35
  [GuerrillaWarfare, 15, 81, 4, 1, 3, 0],
  // @CIVILIZE row 36
  [Gunpowder, 38, 39, 8, -2, 1, 0],
  // @CIVILIZE row 37
  [HorsebackRiding, -1, -1, 4, -1, 0, 0],
  // @CIVILIZE row 38
  [Industrialization, 67, 6, 6, 0, 2, 1],
  // @CIVILIZE row 39
  [Invention, 25, 43, 6, 0, 1, 4],
  // @CIVILIZE row 40
  [IronWorking, 8, 86, 5, -1, 0, 4],
  // @CIVILIZE row 41
  [LaborUnion, 48, 34, 4, -1, 3, 2],
  // @CIVILIZE row 42
  [Laser, 59, 48, 4, 0, 3, 3],
  // @CIVILIZE row 43
  [Leadership, 11, 35, 5, -1, 1, 0],
  // @CIVILIZE row 44
  [Literacy, 88, 12, 5, 2, 0, 3],
  // @CIVILIZE row 45
  [MachineTools, 79, 81, 4, -2, 2, 4],
  // @CIVILIZE row 46
  [Magnetism, 61, 39, 4, -1, 1, 3],
  // @CIVILIZE row 47
  [MapMaking, 1, -1, 6, -1, 0, 1],
  // @CIVILIZE row 48
  [Masonry, -1, -1, 4, 1, 0, 4],
  // @CIVILIZE row 49
  [MassProduction, 5, 19, 5, 0, 3, 4],
  // @CIVILIZE row 50
  [Mathematics, 1, 47, 4, -1, 0, 3],
  // @CIVILIZE row 51
  [Medicine, 60, 84, 4, 0, 1, 1],
  // @CIVILIZE row 52
  [Metallurgy, 35, 85, 6, -2, 1, 0],
  // @CIVILIZE row 53
  [Miniaturization, 44, 24, 4, 1, 3, 4],
  // @CIVILIZE row 54
  [MobileWarfare, 5, 81, 8, -1, 3, 0],
  // @CIVILIZE row 55
  [Monarchy, 9, 12, 5, 1, 0, 2],
  // @CIVILIZE row 56
  [Monotheism, 60, 64, 5, 1, 1, 2],
  // @CIVILIZE row 57
  [Mysticism, 9, -1, 4, 0, 0, 2],
  // @CIVILIZE row 58
  [Navigation, 75, 3, 6, -1, 1, 1],
  // @CIVILIZE row 59
  [NuclearFission, 4, 48, 6, -2, 3, 3],
  // @CIVILIZE row 60
  [NuclearPower, 58, 24, 3, 0, 3, 3],
  // @CIVILIZE row 61
  [Philosophy, 56, 43, 6, 1, 1, 2],
  // @CIVILIZE row 62
  [Physics, 57, 43, 4, -1, 1, 3],
  // @CIVILIZE row 63
  [Plastics, 69, 76, 4, 1, 3, 4],
  // @CIVILIZE row 64
  [Plumbing, -2, -2, 4, 0, 1, 4],
  // @CIVILIZE row 65
  [Polytheism, 9, 36, 4, 0, 0, 2],
  // @CIVILIZE row 66
  [Pottery, -1, -1, 4, 1, 0, 1],
  // @CIVILIZE row 67
  [Radio, 30, 23, 5, -1, 3, 4],
  // @CIVILIZE row 68
  [Railroad, 78, 7, 6, 0, 2, 1],
  // @CIVILIZE row 69
  [Recycling, 48, 21, 2, 1, 3, 2],
  // @CIVILIZE row 70
  [Refining, 10, 19, 4, 0, 2, 4],
  // @CIVILIZE row 71
  [Refrigeration, 23, 74, 3, 1, 3, 1],
  // @CIVILIZE row 72
  [TheRepublic, 12, 43, 5, 1, 0, 2],
  // @CIVILIZE row 73
  [Robotics, 16, 53, 5, -2, 3, 0],
  // @CIVILIZE row 74
  [Rocketry, 0, 24, 6, -2, 3, 0],
  // @CIVILIZE row 75
  [Sanitation, 50, 25, 4, 2, 2, 1],
  // @CIVILIZE row 76
  [Seafaring, 46, 65, 4, 1, 0, 1],
  // @CIVILIZE row 77
  [SpaceFlight, 16, 73, 4, 1, 3, 3],
  // @CIVILIZE row 78
  [Stealth, 80, 72, 3, -2, 3, 0],
  // @CIVILIZE row 79
  [SteamEngine, 61, 38, 4, -1, 2, 3],
  // @CIVILIZE row 80
  [Steel, 23, 37, 4, -1, 2, 4],
  // @CIVILIZE row 81
  [Superconductor, 62, 41, 4, 1, 3, 3],
  // @CIVILIZE row 82
  [Tactics, 17, 42, 6, -1, 2, 0],
  // @CIVILIZE row 83
  [Theology, 55, 29, 3, 2, 1, 2],
  // @CIVILIZE row 84
  [TheoryOfGravity, 3, 85, 4, 0, 1, 3],
  // @CIVILIZE row 85
  [Trade, 20, 12, 4, 2, 0, 1],
  // @CIVILIZE row 86
  [University, 49, 60, 5, 1, 1, 3],
  // @CIVILIZE row 87
  [WarriorCode, -1, -1, 4, -1, 0, 0],
  // @CIVILIZE row 88
  [TheWheel, 36, -1, 4, -1, 0, 4],
  // @CIVILIZE row 89
  [Writing, 1, -1, 4, 2, 0, 3],
  // @CIVILIZE row 90
  [FutureTechnology, 32, 68, 1, 0, 3, 3],
];

export default advances;
