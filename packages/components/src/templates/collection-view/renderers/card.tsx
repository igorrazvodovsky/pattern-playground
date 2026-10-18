import type { BoundEntity } from '@shared/data/bindings';
import { EntityCard } from './entity-card';
import type { RendererProps } from './shared';

/** Cards in the arrangement's geometry: a grid by default, a single column
    when `arrangement.layout` is 'list'. One block, two population shapes. */
export function CardRenderer<T extends BoundEntity>(props: RendererProps<T>) {
  const { items, spec, binding } = props;
  const card = (item: T) => (
    <EntityCard
      item={item}
      binding={binding}
      shownAttributes={spec.representation.shownAttributes}
      selectedId={props.selectedId}
      onItemSelect={props.onItemSelect}
      focusedId={props.focusedId}
      onItemFocus={props.onItemFocus}
    />
  );

  if (spec.arrangement.layout === 'list') {
    return (
      <section className="cards cards--list">
        {items.map((item) => (
          <div key={item.id}>{card(item)}</div>
        ))}
      </section>
    );
  }
  return (
    <ul className="cards layout-grid">
      {items.map((item) => (
        <li key={item.id}>{card(item)}</li>
      ))}
    </ul>
  );
}
