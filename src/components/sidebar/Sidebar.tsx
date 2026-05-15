import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Tooltip } from '@base-ui/react/tooltip';
import { useRender } from '@base-ui/react/use-render';
import clsx from 'clsx';
import { useIsMobile } from '../../hooks/use-is-mobile';

export const SIDEBAR_COOKIE_NAME = 'sidebar_state';
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = '16rem';
export const SIDEBAR_WIDTH_MOBILE = '18rem';
export const SIDEBAR_WIDTH_ICON = '3rem';
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SidebarContextValue {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider.');
  return ctx;
}

// ---------------------------------------------------------------------------
// SidebarProvider
// ---------------------------------------------------------------------------

export interface SidebarProviderProps extends React.ComponentProps<'div'> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [_open, _setOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);

  const open = openProp ?? _open;

  const setOpen = useCallback(
    (value: boolean) => {
      if (openProp === undefined) _setOpen(value);
      onOpenChange?.(value);
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [openProp, onOpenChange],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile((v) => !v);
    } else {
      setOpen(!open);
    }
  }, [isMobile, open, setOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleSidebar]);

  const state: 'expanded' | 'collapsed' = open ? 'expanded' : 'collapsed';

  const value = useMemo<SidebarContextValue>(
    () => ({ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }),
    [state, open, setOpen, openMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <Tooltip.Provider delay={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={clsx('sidebar-wrapper', className)}
          {...props}
        >
          {children}
        </div>
      </Tooltip.Provider>
    </SidebarContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export interface SidebarProps extends React.ComponentProps<'div'> {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}

export function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Dialog.Root open={openMobile} onOpenChange={(open) => setOpenMobile(open)}>
        <Dialog.Portal>
          <Dialog.Backdrop data-slot="sidebar-mobile-backdrop" className="sidebar-mobile-backdrop" />
          <Dialog.Popup
            data-slot="sidebar"
            data-sidebar="sidebar"
            data-mobile="true"
            data-side={side}
            // eslint-disable-next-line react/forbid-component-props -- CSS variable scoping for mobile width, see plans/tech-debt-tracker.md
            style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
            className={clsx('sidebar sidebar-mobile', className)}
            {...props}
          >
            <Dialog.Title className="inclusively-hidden">Navigation sidebar</Dialog.Title>
            <Dialog.Description className="inclusively-hidden">
              Site navigation
            </Dialog.Description>
            <div data-slot="sidebar-inner" className="sidebar__inner">
              {children}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <div
      data-slot="sidebar"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      className={clsx('sidebar', className)}
    >
      <div data-slot="sidebar-gap" className="sidebar__gap" />
      <div
        data-slot="sidebar-container"
        data-sidebar="sidebar"
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-variant={variant}
        data-side={side}
        className="sidebar__container"
        {...props}
      >
        <div data-slot="sidebar-inner" className="sidebar__inner">
          {children}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SidebarTrigger
// ---------------------------------------------------------------------------

export function SidebarTrigger({
  onClick,
  className,
  children,
  ...props
}: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      is="pp-button"
      data-slot="sidebar-trigger"
      data-sidebar="trigger"
      className={clsx('button button--plain sidebar-trigger', className)}
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      {...props}
    >
      {children ?? (
        <>
          <iconify-icon className="icon" icon="ph:sidebar-simple" />
          <span className="inclusively-hidden">Toggle Sidebar</span>
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// SidebarRail
// ---------------------------------------------------------------------------

export function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      data-slot="sidebar-rail"
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={clsx('sidebar-rail', className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SidebarInset
// ---------------------------------------------------------------------------

export function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={clsx('sidebar-inset', className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SidebarInput
// ---------------------------------------------------------------------------

export function SidebarInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={clsx('sidebar-input', className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SidebarHeader / SidebarFooter / SidebarContent / SidebarSeparator
// ---------------------------------------------------------------------------

export function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={clsx('sidebar-header', className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={clsx('sidebar-footer', className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={clsx('sidebar-content', className)}
      {...props}
    />
  );
}

export function SidebarSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="separator"
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={clsx('sidebar-separator', className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SidebarGroup / SidebarGroupLabel / SidebarGroupAction / SidebarGroupContent
// ---------------------------------------------------------------------------

export function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={clsx('sidebar-group', className)}
      {...props}
    />
  );
}

export interface SidebarGroupLabelProps extends Omit<React.ComponentProps<'span'>, 'render'> {
  render?: useRender.RenderProp;
  asChild?: boolean;
}

export function SidebarGroupLabel({ render, className, ...props }: SidebarGroupLabelProps) {
  return useRender({
    render,
    state: {},
    props: {
      'data-slot': 'sidebar-group-label',
      'data-sidebar': 'group-label',
      className: clsx('sidebar-group-label', className),
      ...props,
    },
    defaultTagName: 'span',
  });
}

export interface SidebarGroupActionProps extends Omit<React.ComponentProps<'button'>, 'render'> {
  render?: useRender.RenderProp;
  showOnHover?: boolean;
}

export function SidebarGroupAction({
  render,
  showOnHover = false,
  className,
  ...props
}: SidebarGroupActionProps) {
  return useRender({
    render,
    state: {},
    props: {
      'data-slot': 'sidebar-group-action',
      'data-sidebar': 'group-action',
      ...(showOnHover ? { 'data-show-on-hover': '' } : {}),
      className: clsx('sidebar-group-action', className),
      ...props,
    },
    defaultTagName: 'button',
  });
}

export function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={clsx('sidebar-group-content', className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SidebarMenu / SidebarMenuItem
// ---------------------------------------------------------------------------

export function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={clsx('sidebar-menu', className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={clsx('sidebar-menu-item', className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SidebarMenuButton
// ---------------------------------------------------------------------------

type TooltipContent = { children: React.ReactNode } | string;

export interface SidebarMenuButtonProps extends Omit<React.ComponentProps<'button'>, 'render'> {
  render?: React.ReactElement;
  isActive?: boolean;
  size?: 'default' | 'sm' | 'lg';
  tooltip?: TooltipContent;
}

export function SidebarMenuButton({
  render,
  tooltip,
  isActive = false,
  size = 'default',
  className,
  ...props
}: SidebarMenuButtonProps) {
  const { isMobile, state } = useSidebar();

  const element = useRender({
    render: tooltip ? <Tooltip.Trigger render={render} /> : render,
    state: {},
    props: {
      'data-slot': 'sidebar-menu-button',
      'data-sidebar': 'menu-button',
      ...(isActive ? { 'data-active': '' } : {}),
      'data-size': size,
      className: clsx('sidebar-menu-button', className),
      ...props,
    },
    defaultTagName: 'button',
  });

  if (!tooltip) return element;

  const tooltipContent = typeof tooltip === 'string' ? tooltip : tooltip.children;
  const tooltipHidden = state !== 'collapsed' || isMobile;

  return (
    <Tooltip.Root>
      {element}
      <Tooltip.Portal>
        <Tooltip.Positioner side="right" align="center">
          <Tooltip.Popup
            hidden={tooltipHidden}
            className="sidebar-tooltip-popup"
          >
            {tooltipContent}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

// ---------------------------------------------------------------------------
// SidebarMenuAction
// ---------------------------------------------------------------------------

export interface SidebarMenuActionProps extends Omit<React.ComponentProps<'button'>, 'render'> {
  render?: useRender.RenderProp;
  showOnHover?: boolean;
}

export function SidebarMenuAction({
  render,
  showOnHover = false,
  className,
  ...props
}: SidebarMenuActionProps) {
  return useRender({
    render,
    state: {},
    props: {
      'data-slot': 'sidebar-menu-action',
      'data-sidebar': 'menu-action',
      ...(showOnHover ? { 'data-show-on-hover': '' } : {}),
      className: clsx('sidebar-menu-action', className),
      ...props,
    },
    defaultTagName: 'button',
  });
}

// ---------------------------------------------------------------------------
// SidebarMenuBadge
// ---------------------------------------------------------------------------

export function SidebarMenuBadge({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={clsx('sidebar-menu-badge', className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SidebarMenuSkeleton
// ---------------------------------------------------------------------------

export interface SidebarMenuSkeletonProps extends React.ComponentProps<'div'> {
  showIcon?: boolean;
}

export function SidebarMenuSkeleton({
  showIcon = false,
  className,
  ...props
}: SidebarMenuSkeletonProps) {
  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={clsx('sidebar-menu-skeleton', className)}
      {...props}
    >
      {showIcon && <div className="sidebar-skeleton-icon" aria-hidden="true" />}
      <div className="sidebar-skeleton-bar" aria-hidden="true" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SidebarMenuSub / SidebarMenuSubItem / SidebarMenuSubButton
// ---------------------------------------------------------------------------

export function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={clsx('sidebar-menu-sub', className)}
      {...props}
    />
  );
}

export function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={clsx('sidebar-menu-sub-item', className)}
      {...props}
    />
  );
}

export interface SidebarMenuSubButtonProps extends Omit<React.ComponentProps<'a'>, 'render'> {
  render?: useRender.RenderProp;
  size?: 'sm' | 'md';
  isActive?: boolean;
}

export function SidebarMenuSubButton({
  render,
  size = 'md',
  isActive = false,
  className,
  ...props
}: SidebarMenuSubButtonProps) {
  return useRender({
    render,
    state: {},
    props: {
      'data-slot': 'sidebar-menu-sub-button',
      'data-sidebar': 'menu-sub-button',
      ...(isActive ? { 'data-active': '' } : {}),
      'data-size': size,
      className: clsx('sidebar-menu-sub-button', className),
      ...props,
    },
    defaultTagName: 'a',
  });
}
