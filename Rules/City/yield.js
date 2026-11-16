"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.fundamentalismLoss = exports.scienceOverLimit = exports.limitedScience = exports.splitLuxuries = exports.splitShare = exports.FUNDAMENTALISM_LOSS = exports.LUXURIES_TO_RESEARCH = exports.SCIENCE_LIMIT = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const PlayerGovernmentRegistry_1 = require("@civ-clone/core-government/PlayerGovernmentRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Fundamentalism_1 = require("@civ-clone/base-government-fundamentalism/Fundamentalism");
const Luxuries_1 = require("@civ-clone/base-trade-rate-luxuries/Luxuries");
const Luxuries_2 = require("@civ-clone/base-city-yield-luxuries/Luxuries");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const Yields_1 = require("../../Yields");
const Research_1 = require("@civ-clone/base-trade-rate-research/Research");
const Tax_1 = require("@civ-clone/base-trade-rate-tax/Tax");
const Trade_1 = require("@civ-clone/base-terrain-yield-trade/Trade");
const Yield_1 = require("@civ-clone/core-city/Rules/Yield");
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
const governedBy_1 = require("@civ-clone/base-government-change/lib/governedBy");
const isHuman_1 = require("@civ-clone/base-difficulty/lib/isHuman");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
// After civ2-trade-rate's split and civ2-city's specialists (both `Normal`, 2000) and before civ2-city-improvement's
//  tithes (2500); and as `Yield` rules, so the Library, University and Research Lab (`YieldModifier`s, which read the
//  yields before any modifier) add their share of what's left.
exports.SCIENCE_LIMIT = 2050;
exports.LUXURIES_TO_RESEARCH = 2100;
exports.FUNDAMENTALISM_LOSS = 2200;
/** What the split gave `city` of `YieldType` (the yields labelled with the rate's name), not its specialists'. */
const splitShare = (yields, YieldType, rateName) => yields
    .filter((cityYield) => cityYield instanceof YieldType)
    .flatMap((cityYield) => cityYield.values())
    .filter(([, provider]) => provider === rateName)
    .reduce((total, [value]) => total + value, 0);
exports.splitShare = splitShare;
/** The luxuries the split gave `city` (labelled with the rate's name), not its Entertainers'. */
const splitLuxuries = (yields) => (0, exports.splitShare)(yields, Luxuries_2.default, Luxuries_1.default.name);
exports.splitLuxuries = splitLuxuries;
/**
 * The science the split gives under Fundamentalism: as at COSMIC's 5 tenths, `(trade × 50 + 40) / 100` rounded down,
 *  and no more than the luxuries leave (`city_split_trade`).
 */
const limitedScience = (trade, luxuries) => Math.min(Math.floor((trade * cosmic_1.default.fundamentalismMaxScience * 10 + 40) / 100), Math.max(0, trade - luxuries));
exports.limitedScience = limitedScience;
/** What the split gave research over Fundamentalism's limit, which goes to tax instead. */
const scienceOverLimit = (yields) => Math.max(0, (0, exports.splitShare)(yields, Yields_1.Research, Research_1.default.name) -
    (0, exports.limitedScience)(Math.max(0, (0, reduceYields_1.reduceYield)(yields, Trade_1.default)), (0, exports.splitLuxuries)(yields)));
exports.scienceOverLimit = scienceOverLimit;
/** What Fundamentalism takes from `science`: COSMIC's 50%, rounded down (`city_split_trade`). */
const fundamentalismLoss = (science) => Math.trunc((cosmic_1.default.fundamentalismScienceLoss * science) / 100);
exports.fundamentalismLoss = fundamentalismLoss;
const getRules = (playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance, clientRegistry = ClientRegistry_1.instance) => {
    const fundamentalist = (city) => (0, governedBy_1.default)(city.player(), [Fundamentalism_1.default], playerGovernmentRegistry);
    return [
        // Under Fundamentalism the split uses no more than COSMIC's 5 tenths for research, persons and computer players
        //  alike, and tax takes the rest (OpenCiv2 `src/auto/city.cpp` `city_split_trade`, richardpenman/civ2@e39fe7b). The
        //  player's research rate itself stays as it is, so leaving Fundamentalism restores it. Luxuries are as the rates
        //  give them.
        new Yield_1.default('civ2-science:city/yield/fundamentalism/science-limit', new Priority_1.default(exports.SCIENCE_LIMIT), new Criterion_1.default(fundamentalist), new Criterion_1.default((city, yields) => (0, exports.scienceOverLimit)(yields) > 0), new Effect_1.default((city, yields) => {
            const over = (0, exports.scienceOverLimit)(yields);
            return [
                new Yields_1.Research(-over, Fundamentalism_1.default.name),
                new Tax_1.default.tradeYield(over, Fundamentalism_1.default.name),
            ];
        })),
        // A computer player under Fundamentalism turns the luxuries the split gave a city into science, before the
        //  specialists' yields are added (OpenCiv2 `src/auto/city.cpp` `city_split_trade`, richardpenman/civ2@e39fe7b).
        new Yield_1.default('civ2-science:city/yield/fundamentalism/luxuries-to-research', new Priority_1.default(exports.LUXURIES_TO_RESEARCH), new Criterion_1.default(fundamentalist), new Criterion_1.default((city) => !(0, isHuman_1.default)(city.player(), clientRegistry)), new Criterion_1.default((city, yields) => (0, exports.splitLuxuries)(yields) > 0), new Effect_1.default((city, yields) => {
            const luxuries = (0, exports.splitLuxuries)(yields);
            return [
                new Luxuries_2.default(-luxuries, Fundamentalism_1.default.name),
                new Yields_1.Research(luxuries, Fundamentalism_1.default.name),
            ];
        })),
        // Under Fundamentalism a city loses COSMIC's 50% of its science, rounded down, after the specialists' and before
        //  the Library's and the other improvements' share (`city_split_trade`).
        new Yield_1.default('civ2-science:city/yield/fundamentalism/loss', new Priority_1.default(exports.FUNDAMENTALISM_LOSS), new Criterion_1.default(fundamentalist), new Criterion_1.default((city, yields) => (0, exports.fundamentalismLoss)((0, reduceYields_1.reduceYield)(yields, Yields_1.Research)) > 0), new Effect_1.default((city, yields) => new Yields_1.Research(-(0, exports.fundamentalismLoss)((0, reduceYields_1.reduceYield)(yields, Yields_1.Research)), Fundamentalism_1.default.name))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map