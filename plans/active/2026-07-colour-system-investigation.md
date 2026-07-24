# Colour system investigation

Status: findings 1–3 implemented on `worktree-colour-investigation`; dark mode
(finding 4) still open. Changes verified against the real tokens in a browser
(per-hue ramps render smooth and in-gamut; semantic tints sit correctly on white
and grey; boosted filled badges are vivid and legible). Chosen chroma model:
per-hue ramps clamped to each step’s own gamut ceiling (`scripts/palette-chroma.mjs`).

The colour system follows the two Evil Martians pieces it was seeded from — OKLCH
notation, and a "dynamic theme" built from one lightness ramp and one chroma ramp
with hue as the only per-palette variable. That architecture is half-right. The
lightness half is sound and should stay. The chroma half is the source of the
saturation problems, and it can't be fixed by nudging values — the shared-ramp
assumption is itself the bug. Separately, the system leans entirely on opaque
fills, which is why elements don't sit well on both white and grey surfaces.

Everything below is measured, not eyeballed — the OKLCH→sRGB gamut math and the
WCAG checks were run against the sRGB boundary, and the ramp derivation is
committed at `scripts/palette-chroma.mjs` (re-runnable, retunable per brand).

## How it works today

- `variables-palette.css` defines a shared lightness ramp (`--l50…--l950`,
  linear: 95% start, −8% per step) and a *single* shared chroma ramp
  (`--c50…--c950`, peaking at `--c500 = 0.1472`).
- Every palette — accent, info, success, danger, warning — is
  `oklch(var(--lNNN) var(--cNNN) var(--hHue))`. Only the hue changes between
  palettes. Hues: accent 230, info 260, success 150, danger 25, warning 86.
- `purpose.css` maps each purpose to `--c-body / --c-background / --c-border`
  triples (`.info`, `.success`, …), consumed by callout, badge, messages, etc.
- A hand-added `*-boosted` set (chroma 0.15–0.20) exists for solid fills that
  looked too weak — used by strong/filled badges.

## Finding 1 — one chroma ramp can't serve five hues (the saturation issue)

The sRGB gamut ceiling for chroma varies enormously by hue *and* lightness. A
single chroma ramp asks every hue for the same chroma at each lightness, but the
hues have wildly different room. Measured `%ofMax` = requested chroma as a share
of the maximum in-gamut chroma at that L and H:

| step | accent (230) | info (260) | success (150) | danger (25) | warning (86) |
|------|-------------|-----------|--------------|------------|-------------|
| 300  | 64%         | 60%       | 46%          | 50%        | 62%         |
| 400  | *111% clip* | 70%       | 80%          | 55%        | *108% clip* |
| 500  | *134% clip* | 65%       | *97%*        | 66%        | *130% clip* |
| 600  | *138% clip* | 67%       | *100%*       | 68%        | *134% clip* |
| 700  | *136% clip* | 66%       | *98%*        | 67%        | *132% clip* |
| 900  | *151% clip* | 72%       | *110% clip*  | 75%        | *146% clip* |

Three distinct failure modes, all from the same cause:

- *Accent and warning clip almost their whole ramp.* From step 400 down, the
  requested chroma is physically unreachable in sRGB. The browser gamut-maps it
  back to the boundary, so the rendered colour is duller than the token says and
  — because gamut mapping differs by engine and by whether the display is P3 —
  it isn't even the same colour across machines. `--c-accent` is `accent-500`,
  so *the brand accent itself is a clamped, display-dependent colour.* Warning
  (yellow, hue 86) is worst: yellow can't hold chroma at mid lightness at all,
  so `warning-700` — the body text for `.warning` — renders as a muddy olive.
- *Success clips only at the dark end* (800–950) and rides the very edge at
  500–700, because green's ceiling is non-monotonic in lightness.
- *Info and danger never clip and sit slack* (50–75% of max). They have gamut to
  spare, so at the shared chroma they read markedly less saturated *relative to
  their potential* than blue/yellow are trying to be.

No P3 targeting exists anywhere in the CSS (no `@supports`, `color-gamut`,
`display-p3`, or gamut fallbacks were found), so this isn't a deliberate
"reach into P3, let sRGB clamp" strategy — it clips on every display.

The sharpest way to state it: `Color.mdx` claims chroma is picked "to ensure
maximum visual consistency between palettes." Because each hue clamps by a
different amount, *consistency is defeated exactly where it was intended.* That
holds regardless of whether P3 was ever the goal.

