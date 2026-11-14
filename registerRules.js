"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const requirements_1 = require("./Rules/Research/requirements");
const action_1 = require("./Rules/Player/action");
const added_1 = require("./Rules/Player/added");
const captured_1 = require("./Rules/City/captured");
const complete_1 = require("./Rules/Research/complete");
const cost_1 = require("./Rules/Research/cost");
const process_yield_1 = require("./Rules/City/process-yield");
const Requirements_1 = require("./Requirements");
const started_1 = require("./Rules/Research/started");
const turn_start_1 = require("./Rules/Player/turn-start");
const core_game_1 = require("@civ-clone/core-game");
const register = (game) => {
    game.rules.register(...(0, action_1.default)(game.playerResearch), ...(0, added_1.default)(game.advances, game.playerResearch, game.rules), ...(0, captured_1.default)(game.playerResearch, game.rng, game.clients), ...(0, complete_1.default)(game.engine), ...(0, cost_1.default)(game.difficulty, game.clients, game.playerResearch, game.turn, game.playerWorlds), ...(0, process_yield_1.default)(game.playerResearch, game.rules, game.playerGovernments));
    // Which advances a player can research, from the entries in `Requirements`, so a plugin can change an entry and its
    //  rule together.
    game.requirements.add(requirements_1.deriveRequirementsRules, ...Requirements_1.default);
    game.rules.register((0, requirements_1.plumbing)(), (0, requirements_1.hiddenChoice)(game.playerResearch, game.clients, game.difficulty), ...(0, started_1.default)(game.engine), ...(0, turn_start_1.default)(game.playerResearch, game.rules));
};
exports.register = register;
// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map