import * as Advances from '../Advances';
import {
  CostContext,
  costInputs,
  numberOfAdvances,
  referenceAdvances,
} from '../Rules/Research/cost';
import researchCost, { multipliedCost } from '../lib/cost';
import { describe, it } from 'mocha';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import Client from '@civ-clone/core-client/Client';
import Cost from '@civ-clone/core-science/Rules/Cost';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import { King } from '@civ-clone/civ2-difficulty/Difficulties';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import RateMultiplier from '../Rules/Research/RateMultiplier';
import { advances } from '../data/advances';
import { expect } from 'chai';
import register from '../registerRules';

type Seat = 'person' | 'computer' | 'none' | 'barbarian';

// A game with this package's rules and all 90 advances at King, with a player for each seat: a person's, a computer
//  player's, one with no client yet, or the barbarians (a computer player whose civilization is the barbarians').
const setUp = (...seats: Seat[]) => {
  const game = new Game();

  game.advances.register(...advances.map(([AdvanceType]) => AdvanceType));
  game.difficulty.set(King);

  register(game);

  const players = seats.map((seat: Seat): PlayerResearch => {
      const player = new Player(game.rules);

      if (seat === 'barbarian') {
        const barbarians = Object.create(Barbarian.prototype);

        Object.defineProperty(player, 'civilization', {
          value: () => barbarians,
        });
      }

      if (seat === 'person') {
        game.clients.register(new Client(player));
      }

      if (seat === 'computer' || seat === 'barbarian') {
        game.clients.register(new AIClient(player));
      }

      return game.playerResearch.getByPlayer(player);
    }),
    context: CostContext = {
      gameDifficultyRegistry: game.difficulty,
      clientRegistry: game.clients,
      playerResearchRegistry: game.playerResearch,
      turn: game.turn,
      playerWorldRegistry: game.playerWorlds,
    },
    learn = (playerResearch: PlayerResearch, count: number): void =>
      advances
        .map(([AdvanceType]) => AdvanceType)
        .filter((AdvanceType) => AdvanceType !== Advances.FutureTechnology)
        .slice(0, count)
        .forEach((AdvanceType) => playerResearch.addAdvance(AdvanceType));

  return {
    game,
    players,
    context,
    learn,
    reference: (): number =>
      referenceAdvances(game.playerResearch, game.clients),
    cost: (playerResearch: PlayerResearch): number =>
      game.rules.process(Cost, Advances.Alphabet, playerResearch)[0],
  };
};

describe('referenceAdvances', (): void => {
  it("is the leading person's count with a person seated, however far a computer player leads", (): void => {
    const {
      players: [person, leader, other],
      learn,
      reference,
    } = setUp('person', 'computer', 'computer');

    learn(person, 5);
    learn(leader, 30);
    learn(other, 12);

    expect(reference()).equal(numberOfAdvances(person)).equal(6);
  });

  it('is the most a person has, with two seated', (): void => {
    const {
      players: [first, second, computer],
      learn,
      reference,
    } = setUp('person', 'person', 'computer');

    learn(first, 4);
    learn(second, 9);
    learn(computer, 40);

    expect(reference()).equal(10);
  });

  it("is the leading player's count with no person playing, as when a game is only watched", (): void => {
    // A watched game's observer has no seat and no client in the game's `ClientRegistry`: every player is a computer
    //  player's, as here.
    const {
      players: [first, leader, last],
      learn,
      reference,
    } = setUp('computer', 'computer', 'computer');

    learn(first, 12);
    learn(leader, 30);
    learn(last, 3);

    expect(reference()).equal(numberOfAdvances(leader)).equal(31);
  });

  it('counts a player whose client has not joined yet as no person, so the leader stands in', (): void => {
    const {
      players: [waiting, computer],
      learn,
      reference,
    } = setUp('none', 'computer');

    learn(waiting, 7);
    learn(computer, 2);

    expect(reference()).equal(8);
  });

  it('leaves the barbarians out, with or without a person', (): void => {
    const all = setUp('barbarian', 'computer');

    all.learn(all.players[0], 50);
    all.learn(all.players[1], 10);

    expect(all.reference()).equal(11);

    const seated = setUp('barbarian', 'person');

    seated.learn(seated.players[0], 50);
    seated.learn(seated.players[1], 10);

    expect(seated.reference()).equal(11);
  });

  it('is 1 for players knowing nothing, and 0 with no players', (): void => {
    expect(setUp('computer', 'computer').reference()).equal(1);
    expect(setUp().reference()).equal(0);
  });
});

describe('the research cost with no person playing', (): void => {
  it('prices a computer player level with the leader as one level with a person, not a whole count ahead', (): void => {
    const watched = setUp('computer', 'computer'),
      seated = setUp('computer', 'person');

    [watched, seated].forEach(({ players, learn }) => {
      learn(players[0], 40);
      learn(players[1], 40);
    });

    const [computer] = watched.players,
      [seatedComputer] = seated.players;

    expect(costInputs(watched.context, computer).reference).equal(41);
    expect(watched.cost(computer)).equal(seated.cost(seatedComputer));
    // Against a reference of 0, as before, the lead of 41 added 13 to the ratio.
    expect(watched.cost(computer)).lessThan(
      researchCost({ ...costInputs(watched.context, computer), reference: 0 })
    );
  });

  it('leaves a seated game unchanged: a computer player ahead of the person pays for its lead', (): void => {
    const { players, learn, context, cost } = setUp('computer', 'person'),
      [computer, person] = players;

    learn(computer, 40);
    learn(person, 10);

    expect(costInputs(context, computer).reference).equal(11);
    expect(cost(computer)).equal(researchCost(costInputs(context, computer)));
  });

  it("rides the new reference through a rule set's multiplier (civ2-enhanced's cost by age)", (): void => {
    const { game, players, learn, context, cost } = setUp(
        'computer',
        'computer'
      ),
      [computer, leader] = players;

    learn(computer, 20);
    learn(leader, 25);

    game.rules.register(new RateMultiplier(new Effect((): number => 1.17)));

    expect(costInputs(context, computer).reference).equal(26);
    expect(cost(computer)).equal(
      multipliedCost(researchCost(costInputs(context, computer)), 1.17)
    );
  });
});
