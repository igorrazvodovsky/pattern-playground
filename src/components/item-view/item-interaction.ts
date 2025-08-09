import type { BaseItem, ViewScope, InteractionMode } from './types';
import { modalService } from '../../services/modal-service';
import '../popup/popup';

/**
 * Progressive enhancement item interaction component
 * Enhances existing elements with semantic zoom behavior
 */
export class PPItemInteraction extends HTMLElement {
  private item: BaseItem | null = null;
  private contentType = '';
  private enableEscalation = true;
  private content: HTMLElement | null = null;
  private hoverCard: HTMLElement | null = null;
  private isHovering = false;
  private isModifierPressed = false;
  private hoverCardTimeout: number | null = null;
  private isPopupHovered = false;

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handlePopupMouseEnter = this.handlePopupMouseEnter.bind(this);
    this.handlePopupMouseLeave = this.handlePopupMouseLeave.bind(this);
  }

  static get observedAttributes() {
    return ['content-type', 'enable-escalation', 'item-data'];
  }

  connectedCallback() {
    this.init();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.handleAttributeChange(name, newValue);
    }
  }

  private init() {
    this.parseAttributes();
    this.findContentElements();
    this.setupEventListeners();
    this.setupInteractionHints();
  }

  private parseAttributes() {
    this.contentType = this.getAttribute('content-type') || '';
    this.enableEscalation = this.getAttribute('enable-escalation') !== 'false';

    const itemData = this.getAttribute('item-data');
    if (itemData) {
      try {
        this.item = JSON.parse(itemData);
      } catch (e) {
        console.warn('Invalid item-data JSON:', itemData);
      }
    }
  }

  private findContentElements() {
    // Look for content to wrap - any immediate child elements or text
    const children = Array.from(this.children);
    if (children.length === 0) {
      // Wrap text content
      this.content = document.createElement('span');
      this.content.className = 'item-interaction__content';
      this.content.textContent = this.textContent || '';
      this.textContent = '';
      this.appendChild(this.content);
    } else {
      // Wrap first child or create wrapper
      this.content = children[0] as HTMLElement;
      if (!this.content.classList.contains('item-interaction__content')) {
        this.content.classList.add('item-interaction__content');
      }
    }
  }

  private setupEventListeners() {
    if (this.content && this.enableEscalation) {
      this.content.addEventListener('click', this.handleClick);
      this.content.addEventListener('mouseenter', this.handleMouseEnter);
      this.content.addEventListener('mouseleave', this.handleMouseLeave);
    }

    // Global keyboard listeners for modifier keys
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('focus', this.handleFocus);
  }

  private setupInteractionHints() {
    if (!this.enableEscalation || !this.content) return;

    // Add cursor pointer to indicate interactivity
    this.content.style.cursor = 'pointer';
  }

  private handleAttributeChange(name: string, newValue: string) {
    switch (name) {
      case 'content-type':
        this.contentType = newValue;
        break;
      case 'enable-escalation':
        this.enableEscalation = newValue !== 'false';
        break;
      case 'item-data':
        try {
          this.item = JSON.parse(newValue);
        } catch (e) {
          console.warn('Invalid item-data JSON:', newValue);
        }
        break;
    }
  }

  private handleClick(e: MouseEvent) {
    if (!this.enableEscalation || !this.item) {
      console.log('Click ignored:', { enableEscalation: this.enableEscalation, hasItem: !!this.item });
      return;
    }

    console.log('Item interaction click:', { item: this.item, ctrlKey: e.ctrlKey, metaKey: e.metaKey });
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      this.$emit('scope-change', { scope: 'maxi' });
      this.handleScopeChange('maxi');
    } else {
      this.$emit('scope-change', { scope: 'mid' });
      this.handleScopeChange('mid');
    }
  }

  private handleMouseEnter() {
    this.isHovering = true;
    this.updateHoverState();
  }

  private handleMouseLeave() {
    this.isHovering = false;
    this.updateHoverState();
    this.scheduleHideHoverCard();
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) {
      this.isModifierPressed = true;
      this.updateHoverState();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (!e.ctrlKey && !e.metaKey) {
      this.isModifierPressed = false;
      this.updateHoverState();
    }
  }

  private handleFocus() {
    this.isModifierPressed = false;
    this.updateHoverState();
  }

  private updateHoverState() {
    if (!this.content) return;

    const shouldShowHint = this.enableEscalation && this.isHovering && !this.isModifierPressed;
    const shouldShowCard = this.enableEscalation && this.isHovering && this.isModifierPressed;

    // Update hint styling
    if (shouldShowHint) {
      this.content.classList.add('item-interaction__content--hint');
      this.content.title = 'Hold Ctrl/Cmd for preview';
    } else {
      this.content.classList.remove('item-interaction__content--hint');
      this.content.title = '';
    }

    // Show/hide hover card
    if (shouldShowCard) {
      this.cancelHideHoverCard();
      this.showHoverCard();
    } else if (!this.isPopupHovered) {
      this.scheduleHideHoverCard();
    }
  }

  private showHoverCard() {
    if (!this.item || this.hoverCard) return;

    this.hoverCard = this.createHoverCard();
    this.appendChild(this.hoverCard);

    // Add hover listeners to popup
    this.hoverCard.addEventListener('mouseenter', this.handlePopupMouseEnter);
    this.hoverCard.addEventListener('mouseleave', this.handlePopupMouseLeave);
  }

  private hideHoverCard() {
    if (this.hoverCard) {
      this.hoverCard.removeEventListener('mouseenter', this.handlePopupMouseEnter);
      this.hoverCard.removeEventListener('mouseleave', this.handlePopupMouseLeave);
      this.hoverCard.remove();
      this.hoverCard = null;
      this.isPopupHovered = false;
    }
  }

  private scheduleHideHoverCard() {
    this.cancelHideHoverCard();
    this.hoverCardTimeout = window.setTimeout(() => {
      if (!this.isPopupHovered) {
        this.hideHoverCard();
      }
    }, 500); // 500ms delay for moving mouse from reference to popup
  }

  private cancelHideHoverCard() {
    if (this.hoverCardTimeout) {
      clearTimeout(this.hoverCardTimeout);
      this.hoverCardTimeout = null;
    }
  }

  private handlePopupMouseEnter() {
    this.isPopupHovered = true;
    this.cancelHideHoverCard();
  }

  private handlePopupMouseLeave() {
    this.isPopupHovered = false;
    this.scheduleHideHoverCard();
  }

  private createHoverCard(): HTMLElement {
    const popup = document.createElement('pp-popup');
    popup.classList.add('item-interaction__hover-card');
    popup.setAttribute('placement', 'top');
    popup.setAttribute('distance', '8');
    popup.setAttribute('flip', 'true');
    popup.setAttribute('shift', 'true');
    popup.setAttribute('active', 'true');

    // Set anchor to the content element
    if (this.content) {
      popup.anchor = this.content;
    }

    // Create mini preview content
    const preview = document.createElement('pp-item-preview');
    preview.setAttribute('content-type', this.contentType);
    preview.setAttribute('item-data', JSON.stringify(this.item));

    popup.appendChild(preview);
    return popup;
  }

  private handleScopeChange(scope: ViewScope) {
    switch (scope) {
      case 'mid':
        this.openDrawer();
        break;
      case 'maxi':
        this.openDialog();
        break;
    }
  }

  private openDrawer() {
    if (!this.item) return;

    console.log('Opening drawer for item:', this.item);

    const content = document.createElement('div');
    const detail = document.createElement('pp-item-detail');
    detail.setAttribute('content-type', this.contentType);
    detail.setAttribute('item-data', JSON.stringify(this.item));
    content.appendChild(detail);

    console.log('Generated drawer content:', content.innerHTML);

    // Use modal service directly
    modalService.openDrawer(content.innerHTML, 'right', this.item.label);
  }

  private openDialog() {
    if (!this.item) return;

    const content = document.createElement('div');
    const fullView = document.createElement('pp-item-full-view');
    fullView.setAttribute('content-type', this.contentType);
    fullView.setAttribute('item-data', JSON.stringify(this.item));
    content.appendChild(fullView);

    // Use modal service directly
    modalService.openDialog(content.innerHTML, this.item.label);
  }

  private cleanup() {
    this.cancelHideHoverCard();
    this.hideHoverCard();

    if (this.content) {
      this.content.removeEventListener('click', this.handleClick);
      this.content.removeEventListener('mouseenter', this.handleMouseEnter);
      this.content.removeEventListener('mouseleave', this.handleMouseLeave);
    }

    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('focus', this.handleFocus);
  }

  private $emit(eventName: string, detail: any) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  // Public API for setting item data
  setItem(item: BaseItem) {
    this.item = item;
    this.setAttribute('item-data', JSON.stringify(item));
  }

  getItem(): BaseItem | null {
    return this.item;
  }
}

customElements.define('pp-item-interaction', PPItemInteraction);

declare global {
  interface HTMLElementTagNameMap {
    'pp-item-interaction': PPItemInteraction;
  }
}