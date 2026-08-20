// Types for the world's action log (shared/world/actions.json). The four
// phenomena these describe — individuals, values, actions, facts — are
// specified in docs/specs/world-ontology.md; the relation and action-type
// registries sit beside the log and are enforced by scripts/world/replay.ts.

export type ParticipantValue = string | number | boolean;

// A structured object — a document body, a selection range — is a value like
// any other, interpreted by its shape and stored inline where it occurs.
export type FactObject = ParticipantValue | object;

export interface Fact {
  /** Relation name, e.g. "assignee" for assignee(task-1, user-3). */
  relation: string;
  subject: string;
  /** Related individual id, or a value; omitted for unary facts. */
  object?: FactObject;
}

/** A declarative reaction in shared/world/rules.json, in the paper's when/where/then form. */
export interface Rule {
  id: string;
  /** The action type the rule watches, with its participants. */
  when: string;
  /** The facts that must hold for it to fire; absent when it fires on every match. */
  where?: string;
  /** The action that follows. */
  then: string;
  description: string;
}

export interface ActionRecord {
  id: string;
  /** Action type, a plain verb phrase: "createTask", "addComment", "notify". */
  name: string;
  /** Individual who performed the action, or "system" for rule-driven ones. */
  actor: string;
  timestamp: string;
  /** Named input participants: individual ids and values. */
  input: Record<string, ParticipantValue>;
  /** Named output participants, e.g. the id of an individual the action created. */
  output?: Record<string, ParticipantValue>;
  adds?: Fact[];
  removes?: Fact[];
  /** Ids of the earlier action(s) that triggered this one — a rule may match several. */
  causedBy?: string[];
  /** Id of the rule (shared/world/rules.json) that licensed this action. */
  viaRule?: string;
}
