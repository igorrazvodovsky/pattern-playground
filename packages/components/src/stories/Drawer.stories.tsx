import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from 'storybook/actions';
import { useModalService } from '../hooks/useModalService';
import { modalService } from '../services/modal-service';
import { userEvent, within } from '@storybook/testing-library';

interface DrawerArgs {
  title: string;
  position: 'left' | 'right';
  modal: boolean;
}

const meta = {
  title: "Components/Drawer",
  tags: [
    'activity-level:action',
    'atomic:component',
    'lifecycle:application',
    'mediation:individual'
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Drawer title',
    },
    position: {
      control: { type: 'radio' },
      options: ['left', 'right'] as DrawerArgs['position'][],
      description: 'Which side the drawer slides in from',
    },
    modal: {
      control: { type: 'boolean' },
      description: 'Modal blocks the page behind a scrim; non-modal is a side peek the page stays interactive beneath',
    },
  },
} satisfies Meta<DrawerArgs>;

export default meta;
type Story = StoryObj<DrawerArgs>;

export const Default: Story = {
  args: { title: 'Drawer', position: 'right', modal: true },
  render: ({ title, position, modal }) => (
    <button
      className="button"
      onClick={() => {
        action('drawer-opened')({ title, position, modal });
        modalService.openDrawer(
          <div>
            <p>Drawer content. Drawers are great for forms, details, and secondary content.</p>
            <footer style={{ marginTop: '20px' }}>
              <button className="button" autoFocus>Close</button>
            </footer>
          </div>,
          { title, position, modal }
        )
      }}
    >
      Open {position} drawer
    </button>
  ),
};

export const RightDrawer: Story = {
  render: () => {
    const DrawerExample = () => {
      const { openDrawer } = useModalService();

      const openRightDrawer = () => {
        openDrawer(
          <div>
            <p>This is a right-side drawer content.</p>
            <p>Drawers are great for forms, details, and secondary content.</p>
            <footer style={{ marginTop: '20px' }}>
              <button className="button" autoFocus>Save</button>
            </footer>
          </div>,
          {
            title: 'Right Drawer',
            position: 'right'
          }
        );
      };

      return (
        <button className="button" onClick={openRightDrawer}>
          Open right drawer
        </button>
      );
    };

    return <DrawerExample />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open right drawer' });
    await userEvent.click(trigger);
  },
};

export const LeftDrawer: Story = {
  render: () => {
    const LeftDrawerExample = () => {
      const { openDrawer } = useModalService();

      const openLeftDrawer = () => {
        openDrawer(
          <div>
            <p>This is a left-side drawer content.</p>
            <p>Left drawers are often used for navigation or filters.</p>
            <footer style={{ marginTop: '20px' }}>
              <button className="button" autoFocus>Close</button>
            </footer>
          </div>,
          {
            title: 'Left Drawer',
            position: 'left'
          }
        );
      };

      return (
        <button className="button" onClick={openLeftDrawer}>
          Open left drawer
        </button>
      );
    };

    return <LeftDrawerExample />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open left drawer' });
    await userEvent.click(trigger);
  },
};

export const NonModal: Story = {
  render: () => {
    const NonModalExample = () => {
      const { openDrawer } = useModalService();

      const openPeek = () => {
        openDrawer(
          <div>
            <p>A non-modal side peek: no scrim, and the page behind stays live.</p>
            <p>Because nothing is made inert, you can keep clicking, scrolling, and dragging in the underlying view while this stays open.</p>
            <footer style={{ marginTop: '20px' }}>
              <button className="button" autoFocus>Close</button>
            </footer>
          </div>,
          {
            title: 'Side peek',
            position: 'right',
            modal: false
          }
        );
      };

      return (
        <button className="button" onClick={openPeek}>
          Open side peek
        </button>
      );
    };

    return <NonModalExample />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open side peek' });
    await userEvent.click(trigger);
  },
};