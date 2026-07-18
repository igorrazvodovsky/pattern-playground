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

export interface SidebarArgs {
  collapsible: 'offcanvas' | 'icon' | 'none';
  variant: 'sidebar' | 'floating' | 'inset';
  side: 'left' | 'right';
}

// Exported for Shell's stories to borrow — see excludeStories below.
export function DemoSidebar({ collapsible, variant, side }: SidebarArgs) {
  return (
    <Sidebar collapsible={collapsible} variant={variant} side={side}>
      <SidebarHeader>
        <div className="story-shell-brand">
          <iconify-icon className="icon" icon="ph:hexagon" />
          <span>Acme Corp</span>
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

interface DemoMainProps {
  title: string;
  children?: React.ReactNode;
  triggerAtEnd?: boolean;
}

export function DemoMain({ title, children, triggerAtEnd = false }: DemoMainProps) {
  return (
    <SidebarInset>
      <header className={`story-shell-header${triggerAtEnd ? ' story-shell-header--split' : ''}`}>
        {triggerAtEnd ? (
          <>
            <span className="story-shell-title">{title}</span>
            <SidebarTrigger />
          </>
        ) : (
          <>
            <SidebarTrigger />
            <span className="story-shell-title">{title}</span>
          </>
        )}
      </header>
      <div className="story-shell-body">{children}</div>
    </SidebarInset>
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
  // Every other export from a story file is indexed as a story.
  excludeStories: ['DemoSidebar', 'DemoMain'],
  args: { collapsible: 'offcanvas', variant: 'sidebar', side: 'left' },
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
  // The frame is Shell's subject, not Sidebar's, so stories assume one rather
  // than compose it. Those that vary the arrangement itself opt out below.
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<SidebarArgs>;

export default meta;
type Story = StoryObj<SidebarArgs>;

export const Default: Story = {
  render: (args) => (
    <>
      <DemoSidebar {...args} />
      <DemoMain title="Dashboard">
        <p className="story-shell-note">
          {faker.hacker.phrase()} {faker.hacker.phrase()}
        </p>
      </DemoMain>
    </>
  ),
};

export const IconCollapsible: Story = {
  args: { collapsible: 'icon' },
  render: (args) => (
    <>
      <DemoSidebar {...args} />
      <DemoMain title="Icon collapsible">
        <p className="story-shell-note">
          Collapse the sidebar with the trigger or Cmd/Ctrl+/. Once collapsed to
          icons, hovering a menu item shows its label as a tooltip.
        </p>
      </DemoMain>
    </>
  ),
};

export const Floating: Story = {
  args: { variant: 'floating' },
  render: (args) => (
    <>
      <DemoSidebar {...args} />
      <DemoMain title="Floating variant" />
    </>
  ),
};

export const Inset: Story = {
  args: { variant: 'inset' },
  render: (args) => (
    <>
      <DemoSidebar {...args} />
      <DemoMain title="Inset variant">
        <p className="story-shell-note">
          The inset variant is the one case where the rail reaches into the
          frame: it rounds and insets the main column to match its own floating
          edge.
        </p>
      </DemoMain>
    </>
  ),
};

export const RightSide: Story = {
  args: { side: 'right' },
  decorators: [], // ordering is the point here, so the frame is written by hand

  render: (args) => (
    <SidebarProvider>
      <DemoMain title="Right-side sidebar" triggerAtEnd />
      <DemoSidebar {...args} />
    </SidebarProvider>
  ),
};

export const Controlled: Story = {
  decorators: [],
  render: function ControlledSidebar(args) {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <div className="story-shell-controls">
          <span>Controlled: open = <i>{String(open)}</i></span>
          <button className="button button--plain" onClick={() => setOpen((v) => !v)}>
            Toggle from outside
          </button>
        </div>
        <SidebarProvider open={open} onOpenChange={setOpen}>
          <DemoSidebar {...args} />
          <DemoMain title="Controlled open state" />
        </SidebarProvider>
      </div>
    );
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: (args) => (
    <>
      <DemoSidebar {...args} />
      <DemoMain title="Mobile">
        <p className="story-shell-note">
          On narrow viewports the sidebar leaves the frame entirely and renders
          as a Dialog sheet over it — the shell reverts to a single column.
        </p>
      </DemoMain>
    </>
  ),
};
