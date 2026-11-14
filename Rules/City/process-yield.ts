import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Anarchy from '@civ-clone/base-government-anarchy/Anarchy';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import { Research } from '../../Yields';
import Yield from '@civ-clone/core-yield/Yield';
import { addResearch } from '@civ-clone/base-science-research/lib/progress';
import governedBy from '@civ-clone/base-government-change/lib/governedBy';
import inCivilDisorder from '@civ-clone/base-city-happiness/lib/civilDisorder';

export const getRules: (
  playerResearchRegistry?: PlayerResearchRegistry,
  ruleRegistry?: RuleRegistry,
  playerGovernmentRegistry?: PlayerGovernmentRegistry
) => ProcessYield[] = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  playerGovernmentRegistry: PlayerGovernmentRegistry = playerGovernmentRegistryInstance
): ProcessYield[] => [
  new ProcessYield(
    'civ2-science:city/process-yield/add-research',
    new Criterion((cityYield: Yield): boolean => cityYield instanceof Research),
    // A city in disorder adds no research, as in Civilization. OpenCiv2 shows no zeroing of a disordered city's
    //  science (`city_add_science`), so this is open: M2 survey question Q33.
    new Criterion(
      (cityYield: Yield, city: City, yields: Yield[]) =>
        !inCivilDisorder(city, yields, ruleRegistry)
    ),
    // Under Anarchy no research is added (OpenCiv2 `src/auto/city.cpp` `city_add_science`, richardpenman/civ2@49f26ec).
    new Criterion(
      (cityYield: Yield, city: City): boolean =>
        !governedBy(city.player(), [Anarchy], playerGovernmentRegistry)
    ),
    new Effect(addResearch(playerResearchRegistry))
  ),
];

export default getRules;
