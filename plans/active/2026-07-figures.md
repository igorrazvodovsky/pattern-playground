---
title: "Figures: dates, numbers, and money as design material"
status: "active"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-25"
area: "components"
promoted_to: ""
superseded_by: ""
---
# Figures: dates, numbers, and money as design material

Capture the project's guidance on how figures render — dates, times, durations,
counts, percentages, currency — as a Storybook *Foundations* entry, and settle
where the rest of the content-formatting family lands when it arrives.

## Design framing

Prose already has a home. `prose.mdx` treats words as design material: "the
words, phrasings, labels, and linking choices through which the system takes its
turn". The figures have no equivalent, and they are the other half of what an
interface actually says. `17 Oct 2025`, `9 months ago`, `1.2k`, `£1,204,338.11`,
`£1.2M` — each is an authored choice about what the reader is meant to do with
the value, and the project currently makes those choices ad hoc.

The gap is visible in the code. Across 8 files that format a date or a number:
8 call sites hardcode `en-GB`, 1 hardcodes `en-US`, and 12 call
`toLocaleDateString()` / `toLocaleTimeString()` bare, inheriting whatever locale
the reader's browser reports. The same demo corpus therefore renders the same
kind of value three different ways, which is a convergence failure of exactly
the sort the form language exists to prevent.


## Scope: the documented, not the documenting

These rules govern *components, patterns, and demos* — the material being
documented, which is what ships into products and meets real readers.

The pattern site and Storybook are *containers for documenting that material*.
They are not subjects of the rules. Their own chrome — the `added`/`updated`
badges from `plans/completed/2026-07-pattern-dates.md`, timestamps in prose, figures
in explanatory copy — is authored English documentation, and does not follow the
reader.

The container therefore needs one neutral form rather than a locale. *ISO 8601*
(`2025-10-17`) is the recommendation: language-independent, unambiguous,
sortable, and already carved out in the entry as the form for values that are
sorted or transmitted rather than read. It also avoids inferring a locale from
the author, whose language and region do not pair into a conventional one.

A demo rendering a product surface *is* documented material and follows the
reader. The badge above it is chrome and does not. The line is what the thing
would be if it shipped.

## Placement

*The convergent rules go to Storybook `Foundations/`, not the pattern site.*

The decision follows a resolution the project has already taken, not the
bilingual clause in the role model. Colour, Typography, Layout, Motion, and
Iconography live only in `packages/components/src/stories/foundations/`, and the
workspace-split closure kept them there deliberately — "the foundations-material
pages Layout/Color, all kept in Storybook per closure workstream 1 / T6"
(`plans/completed/2026-07-intra-site-link-validation.md`). When prose still
linked them as `/patterns/foundations/material/…` site pages, the verdict was
that those links were *stale*: they were rewritten to
`<ComponentRef id="foundations-layout--docs">` and
`<ComponentRef id="foundations-color--docs">`, and the same plan records that a
`/patterns/foundations/overview` page was ruled out because "Color/Layout/
Typography/… are separate `role:component` docs, so any Storybook ref would
misrepresent the whole level".

`.claude/rules/documentation.md` still cites `foundations/material/color` as a
`PatternRef` example; that line is stale against this resolution and is worth
correcting while the territory is open.

So the material shelf is Storybook-only by decision, and figures are material in
the same sense a type scale is: a token set plus the rules for applying it,
behaving identically wherever deployed.

*The generative half stays distributed. No new pattern node.*

Choosing relative over absolute time, or a rounded figure over an exact one, is
genuine force-resolution. It does not follow that it earns a node. The role
model's rule applies directly: "author one well-situated move and keep suspected
sibling moves as named forces or sections within it until they earn nodes of
their own". The homes already exist:

| generative question | lives in |
| --- | --- |
| regional format variation, locale resolution | `localization.mdx` § Regional — has a commented-out *Format adapters* section that this work uncomments |
| relative vs absolute, recency, staleness | `temporality.mdx` § History, § Duration |
| forgiving parsing of typed dates and amounts | `data-entry.mdx` |
| numeric alignment, density of figures in a grid | `Table.mdx`, `Stat.mdx` |

