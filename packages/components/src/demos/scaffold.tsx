import type { ReactNode } from 'react';

/**
 * Shared demo scaffolding — the plumbing several demos repeat verbatim.
 * Not catalogue material: each piece is a composition of existing blocks,
 * kept here so the demos stay about their own argument.
 */

interface BackButtonProps {
  onClick: () => void;
  /** Where the actor returns to — "Back to the collection". */
  children: ReactNode;
}

/** The place-keeping return control a drilldown or new-page detail carries. */
export function BackButton({ onClick, children }: BackButtonProps) {
  return (
    <button type="button" className="button button--plain" onClick={onClick}>
      ← {children}
    </button>
  );
}
