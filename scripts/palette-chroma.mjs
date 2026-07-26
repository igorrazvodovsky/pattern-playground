#!/usr/bin/env node
// Derive the per-hue chroma ramps used in
// packages/components/src/styles/variables-palette.css.
//
// Why this exists: one shared chroma ramp can't serve hues with different gamut
// ceilings — it clips blue/yellow and leaves violet/red washed out. This tool
// tunes chroma per hue against the gamut boundary so every step is in gamut and
// as vivid as its hue allows, while the shared lightness ramp is left alone.
//
// Two sets come out, from the same targets. The sRGB set is the base
// declaration. The P3 set ships inside `@media (color-gamut: p3)` and is more
// vivid where the display can show it — 1.1x to 1.4x the chroma depending on
// hue. Both are chosen rather than gamut-mapped at runtime, so a wide-gamut
// display shows a colour we picked instead of whatever the browser's mapping
// happens to produce. (Tailwind ships one out-of-sRGB value and lets the
// browser decide; that is the cross-display variance this avoids.)
//
// Colour maths is delegated to culori (the same library the Evil Martians OKLCH
// articles use) — gamut mapping, contrast, and alpha compositing are its job,
// not hand-rolled matrices.  Install:  npm i -D culori
//
// Run:  node scripts/palette-chroma.mjs         # print ramps + boosted + gamut/contrast audit
// Retune per brand: edit `hues`, `midTarget`, and `shape`, re-run, paste the
// numbers back into variables-palette.css (the file keeps them as literals so
// the browser never has to gamut-map at runtime).

import { inGamut, clampChroma, wcagContrast, blend } from 'culori';

const inSrgb = inGamut('rgb');
const okColor = (l, c, h, alpha) => ({ mode: 'oklch', l, c, h, ...(alpha == null ? {} : { alpha }) });
// max in-gamut chroma at a lightness + hue: ask culori to reduce an off-the-chart
// chroma down to the boundary of the named gamut (CSS Color 4 gamut mapping).
const maxIn = (gamut) => (l, h) => clampChroma(okColor(l, 0.4, h), 'oklch', gamut).c;
const maxChroma = maxIn('rgb');
const maxChromaP3 = maxIn('p3');

// --- ramp definitions (must match variables-palette.css) -------------------
// The lightness ramp is a curve, not a constant increment: fine steps at the
// light end (0.04–0.05), coarse through the middle (0.09), settling to 0.07 at
// the dark end and stopping at 0.27 rather than near-black.
//
// A single increment cannot do this. With eleven steps the span is exactly ten
// increments, so a step small enough to keep 100 near white (~0.04) puts 950 at
// 0.57, and an increment that reaches a usable dark end leaves 100 at 0.90.
//
// Contrast consistency between palettes does not depend on the increment being
// uniform — only on every palette using the same ladder.
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const lightness = [0.98, 0.94, 0.89, 0.82, 0.73, 0.64, 0.56, 0.48, 0.41, 0.34, 0.27];
const Lof = (s) => lightness[steps.indexOf(s)];

// the current smooth chroma *shape* (relative curve, its own peak at 500 = 1)
const shapePeak = 0.1472;
const shape = {
  50: 0.015, 100: 0.0321, 200: 0.0609, 300: 0.0908, 400: 0.1398, 500: 0.1472,
  600: 0.1299, 700: 0.1067, 800: 0.0898, 900: 0.0726, 950: 0.054,
};

// Floor for the light steps, as a fraction of each step's OWN ceiling.
//
// The shape above peaks at 500 and one `midTarget` scales the whole ramp from
// there. That works when a hue's ceiling also peaks near the middle (violet,
// red) and fails when it doesn't. Yellow's ceiling peaks at 100–200 and bottoms
// out at 500, so pinning the scale to the mid step starves exactly the steps
// with the most headroom — the pale tints render cream-grey rather than pale
// yellow. Blue and green have the same defect, milder.
//
// So the light steps get a floor tied to their own ceiling rather than to the
// mid step. Steps 400 and darker keep 0 — they already sit at 92% of ceiling
// and the shape governs them correctly.
const lightFloor = { 50: 0.62, 100: 0.56, 200: 0.58, 300: 0.6 };

// per palette: hue, and the desired chroma at step 500. Violet/red carry the
// vivid end of the range; green sits below its non-monotonic dark clip; blue is
// the brand and is deliberately quieter than its ceiling allows. Yellow's target
// is a choice, not a limit: at L 0.64 its ceiling is 0.131, so 0.12 has headroom.
const palettes = {
  accent:  { hue: 230, midTarget: 0.10 },
  info:    { hue: 260, midTarget: 0.16 },
  success: { hue: 150, midTarget: 0.135 },
  danger:  { hue: 25,  midTarget: 0.16 },
  warning: { hue: 86,  midTarget: 0.12 },
};

