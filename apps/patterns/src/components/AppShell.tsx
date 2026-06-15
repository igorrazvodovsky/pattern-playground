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
  SidebarInset,
} from '@components/sidebar';
import { StackManager } from './StackManager';
import { useNavStore, useNavHydration } from '../lib/nav-store';

type NavLeaf = { label: string; href: string };
type NavBranch = { label: string; children: NavTreeNode[] };
type NavTreeNode = NavLeaf | NavBranch;
type NavGroup = NavBranch;

interface AppShellProps {
  navItems: NavGroup[];
  title: string;
  currentPath: string;
  children: React.ReactNode;
  slug?: string;
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
}

const Chevron = () =>
  React.createElement('iconify-icon', { icon: 'ph:caret-down', className: 'sidebar-collapsible-chevron' });

function NavNode({ node, currentPath, isOpen, setOpen }: NavNodeProps) {
  if (isBranch(node)) {
    return (
      <SidebarMenuItem>
        <Collapsible.Root open={isOpen(node.label)} onOpenChange={(open) => setOpen(node.label, open)}>
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
        isActive={currentPath === node.href}
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

export function AppShell({ navItems, title, currentPath, children, slug, storybookUrl }: AppShellProps) {
  const { isOpen, setOpen } = useNavStore();
  useNavHydration();
  return (
    <SidebarProvider>
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
                  isActive={currentPath === '/'}
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
      <SidebarInset>
        {slug ? (
          <StackManager slug={slug} title={title}>
            {children}
          </StackManager>
        ) : (
          <div className="content-inset">
            {children}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
