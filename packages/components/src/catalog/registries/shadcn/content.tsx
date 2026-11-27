import { Fragment, useRef, type ReactNode } from 'react';
import { useBoundProp, type Components } from '@json-render/react';
import { cn } from './cn';
import { Loader75, Cross } from 'iconoteka-react';
import type { Catalog } from '../../catalog';
import { useFocusHandoff } from '../../behaviour/focus-handoff';
import { useFocusOnShow } from '../../behaviour/focus-on-show';
import { LocationMap } from './map';
import { useHeading } from '../../behaviour/heading-level';
import { Crumb, CrumbOverflow, Trail } from './crumb';
import { DescriptionRows } from './description-rows';
import { DraggableRow } from './draggable-row';
import { FilterTag } from './filter-tag';
import { specItemLayout } from '../../behaviour/item-view';
import { referenceMetadataEntries } from '../../../components/item-view/reference-metadata';
import { icons, purposeIcons } from './icons';
import { badgeClass, markClass, purposeText, type Purpose } from './classes';

const purposeSurface: Record<Purpose, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
  success:
    'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
  warning:
    'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
  danger: 'bg-card text-destructive',
};

// The custom attributes this library can show in an ItemView, keyed
// `type.path` as pp's registered components are.
const customAttributes: Record<string, (item: object) => ReactNode> = {
  'reference.metadata': (item) => <DescriptionRows rows={referenceMetadataEntries(item)} />,
};

