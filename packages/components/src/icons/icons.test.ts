import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OUTPUT, buildCollection, serialise, usedNames } from '../../../../scripts/build-icons.ts';

// <iconify-icon> renders nothing, and logs nothing, for an `ik:` name that
// isn't in the bundled collection, so a typo or a forgotten regeneration
// would only show up as a blank space on the page.
describe('Iconoteka collection', () => {
  it('has an icon for every ik: name in source', () => {
    const { missing } = buildCollection();
    const used = usedNames();
    expect(missing.map((name) => `ik:${name} (${[...(used.get(name) ?? [])].join(', ')})`)).toEqual(
      [],
    );
  });

  it('resolves weight and fill suffixes', () => {
    const names = [
      'trash',
      'trash-light',
      'trash-semibold-fill',
      'heart-fill',
      'heart-bold-fill',
      'wind-medium',
      'pause-fill',
    ];
    const { collection, missing } = buildCollection(names);
    const body = (name: string) => collection.icons[name]?.body;
    expect(new Set(names.slice(0, 3).map(body)).size).toBe(3);
    // Heart draws one fill for every weight, stored under thin.
    expect(body('heart-bold-fill')).toBe(body('heart-fill'));
    // `wind_medium` is its own icon, not `wind` in the medium weight.
    expect(body('wind-medium')).toBeDefined();
    // Pause is outline-only.
    expect(missing).toEqual(['pause-fill']);
  });

  it('is up to date (run `npm run build:icons`)', () => {
    expect(readFileSync(OUTPUT, 'utf8')).toBe(serialise(buildCollection().collection));
  });
});
