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
import { useNavStore, useNavHydration, DEFAULT_GROUPING, ALL_PATTERNS } from '../lib/nav-store';
import { useActivePath, isActivePath } from '../lib/active-path';

import type { NavBranch, NavGrouping, NavLanguage, NavTree, NavTreeNode } from '../lib/nav-tree';
import { CONCEPTS_ENABLED, STORYBOOK_URL } from '../lib/site';

function isBranch(node: NavTreeNode): node is NavBranch {
  return 'children' in node;
}

// The nodes a project language keeps: the leaves whose path is a member, and
// each branch while any member remains in it. A family's overview is never a
// member itself, so it stays as long as its branch does.
function narrow(nodes: NavTreeNode[], members: Set<string>): NavTreeNode[] {
  return nodes.flatMap((node): NavTreeNode[] => {
    if (!isBranch(node)) return members.has(node.href) ? [node] : [];
    const overview = node.children.filter((child) => !isBranch(child) && child.overview);
    const rest = narrow(
      node.children.filter((child) => !overview.includes(child)),
      members,
    );
    return rest.length > 0 ? [{ ...node, children: [...overview, ...rest] }] : [];
  });
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
  // Collapse state is stored under the branch's label, prefixed by this. Groupings
  // other than A–Z prefix their branches with the grouping id and the path, so
  // the same branch label under two groupings keeps two states.
  keyPrefix?: string;
  // Overrides the prefix handed to the children (the Patterns branch scopes its
  // children by grouping while keeping its own key).
  childKeyPrefix?: string;
  // Muted text after the label (the Patterns branch names its grouping).
  note?: string;
  // A row at the head of the branch's panel, before its children (the Patterns
  // branch puts its arrangement menu here).
  lead?: React.ReactNode;
}

const Chevron = () =>
  React.createElement('iconify-icon', {
    icon: 'ik:chevron-small-down',
    className: 'sidebar-collapsible-chevron',
  });

