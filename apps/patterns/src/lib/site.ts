// Site-wide settings shared by build-time pages and client islands.

import type { Locale } from '@shared/format';

export const STORYBOOK_URL: string = import.meta.env.PUBLIC_STORYBOOK_URL ?? 'http://localhost:6006';

// The documentation layer states its own locale rather than deferring to the
// reader's: the badge label around a figure is English either way, so a
// reader's device locale would put "hace 6 meses" after "Added". en-001 is
// CLDR's international English — `17 Oct 2025`, without claiming the pages are
// British.
export const SITE_LOCALE: Locale = 'en-001';
