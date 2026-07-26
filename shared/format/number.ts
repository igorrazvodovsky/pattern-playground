import { numberFormat, type Locale } from './intl-cache.js';

/**
 * Separators, decimal marks, and digit system belong to the reader. What is
 * ours is how many significant figures they get, and whether to abbreviate.
 */
export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: Locale
): string => numberFormat(locale, options).format(value);

/**
 * `1.2k` / `1.2m`, localised. A scanability choice: for surfaces where the
 * reader is orienting rather than reconciling, and where the exact value stays
 * available on the surface it belongs to.
 */
export const formatCompact = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: Locale
): string => numberFormat(locale, { notation: 'compact', ...options }).format(value);

/** Takes the *ratio* — `0.42`, not `42` — because the symbol's position is the locale's. */
export const formatPercent = (
  ratio: number,
  options?: Intl.NumberFormatOptions,
  locale?: Locale
): string => numberFormat(locale, { style: 'percent', ...options }).format(ratio);

/**
 * The currency is a fact about the amount and is always stated; placement,
 * separators, and symbol form are the reader's and never are.
 * `trailingZeroDisplay: 'stripIfInteger'` gives `£75` and `£75.50` rather than
 * `£75.00`. Where more than one currency appears on a surface, symbols stop
 * being enough — pass `currencyDisplay: 'code'` for the whole surface.
 */
export const formatCurrency = (
  value: number,
  currency: string,
  options?: Intl.NumberFormatOptions,
  locale?: Locale
): string =>
  numberFormat(locale, {
    style: 'currency',
    currency,
    trailingZeroDisplay: 'stripIfInteger',
    ...options,
  }).format(value);

/**
 * A domain-fixed unit — bytes, pixels, SI in a scientific reading — where the
 * unit is a fact about the value. `Intl` renders it in the reader's
 * conventions but never *converts*: preference units (distance, mass,
 * temperature) are product state, not a locale lookup.
 */
export const formatUnit = (
  value: number,
  unit: string,
  options?: Intl.NumberFormatOptions,
  locale?: Locale
): string => numberFormat(locale, { style: 'unit', unit, ...options }).format(value);
