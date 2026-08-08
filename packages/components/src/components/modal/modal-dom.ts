import type { ModalPosition, ModalSize } from '../../services/modal-service';

/**
 * Safe DOM creation utilities for modal components
 * Prevents XSS by using DOM methods instead of innerHTML
 */

export function createDrawerDOM(
  modalId: string,
  position: ModalPosition,
  className: string,
  title?: string,
  closable: boolean = true,
  reactContainerId: string = '',
  modal: boolean = true,
  actionsContainerId: string = ''
): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = `drawer drawer--${position}`;
  dialog.id = modalId;

  // PPModal reads this to choose showModal() vs show(); the CSS reads it to
  // drop the scroll lock for a non-blocking side peek.
  if (!modal) {
    dialog.dataset.modal = 'false';
  }

  if (className) {
    dialog.classList.add(...className.split(' ').filter(c => c.trim()));
  }

  // Build header if needed
  if (title || closable) {
    const titleId = title ? `${modalId}-title` : '';
    const header = buildModalHeaderDOM(title, closable, actionsContainerId, titleId);
    dialog.appendChild(header);
    if (titleId) {
      dialog.setAttribute('aria-labelledby', titleId);
    }
  }

  // Build content container
  const contentDiv = document.createElement('div');
  contentDiv.className = 'drawer__content';
  
  if (reactContainerId) {
    const reactContainer = document.createElement('div');
    reactContainer.id = reactContainerId;
    reactContainer.className = 'react-modal-content';
    contentDiv.appendChild(reactContainer);
  }
  
  dialog.appendChild(contentDiv);
  return dialog;
}

export function createDialogDOM(
  modalId: string, 
  size: ModalSize, 
  className: string, 
  title?: string, 
  closable: boolean = true,
  reactContainerId: string = '',
  actionsContainerId: string = ''
): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = `dialog dialog--${size}`;
  dialog.id = modalId;

  if (className) {
    dialog.classList.add(...className.split(' ').filter(c => c.trim()));
  }

  // Build header if needed
  if (title || closable) {
    const titleId = title ? `${modalId}-title` : '';
    const header = buildModalHeaderDOM(title, closable, actionsContainerId, titleId);
    dialog.appendChild(header);
    if (titleId) {
      dialog.setAttribute('aria-labelledby', titleId);
    }
  }

  // Build content container
  const contentDiv = document.createElement('div');
  contentDiv.className = 'dialog__content';
  
  if (reactContainerId) {
    const reactContainer = document.createElement('div');
    reactContainer.id = reactContainerId;
    reactContainer.className = 'react-modal-content';
    contentDiv.appendChild(reactContainer);
  }
  
  dialog.appendChild(contentDiv);
  return dialog;
}

export function buildModalHeaderDOM(
  title?: string,
  closable: boolean = true,
  actionsContainerId: string = '',
  titleId: string = ''
): HTMLElement {
  const header = document.createElement('header');
  header.className = 'modal__header';

  if (title) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'modal__title';
    titleElement.textContent = title; // Safe text assignment
    // A native <dialog> has no default accessible name; the caller points its
    // aria-labelledby here.
    if (titleId) {
      titleElement.id = titleId;
    }
    header.appendChild(titleElement);
  }

  // A React-rendered actions slot, sitting just before the close button so
  // view controls group with it rather than floating over the content.
  if (actionsContainerId) {
    const actions = document.createElement('div');
    actions.className = 'modal__header-actions';
    actions.id = actionsContainerId;
    header.appendChild(actions);
  }

  if (closable) {
    const closeButton = document.createElement('button');
    closeButton.className = 'modal__close';
    closeButton.setAttribute('data-close', '');
    closeButton.setAttribute('aria-label', 'Close modal');
    
    const icon = document.createElement('iconify-icon');
    icon.setAttribute('icon', 'ph:x');
    closeButton.appendChild(icon);
    
    header.appendChild(closeButton);
  }
  
  return header;
}