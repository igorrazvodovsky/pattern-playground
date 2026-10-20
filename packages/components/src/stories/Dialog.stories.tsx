import type { Meta, StoryObj } from '@storybook/react-vite';
import { faker } from '@faker-js/faker';
import { action } from 'storybook/actions';
import { useModalService } from '../hooks/use-modal-service';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  closeWithEscape,
  expectFocusInside,
  expectFocusTrapped,
  findOpenModal,
  openWithKeyboard,
} from './utils/play';

interface DialogArgs {
  title: string;
  size: 'small' | 'medium' | 'large';
  message: string;
}

// Seeded here because the default message is built once, at import.
faker.seed(2);

const meta = {
  title: 'Components/Dialog',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Dialog title',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'] as DialogArgs['size'][],
      description: 'Dialog size',
    },
    message: {
      control: { type: 'text' },
      description: 'Dialog body content',
    },
  },
} satisfies Meta<DialogArgs>;

export default meta;
type Story = StoryObj<DialogArgs>;

export const Default: Story = {
  args: { title: 'Dialog title', size: 'medium', message: faker.hacker.phrase() },
  render: (args) => {
    const DialogExample = () => {
      const { openDialog } = useModalService();

      const openBasicDialog = () => {
        action('dialog-opened')({ title: args.title, size: args.size });
        openDialog(
          <div className="flow">
            <p>{args.message}</p>
            <footer>
              <button className="button" data-close data-autofocus>
                Close
              </button>
            </footer>
          </div>,
          {
            title: args.title,
            size: args.size,
          },
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
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open dialog' });
    await userEvent.click(trigger);
    const dialog = await findOpenModal(args.title);
    // Visibility settles only after the enter transition fades the dialog in.
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Close' })).toBeVisible(),
    );
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
              <button className="button" data-close data-autofocus>
                Close
              </button>
            </footer>
          </div>,
          {
            title: 'Dialog',
          },
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

/**
 * What a dialog owes an actor who never touches the pointer: it opens from the
 * keyboard, takes focus with it, holds focus while it is open, closes on
 * Escape, and hands focus back to whatever opened it — so the actor resumes
 * where they left off rather than at the top of the page.
 */
export const KeyboardOperation: Story = {
  name: 'Keyboard operation',
  args: { title: 'Keyboard dialog', size: 'medium', message: 'Escape closes this.' },
  render: (args) => {
    const KeyboardDialogExample = () => {
      const { openDialog } = useModalService();

      return (
        <button
          className="button"
          onClick={() =>
            openDialog(
              <div className="flow">
                <p>{args.message}</p>
                <footer>
                  <button className="button">Confirm</button>
                </footer>
              </div>,
              { title: args.title, size: args.size },
            )
          }
        >
          Open dialog
        </button>
      );
    };

    return <KeyboardDialogExample />;
  },
  play: async ({ args, canvasElement }) => {
    const trigger = await openWithKeyboard(canvasElement, 'Open dialog');
    const dialog = await findOpenModal(args.title);
    await expectFocusInside(dialog);
    await expectFocusTrapped(dialog);
    // Focus returns to the trigger, not to the top of the document.
    await closeWithEscape(dialog, trigger);
  },
};
