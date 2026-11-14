import Advance from '@civ-clone/core-science/Advance';
/** A prerequisite that is always met (`nil`). */
export declare const NONE = -1;
/** A prerequisite that is never met (`no`): the advance is unavailable. */
export declare const NEVER = -2;
export type AdvanceRow = [
  Advance: typeof Advance,
  first: number,
  second: number,
  aiValue: number,
  civilizedModifier: number,
  epoch: number,
  category: number
];
export declare const advances: AdvanceRow[];
export default advances;
