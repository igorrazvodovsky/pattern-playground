import { useMemo, useState } from 'react';
import snapshot from '@shared/data/catalogue-snapshot.json' with { type: 'json' };
import { ItemView } from '../components/item-view/ItemView';
import { ContentAdapterProvider } from '../components/item-view/ContentAdapterRegistry';
import { productAdapter, productToItemObject } from '../components/item-view/adapters';
import { products } from '../templates/collection-view/data';
import { ProductCard } from '../templates/collection-view/renderers';
import { detectProblems } from './problem-curated-view';
import 'iconify-icon';
import '../jsx-types';

/**
 * The three purposes as three demos, one per variant, each read from the
 * same `products` collection: the exploratory view is borrowed whole from
 * data-view; monitor compresses the collection into glanceable aggregates;
 * investigate is a drilldown path that bottoms out in the item's full view.
 * The data never changes across them — the keying does.
 */

/**
 * A monitoring tile: a headline figure with the design-time decision of which
 * signal answers "is anything wrong?" already made. Its four parts are the
 * anatomy of the genre — a label, the number, a trend against the last cycle,
 * and a one-line reading of what the number means.
 *
 * The trend is a real difference, not a decoration. The current figure is
 * derived from `products`; the baseline is the recorded prior-cycle snapshot
 * (`catalogue-snapshot.json`). `upIsGood` is per-metric: more listings reads
 * as growth, a lower carbon footprint or fewer flags as improvement, so the
 * same upward arrow is coloured good on one tile and bad on another.
 */
interface StatTile {
  label: string;
  value: string;
  unit?: string;
  current: number;
  previous: number;
  upIsGood: boolean;
  verdict: string;
  detail: string;
  alert?: boolean;
}

function MonitorTile({ tile }: { tile: StatTile }) {
  const delta = tile.current - tile.previous;
  const trend = delta === 0 ? '' : delta > 0 === tile.upIsGood ? ' badge--success' : ' badge--danger';
  const icon =
    delta > 0 ? 'ph:arrow-up-right' : delta < 0 ? 'ph:arrow-down-right' : 'ph:minus';
  const deltaText = `${delta > 0 ? '+' : delta < 0 ? '−' : '±'}${Math.abs(delta)}`;

  return (
    <li>
      <article className="card" data-alert={tile.alert || undefined}>
        <div className="card__header">
          <h4 className="label">{tile.label}</h4>
          <span className={`badge badge--pill${trend}`}>
            <iconify-icon className="icon" icon={icon} aria-hidden="true"></iconify-icon>
            {deltaText}
          </span>
        </div>
        <div className="stat pad">
          <strong className="stat__value">
            {tile.value}
            {tile.unit && <span className="stat__unit"> {tile.unit}</span>}
          </strong>
          <p className="stat__verdict">{tile.verdict}</p>
          <p className="muted">{tile.detail}</p>
        </div>
      </article>
    </li>
  );
}

/**
 * Monitoring: the collection compressed to the few signals that answer
 * "is anything wrong?" in passing. Aggregates only — no items on screen.
 */
