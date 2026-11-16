import { Entertainer, Scientist } from '@civ-clone/civ2-city/Specialists';
import { describe, it } from 'mocha';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import AvailableGovernmentRegistry from '@civ-clone/core-government/AvailableGovernmentRegistry';
import AvailableTradeRateRegistry from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import City from '@civ-clone/core-city/City';
import Client from '@civ-clone/core-client/Client';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Democracy from '@civ-clone/base-government-democracy/Democracy';
import Despotism from '@civ-clone/base-government-despotism/Despotism';
import Effect from '@civ-clone/core-rule/Effect';
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
import PlayerTradeRatesRegistry from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import Republic from '@civ-clone/base-government-republic/Republic';
import { Research } from '../Yields';
import ResearchRate from '@civ-clone/base-trade-rate-research/Research';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Specialist from '@civ-clone/core-city/Specialist';
import SpecialistRegistry from '@civ-clone/core-city/SpecialistRegistry';
import TaxRate from '@civ-clone/base-trade-rate-tax/Tax';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import Yield from '@civ-clone/core-yield/Yield';
import YieldModifier from '@civ-clone/core-city/Rules/YieldModifier';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import civ2CityYield from '@civ-clone/civ2-city/Rules/City/yield';
import civ2Split from '@civ-clone/civ2-trade-rate/Rules/City/yield';
import cityYield from '../Rules/City/yield';
import { expect } from 'chai';
import governmentChanged from '@civ-clone/civ2-trade-rate/Rules/Player/government-changed';
import maxRate from '@civ-clone/civ2-trade-rate/Rules/Player/max-rate';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

type Kind = 'person' | 'computer';
type Specialists = { entertainers?: number; scientists?: number };

// A city's yields as `City#yields` works them out, through the real rules in the order a civ2 game registers them:
//  civ2-city's specialists and civ2-trade-rate's split (both 2000, civ2-city first), this package's Fundamentalism
//  rules (2050, 2100, 2200), and a Library (civ2-city-improvement's `YieldModifier` adds half the science the yield
//  rules gave). The player's rates have civ2-trade-rate's maximums.
const setUp = (kind: Kind, GovernmentType: typeof Government) => {
  const ruleRegistry = new RuleRegistry(),
    playerGovernmentRegistry = new PlayerGovernmentRegistry(),
    playerTradeRatesRegistry = new PlayerTradeRatesRegistry(),
    availableTradeRateRegistry = new AvailableTradeRateRegistry(),
    specialistRegistry = new SpecialistRegistry(),
    clientRegistry = new ClientRegistry(),
    player = new Player(ruleRegistry),
    playerGovernment = new PlayerGovernment(
      player,
      new AvailableGovernmentRegistry(),
      ruleRegistry
    ),
    city = { player: () => player } as unknown as City;

  availableTradeRateRegistry.register(LuxuriesRate, ResearchRate, TaxRate);
  clientRegistry.register(
    kind === 'person' ? new Client(player) : new AIClient(player)
  );
  playerGovernmentRegistry.register(playerGovernment);
  playerTradeRatesRegistry.register(
    new PlayerTradeRates(
      player,
      new LuxuriesRate(0),
      new ResearchRate(50),
      new TaxRate(50),
      ruleRegistry
    )
  );

  ruleRegistry.register(
    ...civ2CityYield(
      undefined,
      playerGovernmentRegistry,
      specialistRegistry,
      undefined,
      clientRegistry
    ).filter((rule) =>
      (rule.id() ?? '').startsWith('civ2-city:city/yield/specialist/')
    ),
    ...civ2Split(availableTradeRateRegistry, playerTradeRatesRegistry),
    ...cityYield(playerGovernmentRegistry, clientRegistry),
    ...maxRate(playerGovernmentRegistry, clientRegistry),
    ...governmentChanged(playerTradeRatesRegistry),
    new YieldModifier(
      'test:library',
      new Low(),
      new Criterion(
        (city: City, yields: Yield[], base: Yield[]): boolean =>
          reduceYield(base, Research) > 1
      ),
      new Effect(
        (city: City, yields: Yield[], base: Yield[]): Yield =>
          new Research(reduceYield(base, Research) >> 1, 'Library')
      )
    )
  );

  playerGovernment.set(new GovernmentType());

  const rates = playerTradeRatesRegistry.getByPlayer(player);

  return {
    playerGovernment,
    rates,
    setRates: ([luxuries, research, tax]: number[]): void =>
      rates.setAll([
        [LuxuriesRate, luxuries],
        [ResearchRate, research],
        [TaxRate, tax],
      ]),
    stored: (): number[] => rates.all().map((rate) => rate.value()),
    yieldsOf: (
      trade: number,
      { entertainers = 0, scientists = 0 }: Specialists = {}
    ) => {
      specialistRegistry
        .getByCity(city)
        .forEach((specialist: Specialist) =>
          specialistRegistry.unregister(specialist)
        );
      for (let i = 0; i < entertainers; i++) {
        specialistRegistry.register(new Entertainer(city));
      }
      for (let i = 0; i < scientists; i++) {
        specialistRegistry.register(new Scientist(city));
      }

      const yields: Yield[] = [new Trade(trade)];

      ruleRegistry.get(YieldRule).forEach((rule: YieldRule): void => {
        if (rule.validate(city, yields)) {
          yields.push(...([] as Yield[]).concat(rule.process(city, yields)));
        }
      });

      const base = [...yields];

      ruleRegistry.get(YieldModifier).forEach((rule: YieldModifier): void => {
        if (rule.validate(city, yields, base)) {
          yields.push(
            ...([] as Yield[]).concat(rule.process(city, yields, base) as Yield)
          );
        }
      });

      return {
        luxuries: reduceYield(yields, LuxuriesYield),
        research: reduceYield(yields, Research),
        tax: reduceYield(yields, GoldYield),
      };
    },
  };
};

