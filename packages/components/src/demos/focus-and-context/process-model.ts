import juiceProductionData from '@shared/data/JuiceProduction.json' with { type: 'json' };

/**
 * The industrial process model the certainty fisheye reads, and the six rules
 * that compute its middle tier of connections.
 *
 * There is one store, not two. The "knowledge base" the pattern page invokes is
 * this same file read a second way: the explicit tier is what the model
 * authors, the inferred tier is what falls out of it under a fixed rule set.
 * Nothing here is an authored inference — every rule stands on raw material
 * (a rule sentence, an edge, a membership, an attribute value) that was put in
 * the fixture for its own sake, because an authored `inferredConnections` array
 * would leave three fidelities on screen but only two certainties behind them.
 */

export interface Attribute {
  name: string;
  label: string;
  value: string;
  unit: string | null;
}

export interface AuthoredEdge {
  referenceId: string;
  relationshipType: string;
  relationshipDescription: string;
}

export interface ProcessNode {
  id: string;
  type: string;
  name: string;
  label: string;
  description: string;
  parentId: string | null;
  childrenIds: string[];
  attributes: Attribute[];
  rulesAndConstraints: string[];
  relatedObjects: AuthoredEdge[];
  /** Ids of the service nodes this component is under. */
  services: string[];
}

export interface Configuration {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
}

const raw = juiceProductionData as {
  flattenedModel: Partial<ProcessNode>[];
  configurations: Configuration[];
};

export const nodes: ProcessNode[] = raw.flattenedModel.map((node) => ({
  id: node.id!,
  type: node.type ?? 'Component',
  name: node.name!,
  label: node.label ?? node.name!,
  description: node.description ?? '',
  parentId: node.parentId ?? null,
  childrenIds: node.childrenIds ?? [],
  attributes: node.attributes ?? [],
  rulesAndConstraints: node.rulesAndConstraints ?? [],
  relatedObjects: node.relatedObjects ?? [],
  services: node.services ?? [],
}));

export const configurations: Configuration[] = raw.configurations ?? [];

const byId = new Map(nodes.map((node) => [node.id, node]));

export const getNode = (id: string): ProcessNode | undefined => byId.get(id);

/** The containment axis, upward: the constant frame's other half. */
export function ancestorsOf(id: string): ProcessNode[] {
  const chain: ProcessNode[] = [];
  let node = byId.get(id)?.parentId ?? null;
  while (node) {
    const parent = byId.get(node);
    if (!parent) break;
    chain.unshift(parent);
    node = parent.parentId;
  }
  return chain;
}

/** The containment axis, downward. Dangling child ids are simply not there. */
export function childrenOf(id: string): ProcessNode[] {
  return (byId.get(id)?.childrenIds ?? [])
    .map((childId) => byId.get(childId))
    .filter((child): child is ProcessNode => child !== undefined);
}

/* Containment is the constant frame, so a rule that would report a parent, a
   child or a sibling variant as a discovery has told the reader what the
   breadcrumb and the structure table already say.
   Only two rules need this, and deliberately so: co-membership and a shared
   attribute value are trivially true inside a branch, which is the whole
   complaint the plan makes about parent/variant co-values. The other four
   stand on something a person wrote — a rule sentence, an edge, a service
   membership, a flow through an intermediate — and those stay worth reporting
   between a parent and its child. */
function inSameBranch(a: string, b: string): boolean {
  if (a === b) return true;
  const up = (id: string) => [id, ...ancestorsOf(id).map((node) => node.id)];
  if (up(a).includes(b) || up(b).includes(a)) return true;
  const parentA = byId.get(a)?.parentId;
  return parentA != null && parentA === byId.get(b)?.parentId;
}

// ---------------------------------------------------------------------------
// The connection tiers

export interface Connection {
  id: string;
  name: string;
  /** How the model, or the rule, names the tie. */
  relationship: string;
  description: string;
}

