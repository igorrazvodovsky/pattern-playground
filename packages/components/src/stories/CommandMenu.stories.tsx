import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import CommandMenu from './CommandMenu.tsx';
import '../components/modal/modal.ts';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: 'Components/Command menu',
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
    const unfiltered = canvas.getAllByRole('option').length;
    // "new" reaches Create… through its searchable text, not its label, so
    // this pins the fuzzy match as well as the narrowing.
    await userEvent.type(input, 'new');
    await waitFor(() => expect(canvas.getAllByRole('option').length).toBeLessThan(unfiltered));
    expect(canvas.getByRole('option', { name: /Create…/ })).toBeVisible();
    expect(canvas.queryByRole('option', { name: /Search…/ })).toBeNull();
  },
};

/**
 * The command menu is a keyboard instrument first: the actor types, arrows
 * down the list, and commits — never leaving the input. Commands that hold
 * actions open into their own context rather than flattening into one long
 * list, and Escape steps back out of that context before it dismisses the
 * menu, so a wrong turn costs one key rather than the whole query.
 */
export const KeyboardNavigation: Story = {
  name: 'Keyboard navigation',
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Type a command or search...');
    input.focus();

    // Arrowing moves the active option; the input keeps focus throughout.
    const firstActive = canvas.getAllByRole('option').find((o) => o.getAttribute('aria-selected') === 'true');
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      const active = canvas.getAllByRole('option').find((o) => o.getAttribute('aria-selected') === 'true');
      expect(active).not.toBe(firstActive);
    });
    expect(input).toHaveFocus();

    // Committing a command opens its context rather than running anything:
    // the placeholder becomes the command's name and the list becomes its
    // actions.
    await userEvent.clear(input);
    await userEvent.type(input, 'Change');
    await waitFor(() => expect(canvas.getByRole('option', { name: 'Change…' })).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByPlaceholderText('Change…')).toBeVisible());
    expect(canvas.getByRole('option', { name: /Theme/ })).toBeVisible();

    // Escape steps back out of the context before it dismisses anything.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByPlaceholderText('Type a command or search...')).toBeVisible());
  },
};

export const Dialog: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.keyboard('/');
    const dialog = canvasElement.querySelector('pp-modal dialog') as HTMLDialogElement;
    await waitFor(() => expect(dialog).toHaveAttribute('open'));
    const input = await canvas.findByPlaceholderText('Type a command or search...');
    const unfiltered = canvas.getAllByRole('option').length;
    await userEvent.type(input, 'new');
    await waitFor(() => expect(canvas.getAllByRole('option').length).toBeLessThan(unfiltered));
    expect(canvas.getByRole('option', { name: /Create…/ })).toBeVisible();
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