*The asymmetry with prose is deliberate.* Words and figures are the two things
an interface says, but they land on different surfaces: `prose.mdx` is a
pattern-site foundation framing itself as "a set of *generative moves*", while
figures gets a material entry plus distribution. The reason is not that figures
are less generative — it is that their generative questions already have four
homes, listed above, and prose's did not. Localization owns regional variation,
Temporality owns relative-versus-absolute, Data entry owns parsing, the grid
components own setting. Prose had no such distribution available, so it needed a
page to be the distribution. Figures would be building a hub over territory that
is already occupied.

*The anchoring tension gets named inside the foundation, not spun out.*
*Precision versus scanability*: an exact value serves audit, citation, and
comparison; a rounded or relative one serves scanning and recall. Record the
fission signal — if this tension keeps getting re-derived across dates, counts,
money, durations, and chart axes *with different resolutions each time*, that is
when it earns a pattern node. One shared resolution means it stays a section.

## Naming

Title: `Foundations/Figures` — id `foundations-figures--docs`.

It names the stratum rather than an inventory of its contents, so it stays
accurate as units, percentages, and durations arrive without a retitle. The
alternate is the plainer `Foundations/Numbers and dates`, which reads more
directly but under-describes currency and units and would need widening later.
`Foundations/Data formats` is rejected: it collides with the `data.mdx`
foundation (*Data & Information*) on the head noun.

The entry originally shipped as `Foundations/Notation`. That title named the
same stratum but read too broadly — "notation" spans any symbolic system
(musical, mathematical, diagrammatic), where the entry only ever covered
figures. `Figures` also pairs directly with `prose.mdx`, the entry's explicit
counterpart, and the term the entry already used for itself throughout its own
prose ("the figures stratum"). Retitled and swept — every `ComponentRef` id,
Storybook link, and code comment pointing at the old id.

The title is load-bearing — `scripts/check-story-buckets.mjs` enforces the bucket
and the derived docs id is referenced by `ComponentRef` ids and `realised_by:`
values, so a retitle means a referer sweep.

## Decisions to ratify

### Locale

*Specify the format. Never specify the locale.*

The project is not locale-specific. The British conventions currently spread
through the corpus are a historical artefact, not a decision, and the goal is to
render in the reader's locale wherever the platform can supply it. `localization.mdx`
already teaches this — "rendered through locale-aware formatters rather than
hardcoded patterns" — and the components should stop contradicting it.

Concretely: never name a locale at a call site; state the *options*. The locale
is resolved in one place, in this order — an explicit argument where a caller
holds a reader's stated preference, else the page's `lang`, else `undefined`,
which takes the runtime locale.

*A bare language subtag does not count.* `lang="en"` says the page is in English
and says nothing about whether a date reads 26/09 or 9/26; handed to `Intl` it
resolves to US conventions (`9/26/52`), and `pt` resolves to Brazil. So `lang`
is honoured only when it carries a region — `de-DE` yes, `en` no — and
otherwise falls through to the reader. This is the difference between choosing a
translation, which needs only the language, and choosing a format, which needs
the region too. It also means `Base.astro`'s `lang="en"` is correct as it
stands: it declares the language truthfully and claims no conventions.

The floor is the runtime rather than a built-in default. A library shipping a
finite set of translation bundles must fall back to one it has, usually `en-US`;
`Intl` ships every locale, so the reader's device is a better floor than any tag
an author could pick.

This reframes what counts as a bug. Bare `toLocaleDateString()` is wrong, but not
for the reason an earlier draft of this plan gave — following the reader is the
correct half. It is wrong because it states no *format* either, so the intent is
unstated and the reader gets their locale's default short form; for `en-US` that
is `9/26/52`, a two-digit year. The fix is adding options, not pinning a locale.

Consequences that follow, and that the entry documents:

- The house/CLDR divergences an earlier draft catalogued — ISO short dates,
  forced 12-hour clocks, `Sep` over `Sept` — mostly *dissolve*. Twelve- versus
  twenty-four-hour and month-first versus day-first are answered per reader by
  data the platform ships.
