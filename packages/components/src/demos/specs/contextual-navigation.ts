import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import {
  ancestorsOf,
  childrenOf,
  explicitConnections,
  getNode,
  inferredBand,
  nodes,
  RULES,
  type Attribute,
  type ProcessNode,
} from '../focus-and-context/process-model';
import {
  deduceConnections,
  resolveProposals,
  type Proposal,
} from '../../services/model-deduction-service';
import spec from './contextual-navigation.json' with { type: 'json' };

// `/proposed` holds an activated proposal while `/focus` keeps the last
// component, so Back returns there by clearing `/proposed`.

/* Deliberate rather than random: the pasteuriser has enough authored edges to
   open the list and enough inferences to overflow the cap. A leaf would open
   on a degenerate gradient. */
const DEFAULT_FOCUS = 'pasteurizationUnit-001';

const SUBJECT =
  'An orange juice production line: reception, extraction, clarification, ' +
  'concentration, pasteurization, packaging.';

const PROPOSAL_INTERVAL = 700;

type Certainty = 'explicit' | 'inferred' | 'deduced';
type Shown = Record<Certainty, boolean>;

type Rim =
  | { status: 'loading' }
  | { status: 'ready'; proposals: Proposal[]; revealed: number }
  | { status: 'absent' };

const knownNames = new Set(nodes.map((node) => node.name.trim().toLowerCase()));
const knownIds = new Set(nodes.map((node) => node.id));

const proposalId = (proposal: Proposal) =>
  `proposed:${proposal.name.trim().toLowerCase().replace(/\s+/g, '-')}`;

const ruleLabel = (id: string) => RULES.find((rule) => rule.id === id)?.label ?? id;

const badges = (attributes: Attribute[]) =>
  attributes.map((attribute) => ({
    label: attribute.label,
    text: `${attribute.value}${attribute.unit ?? ''}`,
  }));

const crumb = (node: ProcessNode) => ({ id: node.id, label: node.name });

const derive = ({ focus, proposed, shown, rim }: Record<string, unknown>) => {
  const proposal = proposed as Proposal | null;
  const from = getNode(String(focus))!;
  const anchor = proposal ? (getNode(proposal.anchorId) ?? from) : from;
  const band = inferredBand(anchor.id);
  const levels = shown as Shown;
  const state = rim as Rim;

  const rows = [
    ...(levels.explicit && !proposal
      ? explicitConnections(anchor.id).map((connection) => ({
          key: connection.id,
          emphasis: 'full',
          eyebrow: connection.relationship,
          name: connection.name,
          body: connection.description,
          attributes: badges(getNode(connection.id)?.attributes.slice(0, 4) ?? []),
          target: connection.id,
          proposal: null,
        }))
      : []),
    ...(levels.inferred && !proposal
      ? band.shown.map((connection) => ({
          key: connection.id,
          emphasis: 'reduced',
          eyebrow: ruleLabel(connection.ruleId),
          name: connection.name,
          body: connection.basis,
          attributes: [],
          target: connection.id,
          proposal: null,
        }))
      : []),
    ...(levels.deduced && state.status === 'ready'
      ? state.proposals.slice(0, state.revealed).map((each) => ({
          key: proposalId(each),
          emphasis: 'faint',
          eyebrow: 'Proposed, not modelled',
          name: each.name,
          body: each.rationale,
          attributes: [],
          target: from.id,
          proposal: each,
        }))
      : []),
  ];

  const notes: string[] = [];
  const overflow = band.overflow;
  if (proposal) {
    notes.push(
      'No authored connections, and no rule to run: both need a component the model contains.',
    );
  } else if (levels.inferred && overflow > 0) {
    notes.push(`${overflow} more inferred, held back by the cap.`);
  }
  if (levels.deduced && state.status === 'absent') {
    notes.push(
      'Deducing components the model does not contain needs the language model, and it is not answering.',
    );
  }

  const structure = proposal ? [] : childrenOf(anchor.id);
  const attributes = proposal ? [] : badges(anchor.attributes);
  const rules = proposal ? [] : anchor.rulesAndConstraints;

  return {
    trail: (proposal ? [...ancestorsOf(anchor.id), anchor] : ancestorsOf(anchor.id)).map(crumb),
    current: proposal ? proposal.name : anchor.name,
    note: proposal ? `proposed under ${anchor.name}` : null,
    backLabel: `Back to ${from.name}`,
    title: proposal ? proposal.name : anchor.name,
    icon: proposal ? 'generated' : 'part',
    emphasis: proposal ? 'reduced' : 'full',
    description: proposal ? proposal.rationale : anchor.description,
    conjecture: proposal
      ? `Not in the model. Proposed under the ${anchor.name}, so everything below is conjecture.`
      : null,
    attributes,
    attributeCount: String(attributes.length),
    structure: structure.map((child) => ({
      id: child.id,
      name: child.name,
      type: child.type,
      description: child.description,
    })),
    structureCount: String(structure.length),
    rules,
    ruleCount: String(rules.length),
    rows,
    loading: levels.deduced && state.status === 'loading',
    notes,
  };
};

