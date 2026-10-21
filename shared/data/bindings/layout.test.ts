import { describe, expect, test } from 'vitest';
import type { EntityBinding } from './types';
import { layoutByRole } from './layout';

const binding: EntityBinding = {
  entityType: 'thing',
  attributes: [
    { path: 'icon', role: 'thumbnail', valueType: 'image' },
    { path: 'name', role: 'title', valueType: 'string' },
    { path: 'kind', role: 'subtitle', valueType: 'string' },
    { path: 'summary', role: 'description', valueType: 'string' },
    { path: 'price', label: 'Price', role: 'key-attribute', valueType: 'number', unit: 'kg' },
    { path: 'note', role: 'caption', valueType: 'string' },
    { path: 'status', role: 'badge', valueType: 'string' },
    { path: 'labels', role: 'tag', valueType: 'string', many: true },
    { path: 'site', label: 'Site', role: 'spec', valueType: 'string' },
    { path: 'specs', role: 'spec', valueType: 'string' },
    { path: 'homepage', label: 'Homepage', role: 'link', valueType: 'link' },
    { path: 'listed', label: 'Listed', role: 'footer', valueType: 'string' },
    { path: 'thread', role: 'spec', valueType: 'custom' },
  ],
  scopes: {
    micro: ['icon', 'name'],
    mini: ['icon', 'name', 'status', 'site'],
    mid: ['status', 'summary', 'site'],
    maxi: ['status', 'summary', 'site', 'listed'],
  },
};

const item = {
  id: 'one',
  icon: 'ph:cube',
  name: 'Cube',
  kind: 'Solid',
  summary: 'Six square faces.',
  price: 12,
  note: 'Photographed indoors',
  status: 'Available',
  labels: ['geometry', 'toy'],
  site: 'Leeds',
  specs: { edgeLength: '3 cm', colour: 'Red', weight: null },
  homepage: 'https://example.com',
  listed: 'Monday',
};

describe('layoutByRole', () => {
  test('micro keeps only the title and thumbnail', () => {
    const layout = layoutByRole(binding, 'micro', item, 'all');
    expect(layout).toMatchObject({ hasTitle: true, title: 'Cube', thumbnail: 'ph:cube' });
    expect(layout.badges).toEqual([]);
    expect(layout.rows).toEqual([]);
    expect(layout.customs).toEqual([]);
  });

  test('mini shows rows as labelled badges and leaves out captions and tags', () => {
    const layout = layoutByRole(binding, 'mini', item, 'all');
    expect(layout.badges.slice(0, 2)).toEqual([
      { key: 'status', label: null, text: 'Available' },
      { key: 'site', label: 'Site', text: 'Leeds' },
    ]);
    expect(layout.rows).toEqual([]);
    expect(layout.captions).toEqual([]);
    expect(layout.tags).toEqual([]);
  });

  test('mid and maxi place each role in its own slot', () => {
    const layout = layoutByRole(binding, 'maxi', item, 'all');
    expect(layout.badges).toEqual([{ key: 'status', label: null, text: 'Available' }]);
    expect(layout.keyAttributes).toEqual([{ key: 'price', text: '12 kg' }]);
    expect(layout.subtitles).toEqual([{ key: 'kind', text: 'Solid' }]);
    expect(layout.descriptions).toEqual([{ key: 'summary', text: 'Six square faces.' }]);
    expect(layout.captions).toEqual([{ key: 'note', text: 'Photographed indoors' }]);
    expect(layout.tags.map((tag) => tag.text)).toEqual(['geometry', 'toy']);
    expect(layout.footers).toEqual([{ key: 'listed', text: 'Listed Monday' }]);
    expect(layout.rows.at(-1)).toEqual({
      key: 'homepage',
      label: 'Homepage',
      text: 'https://example.com',
    });
  });

  test('a record-valued attribute gives one row per key with a value', () => {
    const layout = layoutByRole(binding, 'mid', item, ['specs']);
    expect(layout.rows).toEqual([
      { key: 'specs.edgeLength', label: 'Edge length', text: '3 cm' },
      { key: 'specs.colour', label: 'Colour', text: 'Red' },
    ]);
  });

  test('the selection defaults to the scope and drops attributes with no value', () => {
    const layout = layoutByRole(binding, 'mid', { ...item, site: null });
    expect(layout.hasTitle).toBe(false);
    expect(layout.badges).toHaveLength(1);
    expect(layout.rows).toEqual([]);
    expect(layout.descriptions).toHaveLength(1);
  });

  test('a null selection keeps the scope default', () => {
    expect(layoutByRole(binding, 'mid', item, null)).toEqual(layoutByRole(binding, 'mid', item));
  });

  test('a custom attribute is kept without a value', () => {
    const layout = layoutByRole(binding, 'mid', item, ['thread']);
    expect(layout.customs.map((attribute) => attribute.path)).toEqual(['thread']);
    expect(layout.rows).toEqual([]);
  });
});
