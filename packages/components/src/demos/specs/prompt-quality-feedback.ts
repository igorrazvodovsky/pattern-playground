import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { settleHandler } from './settle';
import spec from './prompt-quality-feedback.json' with { type: 'json' };

// The prompt is checked once the actor stops typing, and the verdict shows
// beneath the composer: too short, too vague, or specific enough. While the
// text differs from the last one checked, a line says the check is running.
// That line is not announced; the verdict empties meanwhile, so each verdict
// is announced once when it arrives. A real system would ask a model; this
// one counts words and looks for words that stand in for a name.

type Verdict = { text: string; purpose: 'success' | 'warning' } | null;

// Words that stand in for a name the actor has not given ("that thing",
// "some stuff"), not the same words inside a name ("Internet of Things").
const placeholders = /\b(that|this|the|some) (thing|things|stuff)\b|\b(that one|something|whatsit)\b/i;
const minWords = 6;

const assess = (prompt: string): Verdict => {
  const words = prompt.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  if (placeholders.test(prompt)) {
    return { text: 'Too vague: say what it was about, or where you came across it.', purpose: 'warning' };
  }
  if (words.length < minWords) return { text: 'Add more detail for best results.', purpose: 'warning' };
  return { text: 'Specific enough to answer well.', purpose: 'success' };
};

const text = (value: unknown) => (typeof value === 'string' ? value : '');
const current = (args: Record<string, unknown>) =>
  text(args.text) === text(args.checked) ? assess(text(args.checked)) : null;

const initial = "What was that thing's name?";

export default {
  spec: spec as Spec,
  setup: {
    initialState: { text: initial, checked: initial },
    handlers: settleHandler,
    functions: {
      verdict: args => current(args)?.text ?? '',
      purpose: args => current(args)?.purpose ?? null,
    },
  } satisfies SpecSetup,
};
