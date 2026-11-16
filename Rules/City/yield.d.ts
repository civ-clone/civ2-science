import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
export declare const SCIENCE_LIMIT = 2050;
export declare const LUXURIES_TO_RESEARCH = 2100;
export declare const FUNDAMENTALISM_LOSS = 2200;
/** What the split gave `city` of `YieldType` (the yields labelled with the rate's name), not its specialists'. */
export declare const splitShare: (
  yields: Yield[],
  YieldType: typeof Yield,
  rateName: string
) => number;
/** The luxuries the split gave `city` (labelled with the rate's name), not its Entertainers'. */
export declare const splitLuxuries: (yields: Yield[]) => number;
/**
 * The science the split gives under Fundamentalism: as at COSMIC's 5 tenths, `(trade × 50 + 40) / 100` rounded down,
 *  and no more than the luxuries leave (`city_split_trade`).
 */
export declare const limitedScience: (
  trade: number,
  luxuries: number
) => number;
/** What the split gave research over Fundamentalism's limit, which goes to tax instead. */
export declare const scienceOverLimit: (yields: Yield[]) => number;
/** What Fundamentalism takes from `science`: COSMIC's 50%, rounded down (`city_split_trade`). */
export declare const fundamentalismLoss: (science: number) => number;
export declare const getRules: (
  playerGovernmentRegistry?: PlayerGovernmentRegistry,
  clientRegistry?: ClientRegistry
) => YieldRule[];
export default getRules;
