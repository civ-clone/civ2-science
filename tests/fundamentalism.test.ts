import { describe, it } from 'mocha';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import City from '@civ-clone/core-city/City';
import Client from '@civ-clone/core-client/Client';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Despotism from '@civ-clone/base-government-despotism/Despotism';
import Effect from '@civ-clone/core-rule/Effect';
import ExcessRate from '@civ-clone/core-trade-rate/Rules/ExcessRate';
import Fundamentalism from '@civ-clone/base-government-fundamentalism/Fundamentalism';
import GoldYield from '@civ-clone/base-city-yield-gold/Gold';
import Government from '@civ-clone/core-government/Government';
import Low from '@civ-clone/core-rule/Priorities/Low';
import LuxuriesRate from '@civ-clone/base-trade-rate-luxuries/Luxuries';
import LuxuriesYield from '@civ-clone/base-city-yield-luxuries/Luxuries';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerTradeRates from '@civ-clone/core-trade-rate/PlayerTradeRates';
import { Research } from '../Yields';
import ResearchRate from '@civ-clone/base-trade-rate-research/Research';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TaxRate from '@civ-clone/base-trade-rate-tax/Tax';
import Yield from '@civ-clone/core-yield/Yield';
import YieldModifier from '@civ-clone/core-city/Rules/YieldModifier';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import cityYield from '../Rules/City/yield';
import { expect } from 'chai';
import maxRate from '../Rules/Player/max-rate';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

type Split = { luxuries: number; research: number; tax: number };
type Specialists = { entertainers?: number; scientists?: number };

const setUp = (
    kind: 'person' | 'computer',
    GovernmentType: typeof Government
  ) => {
    const ruleRegistry = new RuleRegistry(),
      playerGovernmentRegistry = new PlayerGovernmentRegistry(),
      clientRegistry = new ClientRegistry(),
      player = new Player(ruleRegistry),
      playerGovernment = new PlayerGovernment(player, undefined, ruleRegistry);

    clientRegistry.register(
      kind === 'person' ? new Client(player) : new AIClient(player)
    );
    playerGovernment.set(new GovernmentType());
    playerGovernmentRegistry.register(playerGovernment);

    ruleRegistry.register(
      ...maxRate(playerGovernmentRegistry),
      ...cityYield(playerGovernmentRegistry, clientRegistry)
    );

    return { player, ruleRegistry };
  },
  // `City#yields`, for a city whose split and specialists give what's asked, and that has a Library (half the science
  //  the yield rules gave, as civ2-city-improvement's modifier adds it).
  yieldsOf = (
    { player, ruleRegistry }: ReturnType<typeof setUp>,
    { luxuries, research, tax }: Split,
    { entertainers = 0, scientists = 0 }: Specialists = {}
  ): Yield[] => {
    const city = { player: () => player } as unknown as City,
      rules = new RuleRegistry();

    rules.register(
      ...ruleRegistry.get(YieldRule),
      // civ2-trade-rate's split, labelled with the rates' names.
      new YieldRule(
        'test:split',
        new Effect((): Yield[] => [
          new LuxuriesYield(luxuries, LuxuriesRate.name),
          new Research(research, ResearchRate.name),
          new GoldYield(tax, TaxRate.name),
        ])
      ),
      // civ2-city's specialists: 2 luxuries an Entertainer, 3 science a Scientist.
      new YieldRule(
        'test:specialists',
        new Effect((): Yield[] => [
          new LuxuriesYield(entertainers * 2, 'Entertainer'),
          new Research(scientists * 3, 'Scientist'),
        ])
      ),
      new YieldModifier(
        'test:library',
        new Low(),
        new Criterion(
          (city: City, yields: Yield[], base: Yield[]): boolean =>
            reduceYield(base, Research) > 0
        ),
        new Effect(
          (city: City, yields: Yield[], base: Yield[]): Yield =>
            new Research(reduceYield(base, Research) >> 1, 'Library')
        )
      )
    );

    const yields: Yield[] = [];

    rules.get(YieldRule).forEach((rule: YieldRule): void => {
      if (rule.validate(city, yields)) {
        yields.push(...([] as Yield[]).concat(rule.process(city, yields)));
      }
    });

    const base = [...yields];

    rules.get(YieldModifier).forEach((rule: YieldModifier): void => {
      if (rule.validate(city, yields, base)) {
        yields.push(
          ...([] as Yield[]).concat(rule.process(city, yields, base) as Yield)
        );
      }
    });

    return yields;
  },
  totals = (yields: Yield[]) => ({
    luxuries: reduceYield(yields, LuxuriesYield),
    research: reduceYield(yields, Research),
    tax: reduceYield(yields, GoldYield),
  });

