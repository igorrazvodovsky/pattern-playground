# From tree to semilattice: navigating the pattern system as a network

## The problem with the tree

The sidebar in Storybook is a tree. Every pattern must be assigned to exactly one location. This is efficient for navigation — finite choices at each level, clear canonical position — but it misrepresents how the system actually works.

Christopher Alexander's "A City Is Not a Tree" (1965) names this precisely. A tree structure enforces *non-overlapping* membership: any two sets are either disjoint or one contains the other. But living systems — cities, design repertoires — are semilattices: elements participate in multiple overlapping sets simultaneously, and the overlaps are where the richness is. The newsstand at the corner of the drugstore belongs to the pedestrian system, the news distribution system, the social life of the street corner, and the drugstore's economy all at once. Forcing it into one branch kills that richness.

The same applies here. *Notification* sits at the intersection of feedback patterns, collaboration patterns, async communication patterns, and managing-outcomes patterns. The sidebar forces a single address. The cross-links we write to compensate are correct, but they're secondary — buried below the tree's cognitive primacy.

Bowker and Star (*Sorting Things Out*, 1999) describe this as the difference between *typological* and *topological* classification. Typological: assign to discrete bins. Topological: map proximity and connectivity — things have positions relative to each other, clusters emerge from structure rather than being imposed, and boundaries are gradients rather than lines.

## The semilattice already exists

The cross-reference network in the MDX files is already a semilattice. Every "related patterns" link, every inline reference, every `../?path=/docs/...` URL encodes a relationship. The tree is the imposed structure; the link network is the emergent one. It's more truthful about how the patterns actually relate, but it's discovered through reading, not through navigation.

The goal is to make this latent semilattice structure *navigable* — to let the network be a primary surface, not a secondary annotation on top of the tree.

## Direction

The structural work runs along two tracks that reinforce each other:

**Graph navigation**: a force-directed graph where nodes are patterns and edges are relationships. Clusters emerge from the link structure rather than from category assignments. The graph makes visible what the tree hides: which patterns are hubs (many connections, bridging multiple clusters), which are peripheral, which clusters are densely connected and which are loosely coupled. This is a topological view — proximity and connectivity as the primary organising logic.

**Typed relationships**: the current cross-links are untyped adjacency. Distinguishing *precedes*, *enables*, *complements*, *instantiates* would add directional meaning to the graph — turning an undirected proximity map into something closer to a causal/compositional structure. This is also where tags fit: explicit set memberships that allow faceted filtering alongside the emergent topology of the graph.

Together these aren't replacements for the tree but *alternative projections of the same underlying space*. The tree remains useful as an entry point for people who know roughly where they're going. The graph is for exploration, for discovering unexpected adjacencies, for asking "what connects to this?" rather than "where does this go?"

## Tasks

### 1. Graph data structure
Extract the node and edge data from the existing MDX files into `src/pattern-graph.json`. Nodes: all MDX entries with their Meta titles, top-level category, and Storybook path. Edges: all outgoing `../?path=/docs/...` links, mapped back to node IDs.

This is the foundation everything else builds on. Semi-manual extraction is fine for the first pass — grep for the link pattern, resolve URLs to node IDs, review for accuracy.

### 2. PatternGraph component
A React component that renders the graph data using a force-directed layout. The `PatternGraph` import is already in `Intro.mdx` — the component needs to be created at `src/components/PatternGraph`.

### 3. Relationship typing
Annotate edges in the graph data with relationship types: `precedes`, `follows`, `enables`, `complements`, `instantiates`, `tangential`. This adds directional meaning and opens up filtered views ("show only enabling relationships", "show the sequence of patterns for this task").

This is also where formal tags come in — Storybook's native tag system could encode set memberships that the graph edges don't capture (e.g. `AI`, `async`, `system-initiated`), enabling faceted navigation alongside the graph.

### 4. Alternative projections
Once the graph and data structure exist, specific projections become possible:
- *by temporal phase*: arrange along the Seek–Use–Share axis, making the user journey visible as a direction through the space
- *by quality*: group nodes by which qualities they most enact (Agency, Conversation, Malleability, etc.)

These are views of the same data, not separate structures.

## References

- Alexander, C. (1965). *A City Is Not a Tree.* Architectural Forum, 122(1 & 2).
- Bowker, G. C., & Star, S. L. (1999). *Sorting Things Out: Classification and Its Consequences.* MIT Press.