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
            <span>{node.label}</span>
            <Chevron />
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
      <Sidebar collapsible="icon">
        <SidebarContent>
          <a href="/" className="sidebar-logo">
            <img src="/playground.png" alt="Playground" />
          </a>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<button type="button" onClick={openSearch} />}
                  className="sidebar-search"
                  tooltip="Search"
                >
                  {React.createElement('iconify-icon', { icon: 'ph:magnifying-glass' })}
                  <span>Search</span>
                  <kbd className="sidebar-search-kbd">⌘K</kbd>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<a href="/" />}
                  isActive={isActivePath('/', currentPath)}
                  tooltip="Introduction"
                >
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
    </SidebarProvider>
  );
}
