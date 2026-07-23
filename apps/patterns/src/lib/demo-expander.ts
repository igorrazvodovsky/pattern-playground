// Reader-driven demo width. An expandable <Demo> (see components/Demo.tsx)
// renders a corner button; clicking it cycles the width of the demo's host
// .pane so the reader can pick a size that fits their screen, rather than the
// author guessing one. Delegated from the document so it works identically in
// pane 0 and in related panes injected as innerHTML (see StackManager). Nothing
// is persisted — a reload returns every demo to its reading width.

// Steps in cycle order. `width` is written to --pane-max-w on the pane, which
// drives the pane's flex-basis AND its sticky right-inset (see stack.css). null
// removes the override, restoring the stack default (36rem / 70ch reading
// measure). 'full' fills the stack but holds back one spine width per pane
// trailing this one (--pane-n − --pane-i − 1 of them), so the widened demo
// clears the whole right rail of spines instead of butting against — or sliding
// under — the nearest one. Exact spine multiples are the safe window: they land
// the pane's edge on the rail, where the trailing panes stay sticky-pinned as
// clean spines. Add anything past that (e.g. a --space-l gap) and the nearest
// neighbour's visible width crosses the collapse threshold, so it stops
// collapsing and reveals a ragged sliver of its own content instead. A lone
// pane (no trailing panes) reserves 0 and simply fills.
type StepName = 'reading' | 'wide' | 'full';
interface Step {
  name: StepName;
  width: string | null;
  // Describes what the NEXT click does — the button is that action.
  label: string;
}

const FULL_WIDTH =
  'calc(100% - (var(--pane-n) - var(--pane-i, 0) - 1) * var(--pane-spine-w))';

const STEPS: Step[] = [
  { name: 'reading', width: null, label: 'Widen this demo' },
  { name: 'wide', width: '56rem', label: 'Widen this demo further' },
  { name: 'full', width: FULL_WIDTH, label: "Reset this demo's width" },
];

function currentStepIndex(pane: HTMLElement): number {
  const name = pane.dataset.demoExpanded as StepName | undefined;
  const i = STEPS.findIndex((s) => s.name === name);
  return i === -1 ? 0 : i;
}

function applyStep(pane: HTMLElement, index: number) {
  const step = STEPS[index];
  if (step.width === null) {
    delete pane.dataset.demoExpanded;
    pane.style.removeProperty('--pane-max-w');
  } else {
    pane.dataset.demoExpanded = step.name;
    pane.style.setProperty('--pane-max-w', step.width);
  }

  // Reflect the step onto every expand button in this pane (a page may hold
  // more than one expandable demo; width is a pane-level property). step.label
  // describes what the NEXT click does from this step.
  for (const btn of pane.querySelectorAll<HTMLElement>('[data-demo-expand]')) {
    btn.setAttribute('aria-label', step.label);
    btn.setAttribute('title', step.label);
    btn.toggleAttribute('data-demo-full', step.name === 'full');
  }

  // The pane width just changed with no scroll/resize event, so nudge
  // StackManager to re-run its data-collapsed / data-overlapping classifier.
  // Its ResizeObserver on the panes catches this on its own, but a resize
  // dispatch drives the same handler directly — belt and suspenders.
  window.dispatchEvent(new Event('resize'));
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target as Element;
    const btn = target.closest?.('[data-demo-expand]') as HTMLElement | null;
    if (!btn) return;
    const pane = btn.closest<HTMLElement>('.pane');
    if (!pane) return;
    e.preventDefault();
    const next = (currentStepIndex(pane) + 1) % STEPS.length;
    applyStep(pane, next);
  });
}
