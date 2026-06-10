import { useState } from 'react';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { faker } from '@faker-js/faker';
import { navItems as NAV_ITEMS, teamItems as TEAM_ITEMS } from '@shared/data/nav-items.json' with { type: 'json' };
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuAction,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '../components/sidebar';

faker.seed(42);

interface SidebarArgs {
  collapsible: 'offcanvas' | 'icon' | 'none';
  variant: 'sidebar' | 'floating' | 'inset';
  side: 'left' | 'right';
}

function DemoSidebar({
  collapsible,
  variant,
  side,
}: SidebarArgs) {
  return (
    <Sidebar collapsible={collapsible} variant={variant} side={side}>
      <SidebarHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', padding: 'var(--space-2xs) var(--space-xs)' }}>
          <iconify-icon className="icon" icon="ph:hexagon" style={{ fontSize: '1.25rem' }} />
          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Acme Corp</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={item.isActive}
                    tooltip={item.label}
                  >
                    <iconify-icon className="icon" icon={item.icon} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuButton>
                  {item.isActive && (
                    <SidebarMenuAction showOnHover aria-label="More options">
                      <iconify-icon className="icon" icon="ph:dots-three" />
                    </SidebarMenuAction>
                  )}
                  {item.subItems && (
                    <SidebarMenuSub>
                      {item.subItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.label}>
                          <SidebarMenuSubButton isActive={sub.isActive}>
                            <span>{sub.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Teams</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {TEAM_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton tooltip={item.label}>
                    <iconify-icon className="icon" icon={item.icon} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Loading</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[1, 2, 3].map((i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <iconify-icon className="icon" icon="ph:user-circle" />
              <span>Account</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

const meta = {
  title: "Components/Sidebar",
  tags: [
    'activity-level:operation',
    'atomic:composition',
    'role:component',
    'mediation:individual',
  ],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    collapsible: {
      control: { type: 'radio' },
      options: ['offcanvas', 'icon', 'none'] as SidebarArgs['collapsible'][],
      description: 'Collapse behaviour',
    },
    variant: {
      control: { type: 'radio' },
      options: ['sidebar', 'floating', 'inset'] as SidebarArgs['variant'][],
      description: 'Visual variant',
    },
    side: {
      control: { type: 'radio' },
      options: ['left', 'right'] as SidebarArgs['side'][],
      description: 'Which side the sidebar sits on',
    },
  },
} satisfies Meta<SidebarArgs>;

export default meta;
type Story = StoryObj<SidebarArgs>;

export const Default: Story = {
  args: { collapsible: 'offcanvas', variant: 'sidebar', side: 'left' },
  render: (args) => (
    <SidebarProvider>
      <DemoSidebar {...args} />
      <SidebarInset>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-s)', padding: 'var(--space-s) var(--space-m)', borderBottom: 'var(--border)' }}>
          <SidebarTrigger />
          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Dashboard</span>
        </header>
        <main style={{ padding: 'var(--space-l)', flex: 1 }}>
          <p style={{ color: 'var(--c-neutral-600)', maxWidth: '40ch' }}>
            {faker.hacker.phrase()} {faker.hacker.phrase()}
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const IconCollapsible: Story = {
  args: { collapsible: 'icon', variant: 'sidebar', side: 'left' },
  render: (args) => (
    <SidebarProvider>
      <DemoSidebar {...args} />
      <SidebarInset>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-s)', padding: 'var(--space-s) var(--space-m)', borderBottom: 'var(--border)' }}>
          <SidebarTrigger />
          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Icon collapsible — hover menu buttons when collapsed to see tooltips</span>
        </header>
        <main style={{ padding: 'var(--space-l)', flex: 1 }}>
          <p style={{ color: 'var(--c-neutral-600)', maxWidth: '40ch' }}>
            Collapse the sidebar with the trigger or Cmd/Ctrl+B. Hovering menu items shows their label as a tooltip.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const Floating: Story = {
  args: { collapsible: 'offcanvas', variant: 'floating', side: 'left' },
  render: (args) => (
    <SidebarProvider>
      <DemoSidebar {...args} />
      <SidebarInset>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-s)', padding: 'var(--space-s) var(--space-m)', borderBottom: 'var(--border)' }}>
          <SidebarTrigger />
          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Floating variant</span>
        </header>
        <main style={{ padding: 'var(--space-l)', flex: 1 }} />
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const Inset: Story = {
  args: { collapsible: 'offcanvas', variant: 'inset', side: 'left' },
  render: (args) => (
    <SidebarProvider>
      <DemoSidebar {...args} />
      <SidebarInset>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-s)', padding: 'var(--space-s) var(--space-m)', borderBottom: 'var(--border)' }}>
          <SidebarTrigger />
          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Inset variant</span>
        </header>
        <main style={{ padding: 'var(--space-l)', flex: 1 }} />
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const RightSide: Story = {
  args: { collapsible: 'offcanvas', variant: 'sidebar', side: 'right' },
  render: (args) => (
    <SidebarProvider>
      <SidebarInset>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-s)', padding: 'var(--space-s) var(--space-m)', borderBottom: 'var(--border)' }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Right-side sidebar</span>
          <SidebarTrigger />
        </header>
        <main style={{ padding: 'var(--space-l)', flex: 1 }} />
      </SidebarInset>
      <DemoSidebar {...args} />
    </SidebarProvider>
  ),
};

export const Controlled: Story = {
  args: { collapsible: 'offcanvas', variant: 'sidebar', side: 'left' },
  render: function ControlledSidebar(args) {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <div style={{ padding: 'var(--space-s)', borderBottom: 'var(--border)', display: 'flex', gap: 'var(--space-s)', alignItems: 'center', background: 'var(--c-neutral-50)' }}>
          <span style={{ fontSize: 'var(--text-s)' }}>Controlled: open = <strong>{String(open)}</strong></span>
          <button className="button button--plain" onClick={() => setOpen((v) => !v)}>
            Toggle from outside
          </button>
        </div>
        <SidebarProvider open={open} onOpenChange={setOpen}>
          <DemoSidebar {...args} />
          <SidebarInset>
            <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-s)', padding: 'var(--space-s) var(--space-m)', borderBottom: 'var(--border)' }}>
              <SidebarTrigger />
              <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Controlled open state</span>
            </header>
            <main style={{ padding: 'var(--space-l)', flex: 1 }} />
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  },
};

export const Mobile: Story = {
  args: { collapsible: 'offcanvas', variant: 'sidebar', side: 'left' },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: (args) => (
    <SidebarProvider>
      <DemoSidebar {...args} />
      <SidebarInset>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-s)', padding: 'var(--space-s) var(--space-m)', borderBottom: 'var(--border)' }}>
          <SidebarTrigger />
          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Mobile — tap the trigger</span>
        </header>
        <main style={{ padding: 'var(--space-l)', flex: 1 }}>
          <p style={{ color: 'var(--c-neutral-600)', maxWidth: '40ch' }}>
            On narrow viewports the sidebar renders as a Dialog sheet rather than a fixed panel.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
};