- ISO 8601 survives with a narrower job: values that are sorted, parsed, or
  transmitted (`datetime` attributes, sortable column values), never prose.
- Currency and locale become explicitly different axes. The currency is a fact
  about the amount (`currency: 'GBP'`); placement, separators, and symbol form
  belong to the reader. Always state the first, never the second.
- The GOV.UK-derived rules — `one` written out, `to` in ranges, `£138 million` —
  are *English prose* conventions, not formatting. They move to a clearly scoped
  section and are marked not to be ported into translations.
- Tabular figures are a Latin-digit assumption. A locale rendering Arabic-Indic
  digits may have no tabular set, so column layouts must size from content
  rather than a digit count. This is the one place locale-following genuinely
  costs something.

### Units and measurement

Units divide on a line that decides everything downstream, and it is *not* the
line the currency section uses.

*Domain-fixed units* — bytes, pixels, SI in a scientific reading, anything where
the unit is a fact about the value. These behave like currency: the unit is
stated, `Intl.NumberFormat` with `style: 'unit'` renders it in the reader's
conventions, and nothing converts. `5.5 km` in `en-GB`, `5,5 km` in `de-DE`,
`5.5 キロメートル` in `ja-JP` at `unitDisplay: 'long'`. Solved.

*Preference units* — distance, mass, temperature, volume, where the reader's
region has a convention and the *value itself* must change. These do not behave
like currency at all, and the platform helps with neither half:

- `Intl` does not convert. `style: 'unit', unit: 'kilometer'` renders
  `5.5 kilometers` for an `en-US` reader — the unit name is localised, the
  quantity is untouched. Nothing in `Intl` turns it into miles.
- There is no preference signal. `new Intl.Locale('en-US').measurementSystem` is
  unsupported on Node 22, so the runtime will not tell you the reader is
  imperial-preferring.

So measurement preference is *product state* — asked for, stored, and applied —
not something derived from the locale the way date order is. That is a genuine
asymmetry with everything else in the entry, and stating it is most of the value
of covering units at all. The conversion itself is a domain decision (which
units, what rounding, whether to show both) rather than a formatting one.

*File sizes* are a third case. `Intl` has decimal units — `megabyte` renders
`1.5 MB` — but no binary prefixes; `unit: 'mebibyte'` throws. The 1000-versus-1024
question is therefore unanswerable by the platform and must be decided per
product, with the chosen convention stated rather than implied.

*Durations* — `Intl.DurationFormat` is `undefined` on Node 22, so `2 hrs 30 mins`
composes from `style: 'unit'` parts today. Durations inherit the precision
tension directly: `2 hrs 30 mins` orients, `2:30:14` reconciles, and rounding to
the largest useful unit is the same call as rounding a count.

### Relative-to-absolute threshold

*Keep 7 days. Record that it is a judgement, not a standard.*

`time-utils.ts` already switches at 7 days. Atlassian's date-and-time guidance
uses the same number: relative up to 7 days, then a date stamp. Primer's
`RelativeTime` defaults to 30 days (`P30D`). The corpus disagrees, which means
there is no number to defer to — 7 days is chosen because it matches the span in
which "last Tuesday" is still a thing a reader holds, and it is what the code
already does.

### Relative time must carry its absolute value accessibly

This is a defect in the current implementation, not just a documentation gap.
`formatTimestamp()` returns a bare string — no `<time datetime>`, no absolute
value anywhere in the markup. Three call sites render it directly
(`item-view/custom-components.tsx`, `commenting/core/CommentThread.tsx`, and via
`components/task/index.ts`).

The rule: relative text always ships inside `<time datetime="…">` carrying the
machine-readable ISO value, and the absolute value must be reachable *without
hover*. A `title` attribute alone does not qualify — it has no keyboard-native
trigger, and screen readers announce the visible text and ignore it. Primer
documents this and offers `noTitle` precisely so the absolute value can be
delivered through real tooltip markup instead.

### UTC midnight

Unquoted YAML and date-only ISO strings parse as UTC midnight. Format from
`toISOString().slice(0, 10)` parts, never `toLocaleDateString()` on the raw
`Date` — a reader at a negative UTC offset otherwise sees the previous day.

