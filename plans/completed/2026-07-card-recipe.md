# Card: from pseudo-component to recipe

_Completed 2026-07-23._ All five workstreams landed. `card.css` shrank to
surface + zones + variants + opt-in media; arrangement (`.cards` grid,
flush-stack collapse) moved to `layout.css`; the whole-card hit target
became the `.stretched-link` utility (new `stretched-link.css` + a Utilities
Storybook doc), replacing `.card__hit` in view-family.css and five demos;
`.description` became a typography utility; the ambient interior-spacing rules
(auto-margins, catch-all child padding) were deleted in favour of a `.pad`
inset utility plus `.flow`, hand-migrated across every dependent (Card story
fixtures, `Card.stories.tsx`, `renderers.tsx`'s `ProductCard`, data-view
Card/List, and the status-feedback / action-consequences / overview-detail /
problem-curated / purpose-keyed / semantic-zoom / focus-and-context demos).
The row/list variant's 2-column grid is now gated on `:has(> img, figure)`, so
image-less list cards stack cleanly. Card.mdx reframed to a recipe (base /
variants / compositions). Verified visually in Storybook and on the pattern
site (certainty fisheye, monitor tiles, collection-view grid + list).

Shrink `.card` to what actually makes a card a card — a bordered,
backgrounded surface with a small zone vocabulary — and redistribute the
rest of `card.css` to where each concern belongs: collection arrangement
to `layout.css`, the whole-card hit target to a named utility, and the
content-shape guessing to opt-in classes demonstrated in examples.
Card.mdx reframes from component anatomy to recipe.

## Context

`Card.mdx` presents Card as a component, but no `pp-card` element
exists — card is CSS only, and the doc itself already carries the
admission (line 6): "Dedicated card pattern has hit a wall. The sheer
variety in card types means forcing them into a single pattern creates
more problems than it solves." The variance is real: the only invariant
across card uses is visual grouping (border, background, spacing).

`card.css` (~330 lines) is four concerns wearing one name:

- _Surface_ — background, border, radius, `position: relative`. The
  true card; about six lines.
- _Collection arrangement_ — `.cards`, `.cards--list`, `.cards--flush`,
  `layout-grid` interplay, flush-stack radius collapse, the
  `.cards > *` container declaration. Arranging many items, not styling
  one.
