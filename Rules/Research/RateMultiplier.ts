import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * What a player's research cost is multiplied by now, for a rule set that changes Civilization II's (as
 * `civ2-enhanced`'s cost by age does, civ-clone/web-renderer#1077). Civilization II has no such factor, so this
 * package registers none: the first rule that applies decides, and with none the cost is Civilization II's own.
 */
export class RateMultiplier extends Rule<[PlayerResearch], number> {}

export default RateMultiplier;
