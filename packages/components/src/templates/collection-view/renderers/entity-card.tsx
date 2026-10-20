import type React from 'react';
import type { BoundEntity, EntityBinding } from '@shared/data/bindings';
import { getValueAtPath, resolveAttributeSelection } from '@shared/data/bindings';
import { getAttributeValue, formatAttributeValue, attributeLabel } from '../AttributeUtils';
import type { AttributePath } from '../spec';
import { firstOfRole, isIdentity, type ItemCoupling } from './shared';

interface EntityCardProps<T extends BoundEntity = BoundEntity> extends ItemCoupling<T> {
  item: T;
  binding: EntityBinding;
  shownAttributes: AttributePath[];
  /** Makes attribute badges buttons — e.g. click a value to filter by it. */
  onAttributeClick?: (attribute: AttributePath, value: string, item: T) => void;
  /** Per-card controls, placed opposite the heading in the card's top corner. */
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function EntityCard<T extends BoundEntity>({
  item,
  binding,
  shownAttributes,
  selectedId,
  onItemSelect,
  focusedId,
  onItemFocus,
  onAttributeClick,
  actions,
  children,
}: EntityCardProps<T>) {
  const resolved = resolveAttributeSelection(binding, shownAttributes);
  const badges = resolved.filter((attribute) => !isIdentity(attribute));
  const selected = selectedId === item.id;

  const titleAttribute = firstOfRole(resolved, 'title');
  const titleValue = titleAttribute ? getValueAtPath(item, titleAttribute.path) : null;
  const name = titleValue != null ? String(titleValue) : null;

  const thumbnailAttribute = firstOfRole(resolved, 'thumbnail');
  const thumbnailValue = thumbnailAttribute ? getValueAtPath(item, thumbnailAttribute.path) : null;
  const icon =
    typeof thumbnailValue === 'string' && thumbnailValue !== '' ? (
      <iconify-icon className="icon" icon={thumbnailValue} aria-hidden="true"></iconify-icon>
    ) : null;

  const heading =
    name !== null || icon !== null ? (
      <h4 className="label flex">
        {icon}
        {name !== null &&
          (onItemSelect ? (
            <button
              type="button"
              className="stretched-link"
              aria-pressed={selected}
              onClick={() => onItemSelect(item)}
            >
              {name}
            </button>
          ) : (
            name
          ))}
      </h4>
    ) : null;

  const descriptionAttribute = firstOfRole(resolved, 'description');
  const descriptionValue = descriptionAttribute
    ? getValueAtPath(item, descriptionAttribute.path)
    : null;

  const hasBody = descriptionValue != null || badges.length > 0;
  const body = hasBody && (
    <>
      {descriptionValue != null && <p className="description">{String(descriptionValue)}</p>}
      {badges.length > 0 && (
        <div className="card__attributes badges">
          {badges.map((attribute) => {
            const value = formatAttributeValue(
              getAttributeValue(item, attribute.path),
              attribute.path,
              binding,
            );
            return onAttributeClick ? (
              <button
                key={attribute.path}
                type="button"
                className="badge"
                onClick={() => onAttributeClick(attribute.path, value, item)}
              >
                <span className="badge__label">{attributeLabel(attribute.path, binding)}</span>
                {value}
              </button>
            ) : (
              <span key={attribute.path} className="badge">
                <span className="badge__label">{attributeLabel(attribute.path, binding)}</span>
                {value}
              </span>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <article
      className="card"
      data-selected={selected || undefined}
      data-focused={focusedId === item.id || undefined}
      onMouseEnter={onItemFocus ? () => onItemFocus(item) : undefined}
      onMouseLeave={onItemFocus ? () => onItemFocus(null) : undefined}
    >
      {/* Spacing comes from composition: the header zone pads itself; loose body
          content sits in a padded, flowed wrapper. Actions ride in a header row
          so they sit opposite the heading; without them the heading leads the
          body wrapper. */}
      {actions ? (
        <div className="card__header">
          {heading}
          {actions}
        </div>
      ) : null}
      {(!actions || hasBody) && (
        <div className="flow pad">
          {!actions && heading}
          {body}
        </div>
      )}
      {children}
    </article>
  );
}
