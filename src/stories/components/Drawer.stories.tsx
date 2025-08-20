import React from 'react';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useModalService } from '../../hooks/useModalService';

const meta = {
  title: "Components/Drawer",
} satisfies Meta;

export default meta;
type Story = StoryObj;

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
};