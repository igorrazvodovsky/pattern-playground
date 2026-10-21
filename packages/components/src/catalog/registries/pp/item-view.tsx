import type { ComponentContext } from '@json-render/react';
import type { Catalog } from '../../catalog';
import { specItemLayout, specItemSelection } from '../../behaviour/item-view';
import { ItemView as BoundItemView } from '../../../components/item-view/ItemView';
import { useItemViewContext } from '../../../components/item-view/provider';

// ItemView renders a custom attribute through its registered component and
// leaves out one it has none for; the spec says so instead, as shadcn's does.
export function ItemView({ props }: ComponentContext<Catalog, 'ItemView'>) {
  const { customComponents } = useItemViewContext();
  const layout = specItemLayout(props.type, props.item, props.scope, props.shownAttributes);
  if (!layout) return null;
  const missing = layout.customs.filter(
    (attribute) => !customComponents[`${props.type}.${attribute.path}`],
  );
  return (
    <>
      <BoundItemView
        item={props.item}
        contentType={props.type}
        scope={props.scope}
        shownAttributes={specItemSelection(props.type, props.scope, props.shownAttributes)}
      />
      {missing.map((attribute) => (
        <p key={attribute.path} className="spec-demo__unsupported" role="note">
          This library has no component for {attribute.label ?? attribute.path}.
        </p>
      ))}
    </>
  );
}