function NavNode({
  node,
  currentPath,
  isOpen,
  setOpen,
  hydrated,
  keyPrefix = '',
  childKeyPrefix,
  lead,
}: NavNodeProps) {
  if (isBranch(node)) {
    const key = `${keyPrefix}${node.label}`;
    const childPrefix = childKeyPrefix ?? (keyPrefix ? `${key}/` : '');
    return (
      <SidebarMenuItem>
        <Collapsible.Root
          open={hydrated && isOpen(key)}
          onOpenChange={(open) => setOpen(key, open)}
        >
          <SidebarMenuButton
            render={<Collapsible.Trigger />}
            className="sidebar-collapsible-group-trigger"
            tooltip={node.label}
          >
            <Chevron />
            <span>
              {node.label}
            </span>
          </SidebarMenuButton>
          <Collapsible.Panel className="sidebar-collapsible-panel">
            <SidebarGroupContent className="sidebar-collapsible-group-content">
              <SidebarMenu>
                {lead && <SidebarMenuItem>{lead}</SidebarMenuItem>}
                {node.children.map((child) => (
                  <NavNode
                    key={isBranch(child) ? child.label : child.href}
                    node={child}
                    currentPath={currentPath}
                    isOpen={isOpen}
                    setOpen={setOpen}
                    hydrated={hydrated}
                    keyPrefix={childPrefix}
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
  const modal = document.querySelector('pagefind-modal') as
    (HTMLElement & { open?: () => void }) | null;
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

// The menu at the head of the Patterns branch, so it reads as arranging that
// list only. Its row names the active language and grouping. It picks the project language the list is narrowed to and the grouping
// it is arranged by, and links to the active language's page.
//
// The dropdown is gated on `hydrated`: pp-dropdown, pp-list and pp-list-item
// upgrade and mutate their own light DOM (role, tabindex, aria-*, generated
// ids), which would race React's hydration if they were SSR'd. The server and
// the first client render show only the trigger; the dropdown mounts after.
// `hoist` lets the panel escape the sidebar's overflow container. The row
// carries no tooltip, which would wrap it and hide it from pp-dropdown's
// trigger lookup.
function PatternsMenu({
  languages,
  activeLanguage,
  onSelectLanguage,
  groupings,
  activeGrouping,
  onSelectGrouping,
  hydrated,
}: {
  languages: NavLanguage[];
  activeLanguage: NavLanguage | undefined;
  onSelectLanguage: (id: string) => void;
  groupings: NavGrouping[];
  activeGrouping: string;
  onSelectGrouping: (id: string) => void;
  hydrated: boolean;
}) {
  // Selection runs through React's onClick, so pp-dropdown's own
  // pp-select-driven close doesn't fire; close it on select.
  const dropdownRef = React.useRef<(HTMLElement & { open?: boolean }) | null>(null);
  const close = () => {
    if (dropdownRef.current) dropdownRef.current.open = false;
  };
  const trigger = (
    <SidebarMenuButton data-slot={hydrated ? 'trigger' : undefined}>
      <iconify-icon className="icon" icon="ik:library-list" />
      <span>
        <span className="visually-hidden">Arrange patterns: </span>
        {activeLanguage?.label ?? 'All'}
      </span>
    </SidebarMenuButton>
  );
  if (!hydrated) return trigger;
  // Radio state is controlled here, so the two groups sharing one list stay apart.
  const radio = (key: string, label: string, checked: boolean, select: () => void) => (
    <pp-list-item
      key={key}
      type="radio"
      checked={checked}
      onClick={() => {
        select();
        close();
      }}
    >
      {label}
    </pp-list-item>
  );
  return (
    <pp-dropdown ref={dropdownRef} placement="bottom-start" hoist>
      {trigger}
      <pp-popup>
        <pp-list>
          {languages.length > 0 && (
            <>
              <pp-list-label>Language</pp-list-label>
              {radio('all', 'Default', !activeLanguage, () => onSelectLanguage(ALL_PATTERNS))}
              {languages.map(({ id, label }) =>
                radio(id, label, id === activeLanguage?.id, () => onSelectLanguage(id)),
              )}
              <hr />
            </>
          )}
          <pp-list-label>Sort by</pp-list-label>
          {groupings.map(({ id, label }) =>
            radio(id, label, id === activeGrouping, () => onSelectGrouping(id)),
          )}
        </pp-list>
      </pp-popup>
    </pp-dropdown>
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

function CornerLink({
  href,
  icon,
  label,
  external,
}: {
  href: string;
  icon: string;
  label: string;
  external?: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<a href={href} />} tooltip={label}>
        {React.createElement('iconify-icon', { icon })}
        <span>{label}</span>
        {external &&
          React.createElement('iconify-icon', {
            icon: 'ik:open-in-new-window',
            className: 'muted',
          })}
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
export function Nav({
  shared,
  patterns,
  sequences,
  concepts,
  languages,
  corner = 'patterns',
}: NavProps) {
  const { isOpen, setOpen, grouping, setGrouping, language, setLanguage } = useNavStore();
  const hydrated = useNavHydration();
  const currentPath = useActivePath();
  const { word, home, homeLabel } = CORNER[corner];

  // Until rehydration, render the default grouping so the first client render
  // matches the server HTML (see `hydrated` on NavNodeProps); a persisted id
  // naming a grouping that no longer exists falls back to the default too.
  const { groupings } = patterns;
  const active =
    groupings.find((g) => hydrated && g.id === grouping) ??
    groupings.find((g) => g.id === DEFAULT_GROUPING)!;
  // The same holds for the language: all patterns until rehydration, and for an
  // id that names no language. Only the pattern list narrows.
  const activeLanguage = hydrated ? languages.find((l) => l.id === language) : undefined;
  const patternsBranch: NavBranch = {
    label: patterns.label,
    children: activeLanguage
      ? narrow(active.children, new Set(activeLanguage.members))
      : active.children,
  };
  const groups: NavTreeNode[] =
    corner === 'concepts' ? [concepts] : [...shared, sequences, patternsBranch];
  // The trigger names whatever differs from the default arrangement.
  const note =
    [activeLanguage?.label, active.id === DEFAULT_GROUPING ? undefined : active.label]
      .filter(Boolean)
      .join(' · ') || undefined;

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
                  <iconify-icon className="icon" icon="ik:search" />
                  Search
                  <span className="muted" aria-hidden="true">
                    <kbd>⌘</kbd>
                    <kbd>K</kbd>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href={home} />}
                  isActive={isActivePath(home, currentPath)}
                  tooltip={homeLabel}
                >
                  <iconify-icon className="icon" icon="ik:house" />
                  {homeLabel}
                </SidebarMenuButton>
              </SidebarMenuItem>
              {groups
                .filter((group) => isBranch(group) && group.children.length > 0)
                .map((group) =>
                  group === patternsBranch ? (
                    <NavNode
                      key={group.label}
                      node={group}
                      currentPath={currentPath}
                      isOpen={isOpen}
                      setOpen={setOpen}
                      hydrated={hydrated}
                      // A–Z keeps the collapse keys it had before groupings existed.
                      childKeyPrefix={active.id === DEFAULT_GROUPING ? '' : `${active.id}:`}
                      note={note}
                      lead={
                        <PatternsMenu
                          languages={languages}
                          activeLanguage={activeLanguage}
                          onSelectLanguage={setLanguage}
                          groupings={groupings}
                          activeGrouping={active.id}
                          onSelectGrouping={setGrouping}
                          hydrated={hydrated}
                        />
                      }
                    />
                  ) : (
                    <NavNode
                      key={group.label}
                      node={group}
                      currentPath={currentPath}
                      isOpen={isOpen}
                      setOpen={setOpen}
                      hydrated={hydrated}
                    />
                  ),
                )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        {/* The other two corners. Patterns and concepts are in-site; components
            are the Storybook catalogue, so that one leaves the site. */}
        <SidebarFooter>
          <SidebarMenu>
            {corner !== 'patterns' && <CornerLink href="/" icon="ik:sitemap" label="Patterns" />}
            {CONCEPTS_ENABLED && corner !== 'concepts' && (
              <CornerLink href="/concepts" icon="ik:base-shapes" label="Concepts" />
            )}
            <CornerLink href={STORYBOOK_URL} icon="ik:puzzle" label="Components" external />
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