## What the entry contains

1. *Fun meter* — low. Date and number formatting is about as thoroughly settled
   as interface topics get, and the meter tracks how interesting something is to
   think about. What little there is sits in the precision tension and in the
   fact that the figures stratum has no page while the words one does.
   Then a one-sentence definition of the figures stratum.
2. *Dates and times* — the four lengths (full / long / medium / short), the
   `en-GB` renderings of each, the 7-day relative threshold with its accessible
   markup, ranges (`to`, not hyphens), 12-hour with lowercase `am`/`pm`,
   `midday` over `12 noon`, and the UTC-midnight rule.
3. *Numbers* — numerals from 2 upward and `one` written out, comma thousands
   separators, `0.5` not `.5`, `to` in ranges, `%` always with a numeral, and
   when abbreviation (`1.2k`, `£1.2M`) is allowed. GOV.UK forbids `m`/`bn`
   abbreviation outright; the project's surfaces include dense grids where full
   words do not fit, so this needs a stated exception rather than silent
   divergence.
4. *Currency* — symbol adjacent to the amount with no space, decimals only when
   pence are present (`£75`, `£75.50`, never `£75.00`), and when an ISO code is
   required instead of a symbol (multi-currency contexts, where `$` is
   ambiguous).
5. *Units and measurement* — the domain-fixed / preference split, the two things
   `Intl` will not do for preference units, file sizes and the binary-prefix
   gap, and durations.
6. *Setting figures* — `font-variant-numeric: tabular-nums` wherever figures
   stack or are compared, right alignment for numeric table columns, and where
   truncation is allowed. Both already exist unsystematically
   (`table.css:27`, `fisheye.css`, `semantic-zoom.css`, `.pp-table-align-right`);
   this names the rule they are instances of.
7. *Precision versus scanability* — the anchoring tension, in the register
   `prose.mdx` uses for its tensions.
8. *Related patterns* and *Resources & references*, with `PatternRef` links out
   to Localization, Temporality, and Data entry.

## Steps

### 1. Settle the title — *done*

`Foundations/Figures`, id `foundations-figures--docs`. Shipped first as
`Foundations/Notation`; retitled — see § Naming.

### 2. Author `Foundations/Figures` — *done*

`packages/components/src/stories/foundations/Figures.mdx`, following the
sibling foundations' shape (commented-out fun meter, `role:component` /
`activity-level:cross-cutting` / `atomic:visual-element` tags, *Enacted
qualities* section).

Authored ahead of the formatter module, so its examples are literal text rather
than live output — which matches the siblings (Motion and Typography render no
live examples either). Step 3 makes them live, and until it lands the entry and
the code can disagree.

### 3. Formatter module — *done*

*Rendering needs no library.* Nothing date- or number-shaped is in the tree
today, not even transitively, and once the locale stance above removes the house
divergences, `Intl` covers the entry outright — verified against Node 22's ICU
across `en-GB`, `en-US`, `de-DE`, `ja-JP`, `fr-FR`, and `ar-EG`. Separators,
decimal marks, digit systems, clock convention, month order, and currency symbol
placement all come from the locale data. `trailingZeroDisplay: 'stripIfInteger'`
gives `£75`/`£75.50`; `notation: 'compact'` gives `1.2k`/`1.2m`;
`Intl.RelativeTimeFormat` renders the relative phrase. Only the relative-time
*bucketing* is ours.

Adding a dependency is not itself an objection — it just buys nothing here.
`Intl` *is* the locale database; a formatting library wraps it.

*Two jobs do want one, and locale-following makes the case stronger, not weaker:*

- *Parsing typed input.* `Intl` cannot parse at all, and accepting a date or
  amount in the reader's own conventions is materially harder than rendering
  one. This is step 4's data-entry territory and the strongest candidate.
- *Calendar arithmetic and time zones.* `typeof Temporal === 'undefined'` on
  Node 22. Not assuming every reader is in one place makes DST-correct
  differences and calendar-aware comparisons ("last month") real rather than
  theoretical. The current ms-subtraction bucketing in `time-utils.ts` is fine
  for "9 months ago" and wrong for anything calendar-exact.

