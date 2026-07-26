/**
 * Figures: how a stored value becomes a read one.
 *
 * The governing rule is *specify the format, never the locale*. A formatter
 * takes two independent things — what the figure is (a date, an amount in GBP,
 * a percentage), which the system states, and how this reader writes it down,
 * which is the reader's. So every function here takes options and leaves
 * `locale` undefined unless a caller has a reader's stated preference to pass.
 * Whose locale that resolves to is `locale.ts`.
 *
 * It lives in `shared/` rather than the component library because the bindings
 * layer formats values too, and `shared` is the one layer everything else can
 * reach. There is deliberately no second import path.
 *
 * See Storybook `Foundations/Figures` for the reasoning; this module is what
 * the entry documents.
 */

export type { Locale } from './locale.js';
export type { DateInput } from './date.js';

export { documentLocale, resolveLocale } from './locale.js';

export {
  formatDate,
  formatDateTime,
  formatTime,
  isoDate,
  isoDateTime,
  toDate,
} from './date.js';

export {
  formatCompact,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatUnit,
} from './number.js';

export {
  RELATIVE_THRESHOLD_DAYS,
  describeTimestamp,
  formatRelativeTime,
  formatTimestamp,
} from './relative-time.js';
