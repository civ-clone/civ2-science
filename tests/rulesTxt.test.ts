import { describe, it } from 'mocha';
import { advances } from '../data/advances';
import { expect } from 'chai';
import { readCivilize } from '@civ-clone/civ2-asset-extractor/rules';
import { readFileSync } from 'fs';
import { join } from 'path';

// Compares the committed table with the player's own RULES.TXT. Skipped unless `CIV2_PATH` names the game's folder,
//  so CI, which has no copy of the game, never runs it. Only numbers are compared, and a failure names a row, never
//  the file's text.
const path = process.env.CIV2_PATH;

(path ? describe : describe.skip)('RULES.TXT @CIVILIZE', (): void => {
  const rows = path
      ? readCivilize(readFileSync(join(path, 'RULES.TXT'), 'latin1'))
      : [],
    // The game reads prerequisites against a built-in list of abbreviations, which the shipped file also writes as
    //  each row's comment: built here from the file, so nothing of it is committed.
    abbreviations = rows.map((row) => row.comment ?? ''),
    resolve = (token: string): number =>
      token === 'nil' ? -1 : token === 'no' ? -2 : abbreviations.indexOf(token);

  it('has 100 rows, of which the 10 after Future Technology are unavailable', (): void => {
    expect(rows.length === 100).true;
    rows.slice(90).forEach((row, offset): void => {
      expect(row.prerequisites[0] === 'no', `row ${91 + offset}`).true;
    });
  });

  it('names every prerequisite by a row comment that is unique', (): void => {
    expect(new Set(abbreviations.slice(0, 90)).size === 90).true;
  });

  it('matches the committed numbers, row by row', (): void => {
    advances.forEach(
      (
        [, first, second, aiValue, civilizedModifier, epoch, category],
        index
      ): void => {
        const row = rows[index],
          matches =
            resolve(row.prerequisites[0]) === first &&
            resolve(row.prerequisites[1]) === second &&
            row.aiValue === aiValue &&
            row.civilizedModifier === civilizedModifier &&
            row.epoch === epoch &&
            row.category === category;

        expect(matches, `row ${index + 1}`).true;
      }
    );
  });
});
