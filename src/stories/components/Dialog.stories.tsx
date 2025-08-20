import React from 'react';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { faker } from '@faker-js/faker';
import { useModalService } from '../../hooks/useModalService';

const meta = {
  title: "Components/Dialog",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const DialogExample = () => {
      const { openDialog } = useModalService();

      const openBasicDialog = () => {
        openDialog(
          <div>
            <p>{faker.hacker.phrase()}</p>
            <footer style={{ marginTop: '20px' }}>
              <button className="button" autoFocus>Close</button>
            </footer>
          </div>,
          {
            title: 'Dialog title',
            size: 'medium'
          }
        );
      };

      return (
        <button className="button" onClick={openBasicDialog}>
          Open dialog
        </button>
      );
    };

    return <DialogExample />;
  },
};

export const Scrolling: Story = {
  render: () => {
    const ScrollingDialogExample = () => {
      const { openDialog } = useModalService();

      const openScrollingDialog = () => {
        openDialog(
          <div>
            <article style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <p>{faker.lorem.paragraphs(30)}</p>
            </article>
            <footer style={{ marginTop: '20px' }}>
              <button className="button" autoFocus>Close</button>
            </footer>
          </div>,
          {
            title: 'Dialog',
            size: 'large'
          }
        );
      };

      return (
        <button className="button" onClick={openScrollingDialog}>
          Open scrolling dialog
        </button>
      );
    };

    return <ScrollingDialogExample />;
  },
};

export const DisruptiveNotification: Story = {
  render: () => {
    const ConfirmationDialogExample = () => {
      const { openDialog } = useModalService();

      const openConfirmationDialog = () => {
        openDialog(
          <div>
            <p>
              Doing this will make some permanent changes. Are you sure you want to proceed?
            </p>
            <footer style={{ marginTop: '20px' }}>
              <div className="inline-flow">
                <button className="button button--danger" autoFocus>
                  Do it!
                </button>
                <button className="button button--secondary">
                  Cancel
                </button>
              </div>
            </footer>
          </div>,
          {
            title: 'Confirmation',
            size: 'small'
          }
        );
      };

      return (
        <button className="button" onClick={openConfirmationDialog}>
          Do something
        </button>
      );
    };

    return <ConfirmationDialogExample />;
  },
};