describe('Fundamentalism', (): void => {
  describe('the loss of science', (): void => {
    // The split's science and the Scientists' (3 each), then 50% of it lost, rounded down, then the Library's half.
    (
      [
        [5, 0, 3, 1],
        [4, 0, 2, 1],
        [1, 0, 1, 0],
        [0, 1, 2, 1],
        [5, 1, 4, 2],
        [0, 0, 0, 0],
      ] as [number, number, number, number][]
    ).forEach(([research, scientists, kept, library]) =>
      it(`keeps ${kept} of ${research} science and ${scientists} Scientist(s), and the Library adds ${library}`, (): void => {
        const yields = yieldsOf(
          setUp('person', Fundamentalism),
          { luxuries: 0, research, tax: 0 },
          { scientists }
        );

        expect(
          reduceYield(
            yields.filter((cityYield) =>
              cityYield.values().every(([, provider]) => provider !== 'Library')
            ),
            Research
          )
        ).to.equal(kept);
        expect(totals(yields).research).to.equal(kept + library);
      })
    );

    it('takes nothing under any other government', (): void => {
      expect(
        totals(
          yieldsOf(
            setUp('person', Despotism),
            { luxuries: 0, research: 5, tax: 0 },
            { scientists: 1 }
          )
        )
      ).to.deep.equal({ luxuries: 0, research: 12, tax: 0 });
    });
  });

  describe("a computer player's luxuries", (): void => {
    it("turns the split's luxuries into science before the loss, and leaves the Entertainers'", (): void => {
      // 4 luxuries + 5 science + 3 from a Scientist = 12, less 6 = 6, and the Library's 3.
      expect(
        totals(
          yieldsOf(
            setUp('computer', Fundamentalism),
            { luxuries: 4, research: 5, tax: 3 },
            { entertainers: 1, scientists: 1 }
          )
        )
      ).to.deep.equal({ luxuries: 2, research: 9, tax: 3 });
    });

    it("leaves a person's luxuries as luxuries", (): void => {
      // 5 + 3 = 8, less 4 = 4, and the Library's 2.
      expect(
        totals(
          yieldsOf(
            setUp('person', Fundamentalism),
            { luxuries: 4, research: 5, tax: 3 },
            { entertainers: 1, scientists: 1 }
          )
        )
      ).to.deep.equal({ luxuries: 6, research: 6, tax: 3 });
    });

    it('leaves them under any other government', (): void => {
      expect(
        totals(
          yieldsOf(
            setUp('computer', Despotism),
            { luxuries: 4, research: 5, tax: 3 },
            { entertainers: 1 }
          )
        )
      ).to.deep.equal({ luxuries: 6, research: 7, tax: 3 });
    });
  });

  describe('the research rate', (): void => {
    const ratesFor = (setup: ReturnType<typeof setUp>) => {
      // civ2-trade-rate sends research's excess to tax first.
      setup.ruleRegistry.register(
        new ExcessRate('test:excess', new Effect(() => [TaxRate]))
      );

      return new PlayerTradeRates(
        setup.player,
        new LuxuriesRate(0),
        new ResearchRate(0),
        new TaxRate(100),
        setup.ruleRegistry
      );
    };

    it('limits research to 50% under Fundamentalism, persons and computer players alike', (): void => {
      (['person', 'computer'] as const).forEach((kind): void => {
        const rates = ratesFor(setUp(kind, Fundamentalism));

        expect(rates.maxRate(ResearchRate)).to.equal(0.5);
        expect(rates.maxRate(TaxRate)).to.equal(undefined);
        expect(rates.maxRate(LuxuriesRate)).to.equal(undefined);

        rates.setAll([
          [LuxuriesRate, 0],
          [ResearchRate, 80],
          [TaxRate, 20],
        ]);

        expect(rates.all().map((rate) => rate.value())).to.deep.equal([
          0, 50, 50,
        ]);

        rates.setAll([
          [LuxuriesRate, 0],
          [ResearchRate, 50],
          [TaxRate, 50],
        ]);

        expect(rates.all().map((rate) => rate.value())).to.deep.equal([
          0, 50, 50,
        ]);
      });
    });

    it('sets no limit on research under any other government', (): void => {
      expect(
        ratesFor(setUp('person', Despotism)).maxRate(ResearchRate)
      ).to.equal(undefined);
    });
  });
});
