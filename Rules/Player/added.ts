import {
  AdvanceRegistry,
  instance as advanceRegistryInstance,
} from '@civ-clone/core-science/AdvanceRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Added from '@civ-clone/core-player/Rules/Added';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import { addPlayerResearch } from '@civ-clone/base-science-research/lib/playerResearch';

// Every civilization starts knowing nothing (OpenCiv2 `src/auto/civ.cpp` `civ_create_reset_civ`,
//  richardpenman/civ2@49f26ec, clears its advances, and grants none before the first turn). The only advances given
//  before the first turn are the start balancing's (`civ2-player`).
export const getRules: (
  advanceRegistry?: AdvanceRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  ruleRegistry?: RuleRegistry
) => Added[] = (
  advanceRegistry: AdvanceRegistry = advanceRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): Added[] => [
  new Added(
    'civ2-science:player/added/register-player-research',
    new Effect((player: Player): void =>
      addPlayerResearch(
        player,
        advanceRegistry,
        playerResearchRegistry,
        ruleRegistry
      )
    )
  ),
];

export default getRules;
