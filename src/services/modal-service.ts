type ModalType = 'drawer' | 'dialog';
type ModalPosition = 'left' | 'right' | 'center';

interface ModalOptions {
  type?: ModalType;
  position?: ModalPosition;
  title?: string;
  content: string;
  allowOutsideClick?: boolean;
}

class ModalService {
  private modal: HTMLDialogElement | null = null;
  private currentOptions: ModalOptions | null = null;

  private createModal(options: ModalOptions) {
    if (this.modal) {
      document.body.removeChild(this.modal);
    }

    this.modal = document.createElement('dialog');

    // Set CSS classes based on type and position
    const classes = [];
    if (options.type === 'drawer') {
      classes.push('drawer');
      if (options.position && options.position !== 'center') {
        classes.push(`drawer--${options.position}`);
      }
    } else {
      classes.push('dialog');
    }

    this.modal.className = classes.join(' ');
    this.modal.innerHTML = `
      <header>
        <h3>${options.title || 'Details'}</h3>
        <button class="button button--plain modal-close" aria-label="Close ${options.type || 'dialog'}">
          <iconify-icon class="icon" icon="ph:x"></iconify-icon>
          <span class="inclusively-hidden">Close</span>
        </button>
      </header>
      <article class="modal-content">
        ${options.content}
      </article>
    `;

    // Add close event listeners
    const closeButtons = this.modal.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.close();
      });
    });

    // Close on outside click (if enabled)
    if (options.allowOutsideClick !== false) {
      this.modal.addEventListener('click', (e) => {
        const rect = this.modal!.getBoundingClientRect();
        const isInModal = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );

        if (!isInModal) {
          this.close();
        }
      });
    }

    document.body.appendChild(this.modal);
  }

  open(options: ModalOptions | string) {
    if (typeof document === 'undefined') return;

    const modalOptions: ModalOptions = typeof options === 'string'
      ? {
          type: 'drawer',
          position: 'right',
          title: 'Toast Details',
          content: `

          `
        }
      : options;

    this.currentOptions = modalOptions;
    this.createModal(modalOptions);
    this.modal?.showModal();
  }

  openDrawer(content: string, position: ModalPosition = 'right', title?: string) {
    this.open({
      type: 'drawer',
      position,
      title: title || 'Details',
      content
    });
  }

  openDialog(content: string, title?: string) {
    this.open({
      type: 'dialog',
      position: 'center',
      title: title || 'Dialog',
      content
    });
  }

  close() {
    if (this.modal) {
      this.modal.close();
    }
  }

  updateContent(content: string) {
    if (this.modal && this.currentOptions) {
      const contentElement = this.modal.querySelector('.modal-content');
      if (contentElement) {
        contentElement.innerHTML = content;
      }
    }
  }
}

// Global singleton instance
export const modalService = new ModalService();

// Legacy exports for backward compatibility
export const drawerService = {
  open: (content: string) => modalService.open(content),
  close: () => modalService.close()
};