import type { GenerativeProfile } from '../../pattern-profile';

export const profile: GenerativeProfile = {
  operatesOn:
    'a recently committed action whose consequences the actor wants to retract',
  produces:
    'a reverse path that returns the structure to its prior state, with a window in which the retraction is offered',
  enacts: 'forgiveness for mistakes, room for confident exploration',
};
