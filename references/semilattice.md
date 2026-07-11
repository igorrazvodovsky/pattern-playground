# From tree to semilattice: navigating the pattern system as a network

## The problem with the tree

The sidebar is a tree. Every pattern must be assigned to exactly one location. This is efficient for navigation — finite choices at each level, clear canonical position — but it misrepresents how the system actually works.

Christopher Alexander's "A City Is Not a Tree" (1965) names this precisely. A tree structure enforces *non-overlapping* membership: any two sets are either disjoint or one contains the other. But living systems — cities, design repertoires — are semilattices: elements participate in multiple overlapping sets simultaneously, and the overlaps are where the richness is. The newsstand at the corner of the drugstore belongs to the pedestrian system, the news distribution system, the social life of the street corner, and the drugstore's economy all at once. Forcing it into one branch kills that richness.

The same applies here. *Notification* sits at the intersection of feedback patterns, collaboration patterns, async communication patterns, and managing-outcomes patterns. The sidebar forces a single address. The cross-links we write to compensate are correct, but they're secondary — buried below the tree's cognitive primacy.

Bowker and Star (*Sorting Things Out*, 1999) describe this as the difference between *typological* and *topological* classification. Typological: assign to discrete bins. Topological: map proximity and connectivity — things have positions relative to each other, clusters emerge from structure rather than being imposed, and boundaries are gradients rather than lines.

## The semilattice already exists

The cross-reference network in the MDX pages is already a semilattice. Every "related patterns" link, every inline reference encodes a relationship. The tree is the imposed structure; the link network is the emergent one. It's more truthful about how the patterns actually relate, but it is mostly discovered through reading, not through navigation.

The goal is to make this latent semilattice structure *navigable* — to let the network be a primary surface, not a secondary annotation on top of the tree.

## The network as a surface

The move toward this is the pattern graph: a force-directed view where nodes are patterns and edges are relationships, rendered on the pattern site. Clusters emerge from the link structure rather than from category assignments. The graph makes visible what the tree hides: which patterns are hubs (many connections, bridging multiple clusters), which are peripheral, which clusters are densely connected and which are loosely coupled. This is a topological view — proximity and connectivity as the primary organising logic.

It sits alongside the tree rather than replacing it: the two are *alternative projections of the same underlying space*. The sidebar tree remains useful as an entry point for people who know roughly where they're going. The graph is for exploration, for discovering unexpected adjacencies, for asking "what connects to this?" rather than "where does this go?"

The node and edge model is still being worked out — what counts as a node, how edges are typed, which relationships earn a place. The current state of that model lives in [graph-relationship-model.md](../docs/specs/graph-relationship-model.md); the [pattern-site spec](../docs/specs/pattern-site.md) covers how the content and routes behind it are structured.

## Typed relationships

The cross-links started as untyped adjacency and are gaining direction and meaning: distinguishing *precedes* from *enables* from *complements* turns a flat proximity map into something closer to a causal and compositional structure, and opens filtered views — show only the enabling relationships, trace the sequence of moves for a task. The controlled vocabulary and its generative-moves framing live in [relationship-vocabulary.md](../docs/language/relationship-vocabulary.md); this is one of the parts still in motion.

## Further projections

The graph and typed edges are the foundation; further projections of the same data remain ahead:

- *by temporal phase*: arrange along the Seek–Use–Share axis, making the user journey visible as a direction through the space
- *by quality*: group nodes by which qualities they most enact, reading quality-enactment as set membership rather than adjacency
- *faceted filtering by tag*: explicit set memberships (e.g. `AI`, `async`, `system-initiated`) layered over the emergent topology

These are views of the same data, not separate structures.

## References

- Alexander, C. (1965). *A City Is Not a Tree.* Architectural Forum, 122(1 & 2).
- Bowker, G. C., & Star, S. L. (1999). *Sorting Things Out: Classification and Its Consequences.* MIT Press.