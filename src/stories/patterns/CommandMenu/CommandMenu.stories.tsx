import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef } from 'react';
import CommandMenu from './CommandMenu.tsx';

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
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/') {
          e.preventDefault();
          dialogRef.current?.showModal();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
      <>
        <p>Press <kbd>/</kbd> to open the command menu.</p>
        <dialog ref={dialogRef} id="cmd">
          <CommandMenu />
        </dialog>
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

export const WithAI: Story = {
  args: {},
  render: () => (
    <div style={{ padding: '2rem' }}>
      <p>Try searching for commands that don't exist (e.g., "schedule meeting", "export data", "backup files") to see AI suggestions.</p>
      <CommandMenu />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `Command menu with AI functionality. When you search for commands that don't match existing ones, the AI will suggest relevant commands or actions. Try typing queries like "schedule meeting", "export data", or "backup files" to see AI-powered suggestions.`
      }
    }
  }
};