describe('Fundamentalism', (): void => {
  describe('in the split', (): void => {
    // [luxuries, research, tax] rates, the trade, and `city_split_trade` (OpenCiv2 `src/auto/city.cpp`,
    //  richardpenman/civ2@e39fe7b) worked out by hand in tenths: luxuries `(t × (10 − science − tax) + 4) / 10`, science
    //  `(t × min(science, 5) + 4) / 10` up to what luxuries leave, tax the rest; then science less half, rounded down;
    //  then the Library's half of that.
    (
      [
        [[0, 80, 20], 10, { luxuries: 0, research: 3 + 1, tax: 5 }],
        [[30, 70, 0], 7, { luxuries: 2, research: 2 + 1, tax: 2 }],
        [[0, 50, 50], 9, { luxuries: 0, research: 2 + 1, tax: 5 }],
        [[0, 60, 40], 9, { luxuries: 0, research: 2 + 1, tax: 5 }],
        [[0, 80, 20], 1, { luxuries: 0, research: 0, tax: 1 }],
        [[50, 50, 0], 9, { luxuries: 4, research: 2 + 1, tax: 1 }],
      ] as [number[], number, object][]
    ).forEach(([rates, trade, expected]) =>
      it(`splits ${trade} trade at ${rates.join('/')} into ${JSON.stringify(
        expected
      )}`, (): void => {
        const { setRates, stored, yieldsOf } = setUp('person', Fundamentalism);

        setRates(rates);

        expect(stored()).to.deep.equal(rates);
        expect(yieldsOf(trade)).to.deep.equal(expected);
      })
    );

    it("loses half of a city's science, Scientists' included, before the Library", (): void => {
      const { setRates, yieldsOf } = setUp('person', Fundamentalism);

      setRates([0, 50, 50]);

      // 10 trade: 5 science and 5 tax; a Scientist's 3 makes 8; half lost, 4; the Library's 2.
      expect(yieldsOf(10, { scientists: 1 })).to.deep.equal({
        luxuries: 0,
        research: 6,
        tax: 5,
      });

      // 5 science and 3 + 3 makes 11; 5 lost (rounded down), 6; the Library's 3.
      expect(yieldsOf(10, { scientists: 2 })).to.deep.equal({
        luxuries: 0,
        research: 9,
        tax: 5,
      });
    });

    it("turns a computer player's split luxuries into science before the loss, and leaves its Entertainers'", (): void => {
      const { setRates, stored, yieldsOf } = setUp('computer', Fundamentalism);

      // A computer player's research is limited to 70% under Fundamentalism by its maximum rate, and to 5 tenths in
      //  the split.
      setRates([20, 80, 0]);
      expect(stored()).to.deep.equal([20, 70, 10]);

      // 10 trade: 2 luxuries, 7 science limited to 5 (2 to tax: 3), luxuries to science (7), a Scientist's 3 (10),
      //  half lost (5), the Library's 2; the Entertainer's 2 luxuries stay.
      expect(yieldsOf(10, { entertainers: 1, scientists: 1 })).to.deep.equal({
        luxuries: 2,
        research: 7,
        tax: 3,
      });
    });

    it("leaves a person's luxuries as luxuries", (): void => {
      const { setRates, yieldsOf } = setUp('person', Fundamentalism);

      setRates([20, 50, 30]);

      // 10 trade: 2, 5 and 3; 2 more luxuries from an Entertainer; science 5 less 2 is 3, and the Library's 1.
      expect(yieldsOf(10, { entertainers: 1 })).to.deep.equal({
        luxuries: 4,
        research: 4,
        tax: 3,
      });
    });
  });

  describe('the research rate', (): void => {
    it('keeps the research rate a person set, and uses all of it again after Fundamentalism', (): void => {
      const { playerGovernment, setRates, stored, yieldsOf } = setUp(
        'person',
        Democracy
      );

      setRates([0, 80, 20]);
      playerGovernment.set(new Fundamentalism());

      expect(stored()).to.deep.equal([0, 80, 20]);
      expect(yieldsOf(10)).to.deep.equal({ luxuries: 0, research: 4, tax: 5 });

      playerGovernment.set(new Republic());

      expect(stored()).to.deep.equal([0, 80, 20]);
      expect(yieldsOf(10)).to.deep.equal({
        luxuries: 0,
        research: 8 + 4,
        tax: 2,
      });
    });

    it('changes nothing under any other government', (): void => {
      const { setRates, yieldsOf } = setUp('computer', Despotism);

      setRates([20, 60, 20]);

      // 10 trade: 2, 6 and 2; a Scientist's 3 makes 9, and the Library's 4.
      expect(yieldsOf(10, { entertainers: 1, scientists: 1 })).to.deep.equal({
        luxuries: 4,
        research: 13,
        tax: 2,
      });
    });
  });
});
