import React from 'react';
import { Collapsible } from '@base-ui/react/collapsible';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@components/sidebar';
import { setPatternGraphHover } from '../lib/pattern-graph-hover';
import { useNavStore, useNavHydration, DEFAULT_PROJECTION } from '../lib/nav-store';
import { useActivePath, isActivePath } from '../lib/active-path';

type NavLeaf = { label: string; href: string };
type NavBranch = { label: string; children: NavTreeNode[] };
type NavTreeNode = NavLeaf | NavBranch;
type NavGroup = NavBranch;

interface NavProps {
  projections: Record<string, NavGroup[]>;
  projectionLabels: Record<string, string>;
  storybookUrl: string;
}

function isBranch(node: NavTreeNode): node is NavBranch {
  return 'children' in node;
}

interface NavNodeProps {
  node: NavTreeNode;
  currentPath: string;
  isOpen: (key: string) => boolean;
  setOpen: (key: string, open: boolean) => void;
  // Whether the persisted nav store has rehydrated from localStorage. Until it
  // has, every group renders closed so the first client render matches the
  // always-closed server HTML — otherwise the rehydrated singleton store (which
  // survives ClientRouter navigations) opens groups on the client before React
  // hydrates the swapped-in page, throwing a hydration mismatch.
  hydrated: boolean;
}

const Chevron = () =>
  React.createElement('iconify-icon', { icon: 'ph:caret-down', className: 'sidebar-collapsible-chevron' });

