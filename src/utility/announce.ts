let announcer: HTMLElement | null = null;

function getAnnouncer(): HTMLElement {
  if (!announcer || !document.body.contains(announcer)) {
    announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    Object.assign(announcer.style, {
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden'
    });
    document.body.appendChild(announcer);
  }
  return announcer;
}

export function announce(message: string) {
  getAnnouncer().textContent = message;
}
