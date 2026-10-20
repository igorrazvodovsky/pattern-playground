// HTMLElement doesn't exist server-side; the stub base keeps this module
// importable under SSR — the class is only registered/instantiated in the
// browser (register-all).
const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

export class PpToast extends HTMLElementBase {
  private toastGroup: HTMLElement | null = null;
  // Resolves each toast's `closed` promise.
  private dismissed = new WeakMap<HTMLOutputElement, () => void>();

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
    closeIcon.setAttribute('icon', 'ik:cross');
    closeIcon.className = 'icon';
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', () => { void this.dismissToast(toast); });

    if (onClick) {
      // No aria-label: the message is the button's accessible name, so the
      // caller's wording is what gets announced. A toast with an action has
      // to say what the action is in `text` — the component can't know
      // whether the click undoes, opens, or retries.
      const openButton = document.createElement('button');
      openButton.className = 'toast-button';
      openButton.appendChild(body);
      openButton.addEventListener('click', () => {
        onClick();
        void this.dismissToast(toast);
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

  // Every dismissal path exits through the same fade; the fade-out guard makes
  // the later paths no-ops. A toast that never joined the group still settles.
  private async dismissToast(toast: HTMLOutputElement): Promise<void> {
    if (toast.classList.contains('fade-out')) return;
    if (this.toastGroup?.contains(toast)) {
      toast.classList.add('fade-out');
      await Promise.allSettled(
        toast.getAnimations().map(a => a.finished)
      );
      this.removeToast(toast);
    }
    this.dismissed.get(toast)?.();
  }

  // Paused while hovered or focused, so an actor reading the toast or reaching
  // for its action keeps the rest of the window.
  private scheduleDismissal(toast: HTMLOutputElement, duration: number): () => void {
    let remaining = duration;
    let startedAt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hovered = false;
    let focused = false;
    let cancelled = false;

    const run = () => {
      startedAt = Date.now();
      timer = setTimeout(() => { void this.dismissToast(toast); }, remaining);
    };
    const pause = () => {
      if (timer === undefined) return;
      clearTimeout(timer);
      timer = undefined;
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
    };
    const update = () => {
      if (cancelled) return;
      if (hovered || focused) pause();
      else if (timer === undefined) run();
    };

    toast.addEventListener('pointerenter', () => { hovered = true; update(); });
    toast.addEventListener('pointerleave', () => { hovered = false; update(); });
    toast.addEventListener('focusin', () => { focused = true; update(); });
    toast.addEventListener('focusout', (event) => {
      focused = toast.contains(event.relatedTarget as Node | null);
      update();
    });

    run();
    return () => { cancelled = true; pause(); };
  }

  /** Shows a toast and returns a handle: `closed` settles however it is dismissed, `dismiss` closes it early. */
  public open(text: string, onClick?: () => void, duration = onClick ? 8000 : 4000): ToastHandle {
    const toast = this.createToast(text, onClick);
    this.addToast(toast);
    const closed = new Promise<void>(resolve => this.dismissed.set(toast, resolve));
    const cancel = this.scheduleDismissal(toast, duration);
    void closed.then(cancel);
    return { closed, dismiss: () => { void this.dismissToast(toast); } };
  }

  public show(text: string, onClick?: () => void, duration?: number): Promise<void> {
    return this.open(text, onClick, duration).closed;
  }

  private static toaster(): PpToast {
    let toaster = document.querySelector('pp-toast') as PpToast;
    if (!toaster) {
      toaster = document.createElement('pp-toast') as PpToast;
      document.body.appendChild(toaster);
    }
    return toaster;
  }

  static open(text: string, onClick?: () => void, duration?: number): ToastHandle {
    return PpToast.toaster().open(text, onClick, duration);
  }

  static show(text: string, onClick?: () => void, duration?: number): Promise<void> {
    return PpToast.toaster().show(text, onClick, duration);
  }
}

export interface ToastHandle {
  closed: Promise<void>;
  dismiss: () => void;
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-toast": PpToast;
  }
}