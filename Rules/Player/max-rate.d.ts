import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import MaxRate from '@civ-clone/core-trade-rate/Rules/MaxRate';
export declare const getRules: (
  playerGovernmentRegistry?: PlayerGovernmentRegistry
) => MaxRate[];
export default getRules;
