// Default demo height. Every <Demo> clips its content to --demo-max-h (see
// components/Demo.astro and app.css). When the content runs past the cap, the
// frame gets data-demo-overflowing, which fades the bottom edge and shows the
// "Expand" button; expanding sets data-demo-revealed and lifts the cap for the
// rest of the page view. Widening a demo (lib/demo-expander.ts) reveals it too.
//
// One shared ResizeObserver watches each viewport and its children, so a demo
// that grows after mounting (a lazily loaded widget, a switched library)
// re-checks itself. Delegated click handling covers panes injected as innerHTML.

const observer =
  typeof ResizeObserver === 'undefined'
    ? null
    : new ResizeObserver((entries) => {
        for (const entry of entries) {
          const viewport = (entry.target as Element).closest<HTMLElement>('[data-demo-viewport]');
          if (!viewport?.isConnected) {
            observer?.unobserve(entry.target);
            continue;
          }
          check(viewport);
        }
      });

function check(viewport: HTMLElement) {
  const frame = viewport.parentElement;
  if (!frame || frame.hasAttribute('data-demo-revealed')) return;
  frame.toggleAttribute('data-demo-overflowing', viewport.scrollHeight > viewport.clientHeight + 1);
}

// Watch every not-yet-watched demo viewport under root. Idempotent, so it runs
// wherever demos mount (see mountDemos).
export function watchDemoHeights(root: ParentNode): void {
  if (!observer) return;
  for (const viewport of root.querySelectorAll<HTMLElement>(
    '[data-demo-viewport]:not([data-demo-watched])',
  )) {
    viewport.setAttribute('data-demo-watched', '');
    observer.observe(viewport);
    for (const child of viewport.children) observer.observe(child);
  }
}

// Lift the height cap on the demo that contains el.
export function revealDemo(el: Element): void {
  const frame = el
    .closest<HTMLElement>('.demo-block')
    ?.querySelector<HTMLElement>('.demo-block__content');
  if (!frame || frame.hasAttribute('data-demo-revealed')) return;
  frame.setAttribute('data-demo-revealed', '');
  frame.removeAttribute('data-demo-overflowing');
  const viewport = frame.querySelector<HTMLElement>('[data-demo-viewport]');
  if (viewport && observer) {
    observer.unobserve(viewport);
    for (const child of viewport.children) observer.unobserve(child);
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest?.('[data-demo-reveal]');
    if (!btn) return;
    e.preventDefault();
    const viewport = btn.parentElement?.querySelector<HTMLElement>('[data-demo-viewport]');
    revealDemo(btn);
    // The button disappears, so hand focus to the content it uncovered.
    viewport?.focus({ preventScroll: true });
  });
}
