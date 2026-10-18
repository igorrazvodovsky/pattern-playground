import React from 'react';
import type { BoundEntity, EntityBinding } from '@shared/data/bindings';
import type { ViewSpec } from '../spec';
import { EntityCard } from './entity-card';
import type { ItemCoupling } from './shared';

interface BoardLanesProps<T extends BoundEntity = BoundEntity> extends ItemCoupling<T> {
  groups: Map<string, T[]>;
  spec: ViewSpec;
  binding: EntityBinding;
  /** Pre-seeded lane labels so empty lanes stay visible as write destinations. */
  laneLabels?: string[];
  /** Modifier on the board block — `.board--sections` rotates lanes to sections. */
  className?: string;
  renderItem?: (item: T, lane: string) => React.ReactNode;
  /**
   * Renders the lane's `.board__column` element itself, given its contents —
   * the hook a writable board uses to make the lane a drop target without
   * re-implementing the shared markup. The contents lead with the `<summary>`,
   * so whatever this returns has to be a `<details>`.
   */
  renderLane?: (lane: string, content: React.ReactNode) => React.ReactNode;
}

export function BoardLanes<T extends BoundEntity>({
  groups,
  spec,
  binding,
  laneLabels,
  className,
  renderItem,
  renderLane,
  ...coupling
}: BoardLanesProps<T>) {
  const labels = laneLabels ?? [...groups.keys()];
  return (
    <div className={className ? `board ${className}` : 'board'}>
      {labels.map((label) => {
        const laneItems = groups.get(label) ?? [];
        const content = (
          <>
            {/* Text and a count only: `<summary>` is button-like, so any
                interactive descendant is flattened out of the accessibility
                tree — a per-lane control would have to sit beside it, not
                inside it. */}
            <summary>
              {label} <span className="badge">{laneItems.length}</span>
            </summary>
            <ul className="cards">
              {laneItems.map((item) => (
                <li key={item.id}>
                  {renderItem ? (
                    renderItem(item, label)
                  ) : (
                    <EntityCard
                      item={item}
                      binding={binding}
                      shownAttributes={spec.representation.shownAttributes}
                      {...coupling}
                    />
                  )}
                </li>
              ))}
            </ul>
          </>
        );
        return renderLane ? (
          <React.Fragment key={label}>{renderLane(label, content)}</React.Fragment>
        ) : (
          <details className="board__column" key={label} open>
            {content}
          </details>
        );
      })}
    </div>
  );
}
