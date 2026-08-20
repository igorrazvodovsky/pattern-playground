Meng, Namazov, Schare, Cunha & Jackson, *Making Software Meaningful*.
arXiv:2606.11051v1 [cs.SE], 9 June 2026.

# The claim

Software problems arise because there is no meaning shared between everyone
involved — users, designers, engineers. The remedy is to construct and agree
on a representation of the software's behaviour *as observed in the domain of
application*, and then apply that vocabulary consistently across every
artifact and activity: interface, code, event log, bug report, user story.

The paper's worked example is Facebook's "reactions". Users read clicking the
angry button as an act of expression; the system for years counted it as
strong engagement, weighted five times a like. From the screen alone the
discrepancy was undetectable. The act the user performed and the act the
system recorded were not the same act.

# An ontology of phenomena (§4.1)

Four kinds, and no others:

- *Individuals* — things with an identity that persists. They can begin and
  end at particular moments, or last as long as the system does.
- *Values* — things you read off their own structure, or by holding them next
  to another value. The paper's examples: money amounts, phone numbers, email
  addresses, domain names, message bodies.
- *Actions* — single happenings that mean something in the domain. Each takes
  named participants, split into inputs and outputs; there may be several
  outputs, or none.
- *Facts* — what is currently asserted: something about one individual, or a
  relation tying two individuals together, or tying an individual to a value.

The distinction between individual and value is what the rest of the ontology
rests on. An individual, unlike a value, cannot be *interpreted* and has no
structure: identities are matched by identity alone, never compared or
decomposed. Individuals are therefore *not composite* and do not "contain"
attributes — they are associated with values and with other individuals
through facts. The paper is explicit that this relational view is what
escapes the conflation object orientation produces, where a single object
accretes the state of several separate concerns.

# Defining a system's meaning (§4.2)

You do not enumerate individuals, actions and facts. You specify a collection
of rules that generate the possibilities:

- types of individuals (`User`);
- a signature per action type
  (`login (username: String, password: String): (user: User)`);
- the type of each fact (`registered (User)`, `username (User, String)`);
- and, per action type, a rule saying which facts it *requires* and which it
  *ensures*.

All possible behaviours follow inductively from these rules. Initial
conditions are not generally needed, because no individuals exist at the
start and all facts are therefore false.

# Origins (§4.3)

Three threads converge. From formal specification languages (Alloy, B, VDM,
TLA, Z) comes defining behaviour as pre- and post-conditions over states.
From early object orientation comes the persistent individual. From
entity-relationship modelling comes representing state as a collection of
relations associating individuals with each other and mapping individuals to
values — so relationship types become relations, and `username(User, String)`
is a relation named `username` from `User` to `String`.

# Concepts (§4.4)

Because a small system can involve a dozen types of individual and a hundred
actions, the paper partitions *actions* into concepts, each a functional
concern with its associated facts. Individuals are not partitioned: the same
type of individual participates in many concepts. A user has a name and
password in `Authenticating` and a display name in `UserDisplaying`.

# Synchronizations (§4.5)

Coordination between concepts is not a call from one action to another —
that would couple the concepts. It is a declarative rule sitting outside
them:

```
when:  Commenting.newComment (post, text): (comment)
where: Posting.author (post, author)
then:  Notifying.notify (user: author, item: comment)
```

A synchronization creates causal links between actions, binding the arguments
of invoked actions to the results of earlier ones.

# Why it matters (§3, §5.1)

Meaning is a prerequisite for usability, modularity and accountability rather
than an end in itself. The parts most relevant to interaction design:

- *Folk theories.* When software fails to make its meaning clear, users build
  their own account of what it is doing — one that fits the available
  evidence well enough to predict what to do next. These often work until
  they don't, and the failure is hard to report: the user knows something has
  gone wrong but lacks the words to say what.
- *Dark concepts.* Calling angry-as-amplification a "dark pattern" leaves the
  misalignment vague. Naming it — the implementation of one concept
  (engagement weighting) under the guise of another (sentiment expression) —
  locates the offence at the level of meaning, and makes it open to analysis
  and to regulation.
- *Enshittification as reinterpretation.* Platforms degrade not by layering
  on new dark patterns but by gradually substituting one concept for another
  behind an unchanged interface. `Searching` once retrieved the items most
  relevant to the query; later it retrieves the ones the seller paid to
  surface. The user's action does not change; the concept behind it does. A
  vocabulary in which both readings have names is what allows the
  substitution to be noticed.
- *A shared language.* Users describe what they experience; designers
  describe interfaces and data models. An explicit conceptual model gives the
  user an artifact they can read, push back on, and propose changes to in the
  same terms the designers use — so disagreements can be pinned to the model
  rather than absorbed silently.

# Cautions

The ontology is a modelling commitment, not a neutral description. Two the
paper acknowledges: naming a concept does not resolve a disagreement about
whether it is the right one, and explicit meaning does not make software
"just in everyone's eyes" — it supplies the vocabulary in which technical and
social claims can be made against each other at all.
