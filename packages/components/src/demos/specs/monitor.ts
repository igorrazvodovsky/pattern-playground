import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import snapshot from '@shared/data/catalogue-snapshot.json' with { type: 'json' };
import type { SpecSetup } from '../../catalog/SpecDemo';
import { detectProblems } from '../problem-detection';
import spec from './monitor.json' with { type: 'json' };

// A spec cannot fold over the collection, so the figures are worked out here.
// Whether a trend is good is decided per figure, not by its direction: the
// same upward arrow is good on one tile and bad on another.

interface Figure {
  label: string;
  current: number;
  previous: number;
  upIsGood: boolean;
  unit?: string;
  verdict: string;
  detail: string;
  alert?: boolean;
}

const tile = ({ label, current, previous, upIsGood, unit, verdict, detail, alert }: Figure) => {
  const delta = current - previous;
  return {
    label,
    value: String(current),
    unit: unit ?? null,
    verdict,
    detail,
    alert: alert ?? false,
    trend: `${delta > 0 ? '+' : delta < 0 ? '−' : '±'}${Math.abs(delta)}`,
    trendIcon: delta > 0 ? 'increase' : delta < 0 ? 'decrease' : 'unchanged',
    trendTone: delta === 0 ? 'neutral' : delta > 0 === upIsGood ? 'success' : 'danger',
  };
};

const byCycle = (delta: number, up: string, down: string, same: string) =>
  delta > 0 ? up : delta < 0 ? down : same;

const flags = detectProblems(products);
const inProduction = products.filter(
  (item) => item.metadata.availability.status === 'In Production',
).length;
const flaggedItems = new Set(flags.flatMap((flag) => flag.itemIds)).size;
const categories = new Set(products.map((item) => item.metadata.category)).size;
const averageCarbon = Math.round(
  products.reduce((sum, item) => sum + item.metadata.sustainability.carbonFootprint, 0) /
    products.length,
);
const { metrics } = snapshot;

const tiles = [
  tile({
    label: 'Total listings',
    current: products.length,
    previous: metrics.listings,
    upIsGood: true,
    verdict: byCycle(
      products.length - metrics.listings,
      `Up from ${metrics.listings} last cycle`,
      `Down from ${metrics.listings} last cycle`,
      'Unchanged from last cycle',
    ),
    detail: `Across ${categories} categories`,
  }),
  tile({
    label: 'In production',
    current: inProduction,
    previous: metrics.inProduction,
    upIsGood: true,
    verdict: `${inProduction} of ${products.length} active`,
    detail: `${products.length - inProduction} in pilot, development, or retired`,
  }),
  tile({
    label: 'Avg. carbon footprint',
    current: averageCarbon,
    previous: metrics.avgCarbonFootprint,
    upIsGood: false,
    unit: 'kg CO₂e',
    verdict: byCycle(
      averageCarbon - metrics.avgCarbonFootprint,
      `${averageCarbon - metrics.avgCarbonFootprint} kg higher than last cycle`,
      `${metrics.avgCarbonFootprint - averageCarbon} kg lower than last cycle`,
      'Level with last cycle',
    ),
    detail: 'Mean across all listings',
  }),
  tile({
    label: 'Listings flagged',
    current: flaggedItems,
    previous: metrics.flagged,
    upIsGood: false,
    alert: flaggedItems > 0,
    verdict: byCycle(
      flaggedItems - metrics.flagged,
      `${flaggedItems - metrics.flagged} more than last cycle`,
      `${metrics.flagged - flaggedItems} fewer than last cycle`,
      'Unchanged from last cycle',
    ),
    detail: `${flags.length} detection rule${flags.length === 1 ? '' : 's'} firing`,
  }),
];

export default {
  spec: spec as Spec,
  setup: { initialState: { tiles } } satisfies SpecSetup,
};
