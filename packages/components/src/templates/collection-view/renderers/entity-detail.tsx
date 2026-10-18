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

/** The full readout a detail carries when it has a view to itself — the
    binding's `mid` rung plus the title, as an attribute set. */
function detailAttributes(binding: EntityBinding): AttributePath[] {
  const titlePaths = binding.attributes
    .filter((attribute) => attribute.role === 'title')
    .map((attribute) => attribute.path);
  return [...titlePaths, ...binding.scopes.mid].filter(
    (path, index, all) => all.indexOf(path) === index
  );
}

interface InPlaceDetailProps {
  item: BoundEntity;
  binding: EntityBinding;
  /** What the host row is already showing — subtracted from the readout. */
  overviewAttributes: AttributePath[];
  /** Anything the detail carries besides the readout, e.g. a corner toolbar. */
  children?: React.ReactNode;
}

/**
 * The detail opened inside the row it was picked from. In place, the detail
 * is the only thing standing between the row and itself: it opens directly
 * beneath attributes the row is still showing, so its readout is the full set
 * minus whatever the overview already carries. The subtraction is a set
 * operation rather than a rule about titles because the overview's attribute
 * set is not fixed — surface another attribute into the rows and the detail
 * gives that one up too, without anybody editing a list of exceptions. The
 * other layouts separate the two views spatially, the repetition reads as
 * orientation rather than noise, and they keep the full readout.
 *
 * Spacing is the detail's own (`.card > .detail` in view-family.css: full
 * width, its own inset, a top border).
 */
export function InPlaceDetail({ item, binding, overviewAttributes, children }: InPlaceDetailProps) {
  const overviewPaths = new Set(
    resolveAttributeSelection(binding, overviewAttributes).map(
      (attribute) => attribute.path
    )
  );
  const shownAttributes = detailAttributes(binding).filter(
    (path) => !overviewPaths.has(path)
  );
  return (
    <article className="detail flow" aria-label="Detail">
      {children}
      <EntityDetail item={item} binding={binding} shownAttributes={shownAttributes} />
    </article>
  );
}
