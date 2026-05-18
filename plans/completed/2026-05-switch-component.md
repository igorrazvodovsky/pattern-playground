---
title: Add and document Switch component
status: done
kind: exec-spec
created: 2026-05-14
last_reviewed: 2026-05-14
area: operations
---

# Add and document Switch component

## Context

The repertoire has Checkbox documented as a binary-commit primitive but no Switch — even though Switch is the canonical pattern when the effect should apply *immediately* on flip (a setting taking effect now), as opposed to a checkbox that defers commit until form submit. Open UI's explainer (linked below) frames Switch precisely on that commit-semantics distinction, which makes it a useful sibling to Checkbox in `operations/`. Adding Switch closes an obvious gap and lets later patterns (Settings, Form, MorphingControls) link to a defined primitive instead of describing the affordance inline each time.

This implementation includes a `pp-switch` Lit web component so the operation has a documented, encapsulated control in addition to its repertoire page — matching the level of investment given to Input, Range, and Select rather than the lighter Checkbox treatment.

## Approach

Follow the Range/Input precedent for the Lit component, and the Checkbox precedent for the Storybook pages, with two additions agreed in planning: a commit-semantics + accessibility section in the body, and a real `pp-switch` custom element used in the stories.

### Files to create

1. `src/components/switch/switch.ts` — Lit element `PpSwitch`
2. `src/components/switch/switch.css` — scoped styles
3. `src/stories/operations/Switch.mdx` — documentation page
4. `src/stories/operations/Switch.stories.tsx` — Storybook stories using `<pp-switch>`
5. `src/stories/operations/Switch.profile.ts` — generative profile

### Files to edit

- `src/components/register-all.ts` — add `PpSwitch` import and registration entry under the base/primitive section, alongside `pp-input`, `pp-range`, `pp-select`. No dependencies, so no ordering constraint beyond the existing primitive block.

No edits to `pattern-graph.json`, `activity-levels.json`, or any registry — Storybook auto-discovers by `<Meta title="Operations/Switch" />`, and the other JSONs are generated.

### Lit component: pp-switch

Mirror `src/components/range/range.ts` shape: properties with `@property` decorators, scoped `unsafeCSS(styles)`, bulletproof `connectedCallback`, focus/blur passthrough, typed custom event, JSDoc summary in design-repertoire voice, `HTMLElementTagNameMap` declaration.

Properties:

- `checked: boolean` (reflect, default `false`)
- `disabled: boolean` (reflect, default `false`)
- `name: string`
- `label: string` and `labelledby: string` (use existing `textFromIdRefs` helper from `src/utility/accessible-name.ts` — same as Range)
- `describedby: string`
- `size: 'small' | 'medium' | 'large'` (reflect, default `'medium'`)
- `required: boolean` (reflect, default `false`)

Internal markup: a single `<input type="checkbox" role="switch" class="switch__control">` with `aria-checked` bound to `checked`, change handler that flips `this.checked` and emits a typed `change` CustomEvent with `{ checked }` detail. No Shadow DOM (per `web-components.md`: "Don't use Shadow DOM by default").

Accessibility contract from the [WAI-ARIA APG Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/):

- `role="switch"` is set explicitly (even though `<input type="checkbox">` exists) so assistive tech reports on/off rather than checked/unchecked.
- `aria-checked` is `"true"` or `"false"` only — never `"mixed"`. The component's `checked` property is a strict boolean; no third state is reachable through the API.
- Space toggles the switch; the native `<input type="checkbox">` provides this for free. Enter does *not* toggle per APG (which is the default native behaviour) — explicitly noted here so a later contributor doesn't add an Enter handler "for symmetry with buttons".
- The accessible name comes from the surrounding `<label>` or the `label`/`labelledby` properties; `aria-readonly` is not used (per APG, switches are either enabled or disabled, not readonly).

JSDoc summary opening line (repertoire voice, not catalogue voice): *"Switch lands a binary preference the moment the actor flips it — no submit step in between."*

CSS: track + thumb styled via documented `--switch-*` custom properties (track-color, on-color, thumb-size), small/medium/large size variants, focus ring matching Range's `--c-focus-ring` token, disabled state. Light DOM, BEM-ish class names: `.switch`, `.switch__control`, `.switch__track`, `.switch__thumb`, `.switch--checked`, `.switch--disabled`, `.switch--small|medium|large`. Match the styling conventions in `src/components/range/range.css`.

### register-all.ts edit

Add the import:

```ts
import { PpSwitch } from './switch/switch.js';
```

And in `registerAllComponents`, in the base/primitive block:

```ts
{ tagName: 'pp-switch', constructor: PpSwitch },
```

Placed near `pp-input` and `pp-range`.

### Switch.mdx

Section order per `.claude/rules/documentation.md`. Body content beyond the basic template per the design call. British spelling, sentence-case headings, design-repertoire voice (human-situation-inward).

