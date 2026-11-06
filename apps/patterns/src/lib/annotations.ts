// Draws the marks for components/Annotation.astro and the hand-drawn
// highlight over each <mark> in page and article prose. mountAnnotations()
// runs on every page load and for each pane StackManager opens; mounting is
// idempotent. unmountDetachedAnnotations() releases what closed panes and
// swapped pages leave behind. Marks draw at once, without animation.
import { annotate } from 'rough-notation';
import type { RoughAnnotation, RoughAnnotationType } from 'rough-notation/lib/model';

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

interface Note {
  annotation?: RoughAnnotation;
  observer?: ResizeObserver;
}

const notes = new Map<HTMLElement, Note>();

function draw(el: HTMLElement): RoughAnnotation | undefined {
  const body = el.querySelector<HTMLElement>('.annotation__body');
  if (!body) return;
  const type = (el.dataset.annotation ?? 'bracket') as RoughAnnotationType;
  const annotation = annotate(body, {
    type,
    brackets: ['right'],
    color: 'currentColor',
    strokeWidth: 1.25,
    padding: type === 'bracket' ? [2, 12] : 4,
    animate: false,
  });
  annotation.show();
  return annotation;
}

// rough-notation redraws on window resize and when the element's box changes,
// but a ResizeObserver reports nothing for an inline <mark>. Watching the
// block that holds the mark catches reflows from pane and demo resizing. A
// highlight redraws only when the mark's line boxes move within the block, and
// draws first once the mark has line boxes at all: it may sit in a closed
// <details> or a pane that is not laid out yet.
interface Highlight {
  mark: HTMLElement;
  annotation: RoughAnnotation;
  boxes: string;
}

const highlights = new Map<Element, Highlight[]>();
// Created on first use: this module is also loaded during server rendering.
let reflow: ResizeObserver | undefined;

function boxesOf(mark: HTMLElement, block: Element): string {
  const origin = block.getBoundingClientRect();
  return Array.from(mark.getClientRects(), (r) =>
    [r.x - origin.x, r.y - origin.y, r.width, r.height].map(Math.round).join(','),
  ).join(';');
}

// The fill colour comes from app.css, so it follows the colour scheme.
// data-annotated drops the flat <mark> background once the highlight is drawn;
// without script, or before there is anything to draw, the flat background
// stays.
function redraw(highlight: Highlight, block: Element) {
  if (!highlight.mark.isConnected) return;
  const boxes = boxesOf(highlight.mark, block);
  if (boxes === highlight.boxes) return;
  highlight.boxes = boxes;
  if (!boxes) return;
  highlight.annotation.show();
  highlight.mark.dataset.annotated = '';
}

function highlight(mark: HTMLElement) {
  // A display: contents box gets no ResizeObserver entries, so it is skipped
  // like an inline one.
  let block = mark.parentElement;
  while (block && /^(inline|contents)/.test(getComputedStyle(block).display)) {
    block = block.parentElement;
  }
  if (!block) return;
  const entry: Highlight = {
    mark,
    annotation: annotate(mark, {
      type: 'highlight',
      multiline: true,
      iterations: 1,
      animate: false,
    }),
    boxes: '',
  };
  const list = highlights.get(block);
  if (list) list.push(entry);
  else {
    highlights.set(block, [entry]);
    (reflow ??= new ResizeObserver((entries) => {
      for (const { target } of entries) {
        for (const h of highlights.get(target) ?? []) redraw(h, target);
      }
    })).observe(block);
  }
  redraw(entry, block);
  // A late web font can rewrap the line without resizing the block.
  void document.fonts.ready.then(() => redraw(entry, block));
}

// The home page and other non-stack pages hold their prose in .content-inset
// rather than an <article>.
const MARKS = ':is(article, .content-inset) mark:not(.demo-block mark)';

export function mountAnnotations(root: ParentNode): void {
  for (const mark of root.querySelectorAll<HTMLElement>(MARKS)) {
    if (mounted.has(mark)) continue;
    mounted.add(mark);
    highlight(mark);
  }

  for (const el of root.querySelectorAll<HTMLElement>('[data-annotation]')) {
    if (mounted.has(el)) continue;
    mounted.add(el);
    const entry: Note = {};
    const note = el.querySelector<HTMLElement>('.annotation__note');
    if (note && anchored()) {
      el.dataset.placement = 'anchored';
    } else if (note) {
      place(el, note);
      entry.observer = new ResizeObserver(() => place(el, note));
      entry.observer.observe(el);
    }
    entry.annotation = draw(el);
    notes.set(el, entry);
  }
}

// rough-notation keeps a window resize listener and a ResizeObserver per
// annotation, so detached ones are removed rather than left to the collector.
export function unmountDetachedAnnotations(): void {
  for (const [block, list] of highlights) {
    const kept = block.isConnected ? list.filter((h) => h.mark.isConnected) : [];
    for (const h of list) if (!kept.includes(h)) h.annotation.remove();
    if (kept.length) highlights.set(block, kept);
    else {
      highlights.delete(block);
      reflow?.unobserve(block);
    }
  }
  for (const [el, { annotation, observer }] of notes) {
    if (el.isConnected) continue;
    annotation?.remove();
    observer?.disconnect();
    notes.delete(el);
  }
}
