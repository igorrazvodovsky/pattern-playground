import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '@shared/data/types';
import { loadElementAdapter } from '../../utility/dnd';
import { products as canonicalProducts } from '../../templates/collection-view/data';
import { makeSpec } from '../../templates/collection-view/spec';
import {
  getAttributeValue,
  formatAttributeValue,
} from '../../templates/collection-view/AttributeUtils';
import { BoardLanes, CardRenderer, EntityCard } from '../../templates/collection-view/renderers';
import { productBinding } from '@shared/data/bindings';
import { GroupingControls } from './GroupingControls';
import { attributeLabel } from '../../templates/collection-view/AttributeUtils';
import { showToast } from '../demo-runtime';

/**
 * The Board preset taken apart: cards + groupBy + groups on the inline axis.
 * Dragging a card between groups writes the grouping attribute through the
 * projection — the write travels with the groupBy, not the board, so it
 * survives both the rotation onto the block axis and the choice of which
 * attribute groups. Grouping by a computed attribute (price band) makes the
 * same gesture illegal, and the refusal is surfaced rather than swallowed.
 * Every drag also has a non-pointer path: the card's corner menu names every
 * destination and performs the same write.
 */

/** The synthetic path for the computed lane; see ATTRIBUTE_LABELS in AttributeUtils. */
const PRICE_BAND = 'pricing.band';

const PRICE_LANES = ['Under $100', '$100–1,000', 'Over $1,000'];

interface GroupingOption {
  /** Pre-seeded so an empty group stays visible as a write destination. */
  groups: string[];
  /** Defaults to the shared display rule — the value as the card shows it. */
  groupOf?: (item: Product) => string;
  /** Absent means the grouping is computed and so can only refuse a write. */
  write?: (item: Product, group: string) => Product;
}

const GROUPINGS: Record<string, GroupingOption> = {
  'availability.status': {
    groups: ['In Development', 'Pilot', 'In Production', 'Discontinued'],
    write: (item, status) => ({
      ...item,
      metadata: {
        ...item.metadata,
        availability: { ...item.metadata.availability, status },
      },
    }),
  },
  condition: {
    groups: ['New', 'Refurbished', 'Remanufactured'],
    write: (item, condition) => ({
      ...item,
      metadata: { ...item.metadata, condition },
    }),
  },
  [PRICE_BAND]: {
    groups: PRICE_LANES,
    groupOf: (item) => {
      const price = item.metadata.pricing.msrp;
      if (price < 100) return PRICE_LANES[0];
      if (price <= 1000) return PRICE_LANES[1];
      return PRICE_LANES[2];
    },
  },
};

const GROUPING_PATHS = Object.keys(GROUPINGS);

type Orientation = 'lanes' | 'sections';

const ORIENTATIONS: Record<Orientation, { label: string; icon: string; className: string }> = {
  lanes: { label: 'Columns', icon: 'ph:columns', className: 'board--lanes' },
  sections: { label: 'Rows', icon: 'ph:rows', className: 'board--sections' },
};

/**
 * How long a card has to hover a collapsed group before it springs open —
 * Atlassian's figure for the same gesture in their tree components, and the
 * one the Finder's spring-loaded folders trained everyone on.
 */
const SPRING_OPEN_MS = 500;

interface DraggableCardProps {
  item: Product;
  shownAttributes: string[];
  groups: string[];
  currentGroup: string;
  onMove: (item: Product, group: string) => void;
}

function DraggableCard({
  item,
  shownAttributes,
  groups,
  currentGroup,
  onMove,
}: DraggableCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    loadElementAdapter().then(({ draggable }) => {
      if (cancelled) return;
      cleanup = draggable({
        element,
        getInitialData: () => ({ productId: item.id }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      });
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [item.id]);

  return (
    <div ref={ref} data-dragging={dragging || undefined}>
      <EntityCard
        item={item}
        binding={productBinding}
        shownAttributes={shownAttributes}
        actions={
          <pp-dropdown>
            <button className="button button--plain" is="pp-button" slot="trigger">
              <iconify-icon className="icon" icon="ph:dots-three" aria-hidden="true"></iconify-icon>
              <span className="visually-hidden">Move {item.name} to…</span>
            </button>
            <pp-list>
              <pp-list-label>Move to</pp-list-label>
              {groups
                .filter((group) => group !== currentGroup)
                .map((group) => (
                  <pp-list-item key={group} onClick={() => onMove(item, group)}>
                    {group}
                  </pp-list-item>
                ))}
            </pp-list>
          </pp-dropdown>
        }
      />
    </div>
  );
}

interface DropGroupProps {
  label: string;
  writable: boolean;
  onDrop: (productId: string, group: string) => void;
  children: React.ReactNode;
}

/**
 * The lane as a drop destination. It is the same `.board__column` disclosure
 * BoardLanes renders by default, so the rotation onto the block axis carries
 * the drop target with it.
 *
 * The target is registered on the `<details>` rather than on the card list
 * inside it, and that is the whole design: a closed disclosure's contents are
 * skipped — not painted, not hit-tested, not in the accessibility tree — so a
 * drop target sitting inside one would silently stop existing the moment the
 * group collapsed. On the `<details>` box it survives, because a closed lane
 * still has its summary row on screen to catch the drop.
 *
 * Two things follow. Dwelling over a closed lane springs it open, so the drop
 * can be aimed rather than guessed at; and a drop that lands before the spring
 * opens it anyway, so the moved card is visible where it went.
 */
function DropGroup({ label, writable, onDrop, children }: DropGroupProps) {
  const ref = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(true);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let spring: ReturnType<typeof setTimeout> | undefined;
    const cancelSpring = () => clearTimeout(spring);
    loadElementAdapter().then(({ dropTargetForElements }) => {
      if (cancelled) return;
      cleanup = dropTargetForElements({
        element,
        getData: () => ({ group: label }),
        onDragEnter: () => {
          setOver(true);
          spring = setTimeout(() => setOpen(true), SPRING_OPEN_MS);
        },
        onDragLeave: () => {
          setOver(false);
          cancelSpring();
        },
        onDrop: ({ source }) => {
          setOver(false);
          cancelSpring();
          // Left open rather than restored to collapsed: the card has to be
          // visible where it landed, or the write reads as a disappearance.
          setOpen(true);
          const productId = source.data.productId;
          if (typeof productId === 'string') onDrop(productId, label);
        },
      });
    });
    return () => {
      cancelled = true;
      cancelSpring();
      cleanup?.();
    };
  }, [label, onDrop]);

  return (
    <details
      className="board__column"
      ref={ref}
      open={open}
      // Find-in-page and fragment navigation open a disclosure without asking,
      // so the state is read back off the element rather than assumed.
      onToggle={(event) => setOpen(event.currentTarget.open)}
      data-drop-over={over || undefined}
      data-writable={writable || undefined}
    >
      {children}
    </details>
  );
}

