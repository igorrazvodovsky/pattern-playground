// Radix portals overlays to <body>, outside the demo and so outside the
// [data-registry="shadcn"] scope the sheet is limited to. Overlays portal into
// a body-level container that carries the scope attribute instead.
let portalRoot: HTMLElement | null = null;

export const scopedPortal = () => {
  if (!portalRoot?.isConnected) {
    portalRoot = Object.assign(document.createElement('div'), { className: 'spec-demo-portal' });
    portalRoot.dataset.registry = 'shadcn';
    document.body.append(portalRoot);
  }
  return portalRoot;
};
