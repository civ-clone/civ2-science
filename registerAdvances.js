"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const advances_1 = require("./data/advances");
const AdvanceRegistry_1 = require("@civ-clone/core-science/AdvanceRegistry");
// All 90, Plumbing included: a game can name it, but no player can research it (`Rules/Research/requirements`). The 66
//  shared with Civilization are already registered by their own packages by now, and a registry never moves an entry
//  it holds, so the registry's order is not RULES.TXT's: rules that need that order ask `lib/advanceIndex`.
AdvanceRegistry_1.instance.register(...advances_1.advances.map(([AdvanceType]) => AdvanceType));
//# sourceMappingURL=registerAdvances.js.map