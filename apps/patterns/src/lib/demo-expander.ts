// Reader-driven demo width. Two <Demo> affordances (see components/Demo.tsx)
// share one width axis, the --demo-w / --pane-max-w custom property on the host
// .pane: `expandable` renders a button that snaps to preset widths, `resizable`
// renders a drag handle for continuous control. Either can appear alone; together
// the button is the preset for the drag. Delegated from the document so it works
// identically in pane 0 and in related panes injected as innerHTML (see
// StackManager). Nothing is persisted — a reload returns every demo to reading.
//
// A resizable pane derives --pane-max-w from --demo-w in CSS (clamped to reading
// on the low end, the stack-spine `full` calc on the high end — see app.css), so
// below the reading measure only the demo box narrows and prose holds still. So
// for those panes we write --demo-w; a lone expandable pane writes --pane-max-w
// directly, its historical behaviour.

const READING_PX = 16 * 16; // 16rem, the resize floor

function paneResizable(pane: HTMLElement): boolean {
  return !!pane.querySelector('.demo-block__content[data-resizable]');
}

// Which custom property carries this pane's width (see the file header).
function widthVar(pane: HTMLElement): '--demo-w' | '--pane-max-w' {
  return paneResizable(pane) ? '--demo-w' : '--pane-max-w';
}

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
  const prop = widthVar(pane);
  if (step.width === null) {
    delete pane.dataset.demoExpanded;
    pane.style.removeProperty(prop);
  } else {
    pane.dataset.demoExpanded = step.name;
    pane.style.setProperty(prop, step.width);
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

// Write a continuous width (px) to a resizable pane's --demo-w. The CSS clamp
// caps the high end (stack width), so JS only needs to hold the low floor;
// data-demo-expanded engages the article measure + prose cap for the wide half.
function setDemoWidth(pane: HTMLElement, px: number) {
  pane.dataset.demoExpanded = 'custom';
  pane.style.setProperty('--demo-w', `${Math.max(READING_PX, Math.round(px))}px`);
  // The var change resizes the article/demo, which the demo's own and
  // StackManager's ResizeObservers catch — no manual resize dispatch needed.
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

  // Pointer drag on a resize handle. Pointer capture keeps the drag alive if the
  // cursor outruns the handle; events still bubble to this document listener.
  let drag: { pane: HTMLElement; startX: number; startW: number } | null = null;

  document.addEventListener('pointerdown', (e) => {
    const handle = (e.target as Element).closest?.('[data-demo-resize]') as HTMLElement | null;
    if (!handle) return;
    const pane = handle.closest<HTMLElement>('.pane');
    const content = handle.closest<HTMLElement>('.demo-block__content');
    if (!pane || !content) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    drag = { pane, startX: e.clientX, startW: content.getBoundingClientRect().width };
  });

  document.addEventListener('pointermove', (e) => {
    if (!drag) return;
    setDemoWidth(drag.pane, drag.startW + (e.clientX - drag.startX));
  });

  const endDrag = () => {
    drag = null;
  };
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);

  // Keyboard resize: arrows nudge the focused handle by one step.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const handle = (e.target as Element).closest?.('[data-demo-resize]') as HTMLElement | null;
    if (!handle) return;
    const pane = handle.closest<HTMLElement>('.pane');
    const content = handle.closest<HTMLElement>('.demo-block__content');
    if (!pane || !content) return;
    e.preventDefault();
    const step = 32;
    setDemoWidth(pane, content.getBoundingClientRect().width + (e.key === 'ArrowRight' ? step : -step));
  });
}
