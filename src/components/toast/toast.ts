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

  private createToast(text: string): HTMLOutputElement {
    const toast = document.createElement('output');
    toast.className = 'toast fade show';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
      <div class="toast-body">
        <span class="toast-message">${text}</span>
      </div>
      <button class="toast-close" aria-label="Close">
        <iconify-icon icon="ph:x" className="icon" />
      </button>
    `;

    const closeButton = toast.querySelector('.toast-close') as HTMLButtonElement;
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.removeToast(toast);
      });
    }

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

  // Public API method to show a toast
  public show(text: string): Promise<void> {
    const toast = this.createToast(text);
    this.addToast(toast);

    return new Promise<void>(async (resolve) => {
      await Promise.allSettled(
        toast.getAnimations().map(animation =>
          animation.finished
        )
      );
      this.removeToast(toast);
      resolve();
    });
  }

  // Static method for easy usage
  static show(text: string): Promise<void> {
    let toaster = document.querySelector('pp-toast') as PpToast;
    if (!toaster) {
      toaster = document.createElement('pp-toast') as PpToast;
      document.body.appendChild(toaster);
    }
    return toaster.show(text);
  }
}

customElements.define('pp-toast', PpToast);
declare global {
  interface HTMLElementTagNameMap {
    "pp-toast": PpToast;
  }
}