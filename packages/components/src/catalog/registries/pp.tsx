import { Children, Fragment, useEffect, useId, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { defineRegistry, useBoundProp } from '@json-render/react';
import clsx from 'clsx';
import { catalog, actionsSuppliedBySpecs, toastDuration, type iconNames, type purposes } from '../catalog';
import type { ToastHandle } from '../../components/toast/toast';
import { captureOpener, focusDemoIfOpenerGone, type Opener } from './dialog-focus';
import { useDisclosureState } from './disclosure-state';
import { useFieldError } from './field-validation';
import { submitForm } from './form-submit';
import { useFocusHandoff } from './focus-handoff';
import { useFocusOnShow } from './focus-on-show';
import { Subsection, useHeading } from './heading-level';
import { useToastList } from './toast-list';
import { TracingProvider, useMarkTracing, useTracingState } from './mark-tracing';
import '../../jsx-types';

// The catalog rendered with the project's own library: pp-* elements and the
// CSS layer's classes, the same markup the hand-written demos use.

type PpModal = HTMLElement & { open: () => void; close: () => void };

const space = { none: '0', s: 'var(--space-xs)', m: 'var(--space-s)', l: 'var(--space-m)' } as const;
const columnWidth = { s: '16ch', m: '24ch', l: '36ch' } as const;
// A field's label, control and error, a small step apart. A grid rather than
// .flow, whose own --flow-space would also set the field's distance from the
// field before it.
const fieldLayout: CSSProperties = { display: 'grid', gap: space.s };
const icons: Record<(typeof iconNames)[number], string> = {
  archive: 'ph:archive-box',
  back: 'ph:arrow-left',
  cancel: 'ph:x',
  decrease: 'ph:arrow-down-right',
  delete: 'ph:trash-simple',
  'delete-confirm': 'ph:trash-simple-fill',
  external: 'ph:arrow-square-out',
  generated: 'ph:sparkle',
  guide: 'ph:book-open',
  history: 'ph:clock-counter-clockwise',
  increase: 'ph:arrow-up-right',
  link: 'ph:link',
  notifications: 'ph:bell',
  open: 'ph:folder-open',
  publish: 'ph:globe-hemisphere-west',
  'remove-person': 'ph:user-minus',
  restore: 'ph:arrow-arc-left',
  search: 'ph:magnifying-glass',
  transfer: 'ph:crown-simple',
  unchanged: 'ph:minus',
};
const purposeIcons: Record<(typeof purposes)[number], string> = {
  info: 'ph:info',
  success: 'ph:check-circle',
  warning: 'ph:warning',
  danger: 'ph:x-circle',
};

// A field's error, placed where the library's field styles expect it
// (data-slot="error" after pp-input, inside pp-select). An alert, so that it
// is read out when a submit sets it.
const fieldError = (id: string, message: string) => (
  <small id={id} data-slot="error" role="alert">
    <span className="visually-hidden">Error:</span> {message}
  </small>
);

export const { registry } = defineRegistry(catalog, {
  components: {
    Stack: ({ props, children }) =>
      props.direction === 'horizontal' ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: space[props.gap ?? 'm'],
            alignItems: props.align ?? 'center',
          }}
        >
          {children}
        </div>
      ) : (
        <div className="flow" style={{ '--flow-space': space[props.gap ?? 'm'] } as CSSProperties}>
          {children}
        </div>
      ),

    // A list of cards, each in its own item. A repeat reaches the registry as
    // one child that renders every item, so it cannot be split into list
    // items here; a grid with one child lays it out without the list.
    Grid: ({ props, children }) => {
      const style = { '--layout-grid-min': columnWidth[props.minColumnWidth ?? 'm'] } as CSSProperties;
      return Children.count(children) < 2 ? (
        <div className="cards layout-grid" style={style}>
          {children}
        </div>
      ) : (
        <ul className="cards layout-grid" style={style}>
          {Children.map(children, child => <li>{child}</li>)}
        </ul>
      );
    },

    // A plain card is one padded column. With a suffix or actions it takes
    // the card's zones: a header that spreads the title and the suffix apart,
    // and a footer that puts the actions at the end. A card that opens puts
    // its title in a .stretched-link button, which covers the card while the
    // header's and footer's other controls stay above it. The button takes
    // focus when it appears, if `focusOnShow` (focus-on-show.ts). The title is
    // a heading at the demo's current level (heading-level.ts); .card__title
    // keeps its size whatever the level.
    Card: ({ props, children, slots, emit }) => {
      const openRef = useRef<HTMLButtonElement>(null);
      useFocusOnShow(openRef, props.focusOnShow);
      const Heading = useHeading();
      const title = props.opens ? (
        <button ref={openRef} type="button" className="stretched-link" onClick={() => emit('open')}>
          {props.title}
        </button>
      ) : (
        props.title
      );
      return slots?.suffix || slots?.actions ? (
        <article className="card">
          <div className="card__header">
            {props.title && <Heading className="label card__title">{title}</Heading>}
            {slots.suffix && <div className="flex">{slots.suffix}</div>}
          </div>
          <div className="flow pad">
            <Subsection>{children}</Subsection>
          </div>
          {slots.actions && (
            <div className="card__footer">
              <div className="flex" />
              <div className="flex">{slots.actions}</div>
            </div>
          )}
        </article>
      ) : (
        <article className="card flow pad" style={{ '--flow-space': '0em' } as CSSProperties}>
          {props.title && <Heading className="card__title">{title}</Heading>}
          <Subsection>{children}</Subsection>
        </article>
      );
    },

    // With a purpose, the purpose's colour class, its icon and a strong run
    // of text, as the library marks a message in place.
    Text: ({ props, children }) => {
      let text = <>{props.text}</>;
      if (props.highlight) text = <mark>{text}</mark>;
      if (props.purpose) text = <strong>{text}</strong>;
      if (props.size === 'small') text = <small>{text}</small>;
      return (
        <p
          className={clsx(props.purpose ? [props.purpose, 'flex'] : props.muted && 'muted')}
          style={props.size === 'large' ? { fontSize: 'larger' } : undefined}
          role={props.status ? 'status' : undefined}
        >
          {props.purpose && <iconify-icon className="icon" icon={purposeIcons[props.purpose]} aria-hidden="true" />}
          {text}
          {children && <> {children}</>}
        </p>
      );
    },

    // A neutral callout takes the raised surface (`layer`) rather than a
    // purpose class, as in the Callout story.
    // Actions run on after the text, in the same line of prose. The text
    // takes the width beside the icon: at its natural width a message longer
    // than a line would wrap below the icon in a narrow demo, where .flex wraps.
    Callout: ({ props, slots }) => (
      <div className={clsx('callout', 'flex', props.purpose ?? 'layer')}>
        <iconify-icon className="icon" icon={purposeIcons[props.purpose ?? 'info']} aria-hidden="true" />
        <span style={{ flex: 1 }}>
          {props.title && <strong>{props.title}. </strong>}
          {props.text}
          {slots?.actions && <> {slots.actions}</>}
        </span>
      </div>
    ),

    // The library's empty state: a centred column with a large icon, the
    // title as a heading at the demo's current level and the actions side by
    // side.
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

    // pp-sections reads its children as heading-then-content runs and rewires
    // them for the affordance. Each Section brings its content already in the
    // panel the element would otherwise wrap it in, so the element leaves those
    // nodes where React put them. The element takes any heading level, and
    // sizes the titles itself.
    Sections: ({ props, children }) => <pp-sections affordance={props.affordance}>{children}</pp-sections>,

    Section: ({ props, children }) => {
      const Heading = useHeading();
      return (
        <>
          <Heading>{props.title}</Heading>
          <div data-pp-panel="" className="flow">
            <Subsection>{children}</Subsection>
          </div>
        </>
      );
    },

    BulletList: ({ props }) => (
      <ul>
        {props.items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    ),

    DescriptionList: ({ props }) => (
      <dl className="description-list">
        {props.items.map(item => (
          <Fragment key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </Fragment>
        ))}
      </dl>
    ),

    // The library's conversation layout, as in the Messaging stories: the
    // actor's messages sit on a raised bubble at the end of the line. A marked
    // run's note is a pp-tooltip, which opens on hover and on focus of the
    // mark, so the mark takes focus for actors on a keyboard. The tooltip's
    // styles underline the mark to say a note is there. A linked run traces
    // its link (mark-tracing.ts); the library's message styles drop the
    // highlight from a run marked data-dimmed, and a hidden line names the
    // runs it is linked to.
    Messages: ({ children }) => (
      <TracingProvider value={useTracingState()}>
        <div className="messages layer">{children}</div>
      </TracingProvider>
    ),

    Message: ({ props }) => {
      const tracing = useMarkTracing(props.parts);
      return (
        <div className={clsx('message', props.from === 'actor' ? 'message--outbound' : 'message--inbound')}>
          <div className="message__content">
            <div className={clsx('message__body', props.from === 'actor' && 'layer')}>
              {props.parts.map((part, index) => {
                if (typeof part === 'string') return part;
                const { dimmed, linkedTo, handlers } = tracing(index);
                const mark = (
                  <mark key={index} tabIndex={part.note ? 0 : undefined} data-dimmed={dimmed || undefined} {...handlers}>
                    {part.text}
                    {linkedTo.length > 0 && <span className="visually-hidden">, linked to: {linkedTo.join('; ')}</span>}
                  </mark>
                );
                if (!part.note) return mark;
                return (
                  <pp-tooltip key={index} content={part.note}>
                    {mark}
                  </pp-tooltip>
                );
              })}
            </div>
          </div>
        </div>
      );
    },

    // The library's timeline is the stepper. A stepper inside an entry drops
    // its rail by itself. An expandable entry is a <details> placed directly
    // in the entry's content, where the stepper turns the rail dot into its
    // disclosure marker; the time stays outside it, so it shows while the
    // entry is closed. The actor's own entry takes the raised surface. A
    // named actor with a destination is a link, which the stepper sets in a
    // medium weight; one without is strong.
    Timeline: ({ props, children }) => (
      <ol
        className="stepper"
        style={props.density === 'compact' ? ({ '--_circle-size': '0.5rem' } as CSSProperties) : undefined}
      >
        {children}
      </ol>
    ),

    TimelineEntry: ({ props, children, bindings }) => {
      const [open, setOpen] = useDisclosureState(props.open, bindings?.open);
      let title = (
        <>
          {typeof props.by === 'string' && <><strong>{props.by}</strong> </>}
          {props.by && typeof props.by === 'object' && <><a href={props.by.href}>{props.by.name}</a> </>}
          {props.title}
        </>
      );
      if (props.pending) title = <span className="shimmer">{title}</span>;
      return (
        <li className={clsx('stepper__item', props.from === 'actor' && 'layer')}>
          <div className={clsx('stepper__content', !props.expandable && 'flow')}>
            {props.expandable ? (
              <details open={open} onToggle={event => setOpen(event.currentTarget.open)}>
                {/* summary lays its children out as a row, so the title stays one child */}
                <summary><span>{title}</span></summary>
                <div className="flow">{children}</div>
              </details>
            ) : (
              <>
                <p>{title}</p>
                {children}
              </>
            )}
            {props.time && <small className="muted">{props.time}</small>}
          </div>
        </li>
      );
    },

    // A List is its own surface, as the shadcn List is a card: `layer` raises
    // it off whatever it sits on.
    List: ({ props, children }) => (
      <pp-list className={clsx('layer', props.borderless && 'borderless')}>{children}</pp-list>
    ),

    // pp-list ticks a checkbox row itself and announces it with pp-select on
    // the list, so a bound row listens there for its own item and writes the
    // new value back to state.
    ListItem: ({ props, children, slots, bindings }) => {
      const ref = useRef<HTMLElement & { checked: boolean }>(null);
      const [checked, setChecked] = useBoundProp(props.checked, bindings?.checked);
      const bound = Boolean(bindings?.checked);
      useEffect(() => {
        const item = ref.current;
        const list = item?.closest('pp-list');
        if (!bound || !props.checkbox || !item || !list) return;
        const onSelect = (event: Event) => {
          if ((event as CustomEvent<{ item: HTMLElement }>).detail.item === item) setChecked(item.checked);
        };
        list.addEventListener('pp-select', onSelect);
        return () => list.removeEventListener('pp-select', onSelect);
      }, [bound, props.checkbox, setChecked]);
      const label = props.struck ? <s>{props.label}</s> : props.label;
      return (
        <pp-list-item ref={ref} type={props.checkbox ? 'checkbox' : undefined} checked={Boolean(props.checkbox && checked)}>
          {props.description ? (
            <span>
              {label}
              <small className="muted" style={{ display: 'block' }}>{props.description}</small>
            </span>
          ) : (
            label
          )}
          {children}
          {slots?.suffix && <span data-slot="suffix">{slots.suffix}</span>}
        </pp-list-item>
      );
    },

    // The library's stat readout. An alert figure takes the danger colour
    // (stat.css).
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

    Badge: ({ props }) => (
      <strong
        className={clsx(
          'badge',
          props.pill && 'badge--pill',
          props.pulse && 'badge--pulse',
          props.tone && props.tone !== 'neutral' && `badge--${props.tone}`,
        )}
      >
        {props.label && <span className="badge__label">{props.label}</span>}
        {props.icon && <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />}
        {props.text}
      </strong>
    ),

    // The library's tag; a pending label shimmers. A removable tag is a
    // .tag-group: the tag, then the remove button as a joined segment, as the
    // active filters in the library's filter bar are drawn. The remove button
    // hands focus on (focus-handoff.ts) if it unmounts while focused.
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
        <button ref={openRef} type="button" className="tag" onClick={() => emit('open')}>
          {content}
        </button>
      ) : (
        <span className="tag">{content}</span>
      );
      if (props.opens || !props.removeLabel) return tag;
      return (
        <span className="tag-group">
          {tag}
          <button ref={removeRef} type="button" className="tag tag-group__remove" onClick={() => emit('remove')}>
            <iconify-icon icon={icons.cancel} aria-hidden="true" />
            <span className="visually-hidden">{props.removeLabel}</span>
          </button>
        </span>
      );
    },

    // Hands focus on (focus-handoff.ts) if it unmounts while focused.
    Button: ({ props, emit }) => {
      const ref = useFocusHandoff(props.focusNext);
      useFocusOnShow(ref, props.focusOnShow);
      return (
        <button
          ref={ref}
          type={props.submit ? 'submit' : 'button'}
          className={clsx('button', props.variant && props.variant !== 'default' && `button--${props.variant}`)}
          disabled={props.disabled ?? undefined}
          aria-expanded={props.expanded ?? undefined}
          data-autofocus={props.initialFocus || undefined}
          onClick={() => emit('press')}
        >
          {props.icon && <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />}
          {props.hideLabel ? <span className="visually-hidden">{props.label}</span> : props.label}
        </button>
      );
    },

    Input: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const error = useFieldError(bindings?.value, value, props.checks, props.error);
      const id = useId();
      // The error is an alert so that it is read out when it appears: the
      // press that sets it leaves focus on the button.
      const field = (
        <>
          <pp-input invalid={Boolean(error)}>
            <input
              id={id}
              type={props.type ?? 'text'}
              aria-label={props.hideLabel ? props.label : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              data-invalid={error ? '' : undefined}
              placeholder={props.placeholder ?? undefined}
              data-autofocus={props.initialFocus || undefined}
              value={value ?? ''}
              onChange={event => setValue(event.target.value)}
            />
          </pp-input>
          {error && fieldError(`${id}-error`, error)}
        </>
      );
      return (
        <div style={fieldLayout}>
          {!props.hideLabel && <label htmlFor={id}>{props.label}</label>}
          {field}
        </div>
      );
    },

    // The library's growing textarea: .grow-wrap sizes itself from a copy of
    // the text in data-replicated-value.
    Textarea: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const id = useId();
      return (
        <div style={fieldLayout}>
          <label htmlFor={id}>{props.label}</label>
          <div className="grow-wrap" data-replicated-value={value ?? ''}>
            <textarea
              id={id}
              rows={3}
              placeholder={props.placeholder ?? undefined}
              value={value ?? ''}
              onChange={event => setValue(event.target.value)}
            />
          </div>
        </div>
      );
    },

    // pp-select around a native select. The empty value is a disabled first
    // option (the placeholder, or blank), so the select shows nothing chosen
    // when nothing is, and it cannot be chosen again.
    Select: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const error = useFieldError(bindings?.value, value, props.checks, props.error);
      const id = useId();
      return (
        <div style={fieldLayout}>
          <label htmlFor={id}>{props.label}</label>
          <pp-select invalid={Boolean(error)}>
            <select
              id={id}
              aria-describedby={error ? `${id}-error` : undefined}
              data-invalid={error ? '' : undefined}
              value={value ?? ''}
              onChange={event => setValue(event.target.value)}
            >
              <option value="" disabled>{props.placeholder ?? ''}</option>
              {props.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {error && fieldError(`${id}-error`, error)}
          </pp-select>
        </div>
      );
    },

    RadioGroup: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const name = useId();
      return (
        // The library resets a fieldset's margin, so the form's spacing goes on a wrapper.
        <div>
          <fieldset style={fieldLayout}>
            <legend>{props.label}</legend>
            {props.options.map(option => (
              <label key={option.value} className="form-control">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => setValue(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        </div>
      );
    },

    Checkbox: ({ props, bindings }) => {
      const [checked, setChecked] = useBoundProp(props.checked, bindings?.checked);
      return (
        <label className="form-control">
          <input type="checkbox" checked={checked ?? false} onChange={event => setChecked(event.target.checked)} />
          {props.label}
        </label>
      );
    },

    // Submitting runs the spec's checks (form-submit.ts). A form is read
    // most easily at about 36rem, however wide the demo is.
    Form: ({ props, children, emit }) => (
      <form
        className="flow"
        style={{ '--flow-space': 'var(--space-l)', maxInlineSize: '36rem' } as CSSProperties}
        aria-label={props.label ?? undefined}
        noValidate
        onSubmit={event => void submitForm(event, emit)}
      >
        {children}
      </form>
    ),

    // The library's dialog: <pp-modal> around a <dialog class="dialog">, the
    // markup modalService builds, opened and closed from the bound state.
    // pp-modal traps focus, closes on Escape and on a click outside (an alert
    // sets closedby="closerequest", so only Escape), starts focus on the
    // element marked data-autofocus, and hands focus back to the opener.
    //
    // Every close, whether from state, pp-modal or the browser, ends in the
    // dialog's close event, so the state and the focus fallback are settled
    // there. It fires once the dialog is shut and the page is no longer inert,
    // so the demo can take focus.
    Dialog: ({ props, children, slots, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      const modal = useRef<PpModal>(null);
      const opener = useRef<Opener | null>(null);
      const titleId = useId();
      const descriptionId = useId();

      const onClose = () => {
        setOpen(false);
        if (opener.current) focusDemoIfOpenerGone(opener.current);
        opener.current = null;
      };

      useEffect(() => {
        void customElements.whenDefined('pp-modal').then(() => {
          const el = modal.current;
          const shown = el?.querySelector('dialog')?.open;
          if (!el || shown === undefined) return;
          if (open && !shown) {
            opener.current = captureOpener();
            el.open();
          }
          if (!open && shown) el.close();
        });
      }, [open]);

      return createPortal(
        <pp-modal ref={modal}>
          <dialog
            className="dialog"
            role={props.alert ? 'alertdialog' : undefined}
            aria-labelledby={titleId}
            aria-describedby={props.description ? descriptionId : undefined}
            closedby={props.alert ? 'closerequest' : 'any'}
            onClose={onClose}
          >
            <header className="modal__header">
              <h2 className="modal__title" id={titleId}>{props.title}</h2>
              <button type="button" className="modal__close" data-close aria-label="Close">
                <iconify-icon icon="ph:x" aria-hidden="true" />
              </button>
            </header>
            <article className="flow">
              {props.description && <p id={descriptionId}>{props.description}</p>}
              {children}
            </article>
            {slots?.actions && (
              <footer>
                <menu>{slots.actions}</menu>
              </footer>
            )}
          </dialog>
        </pp-modal>,
        document.body,
      );
    },

    // The library's drawer is <pp-modal> around a <dialog class="drawer">, the
    // markup modalService builds. A portal rather than modalService itself:
    // the service renders content in a React root of its own, outside the
    // spec's state and action providers.
    Drawer: ({ props, children, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      const modal = useRef<PpModal>(null);
      const titleId = useId();

      useEffect(() => {
        const el = modal.current;
        if (!el) return;
        const onClose = () => setOpen(false);
        el.addEventListener('pp-modal-close', onClose);
        return () => el.removeEventListener('pp-modal-close', onClose);
      }, [setOpen]);

      useEffect(() => {
        void customElements.whenDefined('pp-modal').then(() => {
          const el = modal.current;
          const shown = el?.querySelector('dialog')?.open;
          if (!el || shown === undefined) return;
          if (open && !shown) el.open();
          if (!open && shown) el.close();
        });
      }, [open]);

      return createPortal(
        <pp-modal ref={modal}>
          <dialog className="drawer drawer--right" data-modal="false" aria-labelledby={titleId}>
            <header className="modal__header">
              <h2 className="modal__title" id={titleId}>{props.title}</h2>
              <button type="button" className="modal__close" data-close aria-label="Close">
                <iconify-icon icon="ph:x" aria-hidden="true" />
              </button>
            </header>
            <div className="drawer__content flow">{children}</div>
          </dialog>
        </pp-modal>,
        document.body,
      );
    },

    // The library's toast. PpToast keeps one group on the page and owns the
    // stacking, the fade, the close button and the pause on hover and focus,
    // so this only opens and closes toasts to match the bound list. The
    // library makes the whole toast the action's button, named by its text,
    // so the action's label joins the message. The toast module loads when
    // the first toast opens, as demo-runtime's showToast does.
    Toasts: ({ props, bindings, emit }) => {
      const { dismiss, press } = useToastList(bindings?.toasts, bindings?.pressed, emit);
      // Open toasts call the latest press, so the list effect need not re-run
      // when `emit` changes.
      const pressLatest = useRef(press);
      pressLatest.current = press;
      const shown = useRef(new Map<string, Promise<ToastHandle>>());

      useEffect(() => {
        const listed = new Set(props.toasts.map(toast => toast.id));
        for (const [id, handle] of shown.current) {
          if (listed.has(id)) continue;
          shown.current.delete(id);
          void handle.then(h => h.dismiss());
        }
        for (const toast of props.toasts) {
          if (shown.current.has(toast.id)) continue;
          const handle = import('../../components/toast/toast').then(({ PpToast }) =>
            toast.actionLabel
              ? PpToast.open(`${toast.message} — ${toast.actionLabel}`, () => pressLatest.current(toast), toastDuration.withAction)
              : PpToast.open(toast.message, undefined, toastDuration.plain),
          );
          shown.current.set(toast.id, handle);
          void handle.then(h => h.closed).then(() => {
            if (shown.current.get(toast.id) !== handle) return;
            shown.current.delete(toast.id);
            dismiss(toast.id);
          });
        }
      }, [props.toasts, dismiss]);

      // Switching library unmounts this: close what is showing but leave the
      // list alone, so the other library shows the same toasts.
      useEffect(() => () => {
        const handles = [...shown.current.values()];
        shown.current.clear();
        for (const handle of handles) void handle.then(h => h.dismiss());
      }, []);

      return null;
    },

    // The library has no grouped rule form, so the demo says so rather than
    // rendering a different thing.
    RuleBuilder: () => (
      <p className="spec-demo__unsupported" role="note">
        This library has no rule builder with groups.
      </p>
    ),
  },
  actions: actionsSuppliedBySpecs,
});
