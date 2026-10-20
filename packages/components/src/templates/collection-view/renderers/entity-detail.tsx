import React from 'react';
import type { BoundEntity, EntityBinding } from '@shared/data/bindings';
import { getValueAtPath, resolveAttributeSelection } from '@shared/data/bindings';
import { getAttributeValue, formatAttributeValue, attributeLabel } from '../AttributeUtils';
import type { AttributePath } from '../spec';
import { firstOfRole, isIdentity } from './shared';

interface EntityDetailProps {
  item: BoundEntity;
  binding: EntityBinding;
  shownAttributes: AttributePath[];
  children?: React.ReactNode;
}

/**
 * The detail counterpart of `EntityCard`, reading the same `shownAttributes`
 * contract: identity attributes take their dedicated slots (title a heading,
 * description a paragraph), everything else becomes a description-list row.
 *
 * The card compresses a chosen subset and this expands one; because both are
 * driven by an attribute list rather than a fixed layout, a pair of views can
 * be composed by set arithmetic — which is what makes a detail that omits what
 * its overview already carries a filter rather than a special case.
 */
export function EntityDetail({ item, binding, shownAttributes, children }: EntityDetailProps) {
  const resolved = resolveAttributeSelection(binding, shownAttributes);
  const rows = resolved.filter((attribute) => !isIdentity(attribute));

  const titleAttribute = firstOfRole(resolved, 'title');
  const titleValue = titleAttribute ? getValueAtPath(item, titleAttribute.path) : null;
  // The heading's icon comes from the binding's thumbnail attribute whether
  // or not the selection names it — a detail identifies its item.
  const thumbnailAttribute = firstOfRole(binding.attributes, 'thumbnail');
  const thumbnailValue = thumbnailAttribute
    ? getValueAtPath(item, thumbnailAttribute.path)
    : null;

  const descriptionAttribute = firstOfRole(resolved, 'description');
  const descriptionValue = descriptionAttribute
    ? getValueAtPath(item, descriptionAttribute.path)
    : null;

  return (
    <>
      {titleValue != null && (
        <h4 className="label flex">
          {typeof thumbnailValue === 'string' && thumbnailValue !== '' && (
            <iconify-icon
              className="icon"
              icon={thumbnailValue}
              aria-hidden="true"
            ></iconify-icon>
          )}
          {String(titleValue)}
        </h4>
      )}
      {descriptionValue != null && (
        <p className="description">{String(descriptionValue)}</p>
      )}
      {rows.length > 0 && (
        <dl className="description-list">
          {rows.map((attribute) => (
            <React.Fragment key={attribute.path}>
              <dt>{attributeLabel(attribute.path, binding)}</dt>
              <dd>
                {formatAttributeValue(
                  getAttributeValue(item, attribute.path),
                  attribute.path,
                  binding
                )}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      {children}
    </>
  );
}
