import type { Product } from '@shared/data/types';

// Detection rules over the product collection. Each rule that matches
// produces a flag: what is wrong, why it matters, and the items it applies
// to. The problem checklist (specs/problem-checklist.ts) and the
// purpose-keyed views read the same flags.

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
