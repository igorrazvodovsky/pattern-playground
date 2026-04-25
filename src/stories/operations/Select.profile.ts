import type { GenerativeProfile } from '../../pattern-profile';

export const profile: GenerativeProfile = {
  operatesOn:
    'a single field whose value must come from a short, bounded set the actor already recognises',
  produces:
    'a collapsed control that hides the option set out of the way until the actor needs to act on it',
  enacts: 'economy of attention and screen space; recognition over recall',
};