// ramp = scale the shape to the mid target, lift the light steps to their own
// floor, then clamp each step to 92% of that step's own gamut ceiling so
// nothing ever needs runtime gamut-mapping. `ceil` selects the gamut, so the
// same targets produce both the sRGB base and the P3 override.
// The floor is itself capped at the mid target: a pale tint should never end up
// more colourful than the step the palette is named for. Without this, green's
// wide ceiling at L 0.82 pushes success-300 past success-500 and the ramp bulges
// in the middle — visible in P3, where that ceiling is wider still.
const buildRamp = (hue, midTarget, ceil = maxChroma) => {
  const f = midTarget / shapePeak;
  return steps.map((s) => {
    const ceiling = ceil(Lof(s), hue);
    const floor = Math.min((lightFloor[s] ?? 0) * ceiling, midTarget);
    return Math.min(Math.max(f * shape[s], floor), 0.92 * ceiling);
  });
};

// boosted = maximally vivid solid fills (filled badges/dots): ~95% of the
// in-gamut max at steps 200–700, capped so red/violet don't go neon. The light
// rungs exist for hues that can only be vivid while light: warning's solid fill
// is drawn from 300, since at 700 yellow is mud whatever its chroma. The P3 cap
// is raised in proportion to the gamut, so "neon" stays the same perceptual
// threshold rather than the same number.
const boostSteps = [200, 300, 400, 500, 600, 700];
const boostCap = { srgb: 0.18, p3: 0.21 };
const buildBoost = (hue, ceil = maxChroma, cap = boostCap.srgb) =>
  boostSteps.map((s) => Math.min(0.95 * ceil(Lof(s), hue), cap));

// --- output ----------------------------------------------------------------
const f4 = (n) => n.toFixed(4);
const inP3 = inGamut('p3');

console.log('# Lightness ramp\n  ' + steps.map((s) => `${s}=${Lof(s)}`).join(' ') + '\n');

console.log('# sRGB chroma ramps — the base declaration\n');
for (const [name, { hue, midTarget }] of Object.entries(palettes)) {
  const ramp = buildRamp(hue, midTarget);
  const clipped = steps.some((s, i) => !inSrgb(okColor(Lof(s), ramp[i], hue)));
  console.log(`${name} · hue ${hue}${clipped ? '  !! CLIPS sRGB' : ''}`);
  console.log('  ramp   :', steps.map((s, i) => `${s}=${f4(ramp[i])}`).join(' '));
  console.log('  boosted:', boostSteps.map((s, i) => `${s}=${f4(buildBoost(hue)[i])}`).join(' '), '\n');
}

console.log('# P3 chroma ramps — for @media (color-gamut: p3)\n');
for (const [name, { hue, midTarget }] of Object.entries(palettes)) {
  const ramp = buildRamp(hue, midTarget, maxChromaP3);
  const base = buildRamp(hue, midTarget);
  const bad = steps.some((s, i) => !inP3(okColor(Lof(s), ramp[i], hue)));
  const gain = steps.map((s, i) => ramp[i] / base[i]);
  console.log(`${name} · hue ${hue}${bad ? '  !! CLIPS P3' : ''}  gain x${Math.min(...gain).toFixed(2)}–x${Math.max(...gain).toFixed(2)}`);
  console.log('  ramp   :', steps.map((s, i) => `${s}=${f4(ramp[i])}`).join(' '));
  console.log('  boosted:', boostSteps.map((s, i) => `${s}=${f4(buildBoost(hue, maxChromaP3, boostCap.p3)[i])}`).join(' '), '\n');
}

// The shipped semantic surface is a translucent tint, so a purpose's -700 text
// sits over `tint /0.10` composited over the page surface, not over an opaque
// step. Verify AA (4.5) holds over both white and grey (neutral-50), since
// Color.mdx sells the palette on "accessible on white and grey".
const white = okColor(1, 0, 0);
const grey = okColor(Lof(50), 0.002, 230); // neutral-50
console.log('# Contrast of -700 text over the /0.10 tint, composited over surface');
const flag = (r) => (r >= 4.5 ? 'AA' : r >= 3 ? 'AA-large' : 'FAIL');
for (const [name, { hue, midTarget }] of Object.entries(palettes)) {
  const ramp = buildRamp(hue, midTarget);
  const fg = okColor(Lof(700), ramp[steps.indexOf(700)], hue);
  const tint = okColor(Lof(500), ramp[steps.indexOf(500)], hue, 0.1);
  const w = wcagContrast(fg, blend([white, tint], 'normal'));
  const g = wcagContrast(fg, blend([grey, tint], 'normal'));
  console.log(`  ${name.padEnd(8)} white ${w.toFixed(2)} ${flag(w).padEnd(8)} grey ${g.toFixed(2)} ${flag(g)}`);
}

// The neutral ramp rides the same lightness curve, and it carries body text,
// borders and layer surfaces. Moving the curve moves all of them, so the steps
// those tokens point at have to be re-checked rather than assumed.
const neutralC = { 50: 0.002, 100: 0.005, 200: 0.011, 300: 0.017, 400: 0.026,
  500: 0.034, 600: 0.039, 700: 0.033, 800: 0.027, 900: 0.021, 950: 0.015 };
console.log('\n# Neutral steps against white — which are still usable as text (AA 4.5)');
for (const s of steps) {
  const r = wcagContrast(okColor(Lof(s), neutralC[s], 230), white);
  if (r >= 3) console.log(`  neutral-${String(s).padEnd(4)} L ${Lof(s).toFixed(2)}  ${r.toFixed(1).padStart(5)}  ${flag(r)}`);
}
