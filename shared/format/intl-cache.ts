/**
 * Memoised `Intl` constructors.
 *
 * Constructing a formatter costs around 28 µs; formatting with one already
 * built costs around 0.6 µs. A thousand-row table with three date columns is
 * three thousand constructions — roughly 90 ms of pure formatting, which is
 * several dropped frames. So every formatter in this module comes from here,
 * and nothing outside the module calls `toLocale*` directly (there is a lint
 * rule to that effect).
 *
 * See Storybook `Foundations/Figures`.
 */

import { resolveLocale, type Locale } from './locale.js';

export type { Locale };

const keyOf = (locale: Locale, options: object | undefined): string =>
  `${Array.isArray(locale) ? locale.join(',') : (locale ?? '')}|${
    options ? JSON.stringify(options) : ''
  }`;

/**
 * Resolution happens here, ahead of the cache lookup: `undefined` and the tag
 * it resolves to must not key to different entries, and a page whose `lang`
 * changes must not be served the formatter built before it did.
 */
const memoise = <O extends object, F>(construct: (locale: Locale, options?: O) => F) => {
  const cache = new Map<string, F>();
  return (requested: Locale, options?: O): F => {
    const locale = resolveLocale(requested);
    const key = keyOf(locale, options);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const formatter = construct(locale, options);
    cache.set(key, formatter);
    return formatter;
  };
};

export const dateTimeFormat = memoise<Intl.DateTimeFormatOptions, Intl.DateTimeFormat>(
  (locale, options) => new Intl.DateTimeFormat(locale, options)
);

export const numberFormat = memoise<Intl.NumberFormatOptions, Intl.NumberFormat>(
  (locale, options) => new Intl.NumberFormat(locale, options)
);

export const relativeTimeFormat = memoise<Intl.RelativeTimeFormatOptions, Intl.RelativeTimeFormat>(
  (locale, options) => new Intl.RelativeTimeFormat(locale, options)
);
