import type { GenerativeProfile } from '../../pattern-profile';

export const profile: GenerativeProfile = {
  operatesOn:
    'a recent action whose outcome the actor would benefit from confirming, without needing acknowledgement before continuing',
  produces:
    'a brief peripheral message that auto-dismisses after a short window, optionally carrying a single trailing affordance such as undo',
  enacts:
    "acknowledgement of the action's completion, lightness of touch, recoverability within the dismissal window",
};
