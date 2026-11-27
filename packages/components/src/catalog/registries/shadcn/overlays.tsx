import { useContext, useRef } from 'react';
import { useBoundProp, type Components } from '@json-render/react';
import { createPortal } from 'react-dom';
import { Dialog, DropdownMenu, Popover, Toast } from 'radix-ui';
import { cn } from './cn';
import { Checkmark, ChevronDown, Cross } from 'iconoteka-react';
import { toastDuration, type Catalog } from '../../catalog';
import { captureOpener, settleFocus, type Opener } from '../../behaviour/dialog-focus';
import { useMenuFocusHandoff } from '../../behaviour/focus-handoff';
import { scopedPortal } from './portal';
import { menuCheckItem, menuContent, menuIndicator, popoverSurface } from './parts';
import { Subsection, useHeading } from '../../behaviour/heading-level';
import { MenuMultiple } from '../../behaviour/menu-multiple';
import { popoverHost, useMayTakeFocus } from '../../behaviour/popover-host';
import { usePreview } from '../../../components/item-view/use-preview';
import { useToastList } from '../../behaviour/toast-list';
import { icons } from './icons';
import { buttonBase, buttonSize, buttonVariant } from './classes';
import { useWindowFocus } from './window-focus';

// The close button of a Dialog or a Sheet: a ghost icon-sm Button.
const closeButton = cn(buttonBase, buttonVariant.plain, buttonSize['icon-sm']);

