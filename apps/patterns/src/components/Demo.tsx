import type { ReactNode } from 'react';

interface DemoProps {
  children: ReactNode;
  label?: string;
  surface?: 'gray' | 'white' | 'border';
  // Both features drive one width axis (--demo-w) shared through lib/demo-expander.ts:
  // `resizable` renders a drag handle for continuous control; `expandable` renders
  // a button that snaps to preset widths (reading / wide / full) on the same axis.
  // Either can appear alone; together the button is the preset for the drag.
  expandable?: boolean;
  resizable?: boolean;
}

const surfaceClass = {
  gray: 'layer gray',
  white: 'layer border',
  border: 'border',
} as const;

export function Demo({ children, label, expandable, resizable, surface = 'border' }: DemoProps) {
  return (
    <div className="demo-block">
      <div
        className={`demo-block__content ${surfaceClass[surface]}`.trimEnd()}
        data-resizable={resizable || undefined}
      >
        {children}
        {resizable && (
          // Drag strip pinned to the content's trailing edge (its edge sits at
          // --demo-w). lib/demo-expander.ts turns a drag into --demo-w on the pane.
          <div
            className="demo-resize-handle"
            data-demo-resize
            role="separator"
            aria-orientation="vertical"
            aria-label="Drag to resize this demo"
            title="Drag to resize this demo"
            tabIndex={0}
          />
        )}
      </div>
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
