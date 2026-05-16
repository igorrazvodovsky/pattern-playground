export class PpToast extends HTMLElement {
  private toastGroup: HTMLElement | null = null;

  constructor() {
    super();
  }

  connectedCallback(): void {
    if (!this.toastGroup) {
      this.innerHTML = `
        <div class="toast-group"></div>
      `;
      this.toastGroup = this.querySelector('.toast-group');
    }
  }

  private createToast(text: string, onClick?: () => void): HTMLOutputElement {
    const toast = document.createElement('output');
    toast.className = 'toast fade show';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    const body = document.createElement('div');
    body.className = 'toast-body';
    const message = document.createElement('span');
    message.className = 'toast-message';
    message.textContent = text;
    body.appendChild(message);

    const closeIcon = document.createElement('iconify-icon');
    closeIcon.setAttribute('icon', 'ph:x');
    closeIcon.className = 'icon';
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', () => this.removeToast(toast));

    if (onClick) {
      const openButton = document.createElement('button');
      openButton.className = 'toast-button';
      openButton.setAttribute('aria-label', `Open details for: ${text}`);
      openButton.appendChild(body);
      openButton.addEventListener('click', () => {
        onClick();
        this.removeToast(toast);
      });
      toast.appendChild(openButton);
    } else {
      toast.appendChild(body);
    }

    toast.appendChild(closeButton);
    return toast;
  }

  private addToast(toast: HTMLOutputElement): void {
    if (!this.toastGroup) return;

    if (this.toastGroup.children.length) {
      this.flipToast(toast);
    } else {
      this.toastGroup.appendChild(toast);
    }
  }

  // https://aerotwist.com/blog/flip-your-animations/
  private flipToast(toast: HTMLOutputElement): void {
    if (!this.toastGroup) return;

    // FIRST
    const first = this.toastGroup.offsetHeight;

    // add new child to change container size
    this.toastGroup.appendChild(toast);

    // LAST
    const last = this.toastGroup.offsetHeight;

    // INVERT
    const invert = last - first;

    // PLAY
    const animation = this.toastGroup.animate([
      { transform: `translateY(${invert}px)` },
      { transform: 'translateY(0)' }
    ], {
      duration: 150,
      easing: 'ease-out',
    });

    animation.startTime = document.timeline.currentTime;
  }

  private removeToast(toast: HTMLOutputElement): void {
    if (this.toastGroup && this.toastGroup.contains(toast)) {
      this.toastGroup.removeChild(toast);
    }
  }


  public show(text: string, onClick?: () => void, duration = onClick ? 8000 : 4000): Promise<void> {
    const toast = this.createToast(text, onClick);
    this.addToast(toast);

    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        toast.classList.add('fade-out');
        await Promise.allSettled(
          toast.getAnimations().map(a => a.finished)
        );
        this.removeToast(toast);
        resolve();
      }, duration);
    });
  }

  static show(text: string, onClick?: () => void, duration?: number): Promise<void> {
    let toaster = document.querySelector('pp-toast') as PpToast;
    if (!toaster) {
      toaster = document.createElement('pp-toast') as PpToast;
      document.body.appendChild(toaster);
    }
    return toaster.show(text, onClick, duration);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-toast": PpToast;
  }
}