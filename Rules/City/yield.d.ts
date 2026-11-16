import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
export declare const LUXURIES_TO_RESEARCH = 2100;
export declare const FUNDAMENTALISM_LOSS = 2200;
/** The luxuries the split gave `city` (labelled with the rate's name), not its Entertainers'. */
export declare const splitLuxuries: (yields: Yield[]) => number;
/** What Fundamentalism takes from `science`: COSMIC's 50%, rounded down (`city_split_trade`). */
export declare const fundamentalismLoss: (science: number) => number;
export declare const getRules: (
  playerGovernmentRegistry?: PlayerGovernmentRegistry,
  clientRegistry?: ClientRegistry
) => YieldRule[];
export default getRules;