The `*-boosted` patch is a symptom of the same problem — someone noticed filled
badges looked weak and hand-cranked chroma up. But boosting pushes further out
of gamut: `warning-boosted` clips at steps 300–700, `success-boosted` at 400–700.
It papers over slack hues while making the clipping hues worse. (The replacement
boosted values are derived gamut-safe by `scripts/palette-chroma.mjs`.)

## What is sound — keep it

- *The lightness ramp.* Shared, linear, hue-independent. It's what makes contrast
  predictable, and it's why the palettes feel like a family at all.
- *Contrast.* It rides the shared lightness ramp, so it survives both the chroma
  fix and the move to translucent surfaces. Computed for what actually ships —
  `-700` text over the `/0.10` tint alpha-composited over the surface — every
  purpose clears WCAG AA on white *and* grey (white 8.1–8.8; grey 7.0–7.7; the
  tightest, success-on-grey, is 7.05). The `/0.18` hover tint on grey stays ≥6.4.
  So the "accessible on white and grey" claim is measured, not assumed.
- *Alpha borders.* `--c-border` is already `oklch(… / 0.2)` — the one token that
  correctly adapts to any surface beneath it. That's the model to extend
  (Finding 3).

## Finding 2 — fixing chroma: choose a model, not a number

The fix is to stop sharing one chroma ramp across hues. Keep the lightness ramp;
give chroma per-hue treatment. Three models, in ascending order of control:

1. *Per-step gamut-relative.* Chroma at each step = a fixed fraction (say 0.9) of
   that hue-and-lightness's own max in-gamut chroma. Systematic, never clips,
   every hue sits at the same share of its own gamut. Downside: "same % of
   gamut" is not "same perceived saturation" — blue's gamut is bigger, so blue
   still reads more saturated than red. Fully derivable in a build step or by
   hand from `scripts/palette-chroma.mjs`.
2. *Hand-tuned per-hue ramps.* One chroma ramp per palette, tuned by eye within
   gamut. Most control, best-looking result, what Radix/Leonardo do in practice.
   Downside: five ramps to maintain, and re-tuning on any hue change.
3. *Consistent absolute chroma.* Pick one chroma per step low enough to stay in
   gamut for the *worst* hue (yellow/blue). True perceptual parity. Downside:
   leaves most hues far short of their potential — everything gets duller.

A shape-preserving shortcut (keep the current relative curve, scale it by a
single per-hue peak) is tempting but *over-conservative*: the dark end binds, so
it drags mid-tones down needlessly (it collapses accent/warning to a peak ≈
0.09). The shipped ramps avoid this by clamping *per step* to that step's own
gamut ceiling rather than preserving one shape — the ceiling curve's *shape*
differs per hue, which is exactly why one shared shape fails.

Recommendation: model 2 for the five named purposes (they're few and their look
matters), with the `scripts/palette-chroma.mjs` gamut ceilings as guard-rails so no hand-tuned
value ever clips. Model 1 is the better default if the palette should stay fully
generative (hue slider, per-brand retheming) — in that case bake the
gamut-relative chroma into the token derivation. This is a design call; it's
yours to make. Either way the `*-boosted` set disappears: with chroma tuned per
hue, filled badges no longer need a second cranked ramp.

## Finding 3 — opacity, so elements sit on white *and* grey

Today semantic surfaces are *opaque* light fills (`background-50`, `border-100`).
On white they look right; drop the same chip onto a grey `.layer`
(`neutral-50`) surface and it paints over the grey as a lighter patch instead of
tinting it. The `woah-opacity` approach fixes this: express a semantic surface as
a *translucent* wash of its mid colour, so whatever is behind — white or grey —
shows through and the tint always reads as "a hint of this hue over this
surface."

Concretely, add a tint token per purpose alongside the solid steps:

```css
--c-tint-info:   oklch(var(--l500) var(--cInfoPeak) var(--hInfo) / 0.10);
--c-tint-info-strong: oklch(var(--l500) var(--cInfoPeak) var(--hInfo) / 0.18); /* hover */
--c-border-info: oklch(var(--l600) var(--cInfoPeak) var(--hInfo) / 0.35);      /* alpha, like --c-border */
```

Then point `.info`'s `--c-background` / `--c-border` at the tint/alpha-border
instead of `-50` / `-100`. Two caveats the opacity article is explicit about,
both of which constrain *how far* to take this:

- *Don't make structural layers translucent — only semantic tints.* The
  `.layer` system alternates solid neutral-0/neutral-50 and nests. If those went
  translucent, stacked alpha would compound and deep nesting would muddy
  unpredictably. Keep structural surfaces solid; make only the semantic
  info/success/… tints translucent, so they sit *on* whichever solid layer is
  beneath.
