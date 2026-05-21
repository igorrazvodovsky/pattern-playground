import type { GenerativeProfile } from '../pattern-profile';

export const profile: GenerativeProfile = {
  operatesOn:
    'a single setting whose change should take effect the moment the actor flips it, with no submit step in between',
  produces: 'a control whose state and effect are bound together — flipping it *is* the commit',
  enacts: 'immediacy of commit; legibility of current state at a glance',
};
