#!/usr/bin/env node
// Derive the per-hue chroma ramps used in
// packages/components/src/styles/variables-palette.css.
//
// Why this exists: one shared chroma ramp can't serve hues with different sRGB
// gamut ceilings — it clips blue/yellow and leaves violet/red washed out. This tool tunes chroma
// per hue against the sRGB gamut so every step is in gamut and as vivid as its
// hue allows, while the shared lightness ramp is left alone.
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
// chroma down to the sRGB boundary (CSS Color 4 gamut mapping).
const maxChroma = (l, h) => clampChroma(okColor(l, 0.4, h), 'oklch', 'rgb').c;

// --- ramp definitions (must match variables-palette.css) -------------------
const lInitial = 0.95, lIncrement = 0.08; // culori lightness is 0..1
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const Lof = (s) => (s === 50 ? lInitial : lInitial - lIncrement * steps.indexOf(s));

// the current smooth chroma *shape* (relative curve, its own peak at 500 = 1)
const shapePeak = 0.1472;
const shape = {
  50: 0.015, 100: 0.0321, 200: 0.0609, 300: 0.0908, 400: 0.1398, 500: 0.1472,
  600: 0.1299, 700: 0.1067, 800: 0.0898, 900: 0.0726, 950: 0.054,
};

// per palette: hue, and the desired chroma at step 500. Blue/yellow are set near
// their ceiling (can't go higher); violet/red are boosted well above the old
// shared ramp; green sits below its non-monotonic dark clip.
const palettes = {
  accent:  { hue: 230, midTarget: 0.10 },
  info:    { hue: 260, midTarget: 0.16 },
  success: { hue: 150, midTarget: 0.135 },
  danger:  { hue: 25,  midTarget: 0.16 },
  warning: { hue: 86,  midTarget: 0.105 },
};

// ramp = scale the shape to the mid target, then clamp each step to 92% of that
// step's own gamut ceiling so nothing ever needs runtime gamut-mapping.
const buildRamp = (hue, midTarget) => {
  const f = midTarget / shapePeak;
  return steps.map((s) => Math.min(f * shape[s], 0.92 * maxChroma(Lof(s), hue)));
};

// boosted = maximally vivid solid fills (filled badges/dots): ~95% of the
// in-gamut max at steps 300–700, capped at 0.18 so red/violet don't go neon.
const boostSteps = [300, 400, 500, 600, 700];
const buildBoost = (hue) => boostSteps.map((s) => Math.min(0.95 * maxChroma(Lof(s), hue), 0.18));

// --- output ----------------------------------------------------------------
const f4 = (n) => n.toFixed(4);
console.log('# Per-hue chroma ramps (paste into variables-palette.css)\n');
for (const [name, { hue, midTarget }] of Object.entries(palettes)) {
  const ramp = buildRamp(hue, midTarget);
  const clipped = steps.some((s, i) => !inSrgb(okColor(Lof(s), ramp[i], hue)));
  console.log(`${name} · hue ${hue}${clipped ? '  !! CLIPS' : ''}`);
  console.log('  ramp   :', steps.map((s, i) => `${s}=${f4(ramp[i])}`).join(' '));
  console.log('  boosted:', boostSteps.map((s, i) => `${s}=${f4(buildBoost(hue)[i])}`).join(' '), '\n');
}

// The shipped semantic surface is a translucent tint, so a purpose's -700 text
// sits over `tint /0.10` composited over the page surface, not over an opaque
// step. Verify AA (4.5) holds over both white and grey (neutral-50), since
// Color.mdx sells the palette on "accessible on white and grey".
const white = okColor(1, 0, 0);
const grey = okColor(lInitial, 0.002, 230); // neutral-50
console.log('# Contrast of -700 text over the /0.10 tint, composited over surface');
for (const [name, { hue, midTarget }] of Object.entries(palettes)) {
  const ramp = buildRamp(hue, midTarget);
  const fg = okColor(Lof(700), ramp[steps.indexOf(700)], hue);
  const tint = okColor(Lof(500), ramp[steps.indexOf(500)], hue, 0.1);
  const w = wcagContrast(fg, blend([white, tint], 'normal'));
  const g = wcagContrast(fg, blend([grey, tint], 'normal'));
  const flag = (r) => (r >= 4.5 ? 'AA' : r >= 3 ? 'AA-large' : 'FAIL');
  console.log(`  ${name.padEnd(8)} white ${w.toFixed(2)} ${flag(w).padEnd(8)} grey ${g.toFixed(2)} ${flag(g)}`);
}
