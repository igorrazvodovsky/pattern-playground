// aria-describedby holds a list of ids. Two features write to it on the same
// links (the open-pane mark and the link preview), so each adds and removes
// only its own id.

export function addDescribedBy(el: Element, id: string) {
  const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  if (!ids.includes(id)) el.setAttribute('aria-describedby', [...ids, id].join(' '));
}

export function removeDescribedBy(el: Element, id: string) {
  const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(t => t && t !== id);
  if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
  else el.removeAttribute('aria-describedby');
}