export const content = {
  Text: ({ props, children }) => {
    const text = props.highlight ? <mark className={markClass}>{props.text}</mark> : props.text;
    const purpose = props.pending ? null : props.purpose;
    const Icon = props.pending ? Loader75 : purpose ? purposeIcons[purpose] : null;
    if (props.inline) {
      return (
        <span className={cn(props.muted && 'text-muted-foreground')}>
          {text}
          {children && <> {children}</>}
        </span>
      );
    }
    return (
      <p
        className={cn(
          props.size === 'small'
            ? 'text-xs'
            : props.size === 'large'
              ? 'text-2xl font-semibold tracking-tight'
              : 'text-sm',
          (purpose || props.pending) && 'flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0',
          purpose
            ? [purposeText[purpose], props.size !== 'large' && 'font-medium']
            : (props.muted || props.pending) && 'text-muted-foreground',
        )}
        role={props.status ? 'status' : undefined}
      >
        {Icon && (
          <Icon
            aria-hidden="true"
            className={cn(props.pending && 'animate-spin motion-reduce:animate-none')}
          />
        )}
        {text}
        {children && <> {children}</>}
      </p>
    );
  },

  // No role="alert": a callout is part of the content and is not announced.
  Callout: ({ props, slots }) => {
    const Icon = purposeIcons[props.purpose ?? 'info'];
    return (
      <div
        className={cn(
          'relative grid w-full grid-cols-[auto_1fr] items-start gap-x-2 gap-y-0.5 rounded-lg border px-2.5 py-2 text-left text-sm *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*=size-])]:size-4',
          props.purpose ? purposeSurface[props.purpose] : 'bg-card text-card-foreground',
        )}
      >
        <Icon aria-hidden="true" className="row-span-2" />
        {props.title && <div className="col-start-2 font-medium">{props.title}</div>}
        <div
          className={cn(
            'col-start-2 text-sm text-balance md:text-pretty',
            !props.purpose && 'text-muted-foreground',
          )}
        >
          {props.text}
        </div>
        {slots?.actions && <div className="col-start-2 mt-2 flex gap-2">{slots.actions}</div>}
      </div>
    );
  },

  // shadcn's EmptyTitle is a div; a heading here gives both libraries the
  // same outline.
  EmptyState: ({ props, slots }) => {
    const Icon = props.icon ? icons[props.icon] : null;
    const Heading = useHeading();
    return (
      <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance">
        <div className="flex max-w-sm flex-col items-center gap-2">
          {Icon && (
            <div className="mb-2 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
              <Icon aria-hidden="true" />
            </div>
          )}
          <Heading className="text-sm font-medium tracking-tight">{props.title}</Heading>
          {props.description && (
            <div className="text-sm/relaxed text-muted-foreground">{props.description}</div>
          )}
        </div>
        {slots?.actions && (
          <div className="flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance">
            <div className="flex gap-2">{slots.actions}</div>
          </div>
        )}
      </div>
    );
  },

  BulletList: ({ props }) => (
    <ul className="ml-6 list-disc text-sm [&>li]:mt-1">
      {props.items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  ),

  // Stacks below 24rem of demo width, where the pp list does.
  DescriptionList: ({ props }) =>
    props.draggable ? (
      <dl className="grid grid-cols-1 text-sm @sm/demo:grid-cols-[max-content_1fr]">
        {props.items.map((item) => (
          <DraggableRow key={item.label} id={item.id} label={item.label} value={item.value} />
        ))}
      </dl>
    ) : (
      <DescriptionRows
        rows={props.items.map((item) => ({
          key: item.label,
          label: item.label,
          text: item.value,
        }))}
      />
    ),

  // Laid out by layoutByRole, as in the pp registry; the slots map onto
  // this library's Badge, Text and DescriptionList markup.
  ItemView: ({ props }) => {
    const { item } = props;
    const layout = specItemLayout(props.type, item, props.scope, props.shownAttributes);
    if (!layout || !item) return null;
    if (props.scope === 'micro') {
      return <span className={badgeClass('neutral', false)}>{layout.title}</span>;
    }
    const line = (entry: { key: string; text: string }, className: string) => (
      <p key={entry.key} className={className}>
        {entry.text}
      </p>
    );
    const badges = layout.badges.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {layout.badges.map((badge) => (
          <span key={badge.key} className={badgeClass('neutral', false)}>
            {badge.label && <span className="opacity-70">{badge.label}</span>}
            {badge.text}
          </span>
        ))}
      </div>
    );
    // A summary leads with its key figure at body size and ends with its
    // badges, as pp's does; a fuller view leads with the badges.
    const mini = props.scope === 'mini';
    return (
      <div className={cn('flex flex-col', mini ? 'gap-2' : 'gap-4')}>
        {!mini && badges}
        {layout.keyAttributes.map((entry) =>
          line(entry, mini ? 'text-sm font-semibold' : 'text-2xl font-semibold tracking-tight'),
        )}
        {layout.subtitles.map((entry) => line(entry, 'text-sm text-muted-foreground'))}
        {layout.descriptions.map((entry) => line(entry, 'text-sm'))}
        {mini && badges}
        {layout.captions.map((entry) => line(entry, 'text-sm text-muted-foreground'))}
        {layout.rows.length > 0 && <DescriptionRows rows={layout.rows} />}
        {layout.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {layout.tags.map((tag) => (
              <span key={tag.key} className={badgeClass('neutral', true)}>
                {tag.text}
              </span>
            ))}
          </div>
        )}
        {layout.footers.map((entry) => line(entry, 'text-sm text-muted-foreground'))}
        {layout.customs.map((attribute) => {
          const render = customAttributes[`${props.type}.${attribute.path}`];
          return render ? (
            <Fragment key={attribute.path}>{render(item)}</Fragment>
          ) : (
            <p key={attribute.path} className="spec-demo__unsupported" role="note">
              This library has no component for {attribute.label ?? attribute.path}.
            </p>
          );
        })}
      </div>
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
      <Trail label={props.label}>
        {first && (
          <Crumb key={first.id} label={first.label} stage="first" onPick={() => pick(first.id)} />
        )}
        {first && <CrumbOverflow items={props.items} middle={middle.length > 0} onPick={pick} />}
        {middle.map((item) => (
          <Crumb key={item.id} label={item.label} stage="middle" onPick={() => pick(item.id)} />
        ))}
        <li className="inline-flex min-w-0 items-center gap-1">
          <span
            role="link"
            aria-disabled="true"
            aria-current="page"
            className="font-normal text-foreground group-data-[collapsed=all]/trail:truncate"
          >
            {props.current}
          </span>
          {props.note && <span className="text-xs">{props.note}</span>}
        </li>
      </Trail>
    );
  },

  // The scroll container takes focus so a wide table scrolls from the keyboard.
  Table: ({ props, children }) => (
    <div
      role="region"
      aria-label={props.label}
      tabIndex={0}
      className="relative w-full overflow-x-auto rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors">
            {props.columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  'h-10 px-2 align-middle font-medium whitespace-nowrap text-foreground',
                  column.align === 'end' ? 'text-right' : 'text-left',
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
      </table>
    </div>
  ),

  TableRow: ({ children }) => (
    <tr className="border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50">
      {children}
    </tr>
  ),

  TableCell: ({ props, children }) => (
    <td className={cn('p-2 align-middle whitespace-nowrap', props.align === 'end' && 'text-right')}>
      {props.text}
      {children}
    </td>
  ),

  Stat: ({ props }) => (
    <div data-slot="stat" className="flex flex-col text-sm">
      <p className={cn('text-3xl font-semibold tabular-nums', props.alert && 'text-destructive')}>
        {props.value}
        {props.unit && (
          <span className="text-sm font-normal text-muted-foreground"> {props.unit}</span>
        )}
      </p>
      {(props.verdict || props.detail) && (
        <div className="mt-3 flex flex-col gap-1">
          {props.verdict && <p className="font-medium">{props.verdict}</p>}
          {props.detail && <p className="text-muted-foreground">{props.detail}</p>}
        </div>
      )}
    </div>
  ),

  Badge: ({ props, emit }) => {
    const Icon = props.icon ? icons[props.icon] : null;
    const tone = props.tone ?? 'neutral';
    const Root = props.pressable ? 'button' : 'span';
    return (
      <Root
        type={props.pressable ? 'button' : undefined}
        onClick={props.pressable ? () => void emit('press') : undefined}
        className={cn(
          props.pressable &&
            'cursor-pointer outline-none hover:opacity-80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          badgeClass(tone, Boolean(Icon), props.pill),
          props.pulse && 'animate-pulse',
        )}
      >
        {props.label && <span className="opacity-70">{props.label}</span>}
        {Icon && <Icon aria-hidden="true" />}
        {props.text}
      </Root>
    );
  },

  // A pill Badge without overflow-hidden, which would clip the remove
  // button's focus ring.
  Tag: ({ props, emit }) => {
    const removeRef = useFocusHandoff(props.focusNext);
    const openRef = useRef<HTMLButtonElement>(null);
    useFocusOnShow(openRef, props.focusOnShow);
    const Icon = props.pending ? Loader75 : props.icon ? icons[props.icon] : null;
    const Root = props.opens ? 'button' : 'span';
    return (
      <Root
        ref={props.opens ? openRef : undefined}
        type={props.opens ? 'button' : undefined}
        data-focus-key={(props.opens && props.focusKey) || undefined}
        onClick={props.opens ? () => emit('open') : undefined}
        className={cn(
          badgeClass('neutral', false, true),
          'overflow-visible',
          props.opens &&
            'cursor-pointer outline-none hover:bg-secondary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        )}
      >
        {Icon && (
          <Icon
            aria-hidden="true"
            className={cn(props.pending && 'animate-spin motion-reduce:animate-none')}
          />
        )}
        <span className={props.pending ? 'text-muted-foreground' : undefined}>{props.label}</span>
        {props.removeLabel && !props.opens && (
          <button
            ref={removeRef}
            type="button"
            aria-label={props.removeLabel}
            data-focus-key={props.focusKey ?? undefined}
            onClick={() => emit('remove')}
            className="-mr-1 rounded-full p-0.5 opacity-70 outline-none hover:bg-foreground/10 hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 [&>svg]:size-3"
          >
            <Cross aria-hidden="true" />
          </button>
        )}
      </Root>
    );
  },

  FilterTag: (context) => (
    <FilterTag
      {...context}
      Glyph={context.props.icon ? icons[context.props.icon] : null}
      iconFor={(name) => icons[name]}
    />
  ),

  Map: ({ props, bindings, emit }) => {
    const [selected, setSelected] = useBoundProp(props.selected, bindings?.selected);
    const [focused, setFocused] = useBoundProp(props.focused, bindings?.focused);
    return (
      <LocationMap
        label={props.label}
        locations={props.locations}
        selected={selected ?? null}
        onSelect={(id) => {
          setSelected(id);
          emit('select');
        }}
        focused={focused ?? null}
        onFocusChange={setFocused}
      />
    );
  },

  // AI Elements' CodeBlock, without its highlighting or its header.
  CodeBlock: ({ props }) => (
    <pre
      className="m-0 min-w-0 overflow-x-auto rounded-md border bg-muted/50 p-3 font-mono text-xs text-foreground"
      data-language={props.language ?? undefined}
    >
      <code>{props.code}</code>
    </pre>
  ),
} satisfies Partial<Components<Catalog>>;
