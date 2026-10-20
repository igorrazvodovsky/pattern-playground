// The component libraries a switchable demo renders through
// (packages/components/src/catalog/registries/), with the label the demo
// frame's switch shows. Names and labels only: the frame renders at prerender,
// so the loaders stay in demo-registry.ts, out of the prerender graph.
export const libraryLabels = {
  pp: "playground's own",
  shadcn: 'shadcn',
} as const;

export type Library = keyof typeof libraryLabels;
