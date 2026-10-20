import { expect, userEvent, waitFor, within } from 'storybook/test';

/**
 * Focuses the named button in the story canvas and presses Enter on it.
 * Returns the button so a play function can check focus comes back to it.
 */
export async function openWithKeyboard(canvasElement: HTMLElement, name: string): Promise<HTMLElement> {
  const trigger = within(canvasElement).getByRole('button', { name });
  trigger.focus();
  expect(trigger).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  return trigger;
}

/**
 * The modal service mounts dialogs and drawers on `document.body`, outside the
 * story canvas, and opens them a frame later. The title is the surface's
 * accessible name, so the role query only resolves once it is open and named.
 */
export async function findOpenModal(title: string): Promise<HTMLDialogElement> {
  const surface = await within(document.body).findByRole('dialog', { name: title }) as HTMLDialogElement;
  await waitFor(() => expect(surface).toHaveAttribute('open'));
  return surface;
}

/** Focus has moved into the surface rather than staying behind it. */
export async function expectFocusInside(surface: HTMLElement) {
  await waitFor(() => expect(surface).toContainElement(document.activeElement as HTMLElement));
}

/**
 * A modal surface sits in the top layer and the page behind is inert, so
 * tabbing in either direction never lands outside it.
 */
export async function expectFocusTrapped(surface: HTMLElement) {
  await userEvent.tab();
  expect(surface).toContainElement(document.activeElement as HTMLElement);
  await userEvent.tab();
  expect(surface).toContainElement(document.activeElement as HTMLElement);
  await userEvent.tab({ shift: true });
  expect(surface).toContainElement(document.activeElement as HTMLElement);
}

/** Escape closes the surface; with a trigger, focus must return to it. */
export async function closeWithEscape(surface: HTMLDialogElement, trigger?: HTMLElement) {
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(surface).not.toHaveAttribute('open'));
  if (trigger) await waitFor(() => expect(trigger).toHaveFocus());
}
