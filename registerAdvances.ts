import { advances } from './data/advances';
import { instance as advanceRegistryInstance } from '@civ-clone/core-science/AdvanceRegistry';

// All 90, Plumbing included: a game can name it, but no player can research it (`Rules/Research/requirements`). The 66
//  shared with Civilization are already registered by their own packages by now, and a registry never moves an entry
//  it holds, so the registry's order is not RULES.TXT's: rules that need that order ask `lib/advanceIndex`.
advanceRegistryInstance.register(
  ...advances.map(([AdvanceType]) => AdvanceType)
);
