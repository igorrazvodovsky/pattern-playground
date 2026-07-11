/**
 * Convert a heading's text into a document-unique id and set it on the element,
 * leaving any author-supplied id untouched.
 */
export function setTextAsID(elem: Element): void {
  if (elem.id) return;
  const base = elem.textContent
    ?.replace(/[^a-zA-Z0-9-_ -￯\s-]/g, '-')
    .replace(/[\s-]+/g, '-');
  if (!base) return;
  let suffix = 0;
  let candidate = `toc_${base}`;
  while (document.getElementById(candidate)) {
    suffix++;
    candidate = `toc_${base}_${suffix}`;
  }
  elem.id = candidate;
}
