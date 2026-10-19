import { useMemo, useState } from 'react';
import { ItemView } from '../components/item-view/ItemView';
import { products } from '../templates/collection-view/data';
import { EntityCard } from '../templates/collection-view/renderers';
import { productBinding } from '@shared/data/bindings';
import { detectProblems } from './problem-detection';
import { BackButton } from './scaffold';
import 'iconify-icon';
import '../jsx-types';

/**
 * The three purposes as three demos, one per variant, each read from the
 * same `products` collection: the exploratory view is borrowed whole from
 * data-view; monitor (specs/monitor) compresses the collection into
 * glanceable aggregates; investigate (specs/investigate) is a drilldown path
 * that bottoms out in the item's full view. The data never changes across
 * them — the keying does.
 */

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
          <BackButton onClick={() => setTier('ambient')}>Back to the badge</BackButton>
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
                <article className="card">
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
                  <div className="stat pad" data-alert>
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
          <BackButton onClick={() => setTier('glance')}>Back to the tiles</BackButton>
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
                  <EntityCard
                    item={candidate}
                    binding={productBinding}
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
          <BackButton onClick={() => setTier('focused')}>Back to the slice</BackButton>
          <ItemView
            item={item}
            contentType="product"
            scope="maxi"
            mode="preview"
            heading={2}
          />
        </div>
      )}
    </div>
  );
}
