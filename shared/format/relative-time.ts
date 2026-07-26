import { relativeTimeFormat, type Locale } from './intl-cache.js';
import { formatDateTime, isoDateTime, toDate, type DateInput } from './date.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Relative up to seven days, absolute beyond it — the span over which "last
 * Tuesday" is still something a reader holds without counting.
 *
 * A judgement rather than a standard: Atlassian switches at 7 days, Primer's
 * `RelativeTime` defaults to 30. The corpus disagrees, so there is no number to
 * defer to.
 */
export const RELATIVE_THRESHOLD_DAYS = 7;

/**
 * Which unit the elapsed time falls in, and how many of it. `null` past the
 * threshold, where the reader is owed the date instead.
 *
 * Under a minute is zero seconds rather than a special case: `numeric: 'auto'`
 * has a dedicated CLDR entry for it, so the phrase comes back as `now`,
 * `jetzt`, `maintenant` — the reader's, like everything else here.
 */
const bucket = (elapsedMs: number): { value: number; unit: Intl.RelativeTimeFormatUnit } | null => {
  const magnitude = Math.abs(elapsedMs);
  const sign = elapsedMs < 0 ? 1 : -1;

  if (magnitude < MINUTE) return { value: 0, unit: 'second' };
  if (magnitude < HOUR) return { value: sign * Math.trunc(magnitude / MINUTE), unit: 'minute' };
  if (magnitude < DAY) return { value: sign * Math.trunc(magnitude / HOUR), unit: 'hour' };
  if (magnitude < RELATIVE_THRESHOLD_DAYS * DAY)
    return { value: sign * Math.trunc(magnitude / DAY), unit: 'day' };
  return null;
};

/**
 * `Intl.RelativeTimeFormat` renders the phrase per locale; only the bucketing —
 * which unit, at what boundary — is ours.
 */
export const formatRelativeTime = (
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale?: Locale
): string => relativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);

/**
 * The pieces a timestamp needs in order to be rendered honestly: the text a
 * reader sees, the machine-readable value for `<time datetime>`, and the
 * absolute value, which must stay reachable when the text is relative.
 *
 * Prefer `<pp-timestamp>`, which assembles these into markup and keeps relative
 * text current. Reach for this directly only where markup isn't available.
 */
export const describeTimestamp = (
  timestamp: DateInput,
  locale?: Locale
): { text: string; datetime: string; absolute: string; isRelative: boolean } => {
  const date = toDate(timestamp);
  const absolute = formatDateTime(date, undefined, locale);
  const datetime = isoDateTime(date);
  const relative = bucket(Date.now() - date.getTime());

  if (relative === null) {
    return { text: absolute, datetime, absolute, isRelative: false };
  }
  return {
    text: formatRelativeTime(relative.value, relative.unit, locale),
    datetime,
    absolute,
    isRelative: true,
  };
};

/**
 * The visible text alone. Relative within the threshold, the absolute date and
 * time beyond it.
 *
 * This returns a bare string and so cannot carry the absolute value that
 * relative text owes its reader — that obligation lives in the markup. Use
 * `<pp-timestamp>` wherever markup is possible.
 */
export const formatTimestamp = (timestamp: DateInput, locale?: Locale): string =>
  describeTimestamp(timestamp, locale).text;