Neither blocks the formatter module. Both should be decided on their own
evidence when the need lands, not folded in here.

*It landed in `shared/format/`, not `packages/components/src/utility/format/`.*
The plan put it in the component library; the sweep found
`shared/data/bindings/access.ts` — `formatBoundValue`, the single funnel every
bound entity value passes through — breaking three rules at once (`'en-GB'`
pinned, `$${value.toFixed(2)}` hardcoding a symbol *and* forcing `.00`,
`${value}%` bypassing `style: 'percent'`). `shared` imports from no workspace by
construction, so a module in the library is unreachable from it. Moving the
module down one layer keeps one implementation and one import path;
`shared/package.json` gains a `"./format"` export. There is deliberately no
re-export at the old path.

Modules: `intl-cache.ts` (memoisation), `date.ts`, `number.ts`,
`relative-time.ts`, `index.ts` as the surface. `time-utils.ts` is now a
one-line deprecated re-export so `components/task/index.ts` keeps resolving.

The `typeof Intl !== 'undefined'` guards and the hand-rolled `formatFallback`
path are gone, as planned.

*The `<time>` obligation became a component.* `components/timestamp/`
renders the relative text, the `datetime` attribute, and the absolute value as
visually-hidden content inside the element — announced rather than inferred —
with `title` layered on for sighted mouse readers. The entry's "real tooltip
markup or the accessible name" is narrowed to this: `<time>` has no ARIA role,
so `aria-label` on it is not reliably exposed, and making every timestamp
focusable to host a tooltip would add a tab stop per row. All three render sites
use it. (It shipped first as a React component and is now the `<pp-timestamp>`
custom element — see step 6.)

*A latent bug came out with it.* The old bucketing selected a unit by
`Math.round(diff / unitMs)` walking year → month → week → day, so four days
rounded to one *week* and fell through to the absolute branch: the documented
7-day threshold was really about four. `relative-time.ts` replaces it with an
explicit threshold ladder, so 4–6 days now render relative where they did not
before. The old module also pinned `'en'`; the phrase now follows the reader.

The entry's examples are wired to the module through
`stories/foundations/figures-samples.tsx` — the locale tables and the
relative-time table are rendered, not transcribed, so the documented rendering
and the shipped rendering cannot drift.

### 4. Distribute the generative half — *done*

- `localization.mdx` — § *Locale resolution* and § *Format adapters* both
  written out of their comments. Resolution was uncommented alongside because
  the entry points at Localization for "whose locale", and pointing at a
  comment is pointing at nothing.
- `temporality.mdx` — § History gains *Relative or absolute*: which past the
  reader is being asked to hold, and why the threshold is a memory judgement.
- `data-entry.mdx` — § Forgiving format gains the locale-conventions paragraph;
  the section covered format variety but not whose conventions.
- `Table.mdx` — § *Figures in columns*; `Stat.mdx` — § *The figure*, the
  abbreviation case. Both link rather than restate.

### 5. Drift sweep — *done*

Replace the 21 inconsistent call sites with the formatter module. Two different
faults, both ending at the same fix:

- 9 sites *pin a locale* (8 `en-GB`, 1 `en-US`) — these override the reader.
- 12 sites call `toLocaleDateString()`/`toLocaleTimeString()` *bare* — these
  follow the reader correctly but state no format, so they render the locale's
  default short form.

Every one became a call into the memoised module. Three sites were more than a
locale swap:

- `EarthquakeNode.tsx` put a *formatted* string in a `datetime` shape prop. It
  now stores ISO and formats at render, which is what § *ISO 8601 is a separate
  job* asks for.
- `fisheye.tsx` held five module-scope `Intl` instances pinned to `'en-GB'`;
  they became thin functions over the module, keeping the same call sites.
- `access.ts` — see step 3. `AttributeBinding` gains an optional `currency`
  (ISO 4217, defaulting to GBP), because the currency is a fact about the
  amount and had nowhere to live.

