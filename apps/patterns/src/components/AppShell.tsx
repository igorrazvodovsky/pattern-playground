import React from 'react';
import { Collapsible } from '@base-ui/react/collapsible';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
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

type NavItem = { label: string; href: string };
type NavGroup = { label: string; items: NavItem[] };

interface AppShellProps {
  navItems: NavGroup[];
  title: string;
  currentPath: string;
  children: React.ReactNode;
  slug?: string;
  storybookUrl: string;
}

export function AppShell({ navItems, title, currentPath, children, slug, storybookUrl }: AppShellProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          {/* TODO: logo */}
          {navItems.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Collapsible.Root defaultOpen>
                    <SidebarMenuButton
                      render={<Collapsible.Trigger />}
                      className="sidebar-collapsible-group-trigger"
                      tooltip={group.label}
                    >
                      <span>{group.label}</span>
                      {React.createElement('iconify-icon', { icon: 'ph:caret-down', className: 'sidebar-collapsible-chevron' })}
                    </SidebarMenuButton>
                    <Collapsible.Panel>
                      <SidebarGroupContent className="sidebar-collapsible-group-content">
                        <SidebarMenu>
                          {group.items.map((item) => (
                            <SidebarMenuItem key={item.href}>
                              <SidebarMenuButton
                                render={<a href={item.href} />}
                                isActive={currentPath === item.href}
                                tooltip={item.label}
                              >
                                {item.label}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </Collapsible.Panel>
                  </Collapsible.Root>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          ))}
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
