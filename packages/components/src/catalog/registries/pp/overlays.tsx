import type { Components } from '@json-render/react';
import { useCallback, useContext, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBoundProp } from '@json-render/react';
import type { Catalog } from '../../catalog';
import { usePreview } from '../../../components/item-view/use-preview';
import { useMenuFocusHandoff } from '../../behaviour/focus-handoff';
import { Subsection, useHeading } from '../../behaviour/heading-level';
import { MenuMultiple } from '../../behaviour/menu-multiple';
import { icons } from './icons';
import { useModalWindow } from './modal-window';
import { ModalHeader } from './modal-header';
import { usePopoverWindow } from './popover-window';
import { usePpToasts } from './toast-queue';

export const overlays = {
  // The popup is portaled to <body>: the reference sits in a paragraph,
  // which cannot hold the preview's blocks.
  Reference: ({ props, children, slots, bindings, emit }) => {
    const [shown, setShown] = useBoundProp(props.preview, bindings?.preview);
    const { triggerRef, contentRef, trigger, content, close } = usePreview(
      shown ?? false,
      setShown,
      props.expanded ?? false,
    );
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
    const setTrigger = useCallback(
      (element: HTMLButtonElement | null) => {
        triggerRef.current = element;
        setAnchor(element);
      },
      [triggerRef],
    );
    const Heading = useHeading();
    return (
      <>
        <button
          ref={setTrigger}
          type="button"
          className="reference-mention reference"
          data-focus-key={props.focusKey ?? undefined}
          aria-haspopup="dialog"
          aria-expanded={props.expanded ?? false}
          {...trigger}
          onClick={() => {
            close();
            emit('open');
          }}
        >
          {props.label}
        </button>
        {createPortal(
          <pp-popup
            anchor={anchor ?? undefined}
            active={shown ?? false}
            placement="bottom-start"
            distance={8}
            flip
            shift
            top-layer
          >
            <div
              ref={contentRef}
              className="popover"
              role="dialog"
              aria-label={props.label}
              {...content}
            >
              <div className="popover__header">
                <div className="flow">
                  <Heading className="label">
                    {props.icon && (
                      <>
                        <iconify-icon
                          className="icon"
                          icon={icons[props.icon]}
                          aria-hidden="true"
                        />{' '}
                      </>
                    )}
                    {props.label}
                  </Heading>
                  <Subsection>{children}</Subsection>
                </div>
                {slots?.suffix && <div className="button-group">{slots.suffix}</div>}
              </div>
            </div>
          </pp-popup>,
          document.body,
        )}
      </>
    );
  },

  // `top-layer` keeps the panel clear of a scrolling pane and of the rows it
  // overlaps.
  Popover: ({ props, children, slots, bindings }) => {
    const { popup, panel, anchor, open } = usePopoverWindow(props.open, bindings?.open);
    const Heading = useHeading();
    return (
      <pp-popup
        ref={popup}
        anchor={anchor ?? undefined}
        active={open}
        placement="bottom-start"
        distance={8}
        flip
        shift
        top-layer={true}
        light-dismiss={true}
      >
        <div ref={panel} className="popover" role="dialog" aria-label={props.title} tabIndex={-1}>
          <div className="popover__header">
            <div className="flow">
              <Heading className="label">{props.title}</Heading>
              <Subsection>{children}</Subsection>
            </div>
            {slots?.suffix && <div className="button-group">{slots.suffix}</div>}
          </div>
        </div>
      </pp-popup>
    );
  },

  Menu: ({ props, children }) => {
    const { trigger, list } = useMenuFocusHandoff(props.focusNext);
    // Without an icon there is nothing else to show, so the label shows.
    const iconOnly = Boolean(props.hideLabel && props.icon);
    return (
      <pp-dropdown
        hoist
        placement={props.align === 'end' ? 'bottom-end' : undefined}
        stay-open-on-select={props.multiple ?? false}
      >
        <button
          ref={trigger}
          type="button"
          className="button button--plain"
          data-slot="trigger"
          title={iconOnly ? props.label : undefined}
          data-focus-key={props.focusKey ?? undefined}
        >
          {props.icon && (
            <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />
          )}
          {iconOnly ? (
            <span className="visually-hidden">{props.label}</span>
          ) : (
            <>
              {props.label}
              <iconify-icon className="icon" icon="ik:chevron-down" aria-hidden="true" />
            </>
          )}
        </button>
        <pp-popup>
          <pp-list ref={list}>
            <MenuMultiple value={props.multiple ?? false}>{children}</MenuMultiple>
          </pp-list>
        </pp-popup>
      </pp-dropdown>
    );
  },

  // `disabled` goes in as a boolean: pp-list-item coerces by the type its
  // property holds, and `undefined` would stay as the string "undefined".
  MenuItem: ({ props, emit }) => (
    <pp-list-item
      type={useContext(MenuMultiple) ? 'checkbox' : 'radio'}
      checked={props.checked ?? false}
      disabled={props.disabled ?? false}
      onClick={() => !props.disabled && emit('press')}
    >
      {props.icon && (
        <iconify-icon
          data-slot="prefix"
          className="icon"
          icon={icons[props.icon]}
          aria-hidden="true"
        />
      )}
      {props.label}
    </pp-list-item>
  ),

  // Every close, whether from state, pp-modal or the browser, ends in the
  // dialog's close event, so the state and the focus fallback are settled
  // there. It fires once the page is not inert, so the demo can take focus.
  Dialog: ({ props, children, slots, bindings }) => {
    const { modal, titleId, onClose } = useModalWindow(
      props.open,
      bindings?.open,
      props.returnFocus,
    );
    const descriptionId = useId();
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
          <ModalHeader titleId={titleId} title={props.title} actions={slots?.suffix} />
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
  Drawer: ({ props, children, slots, bindings }) => {
    const { modal, titleId, onClose } = useModalWindow(
      props.open,
      bindings?.open,
      props.returnFocus,
    );
    return createPortal(
      <pp-modal ref={modal}>
        <dialog
          className="drawer drawer--right"
          data-modal="false"
          aria-labelledby={titleId}
          onClose={onClose}
        >
          <ModalHeader titleId={titleId} title={props.title} actions={slots?.suffix} />
          <div className="drawer__content flow">{children}</div>
        </dialog>
      </pp-modal>,
      document.body,
    );
  },

  // PpToast opens each toast itself, so the list renders nothing in place.
  Toasts: ({ props, bindings, emit }) => {
    usePpToasts(props.toasts, bindings?.toasts, bindings?.pressed, emit);
    return null;
  },
} satisfies Partial<Components<Catalog>>;
