import { Elena } from '@elenajs/core';
import { describeTimestamp, type DateInput, type Locale } from '@shared/format';

/**
 * @summary A timestamp that keeps the value it stands for.
 * @status draft
 * @since 0.0.1
 *
 * Relative text — `9 months ago` — is a claim about what the actor still
 * remembers, and it costs them the actual value. So it always ships inside
 * `<time datetime>` carrying the machine-readable instant, and the absolute
 * value stays reachable *without hovering*: a `title` alone has no
 * keyboard-native trigger, and screen readers announce the visible text and
 * skip it. The absolute value therefore sits in the element's own content,
 * visually hidden, where it is announced rather than inferred; `title` is a
 * convenience for sighted actors with a mouse, not the mechanism.
 *
 * The element enhances a `<time>` child,
 * mutating `datetime`, `title`, and text in place. An author or server can
 * write the `<time>` with the absolute value as content — meaningful before
 * upgrade — or omit it and the element creates one. Without a `value` the
 * child is left untouched. The `<time>` is a real element of the document, so
 * the page's own `.visually-hidden` applies to it.
 *
 * See Storybook `Components/Timestamp` and `Foundations/Figures`.
 */

const TICK = 60_000;

/**
 * Relative text goes stale where it stands: `20 minutes ago` is wrong a minute
 * later and nothing re-renders it. One shared interval ticks the elements
 * currently *showing* relative text — an absolute date needs no ticking, and
 * with none on screen the interval doesn't run at all.
 */
const ticking = new Set<PpTimestamp>();
let interval: ReturnType<typeof setInterval> | undefined;

const startTicking = (element: PpTimestamp): void => {
  ticking.add(element);
  interval ??= setInterval(() => {
    for (const live of ticking) live.requestUpdate();
  }, TICK);
};

const stopTicking = (element: PpTimestamp): void => {
  ticking.delete(element);
  if (ticking.size === 0 && interval !== undefined) {
    clearInterval(interval);
    interval = undefined;
  }
};

export class PpTimestamp extends Elena(HTMLElement) {
  static tagName = 'pp-timestamp';

  // `value` may hold a `Date` or epoch number as a property, and objects
  // cannot survive attribute reflection (Elena serialises them as JSON), so
  // both props stay property-only; the attributes are still observed.
  static props = [
    { name: 'value', reflect: false },
    { name: 'locale', reflect: false },
  ];

  /** The instant. An ISO 8601 string as an attribute; any `DateInput` as a property. */
  value: DateInput = '';

  /** Only for a caller holding an actor's stated preference; otherwise resolved. */
  locale: Locale = '';

  #relative = false;
  #written = '';

  // Elena coerces an incoming attribute by the type the prop currently holds;
  // after `value` has held a `Date` or epoch number, an ISO attribute string
  // would go through JSON.parse / Number and be lost. The attribute is always
  // the ISO string, so hand it straight to the property.
  attributeChangedCallback(prop: string, oldValue: string | null, newValue: string | null): void {
    if (prop === 'value') {
      this.value = newValue ?? '';
      return;
    }
    super.attributeChangedCallback(prop, oldValue, newValue);
  }

  // Elena's connectedCallback ends in updated(), so a `<time>` moved in the
  // DOM (disconnect + reconnect without recreation) refreshes and rejoins the
  // ticking set on its own; only teardown needs handling.
  disconnectedCallback(): void {
    super.disconnectedCallback();
    stopTicking(this);
  }

  private get timeEl(): HTMLTimeElement | null {
    return this.querySelector<HTMLTimeElement>(':scope > time');
  }

  updated(): void {
    if (this.value === '' || this.value == null) {
      // No value: leave whatever the author wrote alone.
      this.#relative = false;
      stopTicking(this);
      return;
    }

    const { text, datetime, absolute, isRelative } = describeTimestamp(
      this.value,
      this.locale || undefined
    );
    this.#relative = isRelative;

    let time = this.timeEl;
    if (!time) {
      time = document.createElement('time');
      this.append(time);
    }

    if (time.dateTime !== datetime) time.dateTime = datetime;
    if (isRelative) {
      if (time.title !== absolute) time.title = absolute;
    } else {
      time.removeAttribute('title');
    }

    // Rewrite the leaf content only when it changed — a tick that lands in
    // the same bucket ("now" staying "now") should not churn the DOM.
    const content = isRelative ? `${text} (${absolute})` : text;
    if (this.#written !== content) {
      this.#written = content;
      time.textContent = text;
      if (isRelative) {
        const hidden = document.createElement('span');
        hidden.className = 'visually-hidden';
        hidden.textContent = ` (${absolute})`;
        time.append(hidden);
      }
    }

    if (this.#relative) startTicking(this);
    else stopTicking(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-timestamp': PpTimestamp;
  }
}
