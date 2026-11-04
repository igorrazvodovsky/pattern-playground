// Draws the marks for components/Annotation.astro. mountAnnotations() runs on
// every page load and for each pane StackManager opens; mounting is
// idempotent. Marks draw at once, without animation.
import { annotate } from 'rough-notation';
import type { RoughAnnotationType } from 'rough-notation/lib/model';

const mounted = new WeakSet<HTMLElement>();

// With anchor positioning the note is fixed beside the block and free of the
// pane's clipping. Without it, the note hangs in the margin only if it fits
// inside the pane (or the viewport, outside the stack); otherwise it takes a
// column beside the block.
const anchored = () => CSS.supports('anchor-scope', '--a');

function place(el: HTMLElement, note: HTMLElement) {
  const bounds = (el.closest('.pane-body') ?? document.documentElement).getBoundingClientRect();
  const gap = parseFloat(getComputedStyle(el).getPropertyValue('--annotation-gap')) || 0;
  el.dataset.placement = 'margin';
  const fits = el.getBoundingClientRect().right + gap + note.offsetWidth <= bounds.right;
  el.dataset.placement = fits ? 'margin' : 'inline';
}

function draw(el: HTMLElement) {
  const body = el.querySelector<HTMLElement>('.annotation__body');
  if (!body) return;
  const type = (el.dataset.annotation ?? 'bracket') as RoughAnnotationType;
  annotate(body, {
    type,
    brackets: ['right'],
    color: 'currentColor',
    strokeWidth: 1.25,
    padding: type === 'bracket' ? [2, 12] : 4,
    animate: false,
  }).show();
}

export function mountAnnotations(root: ParentNode): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-annotation]')) {
    if (mounted.has(el)) continue;
    mounted.add(el);
    const note = el.querySelector<HTMLElement>('.annotation__note');
    if (note && anchored()) {
      el.dataset.placement = 'anchored';
    } else if (note) {
      place(el, note);
      new ResizeObserver(() => place(el, note)).observe(el);
    }
    draw(el);
  }
}