```mdx
import { Meta, Story, Canvas } from '@storybook/addon-docs/blocks';
import * as SwitchStories from './Switch.stories.tsx';
import { profile } from './Switch.profile';

<Meta title="Operations/Switch" of={SwitchStories} tags={['activity-level:operation', 'atomic:primitive', 'role:component', 'mediation:individual']} />

> 🥱 Fun meter: dependency.

# Switch

Flip a setting whose effect should apply the moment the actor commits, with no intervening submit step.

<Canvas>
  <Story of={SwitchStories.Switch} />
</Canvas>

## When to reach for a switch over a checkbox

[Short paragraph]: immediate-effect settings (notifications on/off, dark mode, feature toggles) belong on switches; deferred-commit form fields belong on checkboxes. The screen affordance can look similar, but the conversational turn is different — a switch closes the loop in one move; a checkbox sets up a later commit. Link to the Interaction foundation for the turn-taking framing.

<Canvas>
  <Story of={SwitchStories.States} />
</Canvas>

## Accessibility

`pp-switch` follows the [WAI-ARIA APG switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/):

- `role="switch"` so assistive tech announces "on/off" rather than "checked/unchecked".
- `aria-checked` is strictly `"true"` or `"false"` — switches do not have a mixed state. If a third state is needed, the answer is a different control, not an extended switch.
- Space toggles the switch (native checkbox behaviour, preserved). Enter does not toggle, by APG convention.
- The accessible name comes from a wrapping `<label>` or the `label`/`labelledby` properties.

Open UI's `<input type="checkbox" switch>` proposal (linked below) collapses the `role` setup to a single native attribute but is not yet broadly supported; the role-based approach works today and is what `pp-switch` ships with.

## Related patterns

- *Precursors*: [Checkbox](../?path=/docs/primitives-checkbox--docs) — same binary-state input, different commit timing.
- *Complementary*: [Button](../?path=/docs/primitives-button--docs) — for one-shot actions where state isn't carried forward; [Undo](../?path=/docs/operations-undo--docs) — instant-commit changes benefit from a reversible escape hatch.
- *Tangentially related*: [Morphing controls](../?path=/docs/operations-morphing-controls--docs) — a switch can rebind to a different control once flipped.

## Resources & references

- [WAI-ARIA Authoring Practices — Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)
- [Open UI — Switch explainer](https://open-ui.org/components/switch.explainer/)
- [Open UI — Switch research](https://open-ui.org/components/switch/)
```

### Switch.stories.tsx

Mirror Range.stories.tsx shape (since the story drives a custom element via ref), not Checkbox.stories.tsx (which uses a native input). React stories embed `<pp-switch>` as a custom-element JSX tag; the typing comes from the `HTMLElementTagNameMap` declaration in `switch.ts`.

- `SwitchArgs`: `label`, `checked`, `disabled`, `size`
- `meta.title = "Operations/Switch"`, `meta.tags = ['autodocs', 'activity-level:operation', 'atomic:primitive', 'mediation:individual']` (matching Range)
- Primary `Switch` story: controlled component pattern (ref + state + `change` listener), wired to args
- `States` story: a grid showing off, on, disabled-off, disabled-on, and small/medium/large sizes
- `ToggleInteraction` play story: click the switch twice, assert `aria-checked` flips each time

### Switch.profile.ts

```ts
import type { GenerativeProfile } from '../../pattern-profile';

export const profile: GenerativeProfile = {
  operatesOn:
    'a single setting whose change should take effect the moment the actor flips it, with no submit step in between',
  produces: 'a control whose state and effect are bound together — flipping it *is* the commit',
  enacts: 'immediacy of commit; legibility of current state at a glance',
};
```

## Critical files

- `src/components/range/range.ts` — Lit shape and bulletproof loading template
- `src/components/range/range.css` — scoped-styles template
- `src/components/register-all.ts` — register `pp-switch` here
- `src/utility/accessible-name.ts` — `textFromIdRefs` helper to reuse
- `src/stories/operations/Range.stories.tsx` — story shape for a custom-element-driven story
- `src/stories/operations/Checkbox.mdx` and `.profile.ts` — documentation tone and profile shape
- `src/pattern-profile.ts` — profile type
- `.claude/rules/documentation.md` — required section order, voice, linking
- `.claude/rules/web-components.md` — bulletproof loading, no Shadow DOM, centralised registration

## Verification

1. `npm run storybook` (port 6006) and confirm `Operations > Switch` appears in the sidebar.
2. Open the Switch page: primary story renders, controls toggle `checked`/`disabled`/`label`/`size`, States grid shows all variants, ToggleInteraction play runs without error.
3. With browser devtools, confirm the rendered `<pp-switch>` contains an `<input type="checkbox" role="switch">` whose `aria-checked` flips on click and on keyboard Space, and that pressing Enter does *not* toggle (matching the APG contract).
4. Confirm `pp-switch` is registered: `customElements.get('pp-switch')` returns the constructor in the browser console.
5. Confirm cross-links from the Related-patterns section resolve (Checkbox, Button, Undo, MorphingControls pages load).
6. `npm run build` (or whatever the project's typecheck command is per AGENTS.md) passes — Switch.stories.tsx type-checks against `Meta<SwitchArgs>`, and `HTMLElementTagNameMap['pp-switch']` is picked up.

## Out of scope

- No new entries in `src/stories/data/` — controls only, no mock data needed.
- No edits to `pattern-graph.json` or `activity-levels.json` — generated, not hand-edited.
- No `indeterminate` state — per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/switch/), switches do not have a mixed state. If a third state is ever needed, the answer is a different control (segmented or radio), not an extension to Switch.
- No custom Enter-to-toggle handler. Per APG, Space toggles and Enter does not; the native `<input type="checkbox">` already implements this and we leave it alone.