- _Content-shape guessing_ — `figure:has(> *:nth-child(2))` image
  mosaics, `img:only-child` cover behaviour, `.description` clamping,
  and the catch-all child-padding selector ("everything has a padding
  because +/- everything can be interactive"). CSS trying to anticipate
  every content shape from inside the container; this is the wall the
  TODO describes.
- _Interaction mechanics_ — stretched link (`a::before { inset: 0 }`),
  `:focus-within` ring, hover border accent, `.hover-only-actions`,
  plus the `.card__hit` rules in `view-family.css`. Not card-specific:
  "make a region the hit target while keeping inner controls live".

The refactor direction follows the HUG methodology the styling rules
already profess (HTML + utility + group classes, per Kelp): `.card`
stays a _group class_, but one that earns exactly its scope.

### Research grounding

External pass run 2026-07-23 before locking the shape in:

- Nathan Curtis, [Cards and Composability in Design
  Systems](https://eightshapes.com/articles/cards-and-composability-in-design-systems/):
  card is where a system is forced past primitives into composition;
  "cards address internal composition; grids handle external
  arrangement". Named zones (header/main/footer) are what keep flexible
  cards legible — don't dissolve them. Instead of predicting content,
  "create examples exhibiting each one".
- [CUBE CSS](https://cube.fyi/composition.html): the composition layer
  is skeletal and content-agnostic — it must not carry colour or
  decoration. Governs what may move to `layout.css`.
- [Kelp](https://kelpui.com/docs/getting-started/principles/) ships no
  card at all; [USWDS](https://designsystem.digital.gov/components/card/)
  and Bootstrap ship rigid BEM anatomies for copy-paste audiences. This
  project sits between: recipe with worked examples.
- [Panda CSS recipes](https://panda-css.com/docs/concepts/recipes):
  "recipes aren't components themselves — they're styling systems that
  components consume". Base + variants + compositions is the frame for
  the rewritten doc.
- Bootstrap's
  [stretched-link](https://getbootstrap.com/docs/5.3/helpers/stretched-link/)
  and [Inclusive Components —
  Cards](https://inclusive-components.design/cards/): the hit-target
  mechanic is an established standalone helper. Known costs: breaks
  text selection; extra links inside a stretched region are easily
  missed by screen readers; any `transform`/`filter`/`will-change` on
  an intermediate element creates a new containing block and silently
  re-scopes the stretch (relevant with view transitions and hover
  animations).

## Workstreams

### A. Surface and zones

`.card` shrinks to: background (`--card-bg`), border, radius,
`position: relative`, plus the `card--plain` and `card--overlay`
variants. Spacing comes from composition — `.flow`, padding utilities,
`.layer`/purpose utilities for tinted variants — not from the card.

`card__header` / `card__footer` / `card__attributes` survive as thin
zone conveniences (flex row, space-between when multi-child). Strip the
`!important` padding overrides; zones position, markup spaces.

### B. Arrangement moves to layout.css

`layout.css` already owns the composition layer (`.flow`,
`.layout-grid`, `.flex-layout-grid`, `.sidecar`) and even holds a
commented-out card TODO. Move there, unchanged in behaviour:

- `.cards` / `.cards--grid` / `.cards--flush` arrangement rules;
- the flush-stack radius collapse and `-1px` border overlap;
- the `.cards > *` container declaration — load-bearing for grid-item
  container queries; must survive intact.

_Split, don't relocate wholesale:_ `.cards--list` currently also sets
item-internal visuals (80px image, aspect ratio, radius). Those are a
card presentation variant, not arrangement — they stay with the recipe
(as a row/list variant), or the demos that need them. Moving them to
`layout.css` would relocate the category error, not fix it.

### C. Stretched-link utility

Extract the whole-card hit mechanic into a named utility (working name
`.stretched-link`, matching the established term) in the utilities
layer: the `::before`/`::after` overlay, focus-visible ring on the
container, hover affordance hook. Reconcile with the existing
`.card__hit` rules in `view-family.css` — one mechanic, one name; the
view-family selectors that lift inner controls above the overlay come
along. Document under the _Utilities_ Storybook bucket (precedent:
Overflow, Counter, Visually hidden), including the containing-block
caveat and the inner-links accessibility cost.

### D. Demolish the guessing, hand-migrate the dependents

Delete the ambient content-shape rules; where a behaviour is genuinely
wanted, make it opt-in:

- figure mosaics → an explicit class (or inlined into the demos that
  use them), shown as a worked example;
- `.description` clamping → a line-clamp typography utility;
- `img:only-child` cover card → a variant class;
- the catch-all child-padding selector → deleted; markup declares
  spacing (`flow`, padding utilities).

Dependents lean on today's implicit behaviours (auto child margins,
list-image sizing) and get migrated file by file, no regex passes:

- demos: `status-feedback`, `action-consequences`, `overview-detail`,
  `problem-curated-view`, `purpose-keyed-view`, `semantic-zoom`,
  `data-view/CardView` + `ListView`, `focus-and-context`;
- `templates/collection-view/renderers.tsx`;
- Card story fixtures (8 HTML files + `Card.stories.tsx`);
- `view-family.css` card rules (workstream C overlap).

### E. Card.mdx reframes as recipe

Same title, same docs id — `Components/Card` has 13 referers (6
`ComponentRef`s in pattern content, 7 Storybook cross-links) that point
at the _concept_; retitling buys churn with no reader benefit. The page
content states the thesis instead: a card is a surface recipe, not a
component. Structure per the Panda frame — base (surface), variants
(plain, overlay, flush, row), compositions (card + flow, card +
stretched-link, cards in grid/list) — each a worked example rather than
an anatomy spec. Replace the line-6 TODO with the resolution.

## Verification

- `scripts/check-story-buckets.mjs` and the cross-reference validator
  stay green (no retitles expected; Utilities entry for stretched-link
  is additive).
- Visual sweep of every dependent demo, the collection-view template
  stories, and the Card stories in Storybook; flush stacks and list
  layouts against main.
- Grid-item container queries still fire (the `.cards > *` container
  declaration survived the move).
- Whole-card links: click, keyboard focus ring, inner
  buttons/dropdowns still individually operable in view-family demos.