export function WritableBoardDemo() {
  const [items, setItems] = useState<Product[]>(canonicalProducts);
  const [groupBy, setGroupBy] = useState<string | null>('availability.status');
  // Sections to open with: a demo host is capped at the prose measure, where
  // four 18rem lanes never fitted. Lanes are a click away, and the point of
  // the demo is that the write survives the trip either way.
  const [orientation, setOrientation] = useState<Orientation>('sections');

  const option = groupBy ? GROUPINGS[groupBy] : undefined;
  const writable = Boolean(option?.write);

  /** The grouping attribute rides on the card, so a write shows on the item. */
  const spec = useMemo(
    () =>
      makeSpec({
        id: 'writable-board',
        representation: {
          shownAttributes: [
            'name',
            ...(groupBy && groupBy !== PRICE_BAND ? [groupBy] : []),
            'pricing.msrp',
          ],
        },
        // Lanes throughout: the axis is a layout decision over one arrangement,
        // which is why rotating it leaves the spec — and the writes — alone.
        arrangement: groupBy ? { groupBy, groupLayout: 'lanes' } : {},
      }),
    [groupBy]
  );

  const groups = useMemo(() => {
    if (!option || !groupBy) return new Map<string, Product[]>();
    const groupOf =
      option.groupOf ??
      ((item: Product) => formatAttributeValue(getAttributeValue(item, groupBy), groupBy));
    const seeded = new Map<string, Product[]>(option.groups.map((group) => [group, []]));
    for (const item of items) {
      const label = groupOf(item);
      const bucket = seeded.get(label);
      if (bucket) bucket.push(item);
      else seeded.set(label, [item]);
    }
    return seeded;
  }, [items, option, groupBy]);

  /**
   * Both outcomes report through the same channel: a write and its refusal
   * are the same gesture answered differently, so the refusal has to be as
   * visible as the success rather than a silent no-op.
   */
  const move = (product: Product, group: string) => {
    if (!option?.write) {
      void showToast(
        `Not moved: “${group}” is computed from the price. The group can't be written — edit the price and the card follows.`
      );
      return;
    }
    const write = option.write;
    const before = items;
    setItems((current) =>
      current.map((candidate) =>
        candidate.id === product.id ? write(candidate, group) : candidate
      )
    );
    // Clicking the toast reverts the write — the corpus's undo affordance
    // (see the transient-feedback demos), and the reason a write through a
    // projection can be offered casually in the first place.
    void showToast(
      `Moved “${product.name}” — its ${attributeLabel(groupBy!).toLowerCase()} is now ${group}. Undo`,
      () => setItems(before)
    );
  };

  const handleDrop = (productId: string, group: string) => {
    const product = items.find((candidate) => candidate.id === productId);
    if (product) move(product, group);
  };

  const groupLabels = option?.groups ?? [];

  return (
    <div className="flow">
      <div className="toolbar">
        <GroupingControls
          availableAttributes={GROUPING_PATHS}
          currentGrouping={groupBy}
          onGroupingChange={setGroupBy}
        />
        <pp-dropdown>
          <button className="button" is="pp-button" slot="trigger" disabled={!groupBy}>
            <iconify-icon
              className="icon"
              icon={ORIENTATIONS[orientation].icon}
              aria-hidden="true"
            ></iconify-icon>
            {ORIENTATIONS[orientation].label}
          </button>
          <pp-list>
            {(Object.keys(ORIENTATIONS) as Orientation[]).map((value) => (
              <pp-list-item key={value} onClick={() => setOrientation(value)}>
                <iconify-icon
                  slot="prefix"
                  className="icon"
                  icon={ORIENTATIONS[value].icon}
                ></iconify-icon>
                {ORIENTATIONS[value].label}
              </pp-list-item>
            ))}
          </pp-list>
        </pp-dropdown>
      </div>

      {groupBy ? (
        <BoardLanes
          groups={groups}
          spec={spec}
          binding={productBinding}
          laneLabels={groupLabels}
          className={ORIENTATIONS[orientation].className}
          renderLane={(label, content) => (
            <DropGroup label={label} writable={writable} onDrop={handleDrop}>
              {content}
            </DropGroup>
          )}
          renderItem={(item, group) => (
            <DraggableCard
              item={item}
              shownAttributes={spec.representation.shownAttributes}
              groups={groupLabels}
              currentGroup={group}
              onMove={move}
            />
          )}
        />
      ) : (
        <CardRenderer items={items} spec={spec} binding={productBinding} />
      )}
    </div>
  );
}
