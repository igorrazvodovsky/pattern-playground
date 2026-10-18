import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { notifyHandler } from './notify';
import spec from './form.json' with { type: 'json' };

// The spec carries the form: its fields, what each must hold (json-render's
// checks, run by validateForm when the form is submitted), and the saved
// message. Only the message's timeout stays here (./notify.ts). The profile
// starts empty apart from the likeliest experience level.

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      profile: { firstName: '', lastName: '', email: '', role: '', experience: 'junior', bio: '', newsletter: false },
      validation: { valid: false, errors: {} },
      notice: '',
    },
    handlers: notifyHandler,
  } satisfies SpecSetup,
};
