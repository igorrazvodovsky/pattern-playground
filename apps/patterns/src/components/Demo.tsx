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
      <div className="demo-block__content border">{children}</div>
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
              <svg viewBox="0 0 256 256" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M144 48a8 8 0 0 1 8-8h56a8 8 0 0 1 8 8v56a8 8 0 0 1-16 0V67.31l-42.34 42.35a8 8 0 0 1-11.32-11.32L188.69 56H152a8 8 0 0 1-8-8ZM98.34 146.34 56 188.69V152a8 8 0 0 0-16 0v56a8 8 0 0 0 8 8h56a8 8 0 0 0 0-16H67.31l42.35-42.34a8 8 0 0 0-11.32-11.32Z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