The lint rule went in as two `no-restricted-syntax` selectors — bare `toLocale*`
*and* direct `Intl` construction, since `fisheye.tsx` would have slipped past a
`toLocale*`-only ban. Note flat config *replaces* rule options rather than
merging them, so the selectors are appended to the existing array at
`**/src/**/*.{ts,tsx}` and repeated in a second block for `shared/**` (no `src/`
segment), which exempts `shared/format/**`.

Unrelated and pre-existing, found while doing this: the same replace-not-merge
behaviour already dead-letters the `customElements.define` rule for
`**/src/components/**/*.ts`. Left alone — out of scope.

### 6. Element form and locale resolution — *done*

Two amendments to what steps 3–5 shipped, both raised after the sweep landed.

*The timestamp is a custom element, not a React component.* `<pp-timestamp>` is
a `LitElement` with `createRenderRoot() { return this }`, matching the charts
and `map`. Light DOM is load-bearing rather than stylistic: the point of the
component is a real `<time datetime>` in the document, and the visually-hidden
span needs the page's own `.visually-hidden`, which a shadow root would force us
to duplicate. Not a customized built-in (`<time is="…">`) despite the
`pp-button` precedent — WebKit doesn't implement `is=`. The React call sites
consume it as an intrinsic, exactly as they already consume `pp-table`, and pass
`isoDateTime(…)` where they hold a `Date`.

The move costs something the React version got for free: a component re-rendered
with its parent, so relative text refreshed incidentally, whereas an element
renders on connect and then never again — `20 minutes ago` would freeze
permanently. So the element joins a shared minute ticker while its text is
relative and leaves it when the text turns absolute. One interval for the page,
and none at all when nothing on screen is relative.

*The locale is resolved from the document.* `shared/format/locale.ts` reads
`lang` off `<html>`, subject to the region rule in § *Locale* above, and
`intl-cache.ts` resolves before building its cache key so `undefined` and the
tag it resolves to cannot key to separate entries. `document` is guarded for the
Astro build, which reaches this module through `shared/data/bindings/access.ts`.

No `MutationObserver`: the attribute is re-read on every format call and only
the validation is cached, so a switcher that rewrites `lang` takes effect
without a subscription. Verified in the browser — `de-DE` and `ja-JP` honoured
including the relative phrase (`vor 20 Minuten`), bare `de` and `en` ignored,
and reverting to `en` returns to the reader with no stale formatter.

The corresponding half is `localization.mdx` § *Where the answer is written
down*: the resolution cascade ends by writing its answer to `lang`, which is the
joint between resolution policy (the app's) and formatting (the components').

*A second defect surfaced while checking the first.* The under-a-minute case
returned the literal string `'now'` — the one output in `@shared/format` that
pinned English, sitting in the module the entry cites for the opposite rule.
CLDR carries a dedicated entry for it, so `format(0, 'second')` under
`numeric: 'auto'` gives `now` / `jetzt` / `今` / `maintenant`. The branch is now
just the bottom rung of the bucketing ladder rather than a special case outside
it. Verified across the whole ladder in four locales, and in the browser on the
row the first probe had skipped.

Also dropped: `utility/time-utils.ts`, the shim step 3 left so an existing
import path would resolve. Nothing imports it — `components/task/index.ts` is
its only consumer, and *that* file has no importers either — so it was a hop to
nowhere and `task/index.ts` now re-exports from `@shared/format` directly. The
dead barrel itself is left alone as pre-existing.

## Scalability and the dependency boundary

Four of the five axes scale without effort. The fifth is an architectural
requirement, not a preference.

*Locale coverage — free.* `Intl` ships the full CLDR set; the marginal cost of
the hundredth locale is zero, and `supportedValuesOf('unit')` already exposes 45
units. This is the axis a library scales *worst* on: it either wraps the same
data (no gain) or ships its own (bundle growth per locale).

*Bundle — 0 KB, and stays 0 KB.* Requirements grow, the payload does not.

*Adjacent needs — already native.* `Intl.PluralRules`, `ListFormat`,
`Segmenter`, and `DisplayNames` are all present, so plural category selection
and list joining need no dependency either.

*Call volume — the one that does not scale by default.* Measured on Node 22 over
20 000 calls:

