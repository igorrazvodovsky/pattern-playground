import type { AttributeBinding, BoundEntity } from '@shared/data/bindings';
import { resolveAttributeSelection, isNumericValueType } from '@shared/data/bindings';
import { getAttributeValue, formatAttributeValue, attributeLabel } from '../AttributeUtils';
import { isIdentity, type RendererProps } from './shared';

export function TableRenderer<T extends BoundEntity>(props: RendererProps<T>) {
  const { items, spec, binding, selectedId, onItemSelect, focusedId, onItemFocus } = props;
  const resolved = resolveAttributeSelection(binding, spec.representation.shownAttributes);
  const identityColumns = resolved.filter((attribute) => isIdentity(attribute));
  const metadataColumns = resolved.filter((attribute) => !isIdentity(attribute));
  const columns = [...identityColumns, ...metadataColumns];
  const numericClass = (column: AttributeBinding) =>
    isNumericValueType(column.valueType) ? 'pp-table-align-right' : '';

  return (
    <pp-table>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.path} className={numericClass(column)}>
                {attributeLabel(column.path, binding)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              data-selected={selectedId === item.id || undefined}
              data-focused={focusedId === item.id || undefined}
              onMouseEnter={onItemFocus ? () => onItemFocus(item) : undefined}
              onMouseLeave={onItemFocus ? () => onItemFocus(null) : undefined}
            >
              {columns.map((column, index) => {
                const content = formatAttributeValue(
                  getAttributeValue(item, column.path),
                  column.path,
                  binding,
                );
                return (
                  <td key={column.path} className={numericClass(column)}>
                    {index === 0 && onItemSelect ? (
                      <button
                        type="button"
                        className="button button--plain"
                        aria-pressed={selectedId === item.id}
                        onClick={() => onItemSelect(item)}
                      >
                        {content}
                      </button>
                    ) : (
                      content
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </pp-table>
  );
}