export interface InferredConnection extends Connection {
  ruleId: RuleId;
  /** What the inference stands on, said in one line. */
  basis: string;
}

/** Connections the model authors: solid ground, and the nearest tier. */
export function explicitConnections(focusId: string): Connection[] {
  const focus = byId.get(focusId);
  if (!focus) return [];

  return focus.relatedObjects
    .map((edge) => {
      const target = byId.get(edge.referenceId);
      if (!target) return null;
      return {
        id: target.id,
        name: target.name,
        relationship: edge.relationshipType,
        description: edge.relationshipDescription || target.description,
      };
    })
    .filter((connection): connection is Connection => connection !== null);
}

export type RuleId =
  | 'rule-text'
  | 'reverse-edge'
  | 'shared-service'
  | 'configuration'
  | 'two-hop'
  | 'shared-attribute';

interface Rule {
  id: RuleId;
  /** Shown on the card the rule produced, as that card's explanation. */
  label: string;
  run: (focus: ProcessNode) => Omit<InferredConnection, 'ruleId'>[];
}

const quote = (sentence: string) => `“${sentence}”`;

/* Ids appear inside rule prose as bare words or in parentheses, so a word
   boundary either side is the whole match. */
const mentions = (sentence: string, id: string) =>
  new RegExp(`\\b${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(sentence);

const processFlowNeighbours = (id: string): string[] => {
  const neighbours = new Set<string>();
  byId.get(id)?.relatedObjects.forEach((edge) => {
    if (edge.relationshipType === 'Process Flow' && byId.has(edge.referenceId)) {
      neighbours.add(edge.referenceId);
    }
  });
  nodes.forEach((node) => {
    node.relatedObjects.forEach((edge) => {
      if (edge.relationshipType === 'Process Flow' && edge.referenceId === id) {
        neighbours.add(node.id);
      }
    });
  });
  neighbours.delete(id);
  return [...neighbours];
};

/**
 * The rule set, in falling order of what each rule stands on — which is also
 * the order the tier renders in, so the inferred run of the list has its own
 * internal gradient and the pattern's argument is made twice. The order is
 * fixed: the vocabulary is meant to be learnable from repeated exposure.
 */
export const RULES: Rule[] = [
  {
    id: 'rule-text',
    label: 'Named in another component’s rules',
    run: (focus) =>
      nodes.flatMap((node) => {
        if (node.id === focus.id) return [];
        const sentence = node.rulesAndConstraints.find((rule) => mentions(rule, focus.id));
        if (!sentence) return [];
        return [
          {
            id: node.id,
            name: node.name,
            relationship: 'Named in a rule',
            description: node.description,
            basis: `The ${node.name}’s rule: ${quote(sentence)}`,
          },
        ];
      }),
  },
  {
    id: 'reverse-edge',
    label: 'Points here, unreciprocated',
    run: (focus) =>
      nodes.flatMap((node) => {
        if (node.id === focus.id) return [];
        const edge = node.relatedObjects.find((candidate) => candidate.referenceId === focus.id);
        if (!edge) return [];
        return [
          {
            id: node.id,
            name: node.name,
            relationship: edge.relationshipType,
            description: node.description,
            basis: `Its ${edge.relationshipType.toLowerCase()} edge: ${quote(edge.relationshipDescription)}`,
          },
        ];
      }),
  },
  {
    id: 'shared-service',
    label: 'Under the same service',
    run: (focus) =>
      focus.services.flatMap((serviceId) => {
        const service = byId.get(serviceId);
        return nodes
          .filter((node) => node.id !== focus.id && node.services.includes(serviceId))
          .map((node) => ({
            id: node.id,
            name: node.name,
            relationship: 'Shares a service',
            description: node.description,
            basis: `Both under the ${service?.name ?? serviceId}`,
          }));
      }),
  },
  {
    id: 'configuration',
    label: 'Same line configurations',
    run: (focus) => {
      const focusIn = configurations.filter((config) => config.memberIds.includes(focus.id));
      /* Something the line always builds is co-built with everything else the
         line always builds, which tells the reader nothing. The rule only has
         an inference to make where membership discriminates. */
      if (focusIn.length === 0 || focusIn.length === configurations.length) return [];
      const key = focusIn.map((config) => config.id).join('|');

      /* Membership is the fact; co-membership is the inference. A component
         that runs in exactly the configurations the focus runs in is never
         built without it, which no edge in the model says. */
      const where = `in ${focusIn.map((config) => `the ${config.name} line`).join(' and ')}, and nowhere else`;

      return nodes
        .filter((node) => {
          if (node.id === focus.id || inSameBranch(node.id, focus.id)) return false;
          const memberOf = configurations.filter((config) => config.memberIds.includes(node.id));
          return memberOf.map((config) => config.id).join('|') === key;
        })
        .map((node) => ({
          id: node.id,
          name: node.name,
          relationship: 'Runs alongside',
          description: node.description,
          basis: `Runs ${where} — exactly where the ${focus.name} runs`,
        }));
    },
  },
  {
    id: 'two-hop',
    label: 'Two steps along the process flow',
    run: (focus) => {
      const direct = new Set(processFlowNeighbours(focus.id));
      const found = new Map<string, string>();
      direct.forEach((viaId) => {
        processFlowNeighbours(viaId).forEach((candidateId) => {
          if (candidateId === focus.id || direct.has(candidateId)) return;
          if (!found.has(candidateId)) found.set(candidateId, viaId);
        });
      });
      return [...found].map(([id, viaId]) => ({
        id,
        name: byId.get(id)!.name,
        relationship: 'Two steps upstream or down',
        description: byId.get(id)!.description,
        basis: `Reached through the ${byId.get(viaId)!.name}`,
      }));
    },
  },
  {
    id: 'shared-attribute',
    label: 'Same value for the same attribute',
    run: (focus) =>
      nodes.flatMap((node) => {
        if (node.id === focus.id || inSameBranch(node.id, focus.id)) return [];
        const match = focus.attributes.find((attribute) =>
          node.attributes.some(
            (other) => other.name === attribute.name && other.value === attribute.value
          )
        );
        if (!match) return [];
        const value = `${match.value}${match.unit ?? ''}`;
        return [
          {
            id: node.id,
            name: node.name,
            relationship: 'Shares a value',
            description: node.description,
            basis: `Same ${match.label.toLowerCase()} — ${value}`,
          },
        ];
      }),
  },
];

/** How many items the tier shows before it says how many it is holding back. */
export const INFERRED_CAP = 5;

export interface InferredBand {
  /** Up to `INFERRED_CAP` connections, in rule order. */
  shown: InferredConnection[];
  /** What the cap is holding back, so a truncation is never silent. */
  overflow: number;
}

/**
 * The middle tier, computed. Fire-only and in fixed order: a rule that returns
 * nothing contributes nothing, because a card announcing that a rule found no
 * connections is a card about the machinery rather than about the model.
 */
export function inferredBand(focusId: string): InferredBand {
  const focus = byId.get(focusId);
  if (!focus) return { shown: [], overflow: 0 };

  const claimed = new Set([focus.id, ...explicitConnections(focus.id).map((edge) => edge.id)]);
  const all: InferredConnection[] = [];
  RULES.forEach((rule) => {
    const fresh = rule
      .run(focus)
      .filter((connection) => !claimed.has(connection.id))
      .map((connection) => ({ ...connection, ruleId: rule.id }));
    /* Deduped against everything already claimed, so a component reached by
       two rules is reported by the one that stands on more. */
    fresh.forEach((connection) => claimed.add(connection.id));
    all.push(...fresh);
  });

  return {
    shown: all.slice(0, INFERRED_CAP),
    overflow: Math.max(0, all.length - INFERRED_CAP),
  };
}
