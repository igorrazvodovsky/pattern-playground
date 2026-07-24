import React from 'react';
import type { AttributeBinding } from '@shared/data/bindings';
import {
  deriveAttributeLabel,
  formatBoundValue,
  getValueAtPath,
  resolveAttributeSelection,
  resolveEntityTitle,
} from '@shared/data/bindings';
import type { ItemViewProps } from './types';
import { useEntityBinding, useItemViewContext } from './provider';
import { DefaultFallbackRenderer } from './DefaultFallbackRenderer';
import 'iconify-icon';
import '../../jsx-types';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * ItemView — one generic renderer for any bound entity at any scope.
 *
 * Everything type-specific is data: the entity's binding says what each
 * attribute is (role), how its value reads (valueType), and which attributes
 * each scope shows; this component only decides where each role lands.
 * Attributes with `valueType: 'custom'` render through the registered
 * component for `entityType.path` — the behavioural residue.
 *
 * Titles at mid/maxi are host-owned: escalation hosts name the view in their
 * modal chrome, so the body renders no heading of its own. A standalone host
 * (a pane, a demo page) opts in with `heading` — the title-role attribute
 * rendered once, at the level the host's outline calls for. Mini needs none
 * of this: a summary card is self-identifying.
 */

const Thumbnail: React.FC<{ value: unknown; title?: string }> = ({ value, title }) => {
  if (typeof value !== 'string' || value === '') return null;
  if (value.startsWith('http') || value.startsWith('/')) {
    return <img className="icon" src={value} alt="" />;
  }
  return (
    <iconify-icon className="icon" icon={value} title={title} aria-hidden="true"></iconify-icon>
  );
};

const attributeLabel = (attribute: AttributeBinding): string =>
  attribute.label ?? deriveAttributeLabel(attribute.path);

/** A spec attribute resolving to a plain record renders one row per key —
    how a dynamic group like a product's `specifications` stays declarative. */
const specRows = (
  attribute: AttributeBinding,
  value: unknown
): { key: string; label: string; text: string }[] => {
  if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  ) {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue != null)
      .map(([key, entryValue]) => ({
        key: `${attribute.path}.${key}`,
        label: deriveAttributeLabel(key),
        text: formatBoundValue(entryValue, attribute),
      }));
  }
  return [
    {
      key: attribute.path,
      label: attributeLabel(attribute),
      text: formatBoundValue(value, attribute),
    },
  ];
};

