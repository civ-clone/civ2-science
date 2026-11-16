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
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import cosmic from '@civ-clone/civ2-rules/data/cosmic';
import governedBy from '@civ-clone/base-government-change/lib/governedBy';
import isHuman from '@civ-clone/base-difficulty/lib/isHuman';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

// After civ2-trade-rate's split and civ2-city's specialists (both `Normal`, 2000) and before civ2-city-improvement's
//  tithes (2500); and as `Yield` rules, so the Library, University and Research Lab (`YieldModifier`s, which read the
//  yields before any modifier) add their share of what's left.
export const LUXURIES_TO_RESEARCH = 2100;
export const FUNDAMENTALISM_LOSS = 2200;

/** The luxuries the split gave `city` (labelled with the rate's name), not its Entertainers'. */
export const splitLuxuries = (yields: Yield[]): number =>
  yields
    .filter((cityYield: Yield): boolean => cityYield instanceof LuxuriesYield)
    .flatMap((cityYield: Yield) => cityYield.values())
    .filter(([, provider]): boolean => provider === LuxuriesRate.name)
    .reduce((total: number, [value]): number => total + value, 0);

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
