import * as Advances from '../Advances';
import {
  FUTURE_TECHNOLOGY,
  advanceAt,
  advanceIndex,
  enabledAdvances,
  isEnabled,
  researchCandidates,
} from '../lib/advanceIndex';
import { NEVER, NONE, advances } from '../data/advances';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import { join } from 'path';
import requiresAdvances from '../Requirements';

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8')
);

describe('advances', (): void => {
  it('has the 90 rows of @CIVILIZE up to Future Technology, each a different class', (): void => {
    expect(advances).length(90);
    expect(new Set(advances.map(([AdvanceType]) => AdvanceType)).size).equal(
      90
    );
    expect(Object.keys(Advances)).length(90);
  });

  it('indexes every advance by its row, whatever order a registry holds them in', (): void => {
    advances.forEach(([AdvanceType], index): void => {
      expect(advanceIndex(AdvanceType)).equal(index);
      expect(advanceAt(index)).equal(AdvanceType);
    });

    expect(advanceIndex(Advances.FutureTechnology)).equal(FUTURE_TECHNOLOGY);
    expect(advanceIndex(class Religion {} as any)).equal(-1);
  });

  it('has no Religion, which Civilization II dropped', (): void => {
    expect(Object.keys(Advances)).not.include('Religion');
    expect(Object.keys(packageJson.dependencies)).not.include(
      '@civ-clone/base-science-advance-religion'
    );
  });

  it('makes 89 advances available: all but Plumbing', (): void => {
    expect(enabledAdvances).equal(89);
    expect(
      advances
        .map((row, index) => index)
        .filter((index) => !isEnabled(index))
        .map(advanceAt)
    ).eql([Advances.Plumbing]);
  });

  it('never names an unavailable advance as a prerequisite', (): void => {
    advances.forEach(([, first, second], index): void => {
      if (!isEnabled(index)) {
        return;
      }

      [first, second].forEach((prerequisite): void => {
        expect(prerequisite === NONE || isEnabled(prerequisite)).true;
      });
    });
  });

  it('puts Future Technology after Fusion Power and Recycling', (): void => {
    const [, first, second] = advances[FUTURE_TECHNOLOGY];

    expect([advanceAt(first), advanceAt(second)]).eql([
      Advances.FusionPower,
      Advances.Recycling,
    ]);
    expect(Advances.FutureTechnology.repeatable).true;
  });

  it('starts with the seven advances that need nothing, in RULES.TXT order', (): void => {
    expect(researchCandidates(() => false).map(advanceAt)).eql([
      Advances.Alphabet,
      Advances.BronzeWorking,
      Advances.CeremonialBurial,
      Advances.HorsebackRiding,
      Advances.Masonry,
      Advances.Pottery,
      Advances.WarriorCode,
    ]);
  });

  it('never offers Future Technology as known, so it can be researched again', (): void => {
    const all = (index: number): boolean => index !== FUTURE_TECHNOLOGY;

    expect(researchCandidates(all)).eql([FUTURE_TECHNOLOGY]);
  });

  it('makes one entry for every advance that needs another', (): void => {
    expect(requiresAdvances).length(90 - 1 - 7);

    const entry = requiresAdvances.find(
      (requirement) => requirement.subject === Advances.TheWheel
    )!;

    expect(entry.id).equal('civ2-science:research/requirements/TheWheel');
    expect(entry.targets).eql([Advances.HorsebackRiding]);
    expect(
      requiresAdvances.some(
        (requirement) => requirement.subject === Advances.Plumbing
      )
    ).false;
  });

  it('depends on no civ1-* or library-* package', (): void => {
    expect(
      Object.keys(packageJson.dependencies).filter((name) =>
        /^@civ-clone\/(civ1|library)-/.test(name)
      )
    ).eql([]);
    expect(NEVER).equal(-2);
  });
});
