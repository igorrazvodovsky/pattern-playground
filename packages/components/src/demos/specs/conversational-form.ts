import type { Spec } from '@json-render/core';
import { formatDate } from '@shared/format';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './conversational-form.json' with { type: 'json' };

// The spec carries the conversation: each question, and each answer as the
// text or the control the actor answers with. Only the reading of "December 16
// two years ago" is worked out here, from the date the demo mounts, in the
// page's conventions.

export default {
  spec: spec as Spec,
  setup: {
    // A getter, so that each mount reads the date afresh.
    get initialState() {
      return {
        answers: { plans: ['c'], amount: 50 },
        draft: '',
        dateReading: formatDate(new Date(new Date().getFullYear() - 2, 11, 16), { dateStyle: 'full' }),
      };
    },
  } satisfies SpecSetup,
};
