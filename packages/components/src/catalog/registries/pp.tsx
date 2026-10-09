import { Children, Suspense, lazy, useEffect, useId, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { defineRegistry, useBoundProp } from '@json-render/react';
import clsx from 'clsx';
import { catalog, actionsSuppliedBySpecs, type iconNames } from '../catalog';
import '../../jsx-types';

// The catalog rendered with the project's own library: pp-* elements and the
// CSS layer's classes, the same markup the hand-written demos use.

// Tiptap stays out of this chunk until a spec actually renders a rule.
const RuleSentence = lazy(() => import('../../components/rule-sentence').then(m => ({ default: m.RuleSentence })));

type PpModal = HTMLElement & { open: () => void; close: () => void };

const space = { none: '0', s: 'var(--space-xs)', m: 'var(--space-s)', l: 'var(--space-m)' } as const;
const columnWidth = { s: '16ch', m: '24ch', l: '36ch' } as const;
const icons: Record<(typeof iconNames)[number], string> = {
  cancel: 'ph:x',
  delete: 'ph:trash-simple',
  'delete-confirm': 'ph:trash-simple-fill',
  history: 'ph:clock-counter-clockwise',
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

    Card: ({ props, children }) => (
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
        >
          {text}
          {children && <> {children}</>}
        </p>
      );
    },

    List: ({ props, children }) => (
      <pp-list className={clsx(props.borderless && 'borderless')}>{children}</pp-list>
    ),

    ListItem: ({ props, children, slots }) => (
      <pp-list-item type={props.checkbox ? 'checkbox' : undefined} checked={props.checked || undefined}>
        {props.description ? (
          <span>
            {props.label}
            <small className="muted" style={{ display: 'block' }}>{props.description}</small>
          </span>
        ) : (
          props.label
        )}
        {children}
        {slots?.suffix && <span data-slot="suffix">{slots.suffix}</span>}
      </pp-list-item>
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
        {props.text}
      </strong>
    ),

    Button: ({ props, emit }) => (
      <button
        type="button"
        className={clsx('button', props.variant && props.variant !== 'default' && `button--${props.variant}`)}
        disabled={props.disabled ?? undefined}
        aria-expanded={props.expanded ?? undefined}
        onClick={() => emit('press')}
      >
        {props.icon && <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />}
        {props.hideLabel ? <span className="visually-hidden">{props.label}</span> : props.label}
      </button>
    ),

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
        el.addEventListener('modal:close', onClose);
        return () => el.removeEventListener('modal:close', onClose);
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

    RuleSentence: ({ props, bindings, emit }) => {
      const [, setEdit] = useBoundProp(props.edit, bindings?.edit);
      // Events carry no payload: the edit goes to state first, then the event.
      const send = (kind: 'change' | 'add' | 'remove', slotId: string, value: unknown) => {
        setEdit({ kind, slotId, value });
        emit(kind);
      };
      return (
        <Suspense>
          <RuleSentence
            label={props.label}
            parts={props.parts as Parameters<typeof RuleSentence>[0]['parts']}
            onChange={(slotId, value) => send('change', slotId, value)}
            onAdd={(slotId, value) => send('add', slotId, value)}
            onRemove={slotId => send('remove', slotId, null)}
          />
        </Suspense>
      );
    },
  },
  actions: actionsSuppliedBySpecs,
});
