import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { notifyHandler } from './notify';
import spec from './form.json' with { type: 'json' };

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
