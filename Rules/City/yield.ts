import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Fundamentalism from '@civ-clone/base-government-fundamentalism/Fundamentalism';
import LuxuriesRate from '@civ-clone/base-trade-rate-luxuries/Luxuries';
import LuxuriesYield from '@civ-clone/base-city-yield-luxuries/Luxuries';
import Priority from '@civ-clone/core-rule/Priority';
import { Research } from '../../Yields';
import ResearchRate from '@civ-clone/base-trade-rate-research/Research';
import TaxRate from '@civ-clone/base-trade-rate-tax/Tax';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import cosmic from '@civ-clone/civ2-rules/data/cosmic';
import governedBy from '@civ-clone/base-government-change/lib/governedBy';
import isHuman from '@civ-clone/base-difficulty/lib/isHuman';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

// After civ2-trade-rate's split and civ2-city's specialists (both `Normal`, 2000) and before civ2-city-improvement's
//  tithes (2500); and as `Yield` rules, so the Library, University and Research Lab (`YieldModifier`s, which read the
//  yields before any modifier) add their share of what's left.
export const SCIENCE_LIMIT = 2050;
export const LUXURIES_TO_RESEARCH = 2100;
export const FUNDAMENTALISM_LOSS = 2200;

/** What the split gave `city` of `YieldType` (the yields labelled with the rate's name), not its specialists'. */
export const splitShare = (
  yields: Yield[],
  YieldType: typeof Yield,
  rateName: string
): number =>
  yields
    .filter((cityYield: Yield): boolean => cityYield instanceof YieldType)
    .flatMap((cityYield: Yield) => cityYield.values())
    .filter(([, provider]): boolean => provider === rateName)
    .reduce((total: number, [value]): number => total + value, 0);

/** The luxuries the split gave `city` (labelled with the rate's name), not its Entertainers'. */
export const splitLuxuries = (yields: Yield[]): number =>
  splitShare(yields, LuxuriesYield, LuxuriesRate.name);

/**
 * The science the split gives under Fundamentalism: as at COSMIC's 5 tenths, `(trade × 50 + 40) / 100` rounded down,
 *  and no more than the luxuries leave (`city_split_trade`).
 */
export const limitedScience = (trade: number, luxuries: number): number =>
  Math.min(
    Math.floor((trade * cosmic.fundamentalismMaxScience * 10 + 40) / 100),
    Math.max(0, trade - luxuries)
  );

/** What the split gave research over Fundamentalism's limit, which goes to tax instead. */
export const scienceOverLimit = (yields: Yield[]): number =>
  Math.max(
    0,
    splitShare(yields, Research, ResearchRate.name) -
      limitedScience(
        Math.max(0, reduceYield(yields, Trade)),
        splitLuxuries(yields)
      )
  );

/** What Fundamentalism takes from `science`: COSMIC's 50%, rounded down (`city_split_trade`). */
export const fundamentalismLoss = (science: number): number =>
  Math.trunc((cosmic.fundamentalismScienceLoss * science) / 100);

export const getRules: (
  playerGovernmentRegistry?: PlayerGovernmentRegistry,
  clientRegistry?: ClientRegistry
) => YieldRule[] = (
  playerGovernmentRegistry: PlayerGovernmentRegistry = playerGovernmentRegistryInstance,
  clientRegistry: ClientRegistry = clientRegistryInstance
): YieldRule[] => {
  const fundamentalist = (city: City): boolean =>
    governedBy(city.player(), [Fundamentalism], playerGovernmentRegistry);

  return [
    // Under Fundamentalism the split uses no more than COSMIC's 5 tenths for research, persons and computer players
    //  alike, and tax takes the rest (OpenCiv2 `src/auto/city.cpp` `city_split_trade`, richardpenman/civ2@e39fe7b). The
    //  player's research rate itself stays as it is, so leaving Fundamentalism restores it. Luxuries are as the rates
    //  give them.
    new YieldRule(
      'civ2-science:city/yield/fundamentalism/science-limit',
      new Priority(SCIENCE_LIMIT),
      new Criterion(fundamentalist),
      new Criterion(
        (city: City, yields: Yield[]): boolean => scienceOverLimit(yields) > 0
      ),
      new Effect((city: City, yields: Yield[]): Yield[] => {
        const over = scienceOverLimit(yields);

        return [
          new Research(-over, Fundamentalism.name),
          new TaxRate.tradeYield(over, Fundamentalism.name),
        ];
      })
    ),

    // A computer player under Fundamentalism turns the luxuries the split gave a city into science, before the
    //  specialists' yields are added (OpenCiv2 `src/auto/city.cpp` `city_split_trade`, richardpenman/civ2@e39fe7b).
    new YieldRule(
      'civ2-science:city/yield/fundamentalism/luxuries-to-research',
      new Priority(LUXURIES_TO_RESEARCH),
      new Criterion(fundamentalist),
      new Criterion(
        (city: City): boolean => !isHuman(city.player(), clientRegistry)
      ),
      new Criterion(
        (city: City, yields: Yield[]): boolean => splitLuxuries(yields) > 0
      ),
      new Effect((city: City, yields: Yield[]): Yield[] => {
        const luxuries = splitLuxuries(yields);

        return [
          new LuxuriesYield(-luxuries, Fundamentalism.name),
          new Research(luxuries, Fundamentalism.name),
        ];
      })
    ),

    // Under Fundamentalism a city loses COSMIC's 50% of its science, rounded down, after the specialists' and before
    //  the Library's and the other improvements' share (`city_split_trade`).
    new YieldRule(
      'civ2-science:city/yield/fundamentalism/loss',
      new Priority(FUNDAMENTALISM_LOSS),
      new Criterion(fundamentalist),
      new Criterion(
        (city: City, yields: Yield[]): boolean =>
          fundamentalismLoss(reduceYield(yields, Research)) > 0
      ),
      new Effect(
        (city: City, yields: Yield[]): Yield =>
          new Research(
            -fundamentalismLoss(reduceYield(yields, Research)),
            Fundamentalism.name
          )
      )
    ),
  ];
};

export default getRules;