export const ItemView = ({
  item,
  contentType,
  scope,
  mode = 'preview',
  shownAttributes,
  heading,
  onEscalate,
  onInteraction,
}: ItemViewProps & { heading?: HeadingLevel }) => {
  const binding = useEntityBinding(contentType);
  const { customComponents } = useItemViewContext();
  const Heading = heading ? (`h${heading}` as const) : null;

  if (!binding) {
    return (
      <>
        {Heading ? <Heading>{resolveEntityTitle(item, undefined)}</Heading> : null}
        <DefaultFallbackRenderer
          item={item}
          contentType={contentType}
          scope={scope}
          mode={mode}
          onEscalate={onEscalate}
          onInteraction={onInteraction}
        />
      </>
    );
  }

  const shown = resolveAttributeSelection(
    binding,
    shownAttributes ?? binding.scopes[scope]
  );

  const present = shown.filter(
    (attribute) =>
      attribute.valueType === 'custom' || getValueAtPath(item, attribute.path) != null
  );
  const byRole = (role: AttributeBinding['role']) =>
    present.filter(
      (attribute) => attribute.role === role && attribute.valueType !== 'custom'
    );

  const title = resolveEntityTitle(item, binding);
  const thumbnail = byRole('thumbnail')[0];
  const badges = byRole('badge');
  const keyAttributes = byRole('key-attribute');
  const subtitles = byRole('subtitle');
  const captions = byRole('caption');
  const descriptions = byRole('description');
  const tags = byRole('tag');
  const rows = [...byRole('spec'), ...byRole('link')];
  const footers = byRole('footer');
  const customs = present.filter((attribute) => attribute.valueType === 'custom');

  if (process.env.NODE_ENV !== 'production') {
    for (const attribute of present) {
      if (attribute.role === 'action' && attribute.valueType !== 'custom') {
        console.warn(
          `ItemView: action-role attribute '${attribute.path}' is behavioural and only renders through a registered custom component — give it valueType 'custom'`
        );
      }
    }
  }

  const renderCustom = (attribute: AttributeBinding) => {
    const Custom = customComponents[`${contentType}.${attribute.path}`];
    if (!Custom) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `ItemView: no custom component registered for '${contentType}.${attribute.path}'`
        );
      }
      return null;
    }
    return (
      <Custom
        key={attribute.path}
        item={item}
        entityType={contentType}
        attribute={attribute}
        scope={scope}
        onInteraction={onInteraction}
      />
    );
  };

  // Micro: the entity compressed to an inline token.
  if (scope === 'micro') {
    return (
      <span className="tag" data-content-type={contentType} data-scope={scope}>
        {thumbnail && <Thumbnail value={getValueAtPath(item, thumbnail.path)} />}
        {title}
      </span>
    );
  }

  // Mini: a self-identifying summary — its own heading, the rest as badges.
  // The heading renders only when the scope's attribute set includes the
  // title role, so a binding can give a scope over to the content alone
  // (a quote's summary is its blockquote, not its name twice).
  if (scope === 'mini') {
    const miniBadges = [...badges, ...rows];
    const hasTitle = present.some((attribute) => attribute.role === 'title');
    return (
      <div className="flow" data-content-type={contentType} data-scope={scope}>
        {hasTitle && (
          <h4 className="label flex">
            {thumbnail && <Thumbnail value={getValueAtPath(item, thumbnail.path)} />}
            {title}
          </h4>
        )}
        {keyAttributes.map((attribute) => (
          <p key={attribute.path}>
            <strong>{formatBoundValue(getValueAtPath(item, attribute.path), attribute)}</strong>
          </p>
        ))}
        {subtitles.map((attribute) => (
          <p key={attribute.path} className="muted">
            {formatBoundValue(getValueAtPath(item, attribute.path), attribute)}
          </p>
        ))}
        {descriptions.map((attribute) => (
          <p key={attribute.path} className="description">
            {formatBoundValue(getValueAtPath(item, attribute.path), attribute)}
          </p>
        ))}
        {miniBadges.length > 0 && (
          <div className="badges">
            {miniBadges.map((attribute) => (
              <span key={attribute.path} className="badge">
                {attribute.role !== 'badge' && (
                  <span className="badge__label">{attributeLabel(attribute)}</span>
                )}
                {formatBoundValue(getValueAtPath(item, attribute.path), attribute)}
              </span>
            ))}
          </div>
        )}
        {footers.map((attribute) => (
          <p key={attribute.path} className="muted">
            {attributeLabel(attribute)}{' '}
            {formatBoundValue(getValueAtPath(item, attribute.path), attribute)}
          </p>
        ))}
        {customs.map(renderCustom)}
      </div>
    );
  }

  // Mid and maxi: badge row, description, spec rows, then the custom residue.
  const allRows = rows.flatMap((attribute) =>
    specRows(attribute, getValueAtPath(item, attribute.path))
  );

  return (
    <div className="flow" data-content-type={contentType} data-scope={scope}>
      {Heading ? <Heading>{title}</Heading> : null}
      {badges.length > 0 && (
        <header>
          <div className="badges">
            {badges.map((attribute) => (
              <span key={attribute.path} className="badge">
                {formatBoundValue(getValueAtPath(item, attribute.path), attribute)}
              </span>
            ))}
          </div>
        </header>
      )}
      {keyAttributes.map((attribute) => (
        <p key={attribute.path}>
          <strong>{formatBoundValue(getValueAtPath(item, attribute.path), attribute)}</strong>
        </p>
      ))}
      {subtitles.map((attribute) => (
        <p key={attribute.path} className="muted">
          {formatBoundValue(getValueAtPath(item, attribute.path), attribute)}
        </p>
      ))}
      {descriptions.map((attribute) => (
        <p key={attribute.path} className="description">
          {formatBoundValue(getValueAtPath(item, attribute.path), attribute)}
        </p>
      ))}
      {captions.map((attribute) => (
        <p key={attribute.path} className="muted">
          {formatBoundValue(getValueAtPath(item, attribute.path), attribute)}
        </p>
      ))}
      {allRows.length > 0 && (
        <div role="table" className="attribute-list">
          {allRows.map((row) => (
            <div role="row" key={row.key}>
              <div role="cell" className="attribute-list__label muted">
                <div>{row.label}</div>
              </div>
              <div role="cell" className="attribute-list__value">
                {row.text}
              </div>
            </div>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex wrap">
          {tags.flatMap((attribute) => {
            const value = getValueAtPath(item, attribute.path);
            const values = Array.isArray(value) ? value : [value];
            return values.map((entry) => (
              <span key={`${attribute.path}-${String(entry)}`} className="tag">
                {String(entry)}
              </span>
            ));
          })}
        </div>
      )}
      {/* Provenance meta before the custom sections: "Created …" reads as the
          record's own footer, not the comment thread's. */}
      {footers.map((attribute) => (
        <p key={attribute.path} className="muted">
          {attributeLabel(attribute)}{' '}
          {formatBoundValue(getValueAtPath(item, attribute.path), attribute)}
        </p>
      ))}
      {customs.map(renderCustom)}
    </div>
  );
};
