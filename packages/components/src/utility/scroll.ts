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
