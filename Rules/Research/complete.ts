import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import Advance from '@civ-clone/core-science/Advance';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Criterion from '@civ-clone/core-rule/Criterion';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Effect from '@civ-clone/core-rule/Effect';
import { emitResearchComplete } from '@civ-clone/base-science-research/lib/events';

export const getRules: (engine?: Engine) => Complete[] = (
  engine: Engine = engineInstance
): Complete[] => [
  new Complete(
    'civ2-science:research/complete/emit',
    new Effect(emitResearchComplete(engine))
  ),
  // Completing research starts the next with nothing: Civilization II sets the progress to 0 rather than carrying the
  //  excess over (OpenCiv2 `src/auto/civ.cpp` `civ_research_complete`, richardpenman/civ2@49f26ec). Only for research
  //  completed, not an advance acquired another way.
  new Complete(
    'civ2-science:research/complete/no-carry-over',
    new Criterion(
      (playerResearch: PlayerResearch, advance: Advance): boolean =>
        playerResearch.cleared()?.reason === 'completed' &&
        playerResearch.cleared()?.advance === advance.constructor
    ),
    new Effect((playerResearch: PlayerResearch): void => {
      playerResearch.progress().set(0);
    })
  ),
];

export default getRules;
