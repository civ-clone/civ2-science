import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Fundamentalism from '@civ-clone/base-government-fundamentalism/Fundamentalism';
import MaxRate from '@civ-clone/core-trade-rate/Rules/MaxRate';
import Player from '@civ-clone/core-player/Player';
import ResearchRate from '@civ-clone/base-trade-rate-research/Research';
import TradeRate from '@civ-clone/core-trade-rate/TradeRate';
import cosmic from '@civ-clone/civ2-rules/data/cosmic';
import governedBy from '@civ-clone/base-government-change/lib/governedBy';

export const getRules: (
  playerGovernmentRegistry?: PlayerGovernmentRegistry
) => MaxRate[] = (
  playerGovernmentRegistry: PlayerGovernmentRegistry = playerGovernmentRegistryInstance
): MaxRate[] => [
  // Under Fundamentalism no more than COSMIC's 5 tenths of trade goes to research, persons and computer players alike
  //  (OpenCiv2 `src/auto/city.cpp` `city_split_trade`, richardpenman/civ2@e39fe7b). The original uses the lower rate
  //  in the split and lets tax take the rest; here it is the research rate's maximum, so the excess goes to tax as
  //  civ2-trade-rate's `ExcessRate` sends research's first, and the rates show what's used. The lowest maximum holds,
  //  so this is below the government's own.
  new MaxRate(
    'civ2-science:player/max-rate/fundamentalism',
    new Effect((player: Player, rate: TradeRate): number | undefined =>
      rate instanceof ResearchRate &&
      governedBy(player, [Fundamentalism], playerGovernmentRegistry)
        ? cosmic.fundamentalismMaxScience / 10
        : undefined
    )
  ),
];

export default getRules;
