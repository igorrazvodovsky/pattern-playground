import { useState, useRef, useEffect } from 'react';
import type { Product } from '@shared/data/types';
import { products } from '../templates/collection-view/data';
import { ProductCard } from '../templates/collection-view/renderers';
import 'iconify-icon';
import '../jsx-types';

/**
 * Detection rules over the collection render as a checklist that doubles as
 * index, navigation, status, and audit trail. Each flag is a (spec patch,
 * reason) pair carried on its own card, the reason visible at noticing time.
 *
 * The drill is overview-detail in its new-page layout — the value narrow space
 * calls for: the checklist is the overview, opening a problem swaps in its
 * slice (an overview one level down), and a back action returns with the actor
 * placed on the problem they opened. The reason travels in with them; every
 * flag carries a not-useful control in its corner menu, the noise budget made
 * tangible.
 */

export interface ProblemFlag {
  id: string;
  title: string;
  reason: string;
  itemIds: string[];
}

/** Reference date keeps the stale-listing rule deterministic for the demo. */
const REFERENCE_DATE = '2026-01-01';

export function detectProblems(items: Product[]): ProblemFlag[] {
  const flags: ProblemFlag[] = [];

  const missingPassport = items.filter(
    (item) => !(item.metadata as { circular?: { materialPassport?: string | null } })
      .circular?.materialPassport
  );
  if (missingPassport.length > 0) {
    flags.push({
      id: 'missing-passport',
      title: 'Missing material passport',
      reason:
        'The circularity record has no material passport, so end-of-life routing can’t be resolved.',
      itemIds: missingPassport.map((item) => item.id),
    });
  }

  const byCategory = new Map<string, Product[]>();
  for (const item of items) {
    const category = item.metadata.category;
    byCategory.set(category, [...(byCategory.get(category) ?? []), item]);
  }
  const outliers: Product[] = [];
  for (const group of byCategory.values()) {
    if (group.length < 3) continue;
    const prices = group.map((item) => item.metadata.pricing.msrp).toSorted((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    for (const item of group) {
      const ratio = item.metadata.pricing.msrp / median;
      if (ratio > 4 || ratio < 0.25) outliers.push(item);
    }
  }
  if (outliers.length > 0) {
    flags.push({
      id: 'price-outlier',
      title: 'Price is an outlier for its category',
      reason:
        'The price sits far outside the category median — worth checking the listing before it misleads comparisons.',
      itemIds: outliers.map((item) => item.id),
    });
  }

  const stale = items.filter((item) => item.metadata.listedAt < REFERENCE_DATE);
  if (stale.length > 0) {
    flags.push({
      id: 'stale-listing',
      title: 'Listed too long',
      reason: 'The listing predates the current cycle and has not been re-confirmed.',
      itemIds: stale.map((item) => item.id),
    });
  }

  return flags;
}

const SLICE_ATTRIBUTES = ['name', 'category', 'pricing.msrp', 'listedAt'];

export function ProblemChecklistDemo() {
  const [flags] = useState(() => detectProblems(products));
  const [openFlagId, setOpenFlagId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const checklistRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const returnFocusId = useRef<string | null>(null);

  const activeFlags = flags.filter((flag) => !dismissed.has(flag.id));
  const openFlag = activeFlags.find((flag) => flag.id === openFlagId) ?? null;

  // Place kept, the overview-detail guarantee: entering a slice moves focus to
  // the back action; returning drops the actor back on the problem they opened.
  useEffect(() => {
    if (openFlagId === null) {
      if (returnFocusId.current) {
        const selector = `[data-flag="${returnFocusId.current}"] .stretched-link`;
        checklistRef.current?.querySelector<HTMLElement>(selector)?.focus();
        returnFocusId.current = null;
      }
    } else {
      backRef.current?.focus();
    }
  }, [openFlagId]);

  const back = () => {
    returnFocusId.current = openFlagId;
    setOpenFlagId(null);
  };

  const dismiss = (flagId: string) => {
    setDismissed((current) => new Set(current).add(flagId));
    if (openFlagId === flagId) setOpenFlagId(null);
  };

  // L2 — the pruned slice. The reason travels in with the actor; the back
  // action is the only way out, so it carries the escape hatch's old duty.
  if (openFlag) {
    const sliceItems = products.filter((item) => openFlag.itemIds.includes(item.id));
    return (
      <div className="view-family__pane flow" aria-label={openFlag.title}>
        <button ref={backRef} type="button" className="button button--plain" onClick={back}>
          <iconify-icon className="icon" icon="ph:arrow-left" aria-hidden="true"></iconify-icon>
          Back to problems
        </button>
        <div className="callout">
          <p>
            <strong>{openFlag.title}.</strong> {openFlag.reason}
          </p>
        </div>
        <section className="cards cards--flush">
          {sliceItems.map((item) => (
            <div key={item.id}>
              <ProductCard item={item} shownAttributes={SLICE_ATTRIBUTES} />
            </div>
          ))}
        </section>
      </div>
    );
  }

  // L1 — the checklist of detected problems, the default overview.
  return (
    <div ref={checklistRef} className="view-family__pane flow" aria-label="Detected problems">
      <section className="cards cards--flush" aria-label="Detection rules">
        {activeFlags.map((flag) => (
          <div key={flag.id} data-flag={flag.id}>
            <article className="card">
              <div className="card__header">
                <h4 className="label flex">
                  <button
                    type="button"
                    className="stretched-link"
                    onClick={() => setOpenFlagId(flag.id)}
                  >
                    {flag.title}
                  </button>
                  <span className="badge">{flag.itemIds.length}</span>
                </h4>
                <button
                  type="button"
                  className="button button--plain"
                  aria-label={`Not useful — dismiss ${flag.title}`}
                  onClick={() => dismiss(flag.id)}
                >
                  <span className="visually-hidden">Not useful</span>
                  <iconify-icon className="icon" icon="ph:x" aria-hidden="true"></iconify-icon>
                </button>
              </div>
              <p className="pad">{flag.reason}</p>
            </article>
          </div>
        ))}
      </section>
      {activeFlags.length === 0 && (
        <p className="muted">Nothing flagged right now.</p>
      )}
      {dismissed.size > 0 && (
        <p className="muted">
          {dismissed.size} rule{dismissed.size > 1 ? 's' : ''} muted — feedback recorded.
        </p>
      )}
    </div>
  );
}
