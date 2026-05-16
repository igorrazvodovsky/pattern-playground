import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import CommandMenu from './CommandMenu.tsx';
import '../../../components/modal/modal.ts';
import { userEvent, within } from '@storybook/testing-library';

const meta = {
  title: 'Actions/Seeking/Command menu',
  component: CommandMenu,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CommandMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Type a command or search...');
    await userEvent.type(input, 'new');
  },
};

export const Dialog: Story = {
  args: {},
  play: async () => {
    await userEvent.keyboard('/');
    const input = await within(document.body).findByPlaceholderText('Type a command or search...');
    await userEvent.type(input, 'new');
  },
  render: () => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/') {
          e.preventDefault();
          const modal = document.querySelector('pp-modal dialog') as HTMLDialogElement;
          modal?.showModal();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
      <>
        <p>Press <kbd>/</kbd> to open the command menu.</p>
        <pp-modal>
          <dialog id="cmd">
            <CommandMenu onClose={() => {
              const modal = document.querySelector('pp-modal dialog') as HTMLDialogElement;
              modal?.close();
            }} />
          </dialog>
        </pp-modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `Command menu in a modal dialog. Press "/" to open it and test the hierarchical navigation and search functionality.`
      }
    }
  }
};

