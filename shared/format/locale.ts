/**
 * Whose locale.
 *
 * A component has no business holding a locale setting of its own, and an app
 * shouldn't have to thread one through every call. So the page declares it
 * once, in the place the platform already reserves for it — `lang` on the
 * `<html>` element — and formatters read it from there. Resolution policy (the
 * browser signal, the account setting, the switcher) stays the app's; it ends
 * by writing its answer to `lang`, which is the single joint between the two.
 *
 * Explicit argument → document `lang` → the runtime's own locale.
 *
 * The floor is the runtime rather than a built-in default, which is where this
 * departs from designs that fall back to `en-US`: those ship a finite set of
 * translation bundles and must land inside it. `Intl` ships every locale, so
 * "whatever this reader's device says" is strictly better than any tag we
 * could pick.
 */

/**
 * `undefined` means *whatever this reader's device says* — the floor of the
 * resolution order below, and the value a caller passes when it has no reader's
 * stated preference of its own to offer.
 */
export type Locale = string | string[] | undefined;

/**
 * A language subtag, an optional script, then a region — `en-GB`, `pt-BR`,
 * `sr-Latn-RS`. Anything shorter is deliberately ignored; see `documentLocale`.
 */
const CARRIES_REGION = /^[a-z]{2,3}(-[a-z]{4})?-([a-z]{2}|\d{3})(-|$)/i;

const usable = (tag: string): boolean => {
  if (!CARRIES_REGION.test(tag)) return false;
  try {
    return Intl.getCanonicalLocales(tag).length > 0;
  } catch {
    return false;
  }
};

let lastRead: string | null = null;
let lastResult: string | undefined;

/**
 * The page's declared locale, when it declares one a formatter can use.
 *
 * *A bare language subtag is not a locale.* `lang="en"` says the page is in
 * English and says nothing about whether a date reads 26/09 or 9/26 — but
 * handed to `Intl`, CLDR fills the gap with a region and picks the US. So a
 * tag without a region counts as no stated preference and falls through to the
 * reader, where the page would otherwise silently acquire an author's
 * conventions it never declared. This is why `lang` works for choosing
 * translations but not, unqualified, for choosing formats.
 *
 * Re-read on every call, so a locale switcher that rewrites `lang` takes effect
 * with no subscription; the validation behind it is cached on the raw string.
 */
export const documentLocale = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const declared = document.documentElement.lang.trim();
  if (declared !== lastRead) {
    lastRead = declared;
    lastResult = usable(declared) ? declared : undefined;
  }
  return lastResult;
};

/** The locale a formatter should use, given what its caller passed. */
export const resolveLocale = (explicit?: Locale): Locale => explicit ?? documentLocale();
