/**
 * Collection view template: a spec shape (ViewSpec), an entity binding
 * (shared/data/bindings), and the renderer registry that turns a
 * (model, spec, binding) triple into a view. The canonical demo population
 * is the circular-economy products collection, but nothing in the renderers
 * is product-shaped. Component-catalogue material — the view-family pattern demos
 * borrow it, never the other way round.
 */

export * from './spec';
export * from './data';
export * from './renderers';