export const overlays = {
  // A Popover with HoverCard's surface, so preview.ts sets the open and
  // close timing rather than HoverCard.
  Reference: ({ props, children, slots, bindings, emit }) => {
    const [shown, setShown] = useBoundProp(props.preview, bindings?.preview);
    const { triggerRef, contentRef, trigger, content, close } = usePreview(
      shown ?? false,
      setShown,
      props.expanded ?? false,
    );
    const Heading = useHeading();
    const Glyph = props.icon ? icons[props.icon] : null;
    return (
      <Popover.Root open={shown ?? false} onOpenChange={(open) => !open && close()}>
        <Popover.Anchor asChild>
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={props.expanded ?? false}
            data-focus-key={props.focusKey ?? undefined}
            {...trigger}
            onClick={() => {
              close();
              emit('open');
            }}
            className="cursor-pointer rounded-sm bg-primary/10 px-1 font-medium text-primary outline-none hover:bg-primary/15 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {props.label}
          </button>
        </Popover.Anchor>
        <Popover.Portal container={scopedPortal()}>
          <Popover.Content
            ref={contentRef}
            aria-label={props.label}
            align="start"
            sideOffset={8}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            // The reference is the anchor, not a Radix trigger, so focus
            // moving back to it would count as leaving.
            onFocusOutside={(event) => {
              if (triggerRef.current?.contains(event.target as Node)) event.preventDefault();
            }}
            {...content}
            className={cn(popoverSurface, 'w-72')}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2.5">
                <Heading
                  className={cn('leading-snug font-medium', Glyph && 'flex items-center gap-2')}
                >
                  {Glyph && (
                    <Glyph aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  {props.label}
                </Heading>
                <Subsection>{children}</Subsection>
              </div>
              {slots?.suffix && (
                <div className="-mt-1.5 -mr-1.5 flex shrink-0 gap-1">{slots.suffix}</div>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },

  // Anchored to its host (popover-host.ts), found from a hidden marker and
  // given to Radix as a virtual anchor.
  Popover: ({ props, children, slots, bindings }) => {
    const [open, setOpen] = useBoundProp(props.open, bindings?.open);
    const marker = useRef<HTMLSpanElement>(null);
    const anchor = useRef({
      getBoundingClientRect: () =>
        popoverHost(marker.current)?.getBoundingClientRect() ?? new DOMRect(),
    });
    const opener = useRef<Opener | null>(null);
    const mayTakeFocus = useMayTakeFocus();
    const Heading = useHeading();
    return (
      <Popover.Root open={open ?? false} onOpenChange={setOpen}>
        <span ref={marker} hidden />
        <Popover.Anchor virtualRef={anchor} />
        <Popover.Portal container={scopedPortal()}>
          <Popover.Content
            aria-label={props.title}
            align="start"
            sideOffset={8}
            onOpenAutoFocus={(event) => {
              opener.current = captureOpener();
              if (!mayTakeFocus(marker.current)) event.preventDefault();
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              const active = document.activeElement;
              if (!active || active === document.body) settleFocus(null, opener.current);
              opener.current = null;
            }}
            className={cn(popoverSurface, 'w-80 max-w-[calc(100vw-2rem)]')}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2.5">
                <Heading className="leading-snug font-medium">{props.title}</Heading>
                <Subsection>{children}</Subsection>
              </div>
              {slots?.suffix && (
                <div className="-mt-1.5 -mr-1.5 flex shrink-0 gap-1">{slots.suffix}</div>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },

  Menu: ({ props, children }) => {
    const Icon = props.icon ? icons[props.icon] : null;
    const { trigger, list, closed } = useMenuFocusHandoff(props.focusNext);
    // Without an icon there is nothing else to show, so the label shows.
    const iconOnly = Boolean(props.hideLabel && Icon);
    return (
      <DropdownMenu.Root onOpenChange={(open) => !open && closed()}>
        <DropdownMenu.Trigger
          ref={trigger}
          aria-label={iconOnly ? props.label : undefined}
          title={iconOnly ? props.label : undefined}
          data-focus-key={props.focusKey ?? undefined}
          className={cn(buttonBase, buttonVariant.plain, buttonSize[iconOnly ? 'icon' : 'default'])}
        >
          {Icon && <Icon aria-hidden="true" data-icon={iconOnly ? undefined : 'inline-start'} />}
          {!iconOnly && (
            <>
              {props.label}
              <ChevronDown aria-hidden="true" data-icon="inline-end" />
            </>
          )}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal container={scopedPortal()}>
          <DropdownMenu.Content
            ref={list}
            align={props.align ?? 'start'}
            sideOffset={4}
            className={menuContent}
          >
            <MenuMultiple value={props.multiple ?? false}>{children}</MenuMultiple>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  },

  // A checkbox item in the role of a radio item: Radix's radio items take
  // their state from a group value, and here each item says for itself
  // whether it is the one in force. Nova ticks both kinds on the right.
  MenuItem: ({ props, emit }) => {
    const Icon = props.icon ? icons[props.icon] : null;
    const multiple = useContext(MenuMultiple);
    return (
      <DropdownMenu.CheckboxItem
        role={multiple ? undefined : 'menuitemradio'}
        checked={props.checked ?? false}
        disabled={props.disabled ?? undefined}
        onSelect={(event) => {
          if (multiple) event.preventDefault();
          void emit('press');
        }}
        className={menuCheckItem}
      >
        {Icon && <Icon aria-hidden="true" className="text-muted-foreground" />}
        {props.label}
        <span className={menuIndicator}>
          <DropdownMenu.ItemIndicator>
            <Checkmark aria-hidden="true" />
          </DropdownMenu.ItemIndicator>
        </span>
      </DropdownMenu.CheckboxItem>
    );
  },

  Dialog: ({ props, children, slots, bindings }) => {
    const [open, setOpen] = useBoundProp(props.open, bindings?.open);
    const { opened, onCloseAutoFocus } = useWindowFocus(props.returnFocus);
    return (
      <Dialog.Root open={open ?? false} onOpenChange={setOpen}>
        <Dialog.Portal container={scopedPortal()}>
          <Dialog.Overlay className="fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs" />
          <Dialog.Content
            // Radix links a Dialog.Description itself; without one it wants
            // aria-describedby set to undefined explicitly.
            {...(props.description ? {} : { 'aria-describedby': undefined })}
            role={props.alert ? 'alertdialog' : 'dialog'}
            onInteractOutside={props.alert ? (event) => event.preventDefault() : undefined}
            onOpenAutoFocus={(event) => {
              opened();
              const marked = (
                event.currentTarget as HTMLElement | null
              )?.querySelector<HTMLElement>('[data-autofocus]');
              if (!marked) return;
              event.preventDefault();
              marked.focus();
            }}
            onCloseAutoFocus={onCloseAutoFocus}
            className="fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none sm:max-w-sm"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 pr-6">
                <Dialog.Title className="flex-1 text-base leading-none font-medium">
                  {props.title}
                </Dialog.Title>
                {slots?.suffix && <div className="-my-2 flex shrink-0 gap-1">{slots.suffix}</div>}
              </div>
              {props.description && (
                <Dialog.Description className="text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground">
                  {props.description}
                </Dialog.Description>
              )}
            </div>
            <div className="flex flex-col gap-4">{children}</div>
            {slots?.actions && (
              <div className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
                {slots.actions}
              </div>
            )}
            <Dialog.Close className={cn(closeButton, 'absolute top-2 right-2')}>
              <Cross aria-hidden="true" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },

  // shadcn/ui Sheet (side="right"), non-modal so the actor keeps editing the
  // rule beside it. shadcn's own Drawer is a bottom sheet.
  Drawer: ({ props, children, slots, bindings }) => {
    const [open, setOpen] = useBoundProp(props.open, bindings?.open);
    const { opened, onCloseAutoFocus } = useWindowFocus(props.returnFocus);
    return (
      <Dialog.Root open={open ?? false} onOpenChange={setOpen} modal={false}>
        <Dialog.Portal container={scopedPortal()}>
          <Dialog.Content
            aria-describedby={undefined}
            onInteractOutside={(event) => event.preventDefault()}
            onOpenAutoFocus={opened}
            onCloseAutoFocus={onCloseAutoFocus}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col gap-4 border-l bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg sm:max-w-sm"
          >
            <div className="flex items-center gap-2 p-4 pr-10">
              <Dialog.Title className="flex-1 text-base font-medium text-foreground">
                {props.title}
              </Dialog.Title>
              {slots?.suffix && <div className="-my-2 flex shrink-0 gap-1">{slots.suffix}</div>}
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">{children}</div>
            <Dialog.Close className={cn(closeButton, 'absolute top-3 right-3')}>
              <Cross aria-hidden="true" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },

  Toasts: ({ props, bindings, emit }) => {
    const { dismiss, press } = useToastList(bindings?.toasts, bindings?.pressed, emit);
    return (
      <Toast.Provider swipeDirection="right" label="Notifications">
        {props.toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            duration={toast.actionLabel ? toastDuration.withAction : toastDuration.plain}
            onOpenChange={(open) => {
              if (!open) dismiss(toast.id);
            }}
            className="group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-lg bg-popover p-4 pr-8 text-popover-foreground shadow-lg ring-1 ring-foreground/10 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)"
          >
            <Toast.Description className="text-sm">{toast.message}</Toast.Description>
            {toast.actionLabel && (
              <Toast.Action
                altText={toast.actionLabel}
                onClick={() => void press(toast)}
                className={cn(buttonBase, buttonVariant.default, buttonSize.sm)}
              >
                {toast.actionLabel}
              </Toast.Action>
            )}
            <Toast.Close
              aria-label="Close"
              className="absolute top-1 right-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity outline-none group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Cross aria-hidden="true" className="size-4" />
            </Toast.Close>
          </Toast.Root>
        ))}
        {createPortal(
          <Toast.Viewport className="fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse gap-2 p-4 outline-none sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]" />,
          scopedPortal(),
        )}
      </Toast.Provider>
    );
  },
} satisfies Partial<Components<Catalog>>;
