/**
 * Sets `attribute` to empty, then "all", until the trail fits; its styles do
 * the folding. The trail has to take its width from its container, not from
 * its items, or it never overflows.
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

  // Text can change width while neither the trail's size nor its nodes change,
  // as when a web font loads.
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
