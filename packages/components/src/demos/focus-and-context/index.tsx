import { useEffect, useMemo, useRef, useState } from 'react';
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
} from './process-model';
import {
  deduceConnections,
  resolveProposals,
  type Proposal,
} from '../../services/model-deduction-service';
import '../../jsx-types';

export { FisheyeTimelineDemo } from './fisheye';

/**
 * The certainty fisheye: Furnas's machinery with the distance metric pivoted.
 * Distance from the focused component is not position or steps through the
 * tree, it is how sure the system is that the connection is there — and, as in
 * any fisheye, distance buys abstraction and nothing else.
 *
 * The connections are one list, not three. What falls with distance is how much
 * each card says and how solid it looks: an authored edge is a card with a
 * border, a description and the target's readings; a rule's inference is a
 * borderless card carrying the rule that found it and what that rule stands on;
 * a language model's proposal is quieter again, a name marked provisional
 * because it may not name anything that exists. Certainty is read off the card,
 * not off a confidence score.
 *
 * Two axes, and only one of them is graded. The containment axis — the
 * breadcrumb above, the structure table inside the focus card — is modelled by
 * definition, so it is the constant frame: the place bearings come from,
 * unaffected by anything the reader does to the reach. The gradient runs over
 * the connection axis alone.
 *
 * Each level is its own switch. The tiers nest in meaning — keeping the model's
 * guesses while dropping what it states is not a view anyone wants — but a
 * toggle per level is a plainer thing to hold than a cumulative reach, so the
 * control is three checkboxes and any combination is allowed. Each names its
 * tier and carries its count.
 *
 * Activating a connection refocuses, and the gradient re-runs from it.
 * Activating a proposal walks the lens past the model's boundary onto a centre
 * that is itself provisional, whose authored connections are empty by
 * construction; Escape brings it back to the last component that exists.
 */

/* Deliberate rather than random: the pattern's claim is that the three tiers
   read at three fidelities at rest, and the pasteuriser is the component that
   shows it — enough authored edges to open the list, enough inferences to
   overflow the cap. A leaf would open on a degenerate gradient. */
const DEFAULT_FOCUS = 'pasteurizationUnit-001';

const SUBJECT =
  'An orange juice production line: reception, extraction, clarification, ' +
  'concentration, pasteurization, packaging.';

/** How long the rim takes to fill, one proposal at a time. */
const PROPOSAL_INTERVAL = 700;

type Focus =
  | { kind: 'modelled'; id: string }
  | { kind: 'proposed'; proposal: Proposal };

const proposalId = (proposal: Proposal) =>
  `proposed:${proposal.name.trim().toLowerCase().replace(/\s+/g, '-')}`;

const ruleLabel = (id: string) => RULES.find((rule) => rule.id === id)?.label ?? id;

// ---------------------------------------------------------------------------
// The constant frame

/**
 * The containment axis, upward. Every crumb is a real component and refocuses
 * the lens; past the model's boundary the chain still ends on the modelled
 * anchor, and only the last crumb is provisional.
 */
function Breadcrumb({
  trail,
  current,
  proposed,
  onRefocus,
}: {
  trail: ProcessNode[];
  current: string;
  proposed?: string;
  onRefocus: (id: string) => void;
}) {
  return (
    <pp-breadcrumbs role="navigation">
      <a href="#" onClick={(event) => event.preventDefault()}>
        <span className="crumbicon">
          <iconify-icon icon="ph:house"></iconify-icon>
        </span>
        <span className="visually-hidden">Home</span>
      </a>

      {trail.map((node) => (
        <span className="crumb" key={node.id}>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onRefocus(node.id);
            }}
          >
            {node.name}
          </a>
        </span>
      ))}

      <span className="crumb" data-proposed={proposed ? '' : undefined}>
        <a href="#" aria-current="page" onClick={(event) => event.preventDefault()}>
          {current}
        </a>
        {proposed && <small className="muted">proposed under {proposed}</small>}
      </span>
    </pp-breadcrumbs>
  );
}

/**
 * The containment axis, downward. Part of the frame rather than of the
 * gradient: what a thing is made of is not a connection anyone had to guess at.
 */
