import { LitElement, html, CSSResultGroup, unsafeCSS } from 'lit';
import { state } from 'lit/decorators.js';
import styles from './breadcrumbs.css?inline';


export class PpBreadcrumbs extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  // Internal state to track if the component has been initialized
  @state()
  private initialized = false;

  private observer: MutationObserver | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    // Setup mutation observer to watch for changes in the DOM
    this.observer = new MutationObserver(() => {
      this.setupEventListeners();
    });

    this.observer.observe(this, {
      childList: true,
      subtree: true
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.removeEventListeners();
  }

  updated() {
    if (!this.initialized) {
      this.setupEventListeners();
      this.initialized = true;
    }
  }

  private setupEventListeners() {
    this.removeEventListeners();

    // Handle select changes
    const selects = this.querySelectorAll('.disguised-select');
    selects.forEach(select => {
      select.addEventListener('change', this.handleSelectChange);
    });

    // Handle link clicks
    const links = this.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', this.handleLinkClick);
    });
  }

  private removeEventListeners() {
    const selects = this.querySelectorAll('.disguised-select');
    selects.forEach(select => {
      select.removeEventListener('change', this.handleSelectChange);
    });

    const links = this.querySelectorAll('a');
    links.forEach(link => {
      link.removeEventListener('click', this.handleLinkClick);
    });
  }

  private handleLinkClick = (event: Event) => {
    event.preventDefault();
    const link = event.target as HTMLAnchorElement;
    const path = link.textContent || '';

    this.dispatchEvent(new CustomEvent('breadcrumb-navigation', {
      bubbles: true,
      composed: true,
      detail: {
        value: path
      }
    }));
  };

  private handleSelectChange = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    const selectedOption = select.options[select.selectedIndex].text;

    this.dispatchEvent(new CustomEvent('breadcrumb-navigation', {
      bubbles: true,
      composed: true,
      detail: {
        value: selectedOption
      }
    }));

    // For demo purposes, simulate navigation
    console.log(`Navigating to: ${selectedOption}`);
  }


  render() {
    return html`
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-breadcrumbs': PpBreadcrumbs;
  }
}