import React, { useState } from 'react';
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
          <div className="flow">
            <p>{faker.hacker.phrase()}</p>
            <footer>
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
            <article>
              <p>{faker.lorem.paragraphs(30)}</p>
            </article>
            <footer>
              <button className="button" autoFocus>Close</button>
            </footer>
          </div>,
          {
            title: 'Dialog'
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
  tags: ['!autodocs', '!dev'],
  render: () => {
    const ConfirmationDialogExample = () => {
      const { openDialog } = useModalService();

      const openConfirmationDialog = () => {
        openDialog(
          <div className="flow">
            <p>
              Doing this will make some permanent changes. Are you sure you want to proceed?
            </p>
            <footer>
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

export const DeletionConfirmation: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => {
    const DeletionDialogExample = () => {
      const { openDialog, closeModal: closeDialog } = useModalService();
      const [items, setItems] = useState(() =>
        Array.from({ length: 5 }, () => faker.company.name())
      );

      const handleDelete = (item: string, index: number) => {
        const dialogId = openDialog(
          <div className="flow">
            <p>
              Are you sure you want to delete <strong>{item}</strong>?
              This action cannot be undone. A pigeon will be sent to notify all members.
            </p>
            <footer>
              <div className="inline-flow">
                <button
                  className="button button--danger"
                  autoFocus
                  onClick={() => {
                    setItems(items.filter((_, i) => i !== index));
                    closeDialog(dialogId);
                  }}
                >
                  Delete
                </button>
                <button
                  className="button button--secondary"
                  onClick={() => closeDialog(dialogId)}
                >
                  Cancel
                </button>
              </div>
            </footer>
          </div>
        );
      };

      return (
        <div className="stack">
          <pp-list className='borderless'>
            {items.map((item, index) => (
              <pp-list-item key={index}>
                {item}
                <button
                  slot="suffix"
                  className="button button--small button--plain"
                  onClick={() => handleDelete(item, index)}
                >
                  <iconify-icon
                    className="icon"
                    icon="ph:trash-simple"
                  />
                  <span className="inclusively-hidden">
                    Delete
                  </span>
                </button>
              </pp-list-item>
            ))}
          </pp-list>
          {items.length === 0 && (
            <p className="muted">No companies left</p>
          )}
        </div>
      );
    };

    return <DeletionDialogExample />;
  },
  parameters: {
    docs: {
      description: {
        story: "Modal confirmation for high-consequence deletions with clear explanation of impacts."
      }
    }
  }
};

export const TypedConfirmation: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => {
    const TypedConfirmationExample = () => {
      const { openDialog, closeModal: closeDialog } = useModalService();
      const [workspace] = useState("Oriental Aluminum Salad");

      const handleDeleteWorkspace = () => {
        const dialogId = openDialog(
          <div className='flow'>
            <div className="flow">
              <p>
                Deleting <strong>{workspace}</strong> will permanently remove:
              </p>
              <ul>
                <li>&mdash; All projects and files</li>
                <li>&mdash; Team member access</li>
                <li>&mdash; Integration settings</li>
                <li>&mdash; Usage history and analytics</li>
              </ul>
              <pp-input
                type="text"
                className="input"
                placeholder={`Type "${workspace}" to confirm`}
              />
            </div>
            <footer>
              <div className="inline-flow">
                <button
                  className="button button--danger"
                  onClick={() => {closeDialog(dialogId)}}
                >
                  Delete Workspace
                </button>
                <button
                  className="button button--secondary"
                  onClick={() => {closeDialog(dialogId)}}
                >
                  Cancel
                </button>
              </div>
            </footer>
          </div>,
          {
            title: 'Delete workspace',
            size: 'medium'
          }
        );
      };

      return (
        <div className="stack">
          {workspace ? (
            <>
              <button
                className="button button--danger"
                onClick={handleDeleteWorkspace}
              >
                Delete Workspace
              </button>
            </>
          ) : (
            <p className="muted">Workspace has been deleted</p>
          )}
        </div>
      );
    };

    return <TypedConfirmationExample />;
  }
};