const deductionRequest = (anchor: ProcessNode, proposal: Proposal | null) => ({
  focus: proposal
    ? {
        id: anchor.id,
        name: proposal.name,
        type: 'Proposed component',
        description: proposal.rationale,
        attributes: [],
      }
    : {
        id: anchor.id,
        name: anchor.name,
        type: anchor.type,
        description: anchor.description,
        attributes: anchor.attributes.map((attribute) => ({
          name: attribute.label,
          value: `${attribute.value}${attribute.unit ?? ''}`,
        })),
      },
  /* Past the boundary the neighbourhood is the anchor's, because that is all
     the model has to reason from. */
  neighbourhood: explicitConnections(anchor.id)
    .map((connection) => ({
      id: connection.id,
      name: connection.name,
      relation: connection.relationship,
    }))
    .concat(
      childrenOf(anchor.id).map((child) => ({
        id: child.id,
        name: child.name,
        relation: 'Part of',
      })),
    ),
  subject: SUBJECT,
});

const deduce: ActionDefinition = {
  params: z.object({ statePath: z.string(), focus: z.string(), proposal: z.unknown().nullable() }),
  description:
    'Ask a model which components that the model does not contain likely belong near `focus`, the id of a modelled component, or near `proposal`, a component it proposed earlier ({ name, rationale, anchorId }), which is then the subject. Writes { status: loading } to `statePath` at once, then { status: ready, proposals, revealed } when the answer comes, raising `revealed` by one every moment until every proposal shows, or { status: absent } when the model does not answer. A later dispatch replaces an earlier one, whose answer is dropped.',
};

// Proposals arrive one at a time: a tier that fills all at once reads as settled.
const deduceHandler = (store: StateStore, connected: () => boolean) => {
  let controller: AbortController | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let asked: string | undefined;
  let queued: ReturnType<typeof setTimeout> | undefined;

  // A watch does not fire for the state a demo opens with, so the first
  // request goes from here. Its answer can come before the demo watches
  // `/rim`, so until it has revealed every proposal it lays the view out itself.
  let opening = true;
  const write = (path: string, rim: Rim, last = false) => {
    store.set(path, rim);
    if (opening) store.set('/view', derive({ ...store.getSnapshot(), rim }));
    if (last) opening = false;
  };

  const ask = ({ statePath, focus, proposal }: Record<string, unknown>) => {
    const path = String(statePath);
    const proposed = proposal as Proposal | null;
    const anchor = (proposed && getNode(proposed.anchorId)) || getNode(String(focus))!;
    // Refocusing from a proposal through the trail changes both `/focus` and
    // `/proposed`, and each change dispatches. The question is the same, so
    // the second dispatch does not ask it again.
    const question = `${anchor.id}|${proposed?.name ?? ''}`;
    if (question === asked) return;
    asked = question;

    controller?.abort();
    clearInterval(timer);
    const current = new AbortController();
    controller = current;
    store.set(path, { status: 'loading' });

    deduceConnections(deductionRequest(anchor, proposed), { signal: current.signal })
      .then((deduction) => {
        if (current.signal.aborted || !connected()) return;
        const proposals = resolveProposals(deduction, { ids: knownIds, names: knownNames });
        let revealed = 0;
        write(path, { status: 'ready', proposals, revealed }, proposals.length === 0);
        if (proposals.length === 0) return;
        timer = setInterval(() => {
          if (current.signal.aborted || !connected()) return clearInterval(timer);
          revealed += 1;
          const done = revealed >= proposals.length;
          if (done) clearInterval(timer);
          write(path, { status: 'ready', proposals, revealed }, done);
        }, PROPOSAL_INTERVAL);
      })
      .catch(() => {
        if (!current.signal.aborted && connected()) write(path, { status: 'absent' }, true);
      });
  };

  ask({ statePath: '/rim', focus: DEFAULT_FOCUS, proposal: null });
  return {
    // A press that changes `/focus` and `/proposed` in turn dispatches once
    // for each; the request waits for both, so it asks about where the
    // actor ended up rather than a state in between.
    deduce: (params: Record<string, unknown>) => {
      opening = false;
      clearTimeout(queued);
      queued = setTimeout(() => {
        if (connected()) ask(params);
      });
    },
  };
};

const start = {
  focus: DEFAULT_FOCUS,
  proposed: null,
  shown: { explicit: true, inferred: true, deduced: true },
  rim: { status: 'loading' },
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: { ...start, picked: null, view: derive(start) },
    actions: { deduce },
    handlers: deduceHandler,
    functions: {
      derive,
    },
  } satisfies SpecSetup,
};
