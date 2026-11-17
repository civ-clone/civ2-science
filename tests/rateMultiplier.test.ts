import * as Advances from '../Advances';
import {
  Chieftain,
  Deity,
  King,
} from '@civ-clone/civ2-difficulty/Difficulties';
import { CostContext, costInputs, getRules } from '../Rules/Research/cost';
import researchCost, {
  ResearchCostInputs,
  multipliedCost,
  researchRate,
} from '../lib/cost';
import { describe, it } from 'mocha';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Client from '@civ-clone/core-client/Client';
import Cost from '@civ-clone/core-science/Rules/Cost';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import RateMultiplier from '../Rules/Research/RateMultiplier';
import { advances } from '../data/advances';
import { expect } from 'chai';
import register from '../registerRules';

// A game with this package's rules and all 90 advances, at `Level`, with a person and a computer player.
const setUp = (Level: typeof King = King) => {
  const game = new Game();

  game.advances.register(...advances.map(([AdvanceType]) => AdvanceType));
  game.difficulty.set(Level);

  register(game);

  const join = (human: boolean): PlayerResearch => {
    const player = new Player(game.rules);

    game.clients.register(human ? new Client(player) : new AIClient(player));

    return game.playerResearch.getByPlayer(player);
  };

  const person = join(true),
    computer = join(false),
    context: CostContext = {
      gameDifficultyRegistry: game.difficulty,
      clientRegistry: game.clients,
      playerResearchRegistry: game.playerResearch,
      turn: game.turn,
      playerWorldRegistry: game.playerWorlds,
    };

  return {
    game,
    person,
    computer,
    // What the cost rule answers, and Civilization II's own cost, as it was worked out before there was a multiplier.
    cost: (playerResearch: PlayerResearch): number =>
      game.rules.process(Cost, Advances.Alphabet, playerResearch)[0],
    civ2: (playerResearch: PlayerResearch): number => {
      const inputs = costInputs(context, playerResearch),
        known = Math.max(inputs.advances, 0);
      const bulbs = researchRate(inputs) * (known < 2 ? 1 : known);

      return bulbs < 1 || bulbs > 32000 ? 32000 : bulbs;
    },
  };
};

const inputs = (values: Partial<ResearchCostInputs>): ResearchCostInputs => ({
  advances: 0,
  reference: 0,
  level: 3,
  human: true,
  turn: 1,
  techParadigm: 10,
  enabledAdvances: 89,
  mapSize: 'normal',
  ...values,
});

describe('multipliedCost', (): void => {
  it('leaves the cost as it is with 1, rounding nothing, and stops at 32000', (): void => {
    [1, 10, 18, 31999, 32000].forEach((bulbs) =>
      expect(multipliedCost(bulbs, 1), `${bulbs}`).equal(bulbs)
    );
    expect(multipliedCost(32001)).equal(32000);
    expect(multipliedCost(0)).equal(32000);
  });

  it('multiplies, to the nearest whole bulb, before stopping at 32000', (): void => {
    expect(multipliedCost(18, 0.5)).equal(9);
    expect(multipliedCost(45, 0.66)).equal(30);
    expect(multipliedCost(45, 1.17)).equal(53);
    // 40000 is more than 32000, but half of it isn't.
    expect(multipliedCost(40000, 0.5)).equal(20000);
    expect(multipliedCost(30000, 1.17)).equal(32000);
  });

  it("is Civilization II's own cost, unchanged, with no multiplier or 1, whatever the inputs", (): void => {
    let checked = 0;

    [0, 1, 2, 5, 10, 19, 20, 21, 40, 88, 100, 250].forEach((advanceCount) =>
      [0, 5, 20, 60].forEach((reference) =>
        [0, 1, 2, 3, 4, 5].forEach((level) =>
          [true, false].forEach((human) =>
            [0, 1, 80, 151, 300].forEach((turn) =>
              (['small', 'normal', 'large'] as const).forEach((mapSize) => {
                const values = inputs({
                    advances: advanceCount,
                    reference,
                    level,
                    human,
                    turn,
                    mapSize,
                  }),
                  known = Math.max(advanceCount, 0),
                  raw = researchRate(values) * (known < 2 ? 1 : known),
                  original = raw < 1 || raw > 32000 ? 32000 : raw;

                expect(researchCost(values)).equal(original);
                expect(researchCost(values, 1)).equal(original);
                checked++;
              })
            )
          )
        )
      )
    );

    expect(checked).equal(12 * 4 * 6 * 2 * 5 * 3);
  });
});

describe('RateMultiplier (civ-clone/web-renderer#1077)', (): void => {
  it("leaves Civilization II's cost as it is, with no rule of its own, for every player at every level", (): void => {
    [Chieftain, King, Deity].forEach((Level) => {
      const { game, person, computer, cost, civ2 } = setUp(Level);

      expect(game.rules.get(RateMultiplier)).length(0);

      advances
        .map(([AdvanceType]) => AdvanceType)
        .filter((AdvanceType) => AdvanceType !== Advances.FutureTechnology)
        .forEach((AdvanceType, index) => {
          person.addAdvance(AdvanceType);

          if (index % 2 === 0) {
            computer.addAdvance(AdvanceType);
          }

          [person, computer].forEach((playerResearch) =>
            expect(cost(playerResearch), `${Level.name} ${index}`).equal(
              civ2(playerResearch)
            )
          );
        });
    });
  });

  it('multiplies the cost by the first rule that applies, to the nearest whole bulb', (): void => {
    const { game, person, computer, cost, civ2 } = setUp();

    person.addAdvance(Advances.Alphabet);
    computer.addAdvance(Advances.Alphabet);

    game.rules.register(
      new RateMultiplier(
        new Criterion(
          (playerResearch: PlayerResearch): boolean => playerResearch === person
        ),
        new Effect((): number => 0.5)
      ),
      new RateMultiplier(new Effect((): number => 3))
    );

    // A person knowing 1, 2 counted: 12, extra 0, × 67 / 89 = 9, the floor 11 − 2 = 9; × 2 = 18, halved.
    expect(civ2(person)).equal(18);
    expect(cost(person)).equal(9);
    // Only the second applies to the computer player.
    expect(cost(computer)).equal(civ2(computer) * 3);
  });

  it('asks no rules when the cost is given none, as before there was a multiplier', (): void => {
    const { game, person, civ2 } = setUp(),
      [rule] = getRules(
        game.difficulty,
        game.clients,
        game.playerResearch,
        game.turn,
        game.playerWorlds
      );

    game.rules.register(new RateMultiplier(new Effect((): number => 0.5)));

    expect(rule.process(Advances.Alphabet, person)).equal(civ2(person));
  });
});
