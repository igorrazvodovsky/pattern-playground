import { describe, it, expect } from 'vitest';
import {
  applySpecPatch,
  isAxisMalleable,
  makeSpec,
  type ViewSpec,
} from './spec.js';

// A patch has three behaviours that look alike in the type and are not alike
// at all: some sections merge into what is there, some replace it whole, and
// some are cleared by an explicit null. Which section does which is the thing
// a caller gets wrong, so it is the thing pinned here.

const base = (): ViewSpec => ({
  id: 'v1',
  label: 'Products',
  query: [{ id: 'f1', path: 'status', operator: 'is', values: ['active'] }],
  representation: { type: 'card', rung: 'summary', shownAttributes: ['title', 'badge'] },
  arrangement: { sortBy: { field: 'title', order: 'asc' }, layout: 'grid' },
  detail: { openIn: 'side-by-side', openFrom: 'item', openBy: 'click', shownAttributes: 'all' },
  malleability: { query: { disabled: true } },
});

describe('makeSpec', () => {
  it('defaults to a summary card written in roles, so it renders any binding', () => {
    const spec = makeSpec({ id: 'v1' });

    expect(spec.representation).toEqual({
      type: 'card',
      rung: 'summary',
      shownAttributes: ['thumbnail', 'title', 'description', 'badge', 'key-attribute'],
    });
    expect(spec.query).toEqual([]);
    expect(spec.arrangement).toEqual({});
  });

  it('merges a partial representation over the defaults', () => {
    const spec = makeSpec({ id: 'v1', representation: { type: 'table' } });

    expect(spec.representation.type).toBe('table');
    expect(spec.representation.rung).toBe('summary');
    expect(spec.representation.shownAttributes).toHaveLength(5);
  });

  it('leaves the optional keys absent rather than undefined', () => {
    const spec = makeSpec({ id: 'v1' });

    expect('label' in spec).toBe(false);
    expect('detail' in spec).toBe(false);
    expect('malleability' in spec).toBe(false);
  });
});

describe('applySpecPatch', () => {
  it('returns a new spec and leaves the original alone', () => {
    const original = base();
    const patched = applySpecPatch(original, { label: 'Renamed' });

    expect(patched).not.toBe(original);
    expect(original.label).toBe('Products');
  });

  it('merges representation and arrangement into what is already there', () => {
    const patched = applySpecPatch(base(), {
      representation: { type: 'table' },
      arrangement: { groupBy: 'category' },
    });

    expect(patched.representation).toEqual({
      type: 'table',
      rung: 'summary',
      shownAttributes: ['title', 'badge'],
    });
    expect(patched.arrangement).toEqual({
      sortBy: { field: 'title', order: 'asc' },
      layout: 'grid',
      groupBy: 'category',
    });
  });

  it('replaces the query whole, because a clause list is one statement', () => {
    const replacement = [
      { id: 'f2', path: 'price', operator: 'less than' as const, values: ['10'] },
    ];
    const patched = applySpecPatch(base(), { query: replacement });

    expect(patched.query).toEqual(replacement);
  });

  it('replaces detail and malleability whole rather than merging them', () => {
    const patched = applySpecPatch(base(), {
      detail: { openIn: 'popover', openFrom: 'title', openBy: 'hover', shownAttributes: ['title'] },
      malleability: { arrangement: { disabled: true } },
    });

    expect(patched.detail!.openIn).toBe('popover');
    expect(patched.malleability).toEqual({ arrangement: { disabled: true } });
    expect(patched.malleability!.query).toBeUndefined();
  });

  it('clears detail and malleability on an explicit null, removing the key', () => {
    const patched = applySpecPatch(base(), { detail: null, malleability: null });

    expect('detail' in patched).toBe(false);
    expect('malleability' in patched).toBe(false);
  });

  it('leaves a section untouched when the patch omits it', () => {
    const patched = applySpecPatch(base(), { label: 'Renamed' });

    expect(patched.query).toEqual(base().query);
    expect(patched.detail).toEqual(base().detail);
    expect(patched.malleability).toEqual(base().malleability);
  });

  it('distinguishes an omitted label from one explicitly cleared', () => {
    expect(applySpecPatch(base(), {}).label).toBe('Products');
    expect(applySpecPatch(base(), { label: undefined }).label).toBeUndefined();
  });
});

describe('isAxisMalleable', () => {
  it('treats an absent malleability block as fully malleable', () => {
    const spec = makeSpec({ id: 'v1' });

    for (const axis of ['query', 'representation', 'arrangement', 'content'] as const) {
      expect(isAxisMalleable(spec, axis)).toBe(true);
    }
  });

  it('disables only the axes the block names', () => {
    const spec = base();

    expect(isAxisMalleable(spec, 'query')).toBe(false);
    expect(isAxisMalleable(spec, 'representation')).toBe(true);
    expect(isAxisMalleable(spec, 'arrangement')).toBe(true);
    expect(isAxisMalleable(spec, 'content')).toBe(true);
  });
});
