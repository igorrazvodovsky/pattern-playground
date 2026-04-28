# HCI pattern languages

Research notes on pattern and pattern-language literature in HCI. The purpose is
not to import a single school wholesale, but to sharpen the project's working
definition of pattern.

## Sources read

- Andy Dearden and Janet Finlay (2006), [*Pattern Languages in HCI: A Critical Review*](https://doi.org/10.1207/s15327051hci2101_3).
- Sally Fincher, *What is a Pattern Language?*.
- Jurgen Engel, Christian Martin, and Peter Forbrig (2011), *HCI Patterns as a Means to Transform Interactive User Interfaces to Diverse Contexts of Use*.
- Ahmed Seffah and Mohamed Taleb (2012), *Tracing the Evolution of HCI Patterns as an Interaction Design Tool*.
- Elisabeth Bayle et al. (1998), [*Putting It All Together: Towards a Pattern Language for Interaction Design*](https://homepages.cwi.nl/~steven/sigchi/bulletin/1998.1/erickson.html).
- Jan O. Borchers (2000), [*A Pattern Approach to Interaction Design*](https://static.aminer.org/pdf/PDF/000/005/547/a_pattern_approach_to_interaction_design.pdf).
- Martijn van Welie, Gerrit C. van der Veer, and Anton Eliens (2000), [*Interaction Patterns in User Interfaces*](https://www.welie.com/papers/PLoP2k-Welie.pdf).
- Martijn van Welie and Gerrit C. van der Veer (2003), [*Pattern Languages in Interaction Design: Structure and Organization*](https://www.welie.com/papers/Welie-Interact2003.pdf).
- Thomas Erickson (2000), [*Lingua Francas for Design: Sacred Places and Pattern Languages*](https://doi.org/10.1145/347642.347794).
- Diego M. da Rosa and Milene Silveira (2022), [*May the Patterns Be with You: A Framework for HCI Patterns Development*](https://ixdea.org/wp-content/uploads/IxDEA_art/54/54_8.pdf).

## What counts as a pattern

The compact definition from Dearden and Finlay is useful: a pattern is a
structured description of an invariant solution to a recurrent problem within a
context. The rest of the literature complicates every word in that sentence.

A pattern is both:

- an observed recurrence in practice, visible across multiple situated examples
- an authored medium for communicating design guidance

For this project, a `move` becomes a pattern only when it passes most of these
tests:

1. *Recurring situation*: it acts on a human situation that appears repeatedly,
   not on a one-off feature request.
2. *Problem or tension*: it names what is difficult, unstable, costly, or
   ambiguous in that situation.
3. *Forces*: it exposes competing pressures rather than pretending there is a
   neutral best answer.
4. *Invariant resolution*: it describes the stable core of a response that can be
   re-instantiated in different products, modalities, and examples.
5. *Meaningful abstraction*: it sits at a level practitioners can recognise and
   reuse, not so generic that it becomes a principle and not so specific that it
   remains an example.
6. *Rationale*: it explains why the move works and what tradeoffs it makes.
7. *Evidence*: it is grounded in examples, observed use, practice, or literature.
   If evidence is weak, the pattern should be marked as a seed.
8. *Domain and scope*: it says where it applies and where it should not be
   expected to travel.
9. *User and context variables*: it makes legible which actor characteristics,
   goals, expertise levels, constraints, environments, or task conditions affect
   fit.
10. *Consequences and values*: it makes the value commitment legible. Patterns
   recommend particular arrangements; they are not neutral.
11. *Relations*: it participates in a language by pointing to larger contexts,
   enabling mechanisms, alternatives, and follow-up moves.

That means a common UI object is not automatically a pattern. A component such
as a button is usually a mechanism. It becomes pattern-like only when the
documentation captures a complete interaction contract and its use context.

## Activity patterns and design patterns

Bayle et al. distinguish two senses of pattern:

- *Activity pattern*: a recurring phenomenon or behaviour observed in the world,
  without necessarily judging it good or worth emulating.
- *Design pattern*: a recurring problem linked to a solution that has proven
  useful across situations.

This is useful for the project because research observations can be stored
without prematurely turning them into recommendations. An activity pattern is
evidence or source material. A design pattern is a value-bearing move.

Anti-patterns sit nearby: they describe recurring harmful practice and a repair.
They are useful when the library needs to name a failure mode without normalising
it as a positive move.

## Pattern language, not catalogue

A pattern catalogue is a retrievable set of entries. A pattern language is a
connected structure that helps an actor generate, sequence, and adapt design
moves.

Fincher's useful formulation is that a language has an *organising principle*:
the arrangement matters as much as the collected entries. It gives the material a
gestalt shape, making the whole territory legible rather than merely findable.

The strongest accounts of language share four properties:

- *Scale or altitude*: patterns range from broad social or experiential context to
  low-level interaction details. HCI cannot rely on physical scale the way
  architecture can, so its scale is multidimensional: activity, task, technology,
  information, time, actor, and value.
- *Organising principle*: the language has an explicit logic for why entries sit
  near, above, below, before, or after one another. A folder tree alone is not
  enough.
- *Typed relations*: patterns connect by context, completion, enablement,
  specialization, aggregation, association, alternative, and sequence. These
  relations are the difference between a language and a pile of examples.
- *Generativity*: a language helps ask the next design question at the right
  time. Generativity can mean sequencing decisions, constraining a solution
  space, giving indirect practical advice, or surfacing alternatives.

For this repository, the graph is therefore not decoration. It is the nearest
thing the project has to the "language" part of pattern language.

## HCI-specific pressure points

The HCI literature adds several constraints that are weaker in architecture and
software-pattern discussions:

- *Temporality*: interaction patterns must account for state, sequence, rhythm,
  attention, repair, and change over time. Static screenshots are not enough.
- *Multiple stakeholders*: patterns often act as a lingua franca among designers,
  engineers, domain experts, users, managers, and researchers.
- *User-legible language*: HCI patterns should be understandable beyond
  specialists when they are used for participatory design.
- *Context dependence*: culture, genre, domain, device, organisational setting,
  and actor expertise can all change whether a pattern is good.
- *User-experience grounding*: user characteristics, behaviours, expectations,
  perceptions, and goals should inform pattern selection. They should not be
  hidden only in long-form prose.
- *Weak evidence risk*: common practice is not the same as good practice.
  Pattern mining needs criteria for success, not only recurrence.
- *Dynamic presentation*: HCI patterns often need to show temporal or causal
  structure. A static example may not be enough to make the move reusable.
- *Living maintenance*: a pattern language needs review, versioning, confidence,
  and repair as new examples appear.

## Patterns as transformation rules

Engel, Martin, and Forbrig show a more operational use of HCI patterns:
transforming an interface from one context of use to another. Their examples
translate desktop patterns to smartphone patterns by considering models of task,
user, device, environment, and data architecture.

The useful concept is the `transformation pattern`: a rule whose problem is "how
should source pattern X transform under context Y?", whose context describes the
source and target conditions, and whose solution names the target pattern or
sequence of target patterns.

They identify three transformation modes:

1. Reuse the same pattern in the target interface.
2. Keep the same pattern but vary its extensiveness, such as showing fewer menu
   items or less content.
3. Reorganise the interface by replacing one source pattern with one or more
   different target patterns.

For this project, the important lesson is not that patterns should become
automatic rewrite rules. It is that context-of-use variables can change which move
is appropriate, and a mature language may eventually need explicit transformation
relations for adaptation across devices, actors, environments, or expertise levels.

## Patterns as process tools

Seffah and Taleb describe a shift from isolated pattern reuse toward
`pattern-oriented design`: using pattern relationships and user variables to guide
design composition. On this account, a language needs more than a list of related
patterns. It needs relationship semantics strong enough to support decisions such
as "these patterns are alternatives", "this pattern can be embedded in that one",
or "this pattern is super-ordinate to this group".

Their UPADE examples use relationship types such as `similar`, `competitor`,
`super-ordinate`, `sub-ordinate`, and `neighboring`. The exact vocabulary does
not need to be imported, but the principle matters: relationship labels should
carry compositional meaning, not just editorial proximity.

They also argue that HCI pattern languages often under-specify users. User
experience information appears, when it appears at all, inside prose rather than
as a first-class selection aid. They propose connecting personas, behavioural
variables, user goals, and usability problems to pattern selection and composition.

For this project, this supports two existing directions:

- typed edges are load-bearing because they let a designer reason about
  composition, conflict, sequence, and enablement
- qualities and future maturity/status fields should be complemented by concrete
  actor/context variables when a pattern's fit depends on expertise, disability,
  attention, device, domain, or environment

## Pattern-language development lifecycle

Da Rosa and Silveira's systematic mapping is useful because it treats pattern
language work as a lifecycle, not only as authoring. Their framework has three
phases:

1. *Planning*: study the domain, review pattern theory, and search for existing
   pattern collections before writing a new one.
2. *Discovery*: identify patterns, rate confidence, organise relationships,
   validate the language, and publish it.
3. *Post-discovery*: observe usage, derive tools/frameworks/theory from the
   language, and feed findings into the next planning cycle.

They also catalogue the methods HCI researchers actually use to identify
patterns: analysis of existing interactive systems, prototype assessment,
observation of user tasks, ethnography, Grounded Theory, literature review, and
interviews with specialists or users. This matters because HCI pattern mining is
more methodologically diverse than simply spotting repeated UI forms.

The paper sharpens two maturity practices:

- *Confidence rating*: Alexander-style confidence should be visible. Incipient
  patterns, pre-patterns, and inspirational patterns should not be presented with
  the same authority as patterns observed repeatedly in a domain.
- *Validation criteria*: HCI patterns can be evaluated for findability,
  effectiveness, feasibility, reliability, and plausibility. Validation methods
  include design workshops, specialist reviews, field studies, comparisons with
  prior studies, interviews, questionnaires, and prototype construction.

The publishing point is also pragmatic: many HCI pattern collections disappear
after publication, so a pattern language that is not accessible, maintained, and
reviewed never becomes a living design tool.

## Project takeaway

The project's current "generative move" framing is compatible with the HCI
literature, but it should be more demanding about evidence, values, and language
structure.

Use this operational definition:

> A pattern is a named, evidence-seeking interaction move that resolves a
> recurring human situation by balancing forces in a stated context, abstracting
> practice at a reusable level, producing a centre or affordance, carrying
> rationale and consequences, and linking to other moves so a designer can
> continue the sequence.

Use this epistemic rule:

> A new entry can start as a seed, but until it has examples, rationale, and
> relations, it is a candidate pattern rather than a mature one.
