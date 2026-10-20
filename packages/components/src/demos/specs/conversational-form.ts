import type { Spec } from '@json-render/core';
import { formatDate } from '@shared/format';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './conversational-form.json' with { type: 'json' };

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
