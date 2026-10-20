import type { FormEvent } from 'react';

// Focus moves to the first invalid field, so the actor hears its message
// rather than every error at once from the submit button.

export const submitForm = async (
  event: FormEvent<HTMLFormElement>,
  emit: (event: string) => void,
) => {
  event.preventDefault();
  const form = event.currentTarget;
  // Typed void, but resolves once the bound actions have run.
  await emit('submit');
  requestAnimationFrame(() => {
    form.querySelector<HTMLElement>('[data-invalid]')?.focus();
  });
};
