import { Alphabet, FutureTechnology, Writing } from '../Advances';
import { describe, it } from 'mocha';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import Anarchy from '@civ-clone/base-government-anarchy/Anarchy';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import Client from '@civ-clone/core-client/Client';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import Despotism from '@civ-clone/base-government-despotism/Despotism';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import { Research } from '../Yields';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import captured from '../Rules/City/captured';
import { expect } from 'chai';
import processYield from '../Rules/City/process-yield';

describe('City.process-yield', (): void => {
  const setUp = (Government: typeof Anarchy) => {
    const ruleRegistry = new RuleRegistry(),
      playerGovernmentRegistry = new PlayerGovernmentRegistry(),
      playerResearchRegistry = new PlayerResearchRegistry(),
      player = new Player(ruleRegistry),
      city = { player: () => player } as unknown as City,
      playerGovernment = new PlayerGovernment(player, undefined, ruleRegistry),
      playerResearch = new PlayerResearch(
        player,
        new AdvanceRegistry(),
        ruleRegistry
      );

    playerGovernment.set(new Government());
    playerGovernmentRegistry.register(playerGovernment);
    playerResearchRegistry.register(playerResearch);
    ruleRegistry.register(
      ...processYield(
        playerResearchRegistry,
        ruleRegistry,
        playerGovernmentRegistry
      )
    );

    ruleRegistry.process(ProcessYield, new Research(3), city, []);

    return playerResearch;
  };

  it("adds the city's research", (): void => {
    expect(setUp(Despotism).progress().value()).equal(3);
  });

  it('adds none under Anarchy', (): void => {
    expect(setUp(Anarchy).progress().value()).equal(0);
  });
});

describe('City.captured', (): void => {
  const setUp = () => {
    const ruleRegistry = new RuleRegistry(),
      playerResearchRegistry = new PlayerResearchRegistry(),
      clientRegistry = new ClientRegistry(),
      advanceRegistry = new AdvanceRegistry(),
      owner = new Player(ruleRegistry),
      captor = new Player(ruleRegistry),
      city = { player: () => owner } as unknown as City,
      ownerResearch = new PlayerResearch(owner, advanceRegistry, ruleRegistry),
      captorResearch = new PlayerResearch(
        captor,
        advanceRegistry,
        ruleRegistry
      );

    advanceRegistry.register(Alphabet, Writing, FutureTechnology);
    clientRegistry.register(new Client(captor));
    playerResearchRegistry.register(ownerResearch, captorResearch);
    ruleRegistry.register(
      ...captured(playerResearchRegistry, undefined, clientRegistry)
    );

    const capture = async (): Promise<void> => {
      await Promise.all(
        ruleRegistry.process(Captured, city, captor, owner) as any[]
      );
    };

    return { capture, captorResearch, ownerResearch };
  };

  it("takes one of the city's owner's advances", async (): Promise<void> => {
    const { capture, captorResearch, ownerResearch } = setUp();

    ownerResearch.addAdvance(Alphabet);

    await capture();

    expect(captorResearch.completed(Alphabet)).true;
  });

  it('never takes a Future Technology', async (): Promise<void> => {
    const { capture, captorResearch, ownerResearch } = setUp();

    ownerResearch.addAdvance(FutureTechnology);

    await capture();

    expect(captorResearch.complete()).length(0);
  });
});