| approach | per call |
| --- | --- |
| `toLocaleDateString(undefined, { dateStyle: 'medium' })` | 29.7 µs |
| cached `Intl.DateTimeFormat` instance, `.format()` | 0.6 µs |

A 51× difference, and effectively *all* of it is constructor cost (27.9 µs alone).
A 1 000-row table with three date columns is 3 000 constructions — around 90 ms
of pure formatting, which is several dropped frames.

This has a direct consequence for step 5: replacing bare `toLocaleDateString()`
with `toLocaleDateString(undefined, { … })` fixes the *correctness* bug and keeps
the *performance* one. The formatter module must therefore expose memoised
instances, cached on resolved locale plus options — roughly fifteen lines, and the
single most load-bearing implementation decision in step 3. Keying on the
resolved locale rather than constructing at module scope is what lets a reader
change locale mid-session without stale formatters.

*Surface count — scales through the module, and needs enforcement.* The failure
mode is bypass: someone calls `toLocaleDateString` directly and the corpus drifts
again. That is a lint rule, not a library — a `no-restricted-syntax` entry
banning direct `toLocale*` calls outside the formatter module, in the same spirit
as `check-story-buckets.mjs`. Worth adding with step 5 so the sweep cannot
silently undo itself.

### When a dependency becomes right

Five triggers, none of them met today. Each is listed with the signal to watch
rather than a date, because the answer is need-driven.

| need | why `Intl` cannot | trigger |
| --- | --- | --- |
| *Parsing typed input* | no parsing API at all | the first input accepting a date or amount in the reader's own conventions — step 4's data-entry work |
| *Interpolating figures into translated sentences* | `PluralRules` gives the category, not the composed sentence | the first translated string with a count in it; ICU MessageFormat territory |
| *Calendar and time-zone arithmetic* | `typeof Temporal === 'undefined'` | scheduling, DST-crossing durations, "last month" comparisons |
| *Duration formatting* | `Intl.DurationFormat` undefined | low value — composition from unit parts already works |
| *Unit conversion* | renders but never converts; no `measurementSystem` signal | a product needing imperial readers; the conversion is a lookup table, the *preference* is product state |

The likeliest first arrival is message composition, not parsing — a count inside
a translated sentence shows up in ordinary product work long before a
locale-tolerant date field does.

Dependency cost is not an objection in this project. The point is only that
adding one before its trigger buys nothing and puts a wrapper between the code
and the locale data it already has.

## Verification

- `npm run test` (eslint) — no new findings; the two new selectors were probed
  with a throwaway file in both `packages/components/src` and `shared` and fire
  in each, while `shared/format` stays exempt. The repo's standing eslint noise
  (`public/storybook/**` build output, `.claude/worktrees/**`) and its ~268 pre-
  existing `tsc` errors are unchanged and untouched.
- `scripts/check-story-buckets.mjs` — passes.
- `npm run build` — passes; the cross-reference validator resolved 147
  `ComponentRef` ids, 61 `PatternRef` slugs, and 394 intra-site links, including
  every new one in both directions.
- Storybook renders the entry with live formatter output, checked by hand: the
  locale tables, the currency table, and the relative-time table across the
  threshold (3 days relative, 8 days absolute). *Not* checked in two colour
  modes — `base.css` sets `color-scheme: light only`, so the library has one.
- Locale resolution, in Node and again in the browser: regioned tags honoured
  including a script subtag (`sr-Latn-RS`), bare and malformed tags ignored,
  explicit argument winning over both, no `document` at all under the Astro
  build, and no stale formatter when `lang` changes mid-session. The
  UTC-midnight rule holds under `TZ=America/Los_Angeles`.
- `<pp-timestamp>` end to end in the browser: light-DOM `<time datetime>` with
  the visually-hidden absolute value, `title` present only when the text is
  relative, and the minute ticker advancing `1 minute ago` → `3 minutes ago`
  with nothing else re-rendering it. Every row of the relative table follows
  the reader under `de-DE` and `ja-JP`, `now` included.

## Open questions

