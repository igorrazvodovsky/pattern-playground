import type { Meta, StoryObj } from "@storybook/react-vite";
import { faker } from '@faker-js/faker';
import { action } from 'storybook/actions';
import { useModalService } from '../hooks/useModalService';
import { userEvent, within } from '@storybook/testing-library';

interface DialogArgs {
  title: string;
  size: 'small' | 'medium' | 'large';
  message: string;
}

const meta = {
  title: "Components/Dialog",
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
              <button className="button" autoFocus>Close</button>
            </footer>
          </div>,
          {
            title: args.title,
            size: args.size,
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open dialog' });
    await userEvent.click(trigger);
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
