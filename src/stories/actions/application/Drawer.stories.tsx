import type { Meta, StoryObj } from "@storybook/react-vite";
import { useModalService } from '../../../hooks/useModalService';
import { modalService } from '../../../services/modal-service';
import { userEvent, within } from '@storybook/testing-library';

interface DrawerArgs {
  title: string;
  position: 'left' | 'right';
}

const meta = {
  title: "Actions/Application/Drawer",
  tags: [
    'activity-level:action',
    'atomic:component',
    'lifecycle:application',
    'mediation:individual'
  ],
  argTypes: {
    title: {
      control: 'text',
      description: 'Drawer title',
    },
    position: {
      control: { type: 'radio' },
      options: ['left', 'right'] as DrawerArgs['position'][],
      description: 'Which side the drawer slides in from',
    },
  },
} satisfies Meta<DrawerArgs>;

export default meta;
type Story = StoryObj<DrawerArgs>;

export const Default: Story = {
  args: { title: 'Drawer', position: 'right' },
  render: ({ title, position }) => (
    <button
      className="button"
      onClick={() =>
        modalService.openDrawer(
          <div>
            <p>Drawer content. Drawers are great for forms, details, and secondary content.</p>
            <footer style={{ marginTop: '20px' }}>
              <button className="button" autoFocus>Close</button>
            </footer>
          </div>,
          { title, position }
        )
      }
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