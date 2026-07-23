import type { ReactNode } from 'react';

interface DemoProps {
  children: ReactNode;
  label?: string;
  // Desktop-scale demos (toolbars, canvases, multi-column tables) that outgrow
  // the reading measure. Adds a control to the footer row that lets the reader
  // cycle the host pane's width (reading → wide → full). Wiring lives in
  // lib/demo-expander.ts; the width rules key off .pane[data-demo-expanded].
  expandable?: boolean;
}

export function Demo({ children, label, expandable }: DemoProps) {
  return (
    <div className="demo-block">
      <div className="demo-block__content layer gray">{children}</div>
      {(label || expandable) && (
        <div className="demo-block__footer">
          {label && <span className="demo-block__label">{label}</span>}
          {/* Lives in the footer, not over the demo: a corner button collides
              with a demo's own chrome (a canvas's tool panels), and a demo
              island captures pointer events on its own root. */}
          {expandable && (
            <button
              type="button"
              className="demo-expand"
              data-demo-expand
              aria-label="Widen this demo"
              title="Widen this demo"
            >
              <iconify-icon icon="ph:arrows-horizontal" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
