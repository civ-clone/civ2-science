import researchCost, {
  FULL_RAMP,
  ResearchCostInputs,
  fullRampStep,
  rampedStep,
  researchRate,
} from '../lib/cost';
import { describe, it } from 'mocha';
import { expect } from 'chai';

// Worked by hand from OpenCiv2's `civ_research_cost` (richardpenman/civ2@49f26ec), with @COSMIC's paradigm of 10 and
//  the game's 89 advances.
const cost = (inputs: Partial<ResearchCostInputs>): number =>
  researchCost({
    advances: 0,
    reference: 0,
    level: 3,
    human: true,
    turn: 1,
    techParadigm: 10,
    enabledAdvances: 89,
    mapSize: 'normal',
    ...inputs,
  });

describe('researchCost', (): void => {
  it('costs a person at King 10 for the first advance: the floor of 11 less 1', (): void => {
    // ratio 12, extra 0 (no advances yet), 12 × 67 / 89 = 9, raised to 11 − 1 = 10; × 1.
    expect(cost({})).equal(10);
  });

  it('costs a computer player behind the leading person less', (): void => {
    // ratio 11 − 1 = 10, extra 3 × 10 / 20 = 3 (of 7), 13 × 67 / 89 = 9; × 10.
    expect(cost({ human: false, advances: 10, reference: 12, turn: 50 })).equal(
      90
    );
    // Level with the person: 11 + 0, extra 8 × 10 / 20 = 4, 15 × 67 / 89 = 11; × 10.
    expect(cost({ human: false, advances: 10, reference: 10, turn: 50 })).equal(
      110
    );
  });

  it('adds a third of the lead, and up to 6 for being ahead of the turn', (): void => {
    // Deity counts as Emperor: 14, + 0, + clamp(30 − 200 / 8, 0, 6) = 5, + 14 = 33, × 67 / 89 = 24, large × 5 / 4 = 30.
    expect(
      cost({
        level: 5,
        advances: 30,
        reference: 30,
        turn: 200,
        mapSize: 'large',
      })
    ).equal(900);
    // Ahead by 9: 12 + 3 + 6 (30 − 1 / 8 capped), + 15 = 36, × 67 / 89 = 27; × 30.
    expect(cost({ advances: 30, reference: 21 })).equal(810);
  });

  it('takes 1 more off on Deity after turn 150 when 5 behind, and scales a small map by 4 / 5', (): void => {
    // 14 − 1 − 1 = 12, + 4 = 16, × 67 / 89 = 12, small 9; floor 1; × 10.
    expect(
      cost({
        level: 5,
        advances: 10,
        reference: 20,
        turn: 151,
        mapSize: 'small',
      })
    ).equal(90);
    // Where the step survives the scaling: 4 advances, 5 behind. Turn 151: 14 − 1 − 1 = 12, + 4 × 9 / 20 = 1, × 67 / 89
    //  = 9 (floor 7); × 4. Turn 150: 13, + 1, × 67 / 89 = 10; × 4.
    expect(cost({ level: 5, advances: 4, reference: 9, turn: 151 })).equal(36);
    expect(cost({ level: 5, advances: 4, reference: 9, turn: 150 })).equal(40);
    // On Chieftain, no step down for being behind: 6, + 2 = 8, × 67 / 89 = 6 (floor 1); × 10.
    expect(cost({ level: 0, advances: 10, reference: 20 })).equal(60);
  });

  it('stops at 32000', (): void => {
    expect(cost({ human: false, advances: 250 })).equal(32000);
  });

  it('applies a tech paradigm other than 10', (): void => {
    // 12 × 15 / 10 = 18, extra 0, × 67 / 89 = 13; × 1.
    expect(cost({ techParadigm: 15 })).equal(13);
  });
});

// The ratio on its own, for a cost fixed per advance (civ-clone/web-renderer#1072).
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

describe('researchRate', (): void => {
  it('times the advances gained, is the cost', (): void => {
    [
      {},
      { human: false, advances: 10, reference: 12, turn: 50 },
      {
        advances: 30,
        reference: 20,
        turn: 200,
        level: 5,
        mapSize: 'large' as const,
      },
      { techParadigm: 15 },
    ].forEach((values) => {
      const known = Math.max(values.advances ?? 0, 1);

      expect(
        researchRate(inputs(values)) * known,
        JSON.stringify(values)
      ).equal(cost(values));
    });
  });

  it('leaves out the ramp and the floor when told to', (): void => {
    // A person at King knowing 10, level with the reference: 12, extra 9 × 10 / 20 = 4, 16 × 67 / 89 = 12.
    expect(researchRate(inputs({ advances: 10, reference: 10 }))).equal(12);
    // Without the ramp: 12 × 67 / 89 = 9.
    expect(
      researchRate(inputs({ advances: 10, reference: 10 }), { ramp: false })
    ).equal(9);
    // The first advance: 9, raised to 10 by the floor; without it, 9.
    expect(researchRate(inputs({}), { ramp: false })).equal(10);
    expect(researchRate(inputs({}), { ramp: false, floor: false })).equal(9);
  });

  it('ramps the n-th step by three quarters over the first twenty', (): void => {
    expect([1, 10, 20, 40].map(rampedStep)).eql([1.0375, 13.75, 35, 70]);
  });

  it('takes the whole ramp whatever the advances gained, when told to, as from the twentieth on', (): void => {
    // Knowing 10: 12 + 9 = 21, × 67 / 89 = 15, as with 20 or more known.
    expect(
      researchRate(inputs({ advances: 10, reference: 10 }), { ramp: 'full' })
    ).equal(15);
    expect(
      researchRate(inputs({ advances: 25, reference: 25, turn: 200 }), {
        ramp: 'full',
      })
    ).equal(researchRate(inputs({ advances: 25, reference: 25, turn: 200 })));
  });

  it('steps by n over the whole ramp from the twentieth on, and a little less before it', (): void => {
    expect(FULL_RAMP).equal(1.75);
    expect(fullRampStep(20)).equal(20);
    expect(fullRampStep(40)).equal(40);
    expect(fullRampStep(10)).closeTo(10 * (1.375 / 1.75), 1e-9);
  });
});
