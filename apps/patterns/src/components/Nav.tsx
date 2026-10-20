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
import { useNavStore, useNavHydration } from '../lib/nav-store';
import { useActivePath, isActivePath } from '../lib/active-path';

import type { NavBranch, NavTree, NavTreeNode } from '../lib/nav-tree';
import { CONCEPTS_ENABLED, STORYBOOK_URL } from '../lib/site';

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

// Hydration-gated: on connect pp-tooltip appends the pp-popup it owns and reflects its props as attributes, all in its
// own light DOM. register-all.ts upgrades it before the island hydrates, so an
// SSR'd tooltip hands React a subtree that no longer matches the server HTML.
// Server and first client render show the bare trigger; the tooltip wrapper
// mounts after hydration, where the mutation is nobody's business but its own.
function HeaderTip({
  hydrated,
  content,
  placement,
  children,
}: {
  hydrated: boolean;
  content: string;
  placement: 'right';
  children: React.ReactElement;
}) {
  if (!hydrated) return children;
  return (
    <pp-tooltip content={content} placement={placement}>
      {children}
    </pp-tooltip>
  );
}

function SiteHeader({ hydrated }: { hydrated: boolean }) {
  return (
    <header className="site-header">
      <HeaderTip hydrated={hydrated} content="Toggle sidebar (⌘/)" placement="right">
        <SidebarTrigger className="site-header-toggle" />
      </HeaderTip>
    </header>
  );
}

// The site has two corners, each with its own sidebar: the pattern language
// (the default) and the concept catalogue, a parallel catalogue reached from
// the language's footer the way the component catalogue is. Each corner's
// footer points at the other two.
export type NavCorner = 'patterns' | 'concepts';

interface NavProps extends NavTree {
  corner?: NavCorner;
}

const CORNER = {
  patterns: { word: 'pattern', home: '/', homeLabel: 'Introduction' },
  concepts: { word: 'concept', home: '/concepts', homeLabel: 'Overview' },
} as const;

function CornerLink({ href, icon, label, external }: { href: string; icon: string; label: string; external?: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<a href={href} />} tooltip={label}>
        {React.createElement('iconify-icon', { icon })}
        <span>{label}</span>
        {external && React.createElement('iconify-icon', { icon: 'ph:arrow-square-out', className: 'muted' })}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// The persistent sidebar island. `transition:persist`ed in Base.astro under a
// key per corner, so it hydrates once per corner and survives ClientRouter
// swaps within it instead of re-hydrating per navigation. The page content is
// a static sibling (not a child) of this island; active-link state comes from
// the runtime URL via useActivePath, not a prop, since a persisted island
// never re-renders on navigation.
export function Nav({ shared, patterns, sequences, concepts, corner = 'patterns' }: NavProps) {
  const { isOpen, setOpen } = useNavStore();
  const hydrated = useNavHydration();
  const currentPath = useActivePath();
  const { word, home, homeLabel } = CORNER[corner];
  const groups: NavTreeNode[] =
    corner === 'concepts' ? [concepts] : [...shared, sequences, patterns];

  return (
    <SidebarProvider renderWrapper={false}>
      <SiteHeader hydrated={hydrated} />
      <Sidebar collapsible="offcanvas">
        <SidebarContent
          onMouseOver={onNavPointerOver}
          onMouseLeave={() => setPatternGraphHover(null)}
        >
          <div className="sidebar-top">
            <HeaderTip hydrated={hydrated} content="Toggle sidebar (⌘/)" placement="right">
              <SidebarTrigger />
            </HeaderTip>
          </div>
          <SidebarGroup>
            <h1 className="sidebar-logo">
              <a href={home}>
                <i className="muted">{word}</i>
                <span className="sidebar-logo-suffix"> playground</span>
              </a>
            </h1>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<button type="button" onClick={openSearch} />}
                  tooltip="Search"
                >
                  <iconify-icon className="icon" icon="ph:magnifying-glass" />
                  Search
                  <span className="muted" aria-hidden="true">
                    <kbd>⌘</kbd><kbd>K</kbd>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href={home} />}
                  isActive={isActivePath(home, currentPath)}
                  tooltip={homeLabel}
                >
                  <iconify-icon className="icon" icon="ph:house" />
                  {homeLabel}
                </SidebarMenuButton>
              </SidebarMenuItem>
              {groups.filter((group) => isBranch(group) && group.children.length > 0).map((group) => (
                <NavNode
                  key={group.label}
                  node={group}
                  currentPath={currentPath}
                  isOpen={isOpen}
                  setOpen={setOpen}
                  hydrated={hydrated}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        {/* The other two corners. Patterns and concepts are in-site; components
            are the Storybook catalogue, so that one leaves the site. */}
        <SidebarFooter>
          <SidebarMenu>
            {corner !== 'patterns' && <CornerLink href="/" icon="ph:tree-structure" label="Patterns" />}
            {CONCEPTS_ENABLED && corner !== 'concepts' && <CornerLink href="/concepts" icon="ph:shapes" label="Concepts" />}
            <CornerLink href={STORYBOOK_URL} icon="ph:puzzle-piece" label="Components" external />
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