- *Translucent backgrounds break the fixed-contrast guarantee.* With an opaque
  `-50` background, `700` text has a known contrast ratio. Over a translucent
  tint the effective background is whatever's behind it, so contrast becomes
  surface-dependent. It stays safe over white and light grey (both light); it
  *fails* over a dark surface unless the foreground also flips. So: translucent
  tint for the fill, but the text colour stays a decision, not a constant.

## Consequence — dark mode gets much smaller (not free)

Dark mode is currently unimplemented — `tokens.css` remaps only background, body,
and the categorical palette under `body .dark`; all `--c-*-50…950` stay light,
and there's no `prefers-color-scheme` anywhere. The translucency decision above
shrinks this a lot: a `/0.10` tint over a *dark* structural layer already reads
as the right hint of colour, so most semantic surfaces need no dark-specific
values. It doesn't eliminate dark mode — foreground still needs a light/dark
choice per the contrast caveat — but it turns "re-derive five ramps for dark"
into "flip a handful of foregrounds." Worth folding into the same pass, not
treating as a separate project.

## Smaller notes

- `--c-border` recomputes `--l800 --c800-neutral --h` inline rather than deriving
  from `--c-neutral-800` via relative colour. Badge already uses
  `oklch(from var(--badge-bg) …)`. Standardise on `oklch(from … / α)` for the
  alpha-derived tokens once the tint set lands.
- `tokens.css` dark block has two `--c-background` declarations (the second wins);
  the `/* TODO: */` markers confirm it's a stub. Clean up with the dark pass.
- `Color.mdx` states "all palettes use the same scale for relative saturation."
  After Finding 2 that sentence is no longer true and should be rewritten to
  describe the per-hue chroma model — the doc currently documents the bug as if
  it were the design.

## What was implemented

- `variables-palette.css`: replaced the single shared chroma ramp with five
  per-hue ramps (`--<purpose>-c50…950`), each tuned to its hue's gamut and
  in-gamut at every step. Lightness ramp untouched, so contrast is unchanged.
  Values from `scripts/palette-chroma.mjs`, which uses `culori` (the library the
  Evil Martians articles use) for gamut mapping, contrast, and alpha compositing
  rather than hand-rolled matrices — `culori` added to `devDependencies`. It also
  caught that a first hand-rolled pass left the darkest steps (700–950) a hair
  outside the true boundary; the committed values are culori's authoritative
  clamp. Note the repo already has `stylelint-gamut`, which can lint the CSS for
  out-of-gamut colours as a standing guard.
- The `*-boosted` set was kept (filled badges use it) but recomputed to
  gamut-safe per-hue values (~95% of each hue's in-gamut max, capped 0.18),
  replacing the old shared 0.15–0.20 that clipped for yellow and blue.
- Semantic surfaces are now translucent: `--c-background-<purpose>` is a `/0.10`
  wash of the mid colour (`-strong` `/0.18` for hover), `--c-border-<purpose>` a
  `/0.35` alpha border — both adapt to white and grey. `badge.css` light
  variants repointed to these. Structural `.layer` surfaces stay solid.
- `Color.mdx` "approach" rewritten to describe the per-hue chroma + translucent
  model instead of the old shared-scale one.

## Still open

- *Dark mode (finding 4).* The `body .dark` block in `tokens.css` is still a stub
  (background/body/categorical only) and there's no `prefers-color-scheme`. The
  translucent tints now adapt to a dark surface for free, but foregrounds
  (`--c-body-<purpose>` = `-700`) still need a light/dark flip — contrast over a
  translucent tint depends on what's behind it. This is the remaining work.
- *Warning hue.* At hue 86, warning reads olive/khaki at mid lightness — inherent
  to forcing yellow onto a mid-lightness step, not a chroma problem (hue 74 amber
  tested no better). If a brighter warning is wanted, it needs either a
  higher-lightness "warning" step or an amber hue shift; both are design calls.
- *`--c-border` DRYness.* Now that the semantic borders use `oklch(… / α)`, fold
  the neutral `--c-border` onto the same `oklch(from var(--c-neutral-800) …)`
  relative-colour form for consistency.
- *Leftover opaque accent surface.* `reference.css:108` still fills with the
  opaque `--c-accent-50`, so it won't adapt to grey the way badges/callouts now
  do. Repoint to `--c-background-accent` (or leave deliberately opaque) once its
  look is checked in place.
