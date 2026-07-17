import type { Meta, StoryObj } from "@storybook/react-vite";
import { faker } from '@faker-js/faker';
import { SidebarProvider } from '../components/sidebar';
// Borrowed so the two entries can't drift into two different sidebars.
import { DemoSidebar, DemoMain, type SidebarArgs } from './Sidebar.stories';

faker.seed(7);

const RAIL: SidebarArgs = { collapsible: 'offcanvas', variant: 'sidebar', side: 'left' };

const meta = {
  title: "Components/Shell",
  tags: [
    'activity-level:cross-cutting',
    'atomic:composition',
    'role:component',
    'mediation:individual',
  ],
  parameters: {
    layout: 'fullscreen',
    // Rendered inline, the Docs page is the viewport these stories measure
    // themselves against, and the sidebar's fixed panel escapes onto it.
    docs: {
      story: { inline: false, iframeHeight: 520 },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const StaticFrame: Story = {
  render: () => (
    <div className="shell" data-slot="shell">
      <SidebarProvider renderWrapper={false}>
        <DemoSidebar {...RAIL} />
      </SidebarProvider>
      <main className="shell__main" data-slot="shell-main">
        <div className="story-shell-body">
          <p className="story-shell-note">
            {`Here the frame is hand-written HTML and SidebarProvider is passed
            renderWrapper={false} — it contributes state and keyboard handling
            but no DOM. The main column is a sibling of the rail rather than a
            child of the island, so page content is server-rendered and static.`}
          </p>
          <p className="story-shell-note">
            This is how the patterns site is built (<i>Base.astro</i>). Note the
            trade: with the provider scoped to the rail, a trigger outside it has
            no context — the trigger has to live in the rail, or the provider has
            to move up.
          </p>
        </div>
      </main>
    </div>
  ),
};

export const ProviderRendered: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar {...RAIL} />
      <DemoMain title="Header">
        <p className="story-shell-note">
          
        </p>
      </DemoMain>
    </SidebarProvider>
  ),
};

export const ScrollOwnership: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar {...RAIL} />
      <DemoMain title="Scroll ownership">
        <p className="story-shell-note">
          <i>.shell__main</i> sets <i>overflow: auto</i>, so long content scrolls
          the column while the rail stays put — no sticky headers needed on the
          rail. Scroll this column and watch the sidebar hold still.
        </p>
        <div className="story-shell-filler">
          <p className="story-shell-note">{faker.lorem.paragraphs(12)}</p>
        </div>
      </DemoMain>
    </SidebarProvider>
  ),
};