export function MonitorDemo() {
  const tiles = useMemo<StatTile[]>(() => {
    const flags = detectProblems(products);
    const inProduction = products.filter(
      (item) => item.metadata.availability.status === 'In Production'
    ).length;
    const offProduction = products.length - inProduction;
    const flaggedItems = new Set(flags.flatMap((flag) => flag.itemIds)).size;
    const categories = new Set(products.map((item) => item.metadata.category)).size;
    const averageCarbon = Math.round(
      products.reduce((sum, item) => sum + item.metadata.sustainability.carbonFootprint, 0) /
        products.length
    );
    const { metrics } = snapshot;

    const cycleVerdict = (delta: number, up: string, down: string, same: string) =>
      delta > 0 ? up : delta < 0 ? down : same;

    return [
      {
        label: 'Total listings',
        value: String(products.length),
        current: products.length,
        previous: metrics.listings,
        upIsGood: true,
        verdict: cycleVerdict(
          products.length - metrics.listings,
          `Up from ${metrics.listings} last cycle`,
          `Down from ${metrics.listings} last cycle`,
          'Unchanged from last cycle'
        ),
        detail: `Across ${categories} categories`,
      },
      {
        label: 'In production',
        value: String(inProduction),
        current: inProduction,
        previous: metrics.inProduction,
        upIsGood: true,
        verdict: `${inProduction} of ${products.length} active`,
        detail: `${offProduction} in pilot, development, or retired`,
      },
      {
        label: 'Avg. carbon footprint',
        value: String(averageCarbon),
        unit: 'kg CO₂e',
        current: averageCarbon,
        previous: metrics.avgCarbonFootprint,
        upIsGood: false,
        verdict: cycleVerdict(
          averageCarbon - metrics.avgCarbonFootprint,
          `${averageCarbon - metrics.avgCarbonFootprint} kg higher than last cycle`,
          `${metrics.avgCarbonFootprint - averageCarbon} kg lower than last cycle`,
          'Level with last cycle'
        ),
        detail: 'Mean across all listings',
      },
      {
        label: 'Listings flagged',
        value: String(flaggedItems),
        current: flaggedItems,
        previous: metrics.flagged,
        upIsGood: false,
        alert: flaggedItems > 0,
        verdict: cycleVerdict(
          flaggedItems - metrics.flagged,
          `${flaggedItems - metrics.flagged} more than last cycle`,
          `${metrics.flagged - flaggedItems} fewer than last cycle`,
          'Unchanged from last cycle'
        ),
        detail: `${flags.length} detection rule${flags.length === 1 ? '' : 's'} firing`,
      },
    ];
  }, []);

  return (
    <ul className="cards layout-grid">
      {tiles.map((tile) => (
        <MonitorTile key={tile.label} tile={tile} />
      ))}
    </ul>
  );
}

/**
 * Drilldown investigation: a path built at use time as the concern narrows
 * — categories → items in a category → the item's full view. Keyed by the
 * chase, not in advance, so only the path can be designed, not the view.
 *
 * Structurally this is overview-detail's new-page layout, chained: two
 * overview rungs (a category grid, then a list of items) ending in a detail
 * (the full item view), place kept on the way back out. It reuses that
 * pattern's vocabulary — `ProductCard` overviews, an `ItemView` detail — so
 * the two pages read as the same machinery at different depths. The first
 * rung is a card grid rather than a list: a category picker is glanceable,
 * and the change of representation between the two overviews marks them as
 * different rungs of the same descent.
 */
