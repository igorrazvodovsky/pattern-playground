import type { FormEvent } from 'react';

// What a Form does when it is submitted, in every registry. The browser's
// validation is off; the spec binds validateForm to `submit`. When that leaves
// fields invalid, focus moves to the first of them, so the actor starts there
// and hears its message, rather than staying on the submit button with every
// error announced at once. Each registry marks an invalid field's control with
// data-invalid.

export const submitForm = async (event: FormEvent<HTMLFormElement>, emit: (event: string) => void) => {
  event.preventDefault();
  const form = event.currentTarget;
  // emit is typed void, but resolves once the bound actions have run.
  await emit('submit');
  // The fields re-render with their errors after the actions settle.
  requestAnimationFrame(() => {
    form.querySelector<HTMLElement>('[data-invalid]')?.focus();
  });
};
