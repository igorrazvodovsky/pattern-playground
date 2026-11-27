import type { Components } from '@json-render/react';
import type { Catalog } from '../../catalog';
import { Fragment, Suspense, useEffect, useEffectEvent, useMemo, useRef } from 'react';
import { useBoundProp } from '@json-render/react';
import clsx from 'clsx';
import { bindings } from '@shared/data/bindings';
import type { MapComponent, MapFocusDetail, MapSelectDetail } from '../../../components/map/map';
import { FilterTag } from '../../../components/filter/filter-tag';
import { useFocusHandoff, useGroupFocusHandoff } from '../../behaviour/focus-handoff';
import { useFocusOnShow } from '../../behaviour/focus-on-show';
import { useHeading } from '../../behaviour/heading-level';
import { Crumb, CrumbOverflow } from './crumb';
import { DraggableRow } from './draggable-row';
import { icons, purposeIcons } from './icons';
import { PpItemView } from './item-view-lazy';

export const content = {
  Text: ({ props, children }) => {
    if (props.inline) {
      return (
        <span className={clsx(props.muted && 'muted')}>
          {props.highlight ? <mark>{props.text}</mark> : props.text}
          {children && <> {children}</>}
        </span>
      );
    }
    let text = <>{props.text}</>;
    if (props.highlight) text = <mark>{text}</mark>;
    const purpose = props.pending ? null : props.purpose;
    if (purpose) text = <strong>{text}</strong>;
    if (props.size === 'small') text = <small>{text}</small>;
    return (
      <p
        className={clsx(
          purpose
            ? [purpose, 'flex', 'nowrap']
            : props.pending
              ? ['muted', 'flex', 'nowrap']
              : props.muted && 'muted',
          props.size === 'large' && 'text-larger',
        )}
        role={props.status ? 'status' : undefined}
      >
        {props.pending && <pp-spinner aria-hidden="true" />}
        {purpose && (
          <iconify-icon className="icon" icon={purposeIcons[purpose]} aria-hidden="true" />
        )}
        {text}
        {children && <> {children}</>}
      </p>
    );
  },

  Callout: ({ props, slots }) => (
    <div className={clsx('callout', 'flex', props.purpose ?? 'layer')}>
      <iconify-icon
        className="icon"
        icon={purposeIcons[props.purpose ?? 'info']}
        aria-hidden="true"
      />
      <span className="callout__text">
        {props.title && <strong>{props.title}. </strong>}
        {props.text}
        {slots?.actions && <> {slots.actions}</>}
      </span>
    </div>
  ),

  EmptyState: ({ props, slots }) => {
    const Heading = useHeading();
    return (
      <div className="empty-state flow">
        {props.icon && <iconify-icon icon={icons[props.icon]} aria-hidden="true" />}
        <Heading className="empty-state__title">{props.title}</Heading>
        {props.description && <p>{props.description}</p>}
        {slots?.actions && <div className="inline-flow">{slots.actions}</div>}
      </div>
    );
  },

  BulletList: ({ props }) => (
    <ul>
      {props.items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  ),

  DescriptionList: ({ props }) => (
    <dl className={clsx('description-list', props.draggable && 'description-list--draggable')}>
      {props.items.map((item) =>
        props.draggable ? (
          <DraggableRow key={item.label} id={item.id} label={item.label} value={item.value} />
        ) : (
          <Fragment key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </Fragment>
        ),
      )}
    </dl>
  ),

  // Nothing renders until the spec names a kind of item that has a binding,
  // so an item that has not arrived yet leaves no fallback view behind.
  ItemView: (context) =>
    context.props.type && Object.hasOwn(bindings, context.props.type) && context.props.item ? (
      <Suspense fallback={null}>
        <PpItemView {...context} />
      </Suspense>
    ) : null,

  // pp-table is the scroll container and takes focus, so it is a region
  // named by `label`.
  Table: ({ props, children }) => (
    <pp-table role="region" aria-label={props.label}>
      <table>
        <thead>
          <tr>
            {props.columns.map((column, index) => (
              <th
                key={index}
                className={column.align === 'end' ? 'pp-table-align-right' : undefined}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </pp-table>
  ),

  TableRow: ({ children }) => <tr>{children}</tr>,

  TableCell: ({ props, children }) => (
    <td className={props.align === 'end' ? 'pp-table-align-right' : undefined}>
      {props.text}
      {children}
    </td>
  ),

  Stat: ({ props }) => (
    <div className="stat" data-alert={props.alert || undefined}>
      <strong className="stat__value">
        {props.value}
        {props.unit && <span className="stat__unit"> {props.unit}</span>}
      </strong>
      {props.verdict && <p className="stat__verdict">{props.verdict}</p>}
      {props.detail && <p className="muted">{props.detail}</p>}
    </div>
  ),

  // A badge with an icon, such as a trend, reads quiet, as in the shadcn
  // registry; a toned badge without one is a solid fill.
  Badge: ({ props, emit }) => {
    const Root = props.pressable ? 'button' : props.icon ? 'span' : 'strong';
    return (
      <Root
        type={props.pressable ? 'button' : undefined}
        onClick={props.pressable ? () => void emit('press') : undefined}
        className={clsx(
          'badge',
          props.pill && 'badge--pill',
          props.pulse && 'badge--pulse',
          props.tone && props.tone !== 'neutral' && `badge--${props.tone}`,
        )}
      >
        {props.label && <span className="badge__label">{props.label}</span>}
        {props.icon && (
          <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />
        )}
        {props.text}
      </Root>
    );
  },

  Tag: ({ props, emit }) => {
    const removeRef = useFocusHandoff(props.focusNext);
    const openRef = useRef<HTMLButtonElement>(null);
    useFocusOnShow(openRef, props.focusOnShow);
    const content = (
      <>
        {props.icon && <iconify-icon icon={icons[props.icon]} aria-hidden="true" />}
        {props.pending ? <span className="shimmer">{props.label}</span> : props.label}
      </>
    );
    const tag = props.opens ? (
      <button
        ref={openRef}
        type="button"
        className="tag"
        data-focus-key={props.focusKey ?? undefined}
        onClick={() => emit('open')}
      >
        {content}
      </button>
    ) : (
      <span className="tag">{content}</span>
    );
    if (props.opens || !props.removeLabel) return tag;
    return (
      <span className="tag-group">
        {tag}
        <button
          ref={removeRef}
          type="button"
          className="tag tag-group__remove"
          data-focus-key={props.focusKey ?? undefined}
          onClick={() => emit('remove')}
        >
          <iconify-icon icon={icons.cancel} aria-hidden="true" />
          <span className="visually-hidden">{props.removeLabel}</span>
        </button>
      </span>
    );
  },

  FilterTag: ({ props, bindings, emit }) => {
    const [, setEdit] = useBoundProp(props.edit, bindings?.edit);
    const { group } = useGroupFocusHandoff(props.focusNext);
    return (
      <FilterTag
        ref={group}
        label={props.label}
        icon={props.icon && icons[props.icon]}
        operator={props.operator}
        operators={props.operators}
        values={props.values}
        options={props.options}
        glyphs={props.glyphs?.map((each) => ({
          ...each,
          icon: each.icon && icons[each.icon],
        }))}
        removeLabel={props.removeLabel}
        focusKey={props.focusKey}
        onChange={(change) => {
          setEdit(change);
          void emit('change');
        }}
        onRemove={() => void emit('remove')}
      />
    );
  },

  Breadcrumbs: ({ props, bindings, emit }) => {
    const [, setPicked] = useBoundProp(props.picked, bindings?.picked);
    const pick = (id: string) => {
      setPicked(id);
      emit('pick');
    };
    const [first, ...middle] = props.items;
    return (
      <pp-breadcrumbs role="navigation" aria-label={props.label}>
        {first && <Crumb key={first.id} label={first.label} onPick={() => pick(first.id)} />}
        {first && <CrumbOverflow items={props.items} onPick={pick} />}
        {middle.map((item) => (
          <Crumb key={item.id} label={item.label} onPick={() => pick(item.id)} />
        ))}
        <span className="crumb">
          <a aria-current="page">{props.current}</a>
          {props.note && <small className="muted">&nbsp;{props.note}</small>}
        </span>
      </pp-breadcrumbs>
    );
  },

  Map: ({ props, bindings, emit }) => {
    const [selected, setSelected] = useBoundProp(props.selected, bindings?.selected);
    const [focused, setFocused] = useBoundProp(props.focused, bindings?.focused);
    const ref = useRef<MapComponent | null>(null);
    // pp-map redraws its pins and refits the view whenever it is handed a
    // new array, so the array changes only with the places.
    const locations = useMemo(
      () =>
        props.locations.map(({ description, ...location }) => ({
          ...location,
          description: description ?? undefined,
        })),
      [props.locations],
    );
    useEffect(() => {
      if (ref.current) ref.current.locations = locations;
    }, [locations]);
    useEffect(() => {
      if (ref.current) ref.current['selected-id'] = selected ?? '';
    }, [selected]);
    useEffect(() => {
      if (ref.current) ref.current['focused-id'] = focused ?? '';
    }, [focused]);
    const onFocus = useEffectEvent((event: Event) => {
      const { location } = (event as CustomEvent<MapFocusDetail>).detail;
      setFocused(location ? String(location.id) : null);
    });
    const onSelect = useEffectEvent((event: Event) => {
      setSelected(String((event as CustomEvent<MapSelectDetail>).detail.location.id));
      emit('select');
    });
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const focus = (event: Event) => onFocus(event);
      const select = (event: Event) => onSelect(event);
      el.addEventListener('pp-map-focus', focus);
      el.addEventListener('pp-map-select', select);
      return () => {
        el.removeEventListener('pp-map-focus', focus);
        el.removeEventListener('pp-map-select', select);
      };
    }, []);
    return <pp-map ref={ref} aria-label={props.label} />;
  },

  CodeBlock: ({ props }) => (
    <pre data-language={props.language ?? undefined}>
      <code>{props.code}</code>
    </pre>
  ),
} satisfies Partial<Components<Catalog>>;