function Structure({
  children,
  onRefocus,
}: {
  children: ProcessNode[];
  onRefocus: (id: string) => void;
}) {
  if (children.length === 0) return null;

  return (
    <details open>
      <summary>
        Structure <span className="badge">{children.length}</span>
      </summary>
      <pp-table>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {children.map((child) => (
              <tr key={child.id}>
                <td>
                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      onRefocus(child.id);
                    }}
                  >
                    {child.name}
                  </a>
                </td>
                <td>{child.type}</td>
                <td className="pp-table-ellipsis">{child.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </pp-table>
    </details>
  );
}

// ---------------------------------------------------------------------------
// The centre

/** The focus, in full working detail. */
function FocusCard({
  node,
  onRefocus,
}: {
  node: ProcessNode;
  onRefocus: (id: string) => void;
}) {
  return (
    <article className="card flow pad">
      {/* No header wrapper: the title carries no actions, so it is a plain card
          heading in the padded body — the canonical no-actions branch, the same
          shape ProductCard and ProductDetail use. A `.card__header` here would
          pad the title on a different inset from the body and split the one edge
          the card reads down. */}
      <h3 className="label flex">
        <iconify-icon icon="ph:cube-bold" aria-hidden="true"></iconify-icon>
        {node.name}
      </h3>
      <p className="description">{node.description}</p>

      {node.attributes.length > 0 && (
        <details open>
          <summary>
            Attributes <span className="badge">{node.attributes.length}</span>
          </summary>
          <ul className="card__attributes badges">
            {node.attributes.map((attribute) => (
              <span className="badge" key={attribute.name}>
                <span>{attribute.label}</span>
                {attribute.value}
                {attribute.unit ?? ''}
              </span>
            ))}
          </ul>
        </details>
      )}

      <Structure children={childrenOf(node.id)} onRefocus={onRefocus} />

      {node.rulesAndConstraints.length > 0 && (
        <details open>
          <summary>
            Rules &amp; constraints <span className="badge">{node.rulesAndConstraints.length}</span>
          </summary>
          <ul className="card__attributes">
            {node.rulesAndConstraints.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

/**
 * The centre, past the boundary. A component that may not exist gets no
 * attributes, no structure and no rules, because there are none to have — the
 * state narrates itself rather than being announced.
 */
function ProposedCard({ proposal, anchor }: { proposal: Proposal; anchor: ProcessNode }) {
  return (
    <article className="card dashed flow pad">
      <h3 className="label flex">
        <iconify-icon icon="ph:cube-transparent" aria-hidden="true"></iconify-icon>
        {proposal.name}
      </h3>
      <p className="description">{proposal.rationale}</p>
      <p className="muted">
        <small>
          Not in the model. Proposed under the {anchor.name}, so everything below is conjecture.
        </small>
      </p>
    </article>
  );
}

// ---------------------------------------------------------------------------
// The connections, as one list

type Certainty = 'explicit' | 'inferred' | 'deduced';

/**
 * One row of the gradient. Every tier fills the same slots; what changes is how
 * many of them it can fill, which is the fisheye's falloff carried by content
 * rather than by size.
 */
interface Row {
  key: string;
  certainty: Certainty;
  /**
   * What kind of tie this is: the relationship the model authored, the rule
   * that found it, or the fact that nothing found it at all. On an inferred row
   * this is where the rule is named — on the card it produced, rather than in a
   * list of rules off to one side.
   */
  eyebrow: string;
  name: string;
  /** What the row says: the model's words, the rule's basis, or the hedge. */
  body: string;
  /** Explicit only: the readings the model already holds for the target. */
  attributes?: Attribute[];
  activate: () => void;
}

function ConnectionCard({ row }: { row: Row }) {
  return (
    <li>
      <article className="card flow pad" data-certainty={row.certainty}>
        <div className="attribute">{row.eyebrow}</div>
        <h4 className="label">
          <button type="button" className="stretched-link" onClick={row.activate}>
            {row.name}
          </button>
        </h4>
        <small className="description">{row.body}</small>
        {row.attributes && row.attributes.length > 0 && (
          <ul className="card__attributes badges">
            {row.attributes.slice(0, 4).map((attribute) => (
              <span className="badge" key={attribute.name}>
                <span>{attribute.label}</span>
                {attribute.value}
                {attribute.unit ?? ''}
              </span>
            ))}
          </ul>
        )}
      </article>
    </li>
  );
}

/** Which certainty levels are on. Each is its own switch. */
type Shown = Record<Certainty, boolean>;

/* The three levels, in the order they read down the list — most certain first,
   which is also the order the connections render in. */
const TIERS = [
  { certainty: 'explicit', label: 'Explicit' },
  { certainty: 'inferred', label: 'Inferred' },
  { certainty: 'deduced', label: 'Deduced' },
] as const;

/**
 * The levels, as three independent switches rather than one reach. Each names a
 * tier and carries its count, and any combination is allowed: keeping the
 * model's guesses while dropping what it states is not a sensible view, but a
 * switch per level is a simpler thing to hold than a cumulative scale, and the
 * demo would rather be plain than clever about which combinations mean
 * something.
 */
function LevelControl({
  shown,
  setShown,
}: {
  shown: Shown;
  setShown: (shown: Shown) => void;
}) {
  /* The listener goes on the list, not the dropdown: `pp-select` is the list's
     event, and the dropdown only re-emits it for the lists it owns. Same idiom
     the selection demos use. */
  const list = useRef<HTMLElement>(null);

  useEffect(() => {
    const host = list.current;
    if (!host) return;
    const handler = (event: Event) => {
      /* The list has already flipped the item's `checked` by the time the
         event lands; read it back rather than deriving it. `data-certainty`,
         not `value`: React sets a custom element's declared properties, not its
         attributes, so a reflected `value` never becomes one. */
      const item = (event as CustomEvent<{ item: HTMLElement & { checked: boolean } }>).detail
        .item;
      const certainty = item.dataset.certainty as Certainty | undefined;
      if (certainty) setShown({ ...shown, [certainty]: item.checked });
    };
    host.addEventListener('pp-select', handler);
    return () => host.removeEventListener('pp-select', handler);
  }, [shown, setShown]);

  return (
    <pp-dropdown stay-open-on-select>
      <button className="button button--plain" is="pp-button" slot="trigger">
        <iconify-icon className="icon" icon="ph:gear" aria-hidden="true"></iconify-icon>
        <span className="visually-hidden">Levels</span>
      </button>
      <pp-list ref={list}>
        <pp-list-label>Certainty levels</pp-list-label>
        {TIERS.map((tier) => (
          <pp-list-item
            key={tier.certainty}
            type="checkbox"
            data-certainty={tier.certainty}
            checked={shown[tier.certainty]}
          >
            {tier.label}
          </pp-list-item>
        ))}
      </pp-list>
    </pp-dropdown>
  );
}

// ---------------------------------------------------------------------------

const knownNames = new Set(nodes.map((node) => node.name.trim().toLowerCase()));
const knownIds = new Set(nodes.map((node) => node.id));

type RimState =
  | { status: 'loading' }
  | { status: 'ready'; proposals: Proposal[] }
  | { status: 'absent' };

export function ContextualNavigationDemo() {
  const [focus, setFocus] = useState<Focus>({ kind: 'modelled', id: DEFAULT_FOCUS });
  const [shown, setShown] = useState<Shown>({ explicit: true, inferred: true, deduced: true });
  const [rim, setRim] = useState<RimState>({ status: 'loading' });
  const [revealed, setRevealed] = useState(0);

  /* Escape returns the lens to the last component that actually exists, the
     way the timeline's Escape returns it to the root. */
  const lastModelled = useRef(DEFAULT_FOCUS);
  if (focus.kind === 'modelled') lastModelled.current = focus.id;

  const anchor = getNode(focus.kind === 'modelled' ? focus.id : focus.proposal.anchorId)!;

  const explicit = useMemo(
    () => (focus.kind === 'modelled' ? explicitConnections(focus.id) : []),
    [focus]
  );
  const inferred = useMemo(
    () => (focus.kind === 'modelled' ? inferredBand(focus.id) : { shown: [], overflow: 0 }),
    [focus]
  );

  const focusKey = focus.kind === 'modelled' ? focus.id : proposalId(focus.proposal);

  useEffect(() => {
    const controller = new AbortController();
    setRim({ status: 'loading' });
    setRevealed(0);

    /* Past the boundary the neighbourhood is the anchor's, because that is all
       the model has to reason from. */
    const neighbourhood = explicitConnections(anchor.id)
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
        }))
      );

    deduceConnections(
      {
        focus:
          focus.kind === 'modelled'
            ? {
                id: anchor.id,
                name: anchor.name,
                type: anchor.type,
                description: anchor.description,
                attributes: anchor.attributes.map((attribute) => ({
                  name: attribute.label,
                  value: `${attribute.value}${attribute.unit ?? ''}`,
                })),
              }
            : {
                id: anchor.id,
                name: focus.proposal.name,
                type: 'Proposed component',
                description: focus.proposal.rationale,
                attributes: [],
              },
        neighbourhood,
        subject: SUBJECT,
      },
      { signal: controller.signal }
    )
      .then((deduction) => {
        if (controller.signal.aborted) return;
        setRim({
          status: 'ready',
          proposals: resolveProposals(deduction, { ids: knownIds, names: knownNames }),
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setRim({ status: 'absent' });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  /* Proposals arrive at the rim one at a time rather than as a block: the rim
     is where the system is least sure, and a tier that fills all at once reads
     as settled. */
  useEffect(() => {
    if (rim.status !== 'ready' || revealed >= rim.proposals.length) return;
    const timer = setTimeout(() => setRevealed((count) => count + 1), PROPOSAL_INTERVAL);
    return () => clearTimeout(timer);
  }, [rim, revealed]);

  /* Refocusing rebuilds the list, so the control that was activated is gone by
     the time the new gradient renders and the keyboard would be left on the
     document. The frame takes focus instead: the reader lands on the new
     centre, and Escape has somewhere to be heard. */
  const frame = useRef<HTMLDivElement>(null);
  const opening = useRef(true);
  useEffect(() => {
    if (opening.current) {
      opening.current = false;
      return;
    }
    frame.current?.focus({ preventScroll: true });
  }, [focusKey]);

  const refocus = (id: string) => setFocus({ kind: 'modelled', id });
  const proposals = rim.status === 'ready' ? rim.proposals.slice(0, revealed) : [];

  const rows: Row[] = [
    ...(shown.explicit
      ? explicit.map((connection) => ({
          key: connection.id,
          certainty: 'explicit' as const,
          eyebrow: connection.relationship,
          name: connection.name,
          body: connection.description,
          attributes: getNode(connection.id)?.attributes,
          activate: () => refocus(connection.id),
        }))
      : []),
    ...(shown.inferred
      ? inferred.shown.map((connection) => ({
          key: connection.id,
          certainty: 'inferred' as const,
          eyebrow: ruleLabel(connection.ruleId),
          name: connection.name,
          body: connection.basis,
          activate: () => refocus(connection.id),
        }))
      : []),
    ...(shown.deduced
      ? proposals.map((proposal) => ({
          key: proposalId(proposal),
          certainty: 'deduced' as const,
          eyebrow: 'Proposed, not modelled',
          name: proposal.name,
          body: proposal.rationale,
          activate: () => setFocus({ kind: 'proposed', proposal }),
        }))
      : []),
  ];

  /* Everything the list is not saying, said under it: what the cap is holding
     back, the tier the API could not fill, the tiers that are empty by
     construction past the model's boundary. */
  const notes: string[] = [];
  if (focus.kind === 'proposed') {
    notes.push(
      'No authored connections, and no rule to run: both need a component the model contains.'
    );
  } else if (shown.inferred && inferred.overflow > 0) {
    notes.push(`${inferred.overflow} more inferred, held back by the cap.`);
  }
  if (shown.deduced && rim.status === 'absent') {
    notes.push(
      'Deducing components the model does not contain needs the language model, and it is not answering.'
    );
  }

  return (
    <div
      className="certainty"
      ref={frame}
      tabIndex={-1}
      aria-label="Certainty fisheye. Activate a connection to refocus; Escape returns to the last modelled component."
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || focus.kind === 'modelled') return;
        event.stopPropagation();
        event.preventDefault();
        setFocus({ kind: 'modelled', id: lastModelled.current });
      }}
    >
      <section className="flow">
        {/* The frame's own header: where you are on the containment axis, and
            how far the lens reaches along the other one. The reach belongs
            here rather than over the list because it governs the whole view,
            and because a setting that sits beside the bearings reads as part
            of the frame — the one thing it never disturbs. */}
        <div className="certainty__head">
          <Breadcrumb
            trail={
              focus.kind === 'modelled' ? ancestorsOf(focus.id) : [...ancestorsOf(anchor.id), anchor]
            }
            current={focus.kind === 'modelled' ? anchor.name : focus.proposal.name}
            proposed={focus.kind === 'proposed' ? anchor.name : undefined}
            onRefocus={refocus}
          />
          <LevelControl shown={shown} setShown={setShown} />
        </div>

        {/* Still wrapped in `.cards` so the card is a grid-item container (its
            inner blocks size to the card, not the frame); the card carries its
            own inset now, through `.flow`/`.pad`. One card, but still `.cards`. */}
        <div className="cards">
          <div>
            {focus.kind === 'modelled' ? (
              <FocusCard node={anchor} onRefocus={refocus} />
            ) : (
              <ProposedCard proposal={focus.proposal} anchor={anchor} />
            )}
          </div>
        </div>

        <h4>Related</h4>

        <ul className="cards layout-grid">
          {rows.map((row) => (
            <ConnectionCard key={row.key} row={row} />
          ))}
        </ul>

        {shown.deduced && rim.status === 'loading' && (
          <p className="muted">
            <pp-spinner></pp-spinner> <small>Deducing…</small>
          </p>
        )}

        {notes.map((note) => (
          <p className="muted" key={note}>
            <small>{note}</small>
          </p>
        ))}
      </section>
    </div>
  );
}
