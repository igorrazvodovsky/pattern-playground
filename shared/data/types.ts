// The entity shapes here are the assembled views', not second declarations of
// them: the world is the authority, and a hand-written copy would drift from
// it. `User` and `Project` are exported from the barrel the same way, as
// `typeof users[0]` and `typeof projects[0]`.

export type { ProductView as Product } from './world-views';
