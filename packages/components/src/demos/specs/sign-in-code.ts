import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import { keyedTimers } from './shared/timers';
import spec from './sign-in-code.json' with { type: 'json' };

// Signing in with a code sent to the actor's inbox. The message stands beside
// the field, so the code can be typed, or copied with its hyphen and pasted.
// Verification runs when the last digit is in; a wrong code clears the field
// and says so. Resending starts a cooldown the button counts down.

const COOLDOWN = 30;

const newCode = () =>
  String(Math.floor(Math.random() * 1_000_000))
    .padStart(6, '0')
    .replace(/^(\d{3})/, '$1-');

const digits = (code: string) => code.replace(/\D/g, '');

const noParams = z.object({});

const actions: Record<string, ActionDefinition> = {
  verifyCode: {
    params: noParams,
    description:
      'Check `/code` against the code sent; sign in, or set `/error` and clear the field.',
  },
  resendCode: {
    params: noParams,
    description: 'Send a new code to `/sent` and count `/cooldown` down from 30 seconds.',
  },
  signOut: { params: noParams, description: 'Return to the code entry with a fresh code.' },
};

const MISMATCH = 'That code does not match. Check the latest message and try again.';

const resendLabel = (left: number) => (left > 0 ? `Resend code in ${left}s` : 'Resend code');

const handlers = (store: StateStore, connected: () => boolean) => {
  const schedule = keyedTimers(connected);
  const setCooldown = (left: number) => {
    store.set('/cooldown', left);
    store.set('/resendLabel', resendLabel(left));
  };
  const tick = () => {
    const left = (store.get('/cooldown') as number) - 1;
    setCooldown(left);
    if (left > 0) schedule('cooldown', 1000, tick);
  };
  const reset = () => {
    store.set('/sent', newCode());
    store.set('/code', '');
    store.set('/error', null);
    schedule('error', 0, () => {});
  };
  return {
    verifyCode: () => {
      if (store.get('/code') === digits(store.get('/sent') as string)) {
        store.set('/signedIn', true);
        return;
      }
      store.set('/code', '');
      // The same text set again is not announced, so a repeated mismatch
      // takes the alert away and brings it back.
      if (store.get('/error')) {
        store.set('/error', null);
        schedule('error', 100, () => store.set('/error', MISMATCH));
      } else store.set('/error', MISMATCH);
    },
    resendCode: () => {
      reset();
      store.set('/notice', 'New code sent.');
      setCooldown(COOLDOWN);
      schedule('cooldown', 1000, tick);
      schedule('notice', 3000, () => store.set('/notice', ''));
    },
    signOut: () => {
      reset();
      // Replace the pending timers with ones that write nothing.
      schedule('cooldown', 0, () => {});
      schedule('notice', 0, () => {});
      setCooldown(0);
      store.set('/notice', '');
      store.set('/signedIn', false);
    },
  };
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      sent: newCode(),
      code: '',
      error: null,
      cooldown: 0,
      resendLabel: resendLabel(0),
      notice: '',
      signedIn: false,
    },
    actions,
    handlers,
  } satisfies SpecSetup,
};
