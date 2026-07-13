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
  useSidebar,
} from '@components/sidebar';
import { useNavStore, useNavHydration } from '../lib/nav-store';
import { useActivePath, isActivePath } from '../lib/active-path';

type NavLeaf = { label: string; href: string };
type NavBranch = { label: string; children: NavTreeNode[] };
type NavTreeNode = NavLeaf | NavBranch;
type NavGroup = NavBranch;

interface NavProps {
  navItems: NavGroup[];
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
          <Collapsible.Panel>
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

// Open the Pagefind search modal. We call its open() method directly rather
// than relying on <pagefind-modal-trigger>, whose binding goes stale across
// View Transitions swaps. See Base.astro for the matching ⌘K hotkey.
function openSearch() {
  const modal = document.querySelector('pagefind-modal') as (HTMLElement & { open?: () => void }) | null;
  modal?.open?.();
}

// Toggles the sidebar's own visibility. A child of SidebarProvider (unlike
// Nav itself) so it can reach useSidebar().
function SidebarHideTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <SidebarMenuButton
      render={<button type="button" onClick={toggleSidebar} />}
      className="sidebar-search"
      tooltip="Hide navigation"
    >
      {React.createElement('iconify-icon', { icon: 'ph:sidebar-simple' })}
      <span><kbd className="sidebar-search-kbd muted">⌘</kbd><kbd className="sidebar-search-kbd muted">/</kbd></span>
    </SidebarMenuButton>
  );
}

// Reopens the sidebar once collapsible="offcanvas" has taken it fully
// off-screen — SidebarHideTrigger disappears along with the panel, so this
// lives outside it. Desktop-only: the mobile drawer already has its own
// always-rendered, CSS-media-gated trigger (.sidebar-mobile-trigger) that
// paints correctly server-side, which a state-gated one couldn't.
function SidebarShowTrigger() {
  const { state, isMobile } = useSidebar();
  if (isMobile || state !== 'collapsed') return null;
  return <SidebarTrigger className="sidebar-desktop-trigger" aria-label="Show navigation" />;
}

// The persistent sidebar island. `transition:persist`ed in Base.astro, so it
// hydrates once and survives ClientRouter swaps instead of re-hydrating per
// navigation. The page content is a static sibling (not a child) of this
// island; active-link state comes from the runtime URL via useActivePath, not a
// prop, since a persisted island never re-renders on navigation.
export function Nav({ navItems, storybookUrl }: NavProps) {
  const { isOpen, setOpen } = useNavStore();
  const hydrated = useNavHydration();
  const currentPath = useActivePath();
  return (
    <SidebarProvider renderWrapper={false}>
      <Sidebar collapsible="offcanvas">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarHideTrigger />
              </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <h1 className="sidebar-logo">
                <a href="/">        
                  <i className="muted">
                    pattern</i> playground
                </a>
              </h1>
            </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<button type="button" onClick={openSearch} />}
                  className="sidebar-search"
                  tooltip="Search"
                >
                  {React.createElement('iconify-icon', { icon: 'ph:magnifying-glass' })}
                  <span>Search <kbd className="sidebar-search-kbd muted">⌘</kbd><kbd className="sidebar-search-kbd muted">K</kbd></span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
              {navItems.map((group) => (
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
        <SidebarFooter>
          <SidebarMenu>
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
      {/* Shown only below the mobile breakpoint (app.css), where the sidebar
          is a drawer dialog with no other visible way to open it. */}
      <SidebarTrigger className="sidebar-mobile-trigger" aria-label="Open navigation" />
      <SidebarShowTrigger />
    </SidebarProvider>
  );
}
