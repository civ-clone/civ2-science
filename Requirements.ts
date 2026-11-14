import { NEVER, NONE, advances } from './data/advances';
import { Requirement, table } from '@civ-clone/core-requirement/Requirement';
import Advance from '@civ-clone/core-science/Advance';

/**
 * The advances each of Civilization II's advances needs before a player can research it, from `data/advances`: one
 * rule each, made by `Rules/Research/requirements`. `registerRules` adds them to the game's `requirements`. An advance
 * whose prerequisites are both `nil` needs none and isn't listed. Plumbing, whose prerequisites are `no`, is never
 * available: a rule of its own, as an entry can't say "never".
 */
export const requiresAdvances: Requirement[] = table(
  'civ2-science:research/requirements',
  'requires',
  advances
    .filter(
      ([, first, second]) =>
        first !== NEVER && (first !== NONE || second !== NONE)
    )
    .map(
      ([AdvanceType, first, second]): [
        typeof Advance,
        ...(typeof Advance)[]
      ] => [
        AdvanceType,
        ...[first, second]
          .filter((index) => index >= 0)
          .map((index) => advances[index][0]),
      ]
    )
);

export default requiresAdvances;
