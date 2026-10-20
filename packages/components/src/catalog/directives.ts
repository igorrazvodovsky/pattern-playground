import { defineDirective, resolvePropValue, type DirectiveDefinition } from '@json-render/core';
import {
  concatDirective,
  countDirective,
  joinDirective,
  mathDirective,
  pluralizeDirective,
  truncateDirective,
} from '@json-render/directives';
import { z } from 'zod';
import {
  formatCompact,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from '@shared/format';

// The `$`-prefixed values every spec can use, beside `$state`, `$cond` and the
// other built-ins. They are vocabulary any demo shares; a function that knows
// one demo's domain stays a `$computed` in the module beside its spec.
//
// A module constant: the renderer compares directive registries by identity
// on every element.

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

// The stock `$format` falls back to the runtime's default locale and takes a
// `locale` from the spec. This one formats in the document's locale, as the
// rest of the site does, so a spec never names one.
const format = defineDirective({
  name: '$format',
  description:
    'Format `value` in the actor\'s locale: as a `number`, a `compact` number (1.2k), a `percent` (the value is a ratio, 0.42 for 42%), an amount of `currency` (give its ISO code), a `date`, or a `relative` time (the value is a count of `unit`s from now, negative for the past).',
  schema: z
    .object({
      $format: z.enum(['number', 'compact', 'percent', 'currency', 'date', 'relative']),
      value: z.unknown(),
      currency: z.string().optional(),
      unit: z.enum(['second', 'minute', 'hour', 'day', 'week', 'month', 'year']).optional(),
    })
    // The currency is a fact about the amount, so a spec always names it.
    .refine(format => format.$format !== 'currency' || format.currency, { path: ['currency'], message: 'Name the currency' }),
  resolve: (directive, ctx) => {
    const value = resolvePropValue(directive.value, ctx);
    if (value === null || value === undefined || value === '') return '';
    // A value that is not a number or a date shows as nothing, never as NaN.
    if (directive.$format === 'date') {
      if (Number.isNaN(new Date(value as string | number | Date).getTime())) return '';
    } else if (!Number.isFinite(Number(value))) return '';
    switch (directive.$format) {
      case 'number':
        return formatNumber(Number(value));
      case 'compact':
        return formatCompact(Number(value));
      case 'percent':
        return formatPercent(Number(value));
      case 'currency':
        return formatCurrency(Number(value), directive.currency!);
      case 'date':
        return formatDate(value as string | number | Date);
      case 'relative':
        return formatRelativeTime(Number(value), directive.unit ?? 'day');
    }
  },
});

// Lists of plain values, such as the ids or titles the actor closed, compared
// as they are.
const includes = defineDirective({
  name: '$includes',
  description: 'True when the list holds `value`.',
  schema: z.object({ $includes: z.unknown(), value: z.unknown() }),
  resolve: (directive, ctx) =>
    list(resolvePropValue(directive.$includes, ctx)).includes(resolvePropValue(directive.value, ctx)),
});

const excludes = defineDirective({
  name: '$excludes',
  description: 'True when the list does not hold `value`.',
  schema: z.object({ $excludes: z.unknown(), value: z.unknown() }),
  resolve: (directive, ctx) =>
    !list(resolvePropValue(directive.$excludes, ctx)).includes(resolvePropValue(directive.value, ctx)),
});

const toggleIn = defineDirective({
  name: '$toggleIn',
  description:
    'The list with `value` taken out if it holds it, or added at the end if not. Write it back with setState to toggle one value in a list.',
  schema: z.object({ $toggleIn: z.unknown(), value: z.unknown() }),
  resolve: (directive, ctx) => {
    const current = list(resolvePropValue(directive.$toggleIn, ctx));
    const value = resolvePropValue(directive.value, ctx);
    return current.includes(value) ? current.filter(each => each !== value) : [...current, value];
  },
});

// In an action's params, a bare `$item` names the item's state path, for
// actions that write to the item. Wrapped in `$value` it is the item's value.
const value = defineDirective({
  name: '$value',
  description:
    'Resolves its argument as a value. In action params a bare `{ "$item": "id" }` gives the item\'s state path; `{ "$value": { "$item": "id" } }` gives the id itself.',
  schema: z.object({ $value: z.unknown() }),
  resolve: (directive, ctx) => resolvePropValue(directive.$value, ctx),
});

export const directives: DirectiveDefinition[] = [
  concatDirective,
  countDirective,
  joinDirective,
  truncateDirective,
  mathDirective,
  pluralizeDirective,
  format,
  includes,
  excludes,
  toggleIn,
  value,
];
