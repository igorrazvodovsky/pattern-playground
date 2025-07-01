class DrawerService {
  private drawer: HTMLDialogElement | null = null;
  private content: string = '';

  init() {
    if (!this.drawer && typeof document !== 'undefined') {
      this.createDrawer();
    }
  }

  private createDrawer() {
    this.drawer = document.createElement('dialog');
    this.drawer.className = 'drawer drawer--right';
    this.drawer.innerHTML = `
      <header>
        <h3>Toast Details</h3>
        <button class="button button--plain drawer-close" aria-label="Close drawer">
          <iconify-icon class="icon" icon="ph:x"></iconify-icon>
          <span class="inclusively-hidden">Close</span>
        </button>
      </header>
      <article class="drawer-content">
        Toast content will appear here.
      </article>
      <footer>
        <button class="button drawer-close" autofocus>Close</button>
      </footer>
    `;

    // Add close event listeners
    const closeButtons = this.drawer.querySelectorAll('.drawer-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.close();
      });
    });

    // Close on outside click
    this.drawer.addEventListener('click', (e) => {
      const rect = this.drawer!.getBoundingClientRect();
      const isInDrawer = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      
      if (!isInDrawer) {
        this.close();
      }
    });

    document.body.appendChild(this.drawer);
  }

  open(content: string) {
    this.init();
    if (this.drawer) {
      this.content = content;
      const contentElement = this.drawer.querySelector('.drawer-content');
      if (contentElement) {
        contentElement.innerHTML = `
          <p><strong>Toast Message:</strong></p>
          <p>${content}</p>
          <p>This drawer was opened by clicking on the toast notification.</p>
        `;
      }
      this.drawer.showModal();
    }
  }

  close() {
    if (this.drawer) {
      this.drawer.close();
    }
  }
}

// Global singleton instance
export const drawerService = new DrawerService();