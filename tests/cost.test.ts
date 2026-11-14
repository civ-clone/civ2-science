import researchCost, { ResearchCostInputs } from '../lib/cost';
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
    // Not before turn 151: 13, + 4 = 17, × 67 / 89 = 12, small 9.
    expect(
      cost({
        level: 5,
        advances: 10,
        reference: 20,
        turn: 150,
        mapSize: 'small',
      })
    ).equal(90);
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
