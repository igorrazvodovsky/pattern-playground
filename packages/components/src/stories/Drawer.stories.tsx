import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from 'storybook/actions';
import { useModalService } from '../hooks/useModalService';
import { modalService } from '../services/modal-service';
import { expect, userEvent, waitFor, within } from 'storybook/test';

interface DrawerArgs {
  title: string;
  position: 'left' | 'right';
  modal: boolean;
}

const meta = {
  title: "Components/Drawer",
  tags: [
    'activity-level:action',
    'atomic:component',
    'lifecycle:application',
    'mediation:individual'
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Drawer title',
    },
    position: {
      control: { type: 'radio' },
      options: ['left', 'right'] as DrawerArgs['position'][],
      description: 'Which side the drawer slides in from',
    },
    modal: {
      control: { type: 'boolean' },
      description: 'Modal blocks the page behind a scrim; non-modal is a side peek the page stays interactive beneath',
    },
  },
} satisfies Meta<DrawerArgs>;

export default meta;
type Story = StoryObj<DrawerArgs>;

export const Default: Story = {
  args: { title: 'Drawer', position: 'right', modal: true },
  render: ({ title, position, modal }) => (
    <button
      className="button"
      onClick={() => {
        action('drawer-opened')({ title, position, modal });
        modalService.openDrawer(
          <div>
            <p>Drawer content. Drawers are great for forms, details, and secondary content.</p>
            <footer style={{ marginTop: '20px' }}>
              <button className="button" autoFocus>Close</button>
            </footer>
          </div>,
          { title, position, modal }
        )
      }}
    >
      Open {position} drawer
    </button>
  ),
};

/**
 * The modal service mounts drawers on `document.body`, outside the story
 * canvas, and opens them a frame later. The title is what tells one story's
 * surface from another's, since the dialogs carry no accessible name.
 */
async function findOpenDrawer(title: string): Promise<HTMLDialogElement> {
  const heading = await within(document.body).findByRole('heading', { name: title });
  const drawer = heading.closest('dialog') as HTMLDialogElement;
  await waitFor(() => expect(drawer).toHaveAttribute('open'));
  return drawer;
}

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
    const drawer = await findOpenDrawer('Right Drawer');
    expect(drawer).toHaveClass('drawer--right');
    expect(within(drawer).getByRole('button', { name: 'Save' })).toBeVisible();
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
    const drawer = await findOpenDrawer('Left Drawer');
    expect(drawer).toHaveClass('drawer--left');
  },
};

export const NonModal: Story = {
  render: () => {
    const NonModalExample = () => {
      const { openDrawer } = useModalService();

      const openPeek = () => {
        openDrawer(
          <div>
            <p>A non-modal side peek: no scrim, and the page behind stays live.</p>
            <p>Because nothing is made inert, you can keep clicking, scrolling, and dragging in the underlying view while this stays open.</p>
            <footer style={{ marginTop: '20px' }}>
              <button className="button" autoFocus>Close</button>
            </footer>
          </div>,
          {
            title: 'Side peek',
            position: 'right',
            modal: false
          }
        );
      };

      return (
        <button className="button" onClick={openPeek}>
          Open side peek
        </button>
      );
    };

    return <NonModalExample />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open side peek' });
    await userEvent.click(trigger);
    const drawer = await findOpenDrawer('Side peek');
    // The whole point of this story: opened with show(), not showModal(), so
    // the page behind stays live and the trigger is still reachable.
    expect(drawer).toHaveAttribute('data-modal', 'false');
    expect(trigger).toBeVisible();
  },
};

/**
 * The keyboard difference between the two kinds of drawer. A modal drawer
 * takes focus and keeps it: nothing behind it is reachable until it closes. A
 * side peek takes focus too — it is the thing the actor just asked for — but
 * lets them tab back out to the page it sits beside, because that page is
 * still live. Both close on Escape and hand focus back to what opened them.
 */
export const KeyboardOperation: Story = {
  name: 'Keyboard operation',
  args: { title: 'Keyboard drawer', position: 'right', modal: true },
  render: (args) => {
    const KeyboardDrawerExample = () => {
      const { openDrawer } = useModalService();

      return (
        <button
          className="button"
          onClick={() => openDrawer(
            <div className="flow">
              <p>Escape closes this.</p>
              <footer>
                <button className="button">Confirm</button>
              </footer>
            </div>,
            { title: args.title, position: args.position, modal: args.modal }
          )}
        >
          Open drawer
        </button>
      );
    };

    return <KeyboardDrawerExample />;
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open drawer' });

    trigger.focus();
    await userEvent.keyboard('{Enter}');

    const drawer = await findOpenDrawer(args.title);
    await waitFor(() => expect(drawer).toContainElement(document.activeElement as HTMLElement));

    // Modal: the page behind is inert, so tabbing cannot leave the drawer.
    await userEvent.tab();
    expect(drawer).toContainElement(document.activeElement as HTMLElement);
    await userEvent.tab();
    expect(drawer).toContainElement(document.activeElement as HTMLElement);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(drawer).not.toHaveAttribute('open'));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/**
 * The side peek's keyboard contract, which is not the modal one: focus starts
 * inside, but the actor can tab out to the page beside it and keep working —
 * that is the whole reason for opening non-modally.
 */
export const NonModalKeyboardOperation: Story = {
  ...KeyboardOperation,
  name: 'Keyboard operation, side peek',
  args: { title: 'Keyboard side peek', position: 'right', modal: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open drawer' });

    trigger.focus();
    await userEvent.keyboard('{Enter}');

    const drawer = await findOpenDrawer(args.title);
    await waitFor(() => expect(drawer).toContainElement(document.activeElement as HTMLElement));

    // No trap: enough tabs walk off the end of the peek and back into the page.
    const focusable = drawer.querySelectorAll('button, [href], input, select, textarea');
    for (let i = 0; i <= focusable.length; i++) {
      await userEvent.tab();
    }
    expect(drawer).not.toContainElement(document.activeElement as HTMLElement);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(drawer).not.toHaveAttribute('open'));
  },
};