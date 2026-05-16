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
  reactContainerId: string = ''
): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = `drawer drawer--${position}`;
  dialog.id = modalId;
  
  if (className) {
    dialog.classList.add(...className.split(' ').filter(c => c.trim()));
  }
  
  // Build header if needed
  if (title || closable) {
    const header = buildModalHeaderDOM(title, closable);
    dialog.appendChild(header);
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
  reactContainerId: string = ''
): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = `dialog dialog--${size}`;
  dialog.id = modalId;
  
  if (className) {
    dialog.classList.add(...className.split(' ').filter(c => c.trim()));
  }
  
  // Build header if needed
  if (title || closable) {
    const header = buildModalHeaderDOM(title, closable);
    dialog.appendChild(header);
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

export function buildModalHeaderDOM(title?: string, closable: boolean = true): HTMLElement {
  const header = document.createElement('header');
  header.className = 'modal__header';
  
  if (title) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'modal__title';
    titleElement.textContent = title; // Safe text assignment
    header.appendChild(titleElement);
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