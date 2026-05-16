import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
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
}

export function AppShell({ navItems, title, currentPath, children, slug }: AppShellProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<a href="/" />}>
                Pattern Playground
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {navItems.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
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
            </SidebarGroup>
          ))}
        </SidebarContent>
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
