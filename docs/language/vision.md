# Pattern language vision

Long-term orientation for the pattern *language* — the conceptual layer of
moves, qualities, and the relationships between them. It names where the language
is heading; for where the project *artifact* is heading, see
[../project/vision.md](../project/vision.md).

Compare this with [operative-image.md](./operative-image.md), the current working
picture of the language. It is not an implementation plan or schema contract.

## A first language layer exists — but it is not operational

An earlier version of this vision sketched a "possible language layer" — a set of
typed graphs (generative, quality, implementation, taxonomic, collection) over
the pattern MDX. A first iteration of that layer now exists: the typed-edge
vocabulary in [relationship-vocabulary.md](./relationship-vocabulary.md) gives it
concrete form, the role model in
[../specs/pattern-role-model.md](../specs/pattern-role-model.md) settles the node
types, and [operative-image.md](./operative-image.md) describes what is built.

That is a different thing from an operational language. You cannot yet use the
graph to generate design: coverage is partial, structural gaps remain, and the
data model itself — relationship types, profile shape, what is even worth
encoding — is expected to keep changing through several more iterations before it
earns real use in design work. So the sketch has graduated into a first build,
not into a usable language. The vision still points past that build, along two
tracks: one deep and theoretical, one nearer and practical.

## Track 1 — Nature of Order register

The language currently lives in Alexander's *Pattern Language* register: patterns
are moves, typed edges describe how moves combine, and the data is
suggestion-grade. The aspiration is the *Nature of Order* register — structural
*properties* that act as recursive production rules, giving design a genuine
grammar rather than a vocabulary of hints. [design-theory.md](./design-theory.md)
holds the full trajectory; [levels-of-scale.md](../levels-of-scale.md) is the
first worked translation of one property into software.

Getting there means discovering interaction-design analogues of Alexander's
structural properties — configurations that reliably produce certain experiential
effects across diverse users and contexts. This is the long horizon, and it is not close.

## Track 2 — Agent-usable language

The nearer frontier is making the language something an actor — human or AI —
reasons over rather than reads. Three concrete moves:

- *Situations across the corpus.* The `situation.initiating` /
  `situation.resulting` frontmatter constructs exist and are populated for a
  small starting set. The open question is whether the fields pull their weight
  before retrofitting them across the library (see
  [relationship-vocabulary.md](./relationship-vocabulary.md), Open Questions).
- *A query layer over the graph.* Edge axes, transitive enablement, co-grounding
  through shared foundations, and alternative-conflict detection are all derivable
  from the graph and could be exposed to a reasoning actor on demand rather than
  pre-computed.
- *Situation-shaped reasoning.* `recommends` edges carry decision-tree branches
  as raw situational text. The frontier is using them as context for judgement,
  not as predicates to be matched against a query.

This track is the language-level face of the project's
[agent-consumable repertoire](../project/vision.md) direction.

## Mature move record

A mature `move` record splits across the two operative levels and this vision.
The situation constructs already carry the initiating situation and the
resulting-context clauses, and `enacts` edges carry the quality claims. The
fields that remain aspirational are the ones that make the object generative
rather than catalogue-like:

```ts
interface PatternMove {
  id: string;
  name: string;
  situation: string;
  problem: string;
  forces: string[];
  move: string;
  produces: string;
  consequences: string[];
  interactionContract?: string;
  enacts: string[];
  precedes?: string[];
  follows?: string[];
  alternatives?: string[];
  enabledBy?: string[];
  examples?: string[];
  evidence?: string[];
  status: 'seed' | 'observed' | 'settled' | 'deprecated';
}
```

The still-unrealised fields are `problem`, `forces`, `consequences`,
`evidence`, and `status`. They are what would let a reasoning actor treat a
pattern as a move rather than a page, so they belong to Track 2. The `status`
field is the confidence signal: a seed can be useful, but it should not
masquerade as a settled invariant.

Of these, `status` is the nearest: the corpus already generates the need —
stubs present with finished-page authority, and maturity has to be legible as
more than editorial confidence. Whether `consequences` remains a distinct field
is an open comparison against `situation.resulting`, which already covers what
holds after the move is applied, including the new problems it opens; that is
settled on a filled corpus by the situation-backfill pass
([../../plans/active/2026-07-situation-backfill.md](../../plans/active/2026-07-situation-backfill.md)).

## Guidance

When adding or revising material, ask these questions before choosing tags,
edges, or file locations:

1. Is this page an authoritative source for one move, or a collection over a
   territory?
2. Does the thing act on a recurring human situation, or is it mainly an
   implementation mechanism?
3. If it is a control, does the page document a complete interaction contract,
   or only visual/API variants?
4. Which relationship is being asserted: generative sequence, implementation
   enablement, taxonomic instantiation, quality enactment, or editorial
   proximity?
5. Would this distinction be legible to a future agent from repository-local
   artifacts, or is it still living only in prose and assumptions?

Prefer making role and relationship distinctions explicit in docs or source
metadata over relying on path names. Path names are projections. They are useful,
but they are not the ontology.
