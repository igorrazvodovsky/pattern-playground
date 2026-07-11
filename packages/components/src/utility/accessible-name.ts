export function textFromIdRefs(idRefs: string, root: Document | ShadowRoot = document): string {
  return idRefs
    .trim()
    .split(/\s+/)
    .map((id) => root.getElementById(id)?.textContent?.trim())
    .filter((text): text is string => Boolean(text))
    .join(' ');
}
