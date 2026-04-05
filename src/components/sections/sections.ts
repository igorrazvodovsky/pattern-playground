type Affordance = 'tab-bar' | 'details';

const HEADING_SELECTOR = 'h1,h2,h3,h4,h5,h6,pp-h';

let uid = 0;
const nextId = () => `pp-s-${++uid}`;

export class PpSections extends HTMLElement {
  private _resizeObserver?: ResizeObserver;
  private _mutationObserver?: MutationObserver;
  private _mutating = false;
  private _resolvedAffordance: Affordance = 'tab-bar';
  private _initialized = false;

  static get observedAttributes() {
    return ['affordance'];
  }

  connectedCallback() {
    if (document.readyState !== 'loading') {
      this._init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._mutationObserver?.disconnect();
  }

  attributeChangedCallback() {
    if (this._initialized) this._render();
  }

  private _init() {
    this._initialized = true;

    this._resizeObserver = new ResizeObserver(() => {
      if (this.hasAttribute('affordance')) return;
      const css = getComputedStyle(this).getPropertyValue('--pp-affordance').trim() as Affordance;
      if ((css === 'tab-bar' || css === 'details') && css !== this._resolvedAffordance) {
        this._resolvedAffordance = css;
        this._render();
      }
    });
    this._resizeObserver.observe(this);

    this._mutationObserver = new MutationObserver(() => {
      if (this._mutating) return;
      this._render();
    });
    this._mutationObserver.observe(this, { childList: true });

    const css = getComputedStyle(this).getPropertyValue('--pp-affordance').trim() as Affordance;
    if (css === 'tab-bar' || css === 'details') this._resolvedAffordance = css;

    this._render();
  }

  private _affordance(): Affordance {
    const attr = this.getAttribute('affordance') as Affordance | null;
    if (attr === 'tab-bar' || attr === 'details') return attr;
    return this._resolvedAffordance;
  }

  private _parseSections(): Array<{ heading: HTMLElement; contentEls: HTMLElement[] }> {
    const sections: Array<{ heading: HTMLElement; contentEls: HTMLElement[] }> = [];
    let current: { heading: HTMLElement; contentEls: HTMLElement[] } | null = null;

    for (const child of [...this.children] as HTMLElement[]) {
      if (child.hasAttribute('data-pp-nav')) continue;
      if (child.matches(HEADING_SELECTOR)) {
        current = { heading: child, contentEls: [] };
        sections.push(current);
      } else if (current) {
        current.contentEls.push(child);
      }
    }

    return sections;
  }

  private _wrapPanels(
    sections: Array<{ heading: HTMLElement; contentEls: HTMLElement[] }>,
  ): Array<{ heading: HTMLElement; panel: HTMLElement }> {
    const result: Array<{ heading: HTMLElement; panel: HTMLElement }> = [];

    for (const { heading, contentEls } of sections) {
      // Already wrapped — treat as idempotent
      if (contentEls.length === 1 && contentEls[0].hasAttribute('data-pp-panel')) {
        result.push({ heading, panel: contentEls[0] });
        continue;
      }

      const panel = document.createElement('div');
      panel.setAttribute('data-pp-panel', '');

      if (contentEls.length > 0) {
        contentEls[0].before(panel);
        for (const el of contentEls) panel.appendChild(el);
      } else {
        heading.after(panel);
      }

      result.push({ heading, panel });
    }

    return result;
  }

  private _render() {
    if (this._mutating) return;
    this._mutating = true;
    try {
      const affordance = this._affordance();
      this.setAttribute('data-pp-mode', affordance);

      const raw = this._parseSections();
      const sections = this._wrapPanels(raw);

      if (affordance === 'tab-bar') {
        this._renderTabBar(sections);
      } else {
        this._renderDetails(sections);
      }
    } finally {
      this._mutating = false;
    }
  }

  private _renderTabBar(sections: Array<{ heading: HTMLElement; panel: HTMLElement }>) {
    // Clean up details-mode wiring
    for (const { heading, panel } of sections) {
      heading.removeAttribute('data-pp-trigger');
      heading.removeAttribute('aria-expanded');
      heading.removeAttribute('aria-controls');
      heading.removeAttribute('tabindex');
      heading.removeAttribute('role');
      heading.onclick = null;
      heading.onkeydown = null;
      panel.removeAttribute('data-pp-open');
    }

    // Ensure nav exists
    let nav = this.querySelector<HTMLElement>('[data-pp-nav]');
    if (!nav) {
      nav = document.createElement('div');
      nav.setAttribute('data-pp-nav', '');
      nav.setAttribute('role', 'tablist');
      this.prepend(nav);
    }

    // Remove extra tabs
    const existingTabs = [...nav.querySelectorAll<HTMLElement>('[data-pp-tab]')];
    for (let i = sections.length; i < existingTabs.length; i++) existingTabs[i].remove();

    // Ensure at least one active panel
    const panels = sections.map(s => s.panel);
    if (panels.length > 0 && !panels.some(p => p.hasAttribute('data-pp-active'))) {
      panels[0].setAttribute('data-pp-active', '');
    }

    // Build/sync tabs
    const tabs: HTMLElement[] = [];
    sections.forEach(({ heading, panel }, i) => {
      if (!heading.id) heading.id = nextId();
      if (!panel.id) panel.id = nextId();

      let tab = nav!.querySelectorAll<HTMLElement>('[data-pp-tab]')[i];
      if (!tab) {
        tab = document.createElement('button');
        tab.setAttribute('data-pp-tab', '');
        tab.setAttribute('role', 'tab');
        if (!tab.id) tab.id = nextId();
        nav!.appendChild(tab);
      }
      if (!tab.id) tab.id = nextId();

      tab.replaceChildren(...[...heading.childNodes].map(n => n.cloneNode(true)));

      const isActive = panel.hasAttribute('data-pp-active');
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      tab.setAttribute('aria-controls', panel.id);

      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      heading.setAttribute('data-pp-affordance', 'tab-bar');

      tabs.push(tab);
    });

    tabs.forEach((tab, i) => {
      tab.onclick = () => this._activateTab(panels, tabs, i);
      tab.onkeydown = (e: KeyboardEvent) => this._handleTabKey(e, panels, tabs, i);
    });
  }

  private _activateTab(panels: HTMLElement[], tabs: HTMLElement[], index: number) {
    panels.forEach((p, i) => i === index ? p.setAttribute('data-pp-active', '') : p.removeAttribute('data-pp-active'));
    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', i === index ? 'true' : 'false');
      t.setAttribute('tabindex', i === index ? '0' : '-1');
    });
  }

  private _handleTabKey(e: KeyboardEvent, panels: HTMLElement[], tabs: HTMLElement[], i: number) {
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % panels.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + panels.length) % panels.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = panels.length - 1;
    else return;

    e.preventDefault();
    this._activateTab(panels, tabs, next);
    tabs[next]?.focus();
  }

  private _renderDetails(sections: Array<{ heading: HTMLElement; panel: HTMLElement }>) {
    // Remove tab-bar nav
    this.querySelector('[data-pp-nav]')?.remove();

    for (const { heading, panel } of sections) {
      if (!heading.id) heading.id = nextId();
      if (!panel.id) panel.id = nextId();

      // Clean up tab-bar wiring
      heading.removeAttribute('data-pp-affordance');
      panel.removeAttribute('role');
      panel.removeAttribute('data-pp-active');
      panel.removeAttribute('aria-labelledby');

      // Wire as trigger
      heading.setAttribute('data-pp-trigger', '');
      heading.setAttribute('role', 'button');
      heading.setAttribute('tabindex', '0');
      heading.setAttribute('aria-expanded', panel.hasAttribute('data-pp-open') ? 'true' : 'false');
      heading.setAttribute('aria-controls', panel.id);

      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', heading.id);

      heading.onclick = () => this._togglePanel(heading, panel);
      heading.onkeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._togglePanel(heading, panel);
        }
      };
    }
  }

  private _togglePanel(heading: HTMLElement, panel: HTMLElement) {
    const open = panel.hasAttribute('data-pp-open');
    panel.toggleAttribute('data-pp-open', !open);
    heading.setAttribute('aria-expanded', open ? 'false' : 'true');
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-sections': PpSections;
  }
}
