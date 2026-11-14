"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Complete_1 = require("@civ-clone/core-science/Rules/Complete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const events_1 = require("@civ-clone/base-science-research/lib/events");
const getRules = (engine = Engine_1.instance) => [
    new Complete_1.default('civ2-science:research/complete/emit', new Effect_1.default((0, events_1.emitResearchComplete)(engine))),
    // Completing research starts the next with nothing: Civilization II sets the progress to 0 rather than carrying the
    //  excess over (OpenCiv2 `src/auto/civ.cpp` `civ_research_complete`, richardpenman/civ2@49f26ec). Only for research
    //  completed, not an advance acquired another way.
    new Complete_1.default('civ2-science:research/complete/no-carry-over', new Criterion_1.default((playerResearch, advance) => {
        var _a, _b;
        return ((_a = playerResearch.cleared()) === null || _a === void 0 ? void 0 : _a.reason) === 'completed' &&
            ((_b = playerResearch.cleared()) === null || _b === void 0 ? void 0 : _b.advance) === advance.constructor;
    }), new Effect_1.default((playerResearch) => {
        playerResearch.progress().set(0);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=complete.js.map