- *Does the entry want a pattern-site twin after all?* No, and the closure
  resolution above settles it more firmly than "not yet authored" would have —
  the material pages were kept in Storybook on purpose and the site links to them
  were rewritten as stale. Figures follows the shelf. What stays genuinely open
  is whether the shelf itself is right, which is a question about Colour and
  Typography first and only by inheritance about this entry.
- *Does `Intl.DurationFormat` change the duration guidance when it lands?* It is
  `undefined` on Node 22, so durations compose from unit parts today. When it
  ships, the composition goes away but the rounding decision does not.
- *A Storybook toolbar locale switch.* It would make the variation visible
  instead of accidental, and would answer "what locale is this screenshot".
  Deferred — not now. The entry's sample tables pass explicit locales instead,
  which shows the variation without moving the page's own reader.
- *Measurement preference has no platform signal.* See § Units below; the
  product must ask and store it. Whether this project's demos need to model that,
  or just document it, is undecided.

## Residue

- *The memoised path costs ~2.5 µs, not the 0.6 µs a bare cached instance
  costs* — the difference is `JSON.stringify` on the options object per call.
  Still 12× better than the 32 µs bare path, and a 3 000-cell table is 7.6 ms
  rather than 96 ms. A WeakMap tier keyed on options identity measured ~1.2 µs;
  not taken, because the complexity buys a millisecond on a table nobody has.
- *`<pp-timestamp>` leaves sighted keyboard-only readers without the absolute
  value.* They get `title` only, which needs a pointer. Fixing it properly means either
  a focusable timestamp (a tab stop per row) or a disclosure, and both cost more
  than the gap. Primer has the same gap. Worth revisiting if a surface appears
  where the absolute value is load-bearing.
- *Relative bucketing truncates, which reads differently forwards and back.*
  A past time 1h59m ago is "1 hour ago" — correct, it *has* been at least an
  hour. A future time 1h59m away is also "in 1 hour", which under-promises. The
  corpus renders only past timestamps today, so it was left symmetric. Also:
  exactly 7 days falls to absolute, days 0–6 stay relative.
- *`formatBoundValue`'s currency default is GBP*, set on `AttributeBinding`.
  No binding declares one yet, so every bound amount is GBP by default. The
  field exists so the fact can be stated where it belongs; the demo data has not
  been audited for what its amounts actually are.
- *Relative time is the only output in the module that emits words*, so it is
  the only one that can read German inside an English sentence when the reader's
  locale and the page's language disagree. A region-less `lang` — which is what
  this site declares — sends the phrase to the reader, and that is where the
  coherence argument for following `lang` would actually bite. Nothing in the
  corpus depends on it today; a product mixing a fixed page language with an
  unconstrained reader locale would want the phrase and the figures resolved
  separately, which the current single source cannot express.
- *The minute ticker re-renders every relative element on the page together.*
  Cheap at corpus scale (a handful per view) and self-limiting — an element
  leaves the set the moment its text turns absolute, and the interval stops
  when the set empties. A feed of hundreds of live timestamps would want
  staggering or a coarser cadence for the older ones.

## Resources & references

- [Atlassian / Date and time](https://atlassian.design/foundations/content/date-time)
  — four format lengths, the 7-day relative threshold, truncated dates for tight
  space.
- [Intuit content design / Numbers](https://contentdesign.intuit.com/style-and-usage/numbers/)
  — numerals-over-words thresholds, decimals to the hundredth, currency spacing.
- [GOV.UK style guide](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/style-guides/a-to-z-style-guide/)
  — the `en-GB` source for date, time, number, and money style; `to` in ranges;
  no `£75.00`.
- [Primer / RelativeTime](https://primer.style/product/components/relative-time/)
  — the 30-day counter-threshold, and the `title`-is-not-accessible finding.
- [Lightning / Currency](https://www.lightningdesignsystem.com/2e1ef8501/p/5033fb-currency)
  and [Material 2 / Data formats](https://m2.material.io/design/communication/data-formats.html#date-and-time)
  — both client-rendered and not machine-readable; read by hand before the
  currency and truncation sections are written.
- [D'Amato / Numbers](https://system.damato.design/?path=/docs/patterns-numbers--docs)
  — same, and the closest existing analogue to the entry being written.
