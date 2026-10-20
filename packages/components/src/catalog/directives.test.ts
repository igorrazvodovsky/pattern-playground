import { expect, test } from 'vitest';
import { createDirectiveRegistry, resolveActionParam, resolvePropValue } from '@json-render/core';
import { formatCurrency, formatNumber, formatPercent } from '@shared/format';
import { directives } from './directives';

const ctx = {
  stateModel: { closed: ['a', 'b'], count: 1234, ratio: 0.42 },
  repeatItem: { key: 'b', id: 'p1' },
  repeatBasePath: '/rows/0',
  directives: createDirectiveRegistry(directives),
};
const resolve = (value: unknown) => resolvePropValue(value, ctx);

test('$format formats in the document locale', () => {
  expect(resolve({ $format: 'number', value: { $state: '/count' } })).toBe(formatNumber(1234));
  expect(resolve({ $format: 'percent', value: { $state: '/ratio' } })).toBe(formatPercent(0.42));
  expect(resolve({ $format: 'currency', value: 75, currency: 'EUR' })).toBe(formatCurrency(75, 'EUR'));
  expect(resolve({ $format: 'number', value: { $state: '/missing' } })).toBe('');
  expect(resolve({ $format: 'number', value: 'n/a' })).toBe('');
  expect(resolve({ $format: 'date', value: 'not a date' })).toBe('');
});

test('$includes and $excludes test a list for a value', () => {
  expect(resolve({ $includes: { $state: '/closed' }, value: { $item: 'key' } })).toBe(true);
  expect(resolve({ $excludes: { $state: '/closed' }, value: { $item: 'key' } })).toBe(false);
  expect(resolve({ $includes: { $state: '/missing' }, value: 'a' })).toBe(false);
});

test('$toggleIn takes a value out of a list or adds it', () => {
  expect(resolve({ $toggleIn: { $state: '/closed' }, value: { $item: 'key' } })).toEqual(['a']);
  expect(resolve({ $toggleIn: { $state: '/closed' }, value: 'c' })).toEqual(['a', 'b', 'c']);
  expect(resolve({ $toggleIn: { $state: '/missing' }, value: 'c' })).toEqual(['c']);
});

test('$value gives an action the item value, not its path', () => {
  expect(resolveActionParam({ $item: 'id' }, ctx)).toBe('/rows/0/id');
  expect(resolveActionParam({ $value: { $item: 'id' } }, ctx)).toBe('p1');
});
