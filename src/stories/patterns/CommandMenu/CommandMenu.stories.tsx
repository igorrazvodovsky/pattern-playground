import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import CommandMenu from './CommandMenu.tsx';
import '../../../components/modal/modal.ts';

const meta = {
  title: 'Patterns/Command menu*',
  component: CommandMenu,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CommandMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {},
};

export const Dialog: Story = {
  args: {},
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

