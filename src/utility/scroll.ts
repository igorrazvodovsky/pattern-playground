const locks = new Set();

function getScrollbarWidth() {
  const documentWidth = document.documentElement.clientWidth;
  return Math.abs(window.innerWidth - documentWidth);
}

// Used in conjunction with scrollbarWidth to set body padding in case the body has padding already on the `<body>` element.
function getExistingBodyPadding() {
  const padding = Number(getComputedStyle(document.body).paddingRight.replace(/px/, ''));

  if (isNaN(padding) || !padding) {
    return 0;
  }

  return padding;
}

export function scrollIntoView(
  element: HTMLElement,
  container: HTMLElement,
  direction: 'horizontal' | 'vertical' | 'both' = 'vertical',
  behavior: 'smooth' | 'auto' = 'smooth'
) {
  const offset = getOffset(element, container);
  const offsetTop = offset.top + container.scrollTop;
  const offsetLeft = offset.left + container.scrollLeft;
  const minX = container.scrollLeft;
  const maxX = container.scrollLeft + container.offsetWidth;
  const minY = container.scrollTop;
  const maxY = container.scrollTop + container.offsetHeight;

  if (direction === 'horizontal' || direction === 'both') {
    if (offsetLeft < minX) {
      container.scrollTo({ left: offsetLeft, behavior });
    } else if (offsetLeft + element.clientWidth > maxX) {
      container.scrollTo({ left: offsetLeft - container.offsetWidth + element.clientWidth, behavior });
    }
  }

  if (direction === 'vertical' || direction === 'both') {
    if (offsetTop < minY) {
      container.scrollTo({ top: offsetTop, behavior });
    } else if (offsetTop + element.clientHeight > maxY) {
      container.scrollTo({ top: offsetTop - container.offsetHeight + element.clientHeight, behavior });
    }
  }
}

function getOffset(element: HTMLElement, parent: HTMLElement) {
  return {
    top: Math.round(element.getBoundingClientRect().top - parent.getBoundingClientRect().top),
    left: Math.round(element.getBoundingClientRect().left - parent.getBoundingClientRect().left)
  };
}

// Prevents body scrolling. Keeps track of which elements requested a lock so multiple levels of locking are possible without premature unlocking.
export function lockBodyScrolling(lockingEl: HTMLElement) {
  locks.add(lockingEl);

  // When the first lock is created, set the scroll lock size to match the scrollbar's width to prevent content from
  // shifting. We only do this on the first lock because the scrollbar width will measure zero after overflow is hidden.
  if (!document.documentElement.classList.contains('pp-scroll-lock')) {
    /** Scrollbar width + body padding calculation can go away once Safari has scrollbar-gutter support. */
    const scrollbarWidth = getScrollbarWidth() + getExistingBodyPadding(); // must be measured before the `pp-scroll-lock` class is applied

    let scrollbarGutterProperty = getComputedStyle(document.documentElement).scrollbarGutter;

    // default is auto, unsupported browsers is "undefined"
    if (!scrollbarGutterProperty || scrollbarGutterProperty === 'auto') {
      scrollbarGutterProperty = 'stable';
    }

    if (scrollbarWidth <= 0) {
      // if there's no scrollbar, just set it to "revert" so whatever the user has set gets used. This is useful is the page is not overflowing and showing a scrollbar, or if the user has overflow: hidden, or any other reason a scrollbar may not be showing.
      scrollbarGutterProperty = 'revert';
    }
    document.documentElement.style.setProperty('--pp-scroll-lock-gutter', scrollbarGutterProperty);
    document.documentElement.classList.add('pp-scroll-lock');
    document.documentElement.style.setProperty('--pp-scroll-lock-size', `${scrollbarWidth}px`);
  }
}

// Unlocks body scrolling. Scrolling will only be unlocked once all elements that requested a lock call this method.
export function unlockBodyScrolling(lockingEl: HTMLElement) {
  locks.delete(lockingEl);

  if (locks.size === 0) {
    document.documentElement.classList.remove('pp-scroll-lock');
    document.documentElement.style.removeProperty('--pp-scroll-lock-size');
  }
}