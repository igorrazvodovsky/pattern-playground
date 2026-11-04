import React from 'react';
import type { AttributeBinding } from '@shared/data/bindings';
import { layoutByRole, resolveAttributeSelection, resolveEntityTitle } from '@shared/data/bindings';
import type { ItemViewProps } from './types';
import { useEntityBinding, useItemViewContext } from './provider';
import { DefaultFallbackRenderer } from './DefaultFallbackRenderer';
import '../../icons/register-icons';
import '../../jsx-types';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * ItemView — one generic renderer for any bound entity at any scope.
 *
 * Everything type-specific is data: the entity's binding says what each
 * attribute is (role), how its value reads (valueType), and which attributes
 * each scope shows; `layoutByRole` decides where each role lands, and this
 * component renders the slots.
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

  const layout = layoutByRole(binding, scope, item, shownAttributes);
  const { title, badges, keyAttributes, subtitles, descriptions, captions, rows, tags, footers } =
    layout;

  if (process.env.NODE_ENV !== 'production') {
    for (const attribute of resolveAttributeSelection(
      binding,
      shownAttributes ?? binding.scopes[scope],
    )) {
      if (attribute.role === 'action' && attribute.valueType !== 'custom') {
        console.warn(
          `ItemView: action-role attribute '${attribute.path}' is behavioural and only renders through a registered custom component — give it valueType 'custom'`,
        );
      }
    }
  }

  const renderCustom = (attribute: AttributeBinding) => {
    const Custom = customComponents[`${contentType}.${attribute.path}`];
    if (!Custom) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `ItemView: no custom component registered for '${contentType}.${attribute.path}'`,
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

  const thumbnail = <Thumbnail value={layout.thumbnail} />;
  const text = (entry: { key: string; text: string }, className?: string) => (
    <p key={entry.key} className={className}>
      {entry.text}
    </p>
  );

  // Micro: the entity compressed to an inline token.
  if (scope === 'micro') {
    return (
      <span className="tag" data-content-type={contentType} data-scope={scope}>
        {thumbnail}
        {title}
      </span>
    );
  }

  // Mini: a self-identifying summary — its own heading, the rest as badges.
  // The heading renders only when the scope's attribute set includes the
  // title role, so a binding can give a scope over to the content alone
  // (a quote's summary is its blockquote, not its name twice).
  if (scope === 'mini') {
    return (
      <div className="flow" data-content-type={contentType} data-scope={scope}>
        {layout.hasTitle && (
          <h4 className="label flex">
            {thumbnail}
            {title}
          </h4>
        )}
        {keyAttributes.map((entry) => (
          <p key={entry.key}>
            <strong>{entry.text}</strong>
          </p>
        ))}
        {subtitles.map((entry) => text(entry, 'muted'))}
        {descriptions.map((entry) => text(entry, 'description'))}
        {badges.length > 0 && (
          <div className="badges">
            {badges.map((badge) => (
              <span key={badge.key} className="badge">
                {badge.label && <span className="badge__label">{badge.label}</span>}
                {badge.text}
              </span>
            ))}
          </div>
        )}
        {footers.map((entry) => text(entry, 'muted'))}
        {layout.customs.map(renderCustom)}
      </div>
    );
  }

  // Mid and maxi: badge row, description, spec rows, then the custom residue.
  return (
    <div className="flow" data-content-type={contentType} data-scope={scope}>
      {Heading ? <Heading>{title}</Heading> : null}
      {badges.length > 0 && (
        <header>
          <div className="badges">
            {badges.map((badge) => (
              <span key={badge.key} className="badge">
                {badge.text}
              </span>
            ))}
          </div>
        </header>
      )}
      {keyAttributes.map((entry) => text(entry, 'text-larger'))}
      {subtitles.map((entry) => text(entry, 'muted'))}
      {/* Unclamped: a detail has room for the whole description. */}
      {descriptions.map((entry) => text(entry))}
      {captions.map((entry) => text(entry, 'muted'))}
      {rows.length > 0 && (
        <dl className="details-list">
          {rows.map((row) => (
            <React.Fragment key={row.key}>
              <dt>{row.label}</dt>
              <dd>{row.text}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      {tags.length > 0 && (
        <div className="flex wrap">
          {tags.map((tag) => (
            <span key={tag.key} className="tag">
              {tag.text}
            </span>
          ))}
        </div>
      )}
      {/* Provenance meta before the custom sections: "Created …" reads as the
          record's own footer, not the comment thread's. */}
      {footers.map((entry) => text(entry, 'muted'))}
      {layout.customs.map(renderCustom)}
    </div>
  );
};
