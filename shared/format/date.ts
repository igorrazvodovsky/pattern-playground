import { dateTimeFormat, type Locale } from './intl-cache.js';

export type DateInput = Date | string | number;

/** `1952-09-26` — a calendar date with no time of day and no zone. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const toDate = (value: DateInput): Date =>
  value instanceof Date ? value : new Date(value);

/**
 * A date-only string parses as UTC midnight, so a reader at a negative offset
 * would otherwise see the previous day. Such a value carries no time of day and
 * must not acquire one on the way to the screen: read it back in UTC and the
 * calendar day survives, while the rendering stays the reader's.
 */
const calendarSafe = (
  value: DateInput,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormatOptions =>
  typeof value === 'string' && DATE_ONLY.test(value) && options.timeZone === undefined
    ? { ...options, timeZone: 'UTC' }
    : options;

/**
 * A date in the reader's conventions. `dateStyle: 'medium'` — abbreviated
 * month — is the default in reading flow; `short` is all-numeric and for
 * genuinely tight space; `long` and `full` for a date the reader must not
 * mistake.
 */
export const formatDate = (
  value: DateInput,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale?: Locale
): string => dateTimeFormat(locale, calendarSafe(value, options)).format(toDate(value));

/** A time of day in the reader's conventions, including the clock convention. */
export const formatTime = (
  value: DateInput,
  options: Intl.DateTimeFormatOptions = { timeStyle: 'short' },
  locale?: Locale
): string => dateTimeFormat(locale, options).format(toDate(value));

/** Date and time together — the default rendering for an event's timestamp. */
export const formatDateTime = (
  value: DateInput,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
  locale?: Locale
): string => dateTimeFormat(locale, options).format(toDate(value));

/**
 * ISO 8601, for values that are *sorted, parsed, or transmitted* rather than
 * read: `datetime` attributes, sortable column values, filenames, payloads.
 * Deliberately locale-independent, which is what makes it right there and wrong
 * in prose.
 */
export const isoDate = (value: DateInput): string => toDate(value).toISOString().slice(0, 10);

/** The full ISO 8601 instant, for `datetime` attributes carrying a time. */
export const isoDateTime = (value: DateInput): string => toDate(value).toISOString();
