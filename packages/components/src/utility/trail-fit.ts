/**
 * Keeps a one-line trail of items within its own width. Whenever the trail's
 * size or content changes, it is laid out in full and measured, then collapsed
 * a stage at a time until it fits: `attribute` empty folds the middle items,
 * `attribute="all"` folds every item above the current one. The trail's
 * styles do the folding under the attribute; at the last stage they also let
 * the current item shorten with an ellipsis. Measuring from the full layout
 * each time lets the trail open out again as soon as there is room.
 *
 * The trail has to take its width from its container (a block, or a flex item
 * that grows from a zero basis), not from its items, or it never overflows.
 * Returns a function that stops observing.
 */
export function observeTrailFit(trail: HTMLElement, attribute: string): () => void {
  // scrollWidth and clientWidth are rounded to whole pixels, so a trail that
  // fits with a fraction to spare can read one pixel over.
  const overflows = () => trail.scrollWidth > trail.clientWidth + 1;
  const fit = () => {
    trail.removeAttribute(attribute);
    if (!overflows()) return;
    trail.setAttribute(attribute, '');
    if (!overflows()) return;
    trail.setAttribute(attribute, 'all');
  };

  // The items are watched as well as the trail: text can change width while
  // neither the trail's size nor its nodes change, as when a web font loads.
  const resize = new ResizeObserver(fit);
  const watch = () => {
    resize.disconnect();
    resize.observe(trail);
    for (const item of trail.children) resize.observe(item);
  };
  const content = new MutationObserver(() => {
    watch();
    fit();
  });
  content.observe(trail, { childList: true, subtree: true, characterData: true });
  watch();
  fit();

  return () => {
    resize.disconnect();
    content.disconnect();
  };
}
