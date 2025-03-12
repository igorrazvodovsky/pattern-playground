import { LitElement, html, CSSResultGroup, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import styles from './breadcrumbs.css?inline';


@customElement('pp-breadcrumbs')
export class PpBreadcrumbs extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  // Internal state to track if the component has been initialized
  @state()
  private initialized = false;

  private observer: MutationObserver | null = null;

  connectedCallback() {
    super.connectedCallback();

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

    const selects = this.querySelectorAll('.disguised-select');
    selects.forEach(select => {
      select.addEventListener('change', this.handleSelectChange);
    });
  }

  private removeEventListeners() {
    const selects = this.querySelectorAll('.disguised-select');
    selects.forEach(select => {
      select.removeEventListener('change', this.handleSelectChange);
    });
  }

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