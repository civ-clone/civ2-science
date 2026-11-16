"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const PlayerGovernmentRegistry_1 = require("@civ-clone/core-government/PlayerGovernmentRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Fundamentalism_1 = require("@civ-clone/base-government-fundamentalism/Fundamentalism");
const MaxRate_1 = require("@civ-clone/core-trade-rate/Rules/MaxRate");
const Research_1 = require("@civ-clone/base-trade-rate-research/Research");
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
const governedBy_1 = require("@civ-clone/base-government-change/lib/governedBy");
const getRules = (playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance) => [
    // Under Fundamentalism no more than COSMIC's 5 tenths of trade goes to research, persons and computer players alike
    //  (OpenCiv2 `src/auto/city.cpp` `city_split_trade`, richardpenman/civ2@e39fe7b). The original uses the lower rate
    //  in the split and lets tax take the rest; here it is the research rate's maximum, so the excess goes to tax as
    //  civ2-trade-rate's `ExcessRate` sends research's first, and the rates show what's used. The lowest maximum holds,
    //  so this is below the government's own.
    new MaxRate_1.default('civ2-science:player/max-rate/fundamentalism', new Effect_1.default((player, rate) => rate instanceof Research_1.default &&
        (0, governedBy_1.default)(player, [Fundamentalism_1.default], playerGovernmentRegistry)
        ? cosmic_1.default.fundamentalismMaxScience / 10
        : undefined)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=max-rate.js.map