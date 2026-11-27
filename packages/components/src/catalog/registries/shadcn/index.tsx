import { defineRegistry } from '@json-render/react';
import { catalog } from '../../catalog';
import { collections } from './collections';
import { content } from './content';
import { conversation } from './conversation';
import { inputs } from './inputs';
import { layout } from './layout';
import { overlays } from './overlays';
import sheetUrl from '../../shadcn.generated.css?url';

// The catalog rendered with shadcn/ui. Every type is built from shadcn's own
// class lists over Radix primitives, which is how shadcn is meant to be used:
// its components are copied into a project, not imported.
//
// The stylesheet is linked by URL, not imported as a module: Astro hoists CSS
// imported anywhere under a client script into every page's <head>, which
// would load Tailwind on pages that never render a shadcn demo. Callers await
// `stylesheet()` before rendering so the first frame is styled. It checks the
// head on every call: ClientRouter removes head elements the next page's HTML
// lacks, which includes this link, so a sheet loaded on an earlier page is gone
// after a navigation.
//
// Tailwind scans every .tsx file in this folder (catalog/shadcn.css), so a
// class written elsewhere, or in a .ts file, is not in the sheet.
// Rebuild the sheet after changing classes:
//   npm run build:shadcn-css

let loading: Promise<void> | undefined;

export function stylesheet(): Promise<void> {
  const selector = 'link[data-registry-sheet="shadcn"]';
  if (loading && document.head.querySelector(selector)) return loading;
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: sheetUrl });
  link.dataset.registrySheet = 'shadcn';
  loading = new Promise<void>((resolve, reject) => {
    link.addEventListener('load', () => resolve());
    link.addEventListener('error', () => {
      link.remove();
      reject(new Error(`could not load ${sheetUrl}`));
    });
  });
  document.head.append(link);
  return loading;
}

export const { registry } = defineRegistry(catalog, {
  components: {
    ...layout,
    ...collections,
    ...content,
    ...conversation,
    ...inputs,
    ...overlays,
  },
});
