import { Children, useEffect, useId, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { defineRegistry, useBoundProp } from '@json-render/react';
import clsx from 'clsx';
import { catalog, actionsSuppliedBySpecs, toastDuration, type iconNames } from '../catalog';
import type { ToastHandle } from '../../components/toast/toast';
import { captureOpener, focusDemoIfOpenerGone, type Opener } from './dialog-focus';
import { useToastList } from './toast-list';
import '../../jsx-types';

// The catalog rendered with the project's own library: pp-* elements and the
// CSS layer's classes, the same markup the hand-written demos use.

type PpModal = HTMLElement & { open: () => void; close: () => void };

const space = { none: '0', s: 'var(--space-xs)', m: 'var(--space-s)', l: 'var(--space-m)' } as const;
const columnWidth = { s: '16ch', m: '24ch', l: '36ch' } as const;
const icons: Record<(typeof iconNames)[number], string> = {
  archive: 'ph:archive-box',
  cancel: 'ph:x',
  delete: 'ph:trash-simple',
  'delete-confirm': 'ph:trash-simple-fill',
  history: 'ph:clock-counter-clockwise',
  publish: 'ph:globe-hemisphere-west',
  'remove-person': 'ph:user-minus',
  restore: 'ph:arrow-arc-left',
  transfer: 'ph:crown-simple',
};

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

    Grid: ({ props, children }) => (
      <ul
        className="cards layout-grid"
        style={{ '--layout-grid-min': columnWidth[props.minColumnWidth ?? 'm'] } as CSSProperties}
      >
        {Children.map(children, child => <li>{child}</li>)}
      </ul>
    ),

    // A plain card is one padded column. With a suffix or actions it takes
    // the card's zones: a header that spreads the title and the suffix apart,
    // and a footer that puts the actions at the end.
    Card: ({ props, children, slots }) =>
      slots?.suffix || slots?.actions ? (
        <article className="card">
          <div className="card__header">
            {props.title && <h3 className="label">{props.title}</h3>}
            {slots.suffix && <div className="flex">{slots.suffix}</div>}
          </div>
          <div className="flow pad">{children}</div>
          {slots.actions && (
            <div className="card__footer">
              <div className="flex" />
              <div className="flex">{slots.actions}</div>
            </div>
          )}
        </article>
      ) : (
        <article className="card flow pad" style={{ '--flow-space': '0em' } as CSSProperties}>
          {props.title && <h3>{props.title}</h3>}
          {children}
        </article>
      ),

    Text: ({ props, children }) => {
      let text = <>{props.text}</>;
      if (props.highlight) text = <mark>{text}</mark>;
      if (props.size === 'small') text = <small>{text}</small>;
      return (
        <p
          className={clsx(props.muted && 'muted')}
          style={props.size === 'large' ? { fontSize: 'larger' } : undefined}
          role={props.status ? 'status' : undefined}
        >
          {text}
          {children && <> {children}</>}
        </p>
      );
    },

    BulletList: ({ props }) => (
      <ul>
        {props.items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    ),

    List: ({ props, children }) => (
      <pp-list className={clsx(props.borderless && 'borderless')}>{children}</pp-list>
    ),

    ListItem: ({ props, children, slots }) => {
      const label = props.struck ? <s>{props.label}</s> : props.label;
      return (
        <pp-list-item type={props.checkbox ? 'checkbox' : undefined} checked={props.checked || undefined}>
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

    Badge: ({ props }) => (
      <strong
        className={clsx(
          'badge',
          props.pill && 'badge--pill',
          props.pulse && 'badge--pulse',
          props.tone && props.tone !== 'neutral' && `badge--${props.tone}`,
        )}
      >
        {props.text}
      </strong>
    ),

    Button: ({ props, emit }) => (
      <button
        type="button"
        className={clsx('button', props.variant && props.variant !== 'default' && `button--${props.variant}`)}
        disabled={props.disabled ?? undefined}
        aria-expanded={props.expanded ?? undefined}
        data-autofocus={props.initialFocus || undefined}
        onClick={() => emit('press')}
      >
        {props.icon && <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />}
        {props.hideLabel ? <span className="visually-hidden">{props.label}</span> : props.label}
      </button>
    ),

    Input: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const id = useId();
      // The error is an alert so that it is read out when it appears: the
      // press that sets it leaves focus on the button.
      const field = (
        <>
          <pp-input invalid={Boolean(props.error)}>
            <input
              id={id}
              type="text"
              aria-label={props.hideLabel ? props.label : undefined}
              aria-describedby={props.error ? `${id}-error` : undefined}
              placeholder={props.placeholder ?? undefined}
              data-autofocus={props.initialFocus || undefined}
              value={value ?? ''}
              onChange={event => setValue(event.target.value)}
            />
          </pp-input>
          {props.error && (
            <small id={`${id}-error`} data-slot="error" role="alert">
              <span className="visually-hidden">Error:</span> {props.error}
            </small>
          )}
        </>
      );
      return (
        <div className="flow" style={{ '--flow-space': space.s } as CSSProperties}>
          {!props.hideLabel && <label htmlFor={id}>{props.label}</label>}
          {field}
        </div>
      );
    },

    // The library's dialog: <pp-modal> around a <dialog class="dialog">, the
    // markup modalService builds, opened and closed from the bound state.
    // pp-modal traps focus, closes on Escape and on a click outside (an alert
    // sets closedby="closerequest", so only Escape), starts focus on the
    // element marked data-autofocus, and hands focus back to the opener.
    Dialog: ({ props, children, slots, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      const modal = useRef<PpModal>(null);
      const opener = useRef<Opener | null>(null);
      const titleId = useId();
      const descriptionId = useId();

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
          if (open && !shown) {
            opener.current = captureOpener();
            el.open();
          }
          if (!open && shown) {
            el.close();
            if (opener.current) focusDemoIfOpenerGone(opener.current);
            opener.current = null;
          }
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
