import { Requirement } from '@civ-clone/core-requirement/Requirement';
/**
 * The advances each of Civilization II's advances needs before a player can research it, from `data/advances`: one
 * rule each, made by `Rules/Research/requirements`. `registerRules` adds them to the game's `requirements`. An advance
 * whose prerequisites are both `nil` needs none and isn't listed. Plumbing, whose prerequisites are `no`, is never
 * available: a rule of its own, as an entry can't say "never".
 */
export declare const requiresAdvances: Requirement[];
export default requiresAdvances;
