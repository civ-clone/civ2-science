import { advanceValue, cRand, pickResearch } from '../lib/pickResearch';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { researchCandidates } from '../lib/advanceIndex';

// A generator giving these `rand()` results in turn.
const rands = (...values: number[]): (() => number) => {
  let i = 0;

  return (): number => (values[i++ % values.length] + 0.5) / 32768;
};

describe('pickResearch', (): void => {
  const start = researchCandidates(() => false); // 1, 8, 9, 36, 47, 65, 86

  it('turns a generator into C rand() numbers', (): void => {
    expect(cRand(rands(0))).equal(0);
    expect(cRand(rands(32767))).equal(32767);
  });

  it('scores a computer player rand() % value and keeps the first highest', (): void => {
    const value = (index: number): number => (index === 47 ? 5 : 3);

    // Scores: 1 → 0, 8 → 1, 9 → 2, 36 → 2, 47 → 4, 65 → 0, 86 → 1.
    expect(
      pickResearch({
        candidates: start,
        human: false,
        numberOfAdvances: 0,
        level: 3,
        value,
        randomNumberGenerator: rands(0, 1, 2, 2, 4, 0, 1),
      })
    ).equal(47);
  });

  it('draws nothing for a computer player when the value is 1', (): void => {
    let draws = 0;

    pickResearch({
      candidates: start,
      human: false,
      numberOfAdvances: 0,
      level: 3,
      value: () => 1,
      randomNumberGenerator: () => {
        draws++;

        return 0;
      },
    });

    expect(draws).equal(0);
  });

  it("leaves a person's hidden choices out, and scores rand() % 3 + value − 1", (): void => {
    const picked: number[] = [];

    // 9 and 36 are hidden with no advances gained, so only five are scored; the value makes 36 best if it weren't.
    pickResearch({
      candidates: start,
      human: true,
      numberOfAdvances: 0,
      level: 3,
      value: (index: number): number => {
        picked.push(index);

        return index === 36 ? 9 : 2;
      },
      randomNumberGenerator: rands(0),
    });

    expect(picked).eql([1, 8, 47, 65, 86]);
  });

  it('returns -1 with nothing to research', (): void => {
    expect(
      pickResearch({
        candidates: [],
        human: false,
        numberOfAdvances: 0,
        level: 3,
        value: () => 1,
        randomNumberGenerator: () => 0,
      })
    ).equal(-1);
  });
});

describe('advanceValue', (): void => {
  it('adds the civilized modifier times the attitude, and 1 while nobody knows it', (): void => {
    // Alphabet: value 5, modifier 1. Masonry: 4, 1. Warrior Code: 4, −1.
    const civilized = advanceValue({
        civilize: 1,
        known: () => false,
        knownByAnyone: () => false,
      }),
      militaristic = advanceValue({
        civilize: -1,
        known: () => false,
        knownByAnyone: (index) => index === 1,
      });

    expect(civilized(1)).equal(7);
    expect(civilized(86)).equal(4);
    expect(militaristic(1)).equal(4);
    expect(militaristic(86)).equal(6);
  });

  it('takes 1 off for each known advance it leads to, and is never below 1', (): void => {
    // Alphabet (5) leads to Code of Laws, Map Making, Mathematics and Writing; Masonry (4) to Mathematics and Construction.
    const value = advanceValue({
      civilize: 0,
      known: (index) => [12, 46, 49, 88].includes(index),
      knownByAnyone: () => true,
    });

    expect(value(1)).equal(1);
    expect(value(47)).equal(3);
  });
});