function InvestigateDrilldown() {
  const [category, setCategory] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const item of products) {
      const key = item.metadata.category;
      byCategory.set(key, (byCategory.get(key) ?? 0) + 1);
    }
    return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, []);

  const item = products.find((candidate) => candidate.id === itemId);

  if (item) {
    return (
      <div className="flow">
        <button
          type="button"
          className="button button--plain"
          onClick={() => setItemId(null)}
        >
          ← Back to {category}
        </button>
        <ItemView
          item={productToItemObject(item)}
          contentType="product"
          scope="maxi"
          mode="preview"
        />
      </div>
    );
  }

  if (category) {
    const categoryItems = products.filter((candidate) => candidate.metadata.category === category);
    return (
      <div className="flow">
        <button
          type="button"
          className="button button--plain"
          onClick={() => setCategory(null)}
        >
          ← All categories
        </button>
        <section className="cards cards--list">
          {categoryItems.map((candidate) => (
            <div key={candidate.id}>
              <ProductCard
                item={candidate}
                shownAttributes={['name', 'condition', 'pricing.msrp']}
                onItemSelect={(target) => setItemId(target.id)}
              />
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <ul className="cards layout-grid">
      {categories.map(([name, count]) => (
        <li key={name}>
          <article className="card flow pad">
            <h4 className="label">
              <button type="button" className="stretched-link" onClick={() => setCategory(name)}>
                {name}
              </button>
            </h4>
            <div className="card__attributes badges">
              <span className="badge">{count} listings</span>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function InvestigateDemo() {
  return (
    <ContentAdapterProvider adapters={[productAdapter]}>
      <InvestigateDrilldown />
    </ContentAdapterProvider>
  );
}

/**
 * The watch-to-chase tiers as one flow: ambient badge → at-a-glance tile
 * wall → focused slice → the item's full view. Movement inward is
 * deliberate — nothing auto-expands — and the framing is preserved on the
 * way back out. The outer tier's omissions are the curation decision: it
 * shows a count and nothing else. This is also the family tour: monitoring
 * hands to a flag, the flag prunes an overview, the overview bottoms out in
 * the full item view.
 */

type Tier = 'ambient' | 'glance' | 'focused' | 'item';

export function WatchToChaseTiersDemo() {
  const flags = useMemo(() => detectProblems(products), []);
  const [tier, setTier] = useState<Tier>('ambient');
  const [flagId, setFlagId] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);

  const flag = flags.find((candidate) => candidate.id === flagId) ?? null;
  const item = products.find((candidate) => candidate.id === itemId) ?? null;
  const flaggedCount = new Set(flags.flatMap((candidate) => candidate.itemIds)).size;

  return (
    <ContentAdapterProvider adapters={[productAdapter]}>
      <div className="flow">
        {tier === 'ambient' && (
          <div className="flow">
            <button type="button" className="badge" onClick={() => setTier('glance')}>
              Catalogue · {flaggedCount} flagged
            </button>
            <p className="muted">
              The ambient tier deliberately shows one number. Everything else is
              an inward step away.
            </p>
          </div>
        )}

        {tier === 'glance' && (
          <div className="flow">
            <button
              type="button"
              className="button button--plain"
              onClick={() => setTier('ambient')}
            >
              ← Back to the badge
            </button>
            <ul className="cards layout-grid">
              <li>
                <article className="card">
                  <div className="card__header">
                    <h4 className="label">Listings</h4>
                  </div>
                  <div className="stat pad">
                    <strong className="stat__value">{products.length}</strong>
                    <p className="muted">In the catalogue</p>
                  </div>
                </article>
              </li>
              {flags.map((candidate) => (
                <li key={candidate.id}>
                  <article className="card" data-alert>
                    <div className="card__header">
                      <h4 className="label">
                        <button
                          type="button"
                          className="stretched-link"
                          onClick={() => {
                            setFlagId(candidate.id);
                            setTier('focused');
                          }}
                        >
                          {candidate.title}
                        </button>
                      </h4>
                    </div>
                    <div className="stat pad">
                      <strong className="stat__value">{candidate.itemIds.length}</strong>
                      <p className="muted">
                        flagged listing{candidate.itemIds.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tier === 'focused' && flag && (
          <div className="flow">
            <button
              type="button"
              className="button button--plain"
              onClick={() => setTier('glance')}
            >
              ← Back to the tiles
            </button>
            <div className="callout info">
              <p>
                <strong>{flag.title}.</strong> {flag.reason}
              </p>
            </div>
            <section className="cards cards--list">
              {products
                .filter((candidate) => flag.itemIds.includes(candidate.id))
                .map((candidate) => (
                  <div key={candidate.id}>
                    <ProductCard
                      item={candidate}
                      shownAttributes={['name', 'category', 'pricing.msrp', 'listedAt']}
                      selectedId={itemId}
                      onItemSelect={(target) => {
                        setItemId(target.id);
                        setTier('item');
                      }}
                    />
                  </div>
                ))}
            </section>
          </div>
        )}

        {tier === 'item' && item && (
          <div className="flow">
            <button
              type="button"
              className="button button--plain"
              onClick={() => setTier('focused')}
            >
              ← Back to the slice
            </button>
            <ItemView
              item={productToItemObject(item)}
              contentType="product"
              scope="maxi"
              mode="preview"
            />
          </div>
        )}
      </div>
    </ContentAdapterProvider>
  );
}