function NavNode({ node, currentPath, isOpen, setOpen, hydrated }: NavNodeProps) {
  if (isBranch(node)) {
    return (
      <SidebarMenuItem>
        <Collapsible.Root open={hydrated && isOpen(node.label)} onOpenChange={(open) => setOpen(node.label, open)}>
          <SidebarMenuButton
            render={<Collapsible.Trigger />}
            className="sidebar-collapsible-group-trigger"
            tooltip={node.label}
          >
            <Chevron />
            <span>{node.label}</span>
          </SidebarMenuButton>
          <Collapsible.Panel className="sidebar-collapsible-panel">
            <SidebarGroupContent className="sidebar-collapsible-group-content">
              <SidebarMenu>
                {node.children.map((child) => (
                  <NavNode
                    key={isBranch(child) ? child.label : child.href}
                    node={child}
                    currentPath={currentPath}
                    isOpen={isOpen}
                    setOpen={setOpen}
                    hydrated={hydrated}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </Collapsible.Panel>
        </Collapsible.Root>
      </SidebarMenuItem>
    );
  }
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<a href={node.href} />}
        isActive={isActivePath(node.href, currentPath)}
        tooltip={node.label}
      >
        {node.label}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// Announce which pattern the pointer is over, so the graph island on the home
// page can light up the matching node. Delegated rather than bound per item:
// two listeners instead of one per link, and `closest('a[href]')` naturally
// skips the collapsible group triggers, which are buttons and name no pattern.
// Off the home page nothing is listening, and the events are inert.
function onNavPointerOver(event: React.MouseEvent<HTMLElement>) {
  const link = (event.target as HTMLElement).closest('a[href]');
  setPatternGraphHover(link ? new URL(link.getAttribute('href')!, location.href).pathname : null);
}

// Open the Pagefind search modal. We call its open() method directly rather
// than relying on <pagefind-modal-trigger>, whose binding goes stale across
// View Transitions swaps. See Base.astro for the matching ⌘K hotkey.
function openSearch() {
  const modal = document.querySelector('pagefind-modal') as (HTMLElement & { open?: () => void }) | null;
  modal?.open?.();
}

// Reveal-when-scrolling-up, hide-when-scrolling-down. One capturing scroll
// listener on the document catches both the window (content pages scroll the
// document) and a pane-body (stack pages scroll internally) — scroll events
// don't bubble, but they still fire on the element and reach a capturing
// ancestor listener. Each scroll container tracks its own last position, so
// moving focus between panes never registers a phantom delta. The header lives
// in the persisted Nav island, so this binds once and survives ClientRouter
// swaps without re-attaching.
function useAutoHideOnScroll(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const header = ref.current;
    if (!header) return;

    const REVEAL_ZONE = 64; // always shown within this many px of the top
    const DELTA = 6; // ignore sub-pixel jitter
    const lastByTarget = new WeakMap<EventTarget, number>();

    let frame = 0;
    let pending: EventTarget | null = null;

    const update = () => {
      frame = 0;
      const target = pending;
      if (!target) return;
      const isDoc = target === document || target === document.documentElement;
      const y = isDoc ? window.scrollY : (target as HTMLElement).scrollTop;

      const last = lastByTarget.get(target);
      if (last === undefined) {
        // First time this scroller reports in: record a baseline, take no action
        // (a delta needs two samples). Still honour the reveal zone.
        lastByTarget.set(target, y);
        if (y <= REVEAL_ZONE) delete header.dataset.hidden;
        return;
      }
      if (y <= REVEAL_ZONE) {
        delete header.dataset.hidden;
        lastByTarget.set(target, y);
        return;
      }
      const dy = y - last;
      if (Math.abs(dy) < DELTA) return; // below threshold: let small moves accumulate
      lastByTarget.set(target, y);
      if (dy < 0) delete header.dataset.hidden;
      else header.dataset.hidden = '';
    };

    const onScroll = (e: Event) => {
      pending = e.target;
      if (!frame) frame = requestAnimationFrame(update);
    };

    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('scroll', onScroll, true);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
}

function SiteHeader() {
  const ref = React.useRef<HTMLElement>(null);
  useAutoHideOnScroll(ref);
  return (
    <header className="site-header" ref={ref}>
      <pp-tooltip content="Toggle sidebar (⌘/)" placement="right">
        <SidebarTrigger className="site-header-toggle" />
      </pp-tooltip>
      <pp-tooltip content="Search (⌘K)" placement="left">
        <button
          type="button"
          onClick={openSearch}
          className="button button--plain site-header-search"
        >
          {React.createElement('iconify-icon', { icon: 'ph:magnifying-glass', className: 'icon' })}
          <span className="visually-hidden">Search</span>
        </button>
      </pp-tooltip>
    </header>
  );
}

// A standard sidebar footer item that opens the house `pp-dropdown` of
// projections — the corpus organisation is one lens among several, so the
// *current* lens is always named on the trigger, not left implicit.
//
// The dropdown is gated on `hydrated`: pp-dropdown/pp-list/pp-list-item are web
// components that upgrade and mutate their own light DOM (adding role, tabindex,
// aria-*, generated ids) — if they were SSR'd, that mutation would race React's
// hydration and throw a mismatch. So the server and the first client render show
// only the static trigger button (identical markup, clean hydration); the
// dropdown mounts client-side afterwards, a normal mount rather than hydration.
// The trigger label and items' checked state read the same hydration-gated
// `active` the tree renders from. `hoist` lets the panel escape the sidebar's
// fixed/overflow container.
function ProjectionMenu({
  projectionLabels,
  active,
  onSelect,
  hydrated,
}: {
  projectionLabels: Record<string, string>;
  active: string;
  onSelect: (id: string) => void;
  hydrated: boolean;
}) {
  // Selection runs through React's onClick (updating the store), so pp-dropdown's
  // own pp-select-driven close doesn't fire — close it imperatively on select.
  const dropdownRef = React.useRef<(HTMLElement & { open?: boolean }) | null>(null);
  const trigger = (
    <SidebarMenuButton
      data-slot={hydrated ? 'trigger' : undefined}
      tooltip="Organise patterns"
      className="sidebar-projection-trigger"
    >
      <iconify-icon icon="ph:funnel-simple" />
      <span>{projectionLabels[active]}</span>
      <iconify-icon icon="ph:caret-up-down" className="sidebar-projection-caret" aria-hidden="true" />
    </SidebarMenuButton>
  );
  return (
    <SidebarMenuItem>
      {hydrated ? (
        <pp-dropdown ref={dropdownRef} placement="top-start" hoist>
          {trigger}
          <pp-popup>
            <pp-list>
              {Object.entries(projectionLabels).map(([id, label]) => (
                <pp-list-item
                  key={id}
                  type="radio"
                  checked={id === active}
                  onClick={() => {
                    onSelect(id);
                    if (dropdownRef.current) dropdownRef.current.open = false;
                  }}
                >
                  {label}
                </pp-list-item>
              ))}
            </pp-list>
          </pp-popup>
        </pp-dropdown>
      ) : (
        trigger
      )}
    </SidebarMenuItem>
  );
}

// The persistent sidebar island. `transition:persist`ed in Base.astro, so it
// hydrates once and survives ClientRouter swaps instead of re-hydrating per
// navigation. The page content is a static sibling (not a child) of this
// island; active-link state comes from the runtime URL via useActivePath, not a
// prop, since a persisted island never re-renders on navigation.
export function Nav({ projections, projectionLabels, storybookUrl }: NavProps) {
  const { isOpen, setOpen, projection, setProjection } = useNavStore();
  const hydrated = useNavHydration();
  const currentPath = useActivePath();

  // Until rehydration, render the *default* projection so the first client
  // render matches the server HTML (see the `hydrated` note on NavNodeProps);
  // then switch to the persisted one. Guard against a persisted id that points
  // at a since-removed projection by falling back to the default.
  const active =
    hydrated && projections[projection] ? projection : DEFAULT_PROJECTION;
  const activeItems = projections[active] ?? [];

  // Scope collapse state per projection so same-named groups in different
  // projections (e.g. Foundations) don't share open/closed state.
  const scopedIsOpen = (label: string) => isOpen(`${active}:${label}`);
  const scopedSetOpen = (label: string, open: boolean) => setOpen(`${active}:${label}`, open);

  return (
    <SidebarProvider renderWrapper={false}>
      <SiteHeader />
      <Sidebar collapsible="offcanvas">
        <SidebarContent
          onMouseOver={onNavPointerOver}
          onMouseLeave={() => setPatternGraphHover(null)}
        >
          <SidebarGroup>
            <h1 className="sidebar-logo">
              <a href="/">
                <i className="muted">pattern</i>
                <span className="sidebar-logo-suffix"> playground</span>
              </a>
            </h1>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href="/" />}
                  isActive={isActivePath('/', currentPath)}
                  tooltip="Introduction"
                >
                  <iconify-icon className="icon" icon="ph:house" />
                  Introduction
                </SidebarMenuButton>
              </SidebarMenuItem>
              {activeItems.map((group) => (
                <NavNode
                  key={group.label}
                  node={group}
                  currentPath={currentPath}
                  isOpen={scopedIsOpen}
                  setOpen={scopedSetOpen}
                  hydrated={hydrated}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <ProjectionMenu
              projectionLabels={projectionLabels}
              active={active}
              onSelect={setProjection}
              hydrated={hydrated}
            />
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<a href={storybookUrl} />}
                tooltip="Components (Storybook)"
              >
                {React.createElement('iconify-icon', { icon: 'ph:puzzle-piece' })}
                <span>Components</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
