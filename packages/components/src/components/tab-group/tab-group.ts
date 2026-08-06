import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { scrollIntoView } from '../../utility/scroll';
import type { PpTab } from '../tab/tab.ts';
import type { PpTabPanel } from '../tab-panel/tab-panel.ts';

/**
 * @summary Tabs organize content into a container that shows one section at a time.
 * @status draft
 * @since 0.0.1
 *
 * Composite enhancement (rung 2): the author composes a `data-slot="nav"`
 * strip of `<pp-tab>` elements followed by `<pp-tab-panel>` children; the
 * element wires roles and aria relationships, keyboard navigation, and
 * active-state sync, and appends scroll buttons it owns when the strip
 * overflows. The active-tab indicator is CSS on `pp-tab[active]`.
 * Styles live in `src/styles/tabs.css`.
 *
 * @cssproperty --indicator-color - The color of the active tab indicator.
 * @cssproperty --track-color - The color of the indicator's track (the line that separates tabs from panels).
 * @cssproperty --track-width - The width of the indicator's track (the line that separates tabs from panels).
 */

export class PpTabGroup extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  private activeTab?: PpTab;
  private mutationObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private tabs: PpTab[] = [];
  private panels: PpTabPanel[] = [];
  private startButton: HTMLButtonElement | null = null;
  private endButton: HTMLButtonElement | null = null;

  /**
   * When set to auto, navigating tabs with the arrow keys will instantly show the corresponding tab panel. When set to
   * manual, the tab will receive focus but will not show until the user presses spacebar or enter.
   */
  @property() activation: 'auto' | 'manual' = 'auto';

  /** Disables the scroll arrows that appear when tabs overflow. */
  @property({ attribute: 'no-scroll-controls', type: Boolean }) noScrollControls = false;

  get nav(): HTMLElement | null {
    return this.querySelector('[data-slot="nav"]');
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    const nav = this.nav;
    if (nav && !nav.hasAttribute('role')) {
      nav.setAttribute('role', 'tablist');
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.updateScrollControls();
    });

    this.mutationObserver = new MutationObserver(mutations => {
      // Update caches and aria labels when the DOM changes
      if (mutations.some(m => !['aria-labelledby', 'aria-controls'].includes(m.attributeName!))) {
        setTimeout(() => {
          this.syncTabsAndPanels();
          this.setAriaLabels();
        });
      }
    });

    const whenAllDefined = Promise.all([
      customElements.whenDefined('pp-tab'),
      customElements.whenDefined('pp-tab-panel')
    ]);

    this.updateComplete.then(() => {
      this.syncTabsAndPanels();
      this.mutationObserver!.observe(this, { attributes: true, childList: true, subtree: true });
      if (nav) this.resizeObserver!.observe(nav);

      whenAllDefined.then(() => {
        // Set initial tab state when the tabs become visible
        const intersectionObserver = new IntersectionObserver((entries, observer) => {
          if (entries[0].intersectionRatio > 0) {
            this.setAriaLabels();
            this.setActiveTab(this.getActiveTab() ?? this.tabs[0], { emitEvents: false });
            observer.unobserve(entries[0].target);
          }
        });
        intersectionObserver.observe(this);
      });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
    this.mutationObserver?.disconnect();
    this.resizeObserver?.disconnect();
  }

  private getAllTabs() {
    return [...this.querySelectorAll<PpTab>('pp-tab')].filter(tab => tab.closest('pp-tab-group') === this);
  }

  private getAllPanels() {
    return [...this.querySelectorAll<PpTabPanel>('pp-tab-panel')].filter(panel => panel.closest('pp-tab-group') === this);
  }

  private getActiveTab() {
    return this.tabs.find(el => el.active);
  }

  private handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const tab = target.closest('pp-tab');
    const tabGroup = tab?.closest('pp-tab-group');

    // Ensure the target tab is in this tab group
    if (tabGroup !== this) {
      return;
    }

    if (tab !== null) {
      this.setActiveTab(tab, { scrollBehavior: 'smooth' });
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const tab = target.closest('pp-tab');
    const tabGroup = tab?.closest('pp-tab-group');

    // Ensure the target tab is in this tab group
    if (tabGroup !== this) {
      return;
    }

    // Activate a tab
    if (['Enter', ' '].includes(event.key)) {
      if (tab !== null) {
        this.setActiveTab(tab, { scrollBehavior: 'smooth' });
        event.preventDefault();
      }
    }

    // Move focus left or right
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      const activeEl = this.tabs.find(t => t.matches(':focus'));

      if (activeEl?.tagName.toLowerCase() === 'pp-tab') {
        let index = this.tabs.indexOf(activeEl);

        if (event.key === 'Home') {
          index = 0;
        } else if (event.key === 'End') {
          index = this.tabs.length - 1;
        } else if (event.key === 'ArrowLeft') {
          index--;
        } else if (event.key === 'ArrowRight') {
          index++;
        }

        if (index < 0) {
          index = this.tabs.length - 1;
        }

        if (index > this.tabs.length - 1) {
          index = 0;
        }

        this.tabs[index].focus({ preventScroll: true });

        if (this.activation === 'auto') {
          this.setActiveTab(this.tabs[index], { scrollBehavior: 'smooth' });
        }

        if (this.nav) scrollIntoView(this.tabs[index], this.nav, 'horizontal');
        event.preventDefault();
      }
    }
  };

  private handleScrollToStart = () => {
    const nav = this.nav;
    if (!nav) return;
    nav.scroll({
      left: nav.scrollLeft - nav.clientWidth,
      behavior: 'smooth'
    });
  };

  private handleScrollToEnd = () => {
    const nav = this.nav;
    if (!nav) return;
    nav.scroll({
      left: nav.scrollLeft + nav.clientWidth,
      behavior: 'smooth'
    });
  };

  private setActiveTab(tab: PpTab, options?: { emitEvents?: boolean; scrollBehavior?: 'auto' | 'smooth' }) {
    options = {
      emitEvents: true,
      scrollBehavior: 'auto',
      ...options
    };

    if (tab !== this.activeTab) {
      this.activeTab = tab;

      // Sync active tab and panel
      this.tabs.forEach(el => (el.active = el === this.activeTab));
      this.panels.forEach(el => (el.active = el.name === this.activeTab?.panel));

      if (this.nav) scrollIntoView(this.activeTab, this.nav, 'horizontal', options.scrollBehavior);
    }
  }

  private setAriaLabels() {
    // Link each tab with its corresponding panel
    this.tabs.forEach(tab => {
      const panel = this.panels.find(el => el.name === tab.panel);
      if (panel) {
        tab.setAttribute('aria-controls', panel.getAttribute('id')!);
        panel.setAttribute('aria-labelledby', tab.getAttribute('id')!);
      }
    });
  }

  // This stores tabs and panels so we can refer to a cache instead of calling querySelectorAll() multiple times.
  private syncTabsAndPanels() {
    this.tabs = this.getAllTabs();
    this.panels = this.getAllPanels();
    this.updateComplete.then(() => this.updateScrollControls());
  }

  private makeScrollButton(direction: 'start' | 'end') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tab-group__scroll-button tab-group__scroll-button--${direction}`;
    button.setAttribute('aria-label', direction === 'start' ? 'Scroll to start' : 'Scroll to end');
    button.innerHTML = `<iconify-icon class="icon" icon="ph:caret-${direction === 'start' ? 'left' : 'right'}"></iconify-icon>`;
    button.addEventListener('click', direction === 'start' ? this.handleScrollToStart : this.handleScrollToEnd);
    return button;
  }

  updateScrollControls() {
    const nav = this.nav;
    // In most cases, we can compare scrollWidth to clientWidth to determine if scroll controls should show. However,
    // Safari appears to calculate this incorrectly when zoomed at 110%, causing the controls to toggle indefinitely.
    // Adding a single pixel to the comparison seems to resolve it.
    const needsControls = !this.noScrollControls && !!nav && nav.scrollWidth > nav.clientWidth + 1;

    if (needsControls && !this.startButton) {
      this.startButton = this.makeScrollButton('start');
      this.endButton = this.makeScrollButton('end');
      this.prepend(this.startButton);
      this.append(this.endButton);
    } else if (!needsControls && this.startButton) {
      this.startButton.remove();
      this.endButton?.remove();
      this.startButton = null;
      this.endButton = null;
    }
  }

  show(panel: string) {
    const tab = this.tabs.find(el => el.panel === panel);

    if (tab) {
      this.setActiveTab(tab, { scrollBehavior: 'smooth' });
    }
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-tab-group': PpTabGroup;
  }
}
