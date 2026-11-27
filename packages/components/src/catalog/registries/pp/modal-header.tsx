import type { ReactNode } from 'react';

// The header a pp Dialog and Drawer share: the title, the window's own
// actions and the close button.
export const ModalHeader = ({
  titleId,
  title,
  actions,
}: {
  titleId: string;
  title: ReactNode;
  actions?: ReactNode;
}) => (
  <header className="modal__header">
    <h2 className="modal__title" id={titleId}>
      {title}
    </h2>
    {actions && (
      <div className="modal__header-actions">
        <div className="button-group">{actions}</div>
      </div>
    )}
    <button type="button" className="modal__close" data-close aria-label="Close">
      <iconify-icon icon="ik:cross" aria-hidden="true" />
    </button>
  </header>
);
