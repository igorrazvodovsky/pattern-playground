// Upgrades the pattern date badges (components/PatternDates.astro) from the
// absolute date shipped in the HTML to a relative one — "Added 6 months ago".
//
// Why a documentation-layer module rather than <pp-timestamp>: the element's
// bucket() stops at seven days and hands back the date, which is right for the
// timestamps a product interface renders and wrong here. What these badges
// answer is how settled a pattern is, where the figure is the point and the
// exact date is noise. Changing the element to suit the docs would bend a
// foundation to a caller outside its scope, so the docs layer does its own.
//
// Why the text is not computed at build time: a relative phrase is correct only
// to within the deploy interval and decays silently without bound — a page built
// a year ago would still claim "6 months ago" forever. So the absolute date is
// what ships (correct with no JavaScript, and it does not age), and the figure
// is produced here.
//
// Why a MutationObserver rather than explicit calls: pattern articles reach the
// DOM by three routes — the initial render and ClientRouter swaps, panes
// injected as innerHTML by StackManager, and the link-preview popover, which
// fetches the same pane partial and strips only the <h1>. Observing additions
// covers all three and gains no hook sites as more are added.

import { formatDate, formatRelativeTime, type Locale } from '@shared/format';

// The documentation layer states its own locale rather than deferring to the
// reader's: the badge label around the figure is English either way, so a
// reader's device locale would put "hace 6 meses" after "Added". en-001 is
// CLDR's international English — `17 Oct 2025`, without claiming the pages are
// British.
const LOCALE: Locale = 'en-001';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How old, in the coarsest unit that still has a whole number in it. Floored at
 * every step, so "2 years ago" means at least two — `Intl` already reads as a
 * lower bound, which is why no "over" qualifier is prepended.
 *
 * `formatRelativeTime` renders the phrase; only this ladder is local. Unlike
 * `relative-time.ts`'s own bucket() it never returns null: these badges are
 * relative at every distance.
 */
function age(days: number): { value: number; unit: Intl.RelativeTimeFormatUnit } {
  const years = Math.floor(days / 365.25);
  if (years >= 1) return { value: -years, unit: 'year' };
  const months = Math.floor(days / 30.44);
  if (months >= 1) return { value: -months, unit: 'month' };
  const weeks = Math.floor(days / 7);
  if (weeks >= 1) return { value: -weeks, unit: 'week' };
  return { value: -Math.max(0, days), unit: 'day' };
}

function upgrade(el: HTMLTimeElement): void {
  if (el.dataset.relativeDone !== undefined) return;
  const iso = el.getAttribute('datetime');
  if (!iso) return;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return;

  // The absolute has to stay reachable once the visible text stops being one.
  el.title = formatDate(iso, { dateStyle: 'long' }, LOCALE);
  const { value, unit } = age(Math.floor((Date.now() - then) / DAY_MS));
  el.textContent = formatRelativeTime(value, unit, LOCALE);
  el.dataset.relativeDone = '';
}

function upgradeWithin(root: ParentNode): void {
  for (const el of root.querySelectorAll<HTMLTimeElement>('time[data-relative]')) upgrade(el);
}

if (typeof document !== 'undefined') {
  upgradeWithin(document);
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node instanceof HTMLTimeElement && node.matches('time[data-relative]')) upgrade(node);
        else upgradeWithin(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}
