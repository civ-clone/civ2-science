import * as Advances from '../Advances';
import { Chieftain, King } from '@civ-clone/civ2-difficulty/Difficulties';
import { describe, it } from 'mocha';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Advance from '@civ-clone/core-science/Advance';
import { ChooseResearch } from '../PlayerActions';
import Client from '@civ-clone/core-client/Client';
import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { advances } from '../data/advances';
import { expect } from 'chai';
import offeredChoices from '../lib/hiddenChoice';
import register from '../registerRules';

type Who = 'human' | 'computer';

// A game with this package's rules and all 90 advances, registered in the reverse of RULES.TXT's order, so nothing
//  can lean on the registry's order.
const setUp = (Level: typeof King = King) => {
  const game = new Game();

  game.advances.register(
    ...advances.map(([AdvanceType]) => AdvanceType).reverse()
  );
  game.difficulty.set(Level);

  register(game);

  const join = (who: Who): PlayerResearch => {
    const player = new Player(game.rules);

    game.clients.register(
      who === 'human' ? new Client(player) : new AIClient(player)
    );

    return game.playerResearch.getByPlayer(player);
  };

  return { game, join };
};

const give = (
  playerResearch: PlayerResearch,
  ...AdvanceTypes: (typeof Advance)[]
): void =>
  AdvanceTypes.forEach((AdvanceType) => playerResearch.addAdvance(AdvanceType));

describe('research', (): void => {
  it('starts every player knowing nothing', (): void => {
    const { join } = setUp();

    expect(join('human').complete()).length(0);
    expect(join('computer').complete()).length(0);
  });

  it('hides every third choice from a person, but not from the computer players or on Chieftain', (): void => {
    const { join } = setUp(),
      person = join('human'),
      computer = join('computer');

    // The registry's (reversed) order, so compare members.
    expect(person.available()).members([
      Advances.Alphabet,
      Advances.BronzeWorking,
      Advances.Masonry,
      Advances.Pottery,
      Advances.WarriorCode,
    ]);
    expect(computer.available()).members([
      Advances.Alphabet,
      Advances.BronzeWorking,
      Advances.CeremonialBurial,
      Advances.HorsebackRiding,
      Advances.Masonry,
      Advances.Pottery,
      Advances.WarriorCode,
    ]);

    const chieftain = setUp(Chieftain).join('human');

    expect(chieftain.available()).length(7);
  });

  it('moves the hidden choices as the player gains advances', (): void => {
    const { join } = setUp(),
      person = join('human');

    give(person, Advances.Alphabet);

    // Candidates 8, 9, 12, 36, 46, 47, 65, 86, 88; with 1 advance gained, 46 and 88 are hidden.
    expect(person.available()).not.include(Advances.MapMaking);
    expect(person.available()).not.include(Advances.Writing);
    expect(person.available()).include(Advances.CeremonialBurial);
    expect(person.available()).include(Advances.CodeOfLaws);
    expect(person.available()).length(7);
  });

  it('always offers the lowest choice', (): void => {
    expect(offeredChoices([3, 6, 9], 0, 3, true)).eql([3]);
    expect(offeredChoices([3, 6, 9], 1, 3, true)).eql([3, 6, 9]);
    // C's `%` keeps the sign: an index 3 below the count is hidden, 2 below isn't.
    expect(offeredChoices([0, 1, 2], 4, 3, true)).eql([0, 2]);
    expect(offeredChoices([3, 6, 9], 0, 0, true)).eql([3, 6, 9]);
    expect(offeredChoices([3, 6, 9], 0, 3, false)).eql([3, 6, 9]);
  });

  it('never makes Plumbing available', (): void => {
    const { join } = setUp(),
      computer = join('computer');

    give(
      computer,
      ...advances
        .map(([AdvanceType]) => AdvanceType)
        .filter(
          (AdvanceType) =>
            AdvanceType !== Advances.Plumbing &&
            AdvanceType !== Advances.FutureTechnology
        )
    );

    expect(computer.available()).eql([Advances.FutureTechnology]);
  });

  it('offers Future Technology after Fusion Power and Recycling, again and again', (): void => {
    const { join } = setUp(),
      computer = join('computer');

    expect(computer.available()).not.include(Advances.FutureTechnology);

    give(computer, Advances.FusionPower);

    expect(computer.available()).not.include(Advances.FutureTechnology);

    give(computer, Advances.Recycling);

    expect(computer.available()).include(Advances.FutureTechnology);

    give(computer, Advances.FutureTechnology, Advances.FutureTechnology);

    expect(computer.complete()).length(4);
    expect(computer.available()).include(Advances.FutureTechnology);
  });

  it('asks the player to choose while it researches nothing', (): void => {
    const { join } = setUp(),
      person = join('human');

    expect(person.player().mandatoryActions()).length(1);
    expect(person.player().action()).instanceof(ChooseResearch);

    person.research(Advances.Alphabet);

    expect(person.player().mandatoryActions()).length(0);
  });

  it("prices research with Civilization II's cost", (): void => {
    const { game, join } = setUp(),
      person = join('human'),
      computer = join('computer');

    game.turn.increment();

    person.research(Advances.Alphabet);
    computer.research(Advances.Alphabet);

    // `lib/cost`: 10 for a person's first advance at King, 11 × 67 / 89 = 8 for the computer's.
    expect(person.cost().value()).equal(10);
    expect(computer.cost().value()).equal(8);
  });
});
