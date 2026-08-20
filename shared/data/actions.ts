// Typed access to the world's action log, plus a small vocabulary for
// rendering actions as plain-language sentences. Entity ids resolve against
// the assembled views, so the log and the current state of the world stay in
// one vocabulary.

import {
  userViews, projectViews, rawTaskViews, documentViews, commentViews, quoteViews, worldActions,
  materialViews, componentViews, productViews, serviceViews, worldRules,
} from './world-views';
import type { ActionRecord, ParticipantValue, Rule } from './action-types';

export const actions: ActionRecord[] = worldActions;
export const rules: Rule[] = worldRules;

/** Cataloguing is bookkeeping on its own strand of the log, not workspace activity. */
const catalogueActions = new Set([
  'catalogueMaterial', 'catalogueComponent', 'listProduct', 'catalogueService',
]);

/** So are the ledger and the lifecycle assessment: neither is anyone's doing. */
const occurrenceActions = new Set(['recordTransaction', 'recordFlow']);

/** The log without genesis, presence, or bookkeeping — what a feed shows. */
export const feedActions = actions.filter(
  action => action.name !== 'joinWorkspace' && action.name !== 'signIn' &&
    !catalogueActions.has(action.name) && !occurrenceActions.has(action.name)
);

export const getActionById = (id: string) =>
  actions.find(action => action.id === id);

export const getActionsByActor = (actorId: string) =>
  actions.filter(action => action.actor === actorId);

/** Actions in which the individual participates — as actor, input, output, or fact subject/object. */
export const getActionsAbout = (id: string) =>
  actions.filter(action =>
    action.actor === id ||
    Object.values(action.input).includes(id) ||
    Object.values(action.output ?? {}).includes(id) ||
    [...(action.adds ?? []), ...(action.removes ?? [])].some(
      fact => fact.subject === id || fact.object === id
    )
  );

export const getConsequencesOf = (actionId: string) =>
  actions.filter(action => action.causedBy?.includes(actionId));

export const getCausesOf = (action: ActionRecord) =>
  (action.causedBy ?? []).map(getActionById).filter((a): a is ActionRecord => a !== undefined);

export const getRuleById = (id: string) => rules.find(rule => rule.id === id);

export interface ActionProvenance {
  /** The rule that licensed the action. */
  rule: Rule;
  /** The earlier actions that triggered it — a list, since a rule may match several. */
  causes: ActionRecord[];
}

/**
 * Why an action happened, for actions a rule produced: the rule and its
 * triggers, labelled rather than merely linked. Undefined for a root action,
 * which nothing caused.
 */
export const provenanceOf = (action: ActionRecord): ActionProvenance | undefined => {
  const rule = action.viaRule ? getRuleById(action.viaRule) : undefined;
  return rule ? { rule, causes: getCausesOf(action) } : undefined;
};

const userName = (id: ParticipantValue | undefined) =>
  userViews.find(user => user.id === id)?.name;

/** Works across every kind the world holds. */
export const nameOf = (id: ParticipantValue | undefined): string => {
  if (typeof id !== 'string') return String(id ?? '');
  const named =
    userViews.find(user => user.id === id)?.name ??
    projectViews.find(project => project.id === id)?.name ??
    documentViews.find(document => document.id === id)?.name ??
    rawTaskViews.find(task => task.id === id)?.title ??
    quoteViews.find(quote => quote.id === id)?.name ??
    materialViews.find(material => material.id === id)?.name ??
    componentViews.find(component => component.id === id)?.name ??
    productViews.find(product => product.id === id)?.name ??
    serviceViews.find(service => service.id === id)?.name;
  if (named) return named;
  const comment = commentViews.find(c => c.id === id);
  if (comment) return `${userName(comment.authorId) ?? 'a'}’s comment`;
  return id;
};

const statusLabels: Record<string, string> = {
  'status-backlog': 'the backlog',
  'status-todo': 'todo',
  'status-in-progress': 'in progress',
  'status-in-review': 'review',
  'status-done': 'done',
  'status-cancelled': 'cancelled',
};

export interface ActionDescription {
  actorName: string;
  /** Sentence continuation after the actor name, e.g. “created ‘Audit waste streams…’”. */
  phrase: string;
}

export const describeAction = (action: ActionRecord): ActionDescription => {
  const actorName = action.actor === 'system' ? 'System' : nameOf(action.actor);
  const { input, output } = action;

  const phrase = (() => {
    switch (action.name) {
      case 'joinWorkspace':
        return 'joined the workspace';
      case 'signIn':
        return 'signed in to the workspace';
      case 'createProject':
        return `started project “${nameOf(output?.projectId)}”`;
      case 'setPhase':
        return `moved ${nameOf(input.projectId)} into its ${String(input.phase)} phase`;
      case 'setPartners':
        return `recorded ${String(input.partners)} partner organisations on ${nameOf(input.projectId)}`;
      case 'completeProject':
        return `closed ${nameOf(input.projectId)}`;
      case 'joinProject':
        return input.accessLevel === 'viewer'
          ? `joined ${nameOf(input.projectId)} in view-only mode`
          : `joined ${nameOf(input.projectId)}`;
      case 'createTask':
        return `created task “${nameOf(output?.taskId)}”`;
      case 'changeStatus':
        return `moved “${nameOf(input.taskId)}” to ${statusLabels[String(input.status)] ?? String(input.status)}`;
      case 'completeTask':
        return `completed “${nameOf(input.taskId)}”`;
      case 'updateProgress':
        return `logged ${String(input.progress)}% progress on “${nameOf(input.taskId)}”`;
      case 'createQuote':
        return `saved a quote from “${nameOf(input.documentId)}”`;
      case 'addComment':
        return `commented on “${nameOf(input.targetId)}”`;
      case 'replyToComment':
        return `replied to ${nameOf(input.commentId)}`;
      case 'resolveThread':
        return `resolved the thread on ${nameOf(input.commentId)}`;
      case 'notify': {
        // Comment labels read as phrases (“Fatima’s comment”); named artifacts get quotes.
        const isComment = commentViews.some(c => c.id === input.itemId);
        const item = isComment ? nameOf(input.itemId) : `“${nameOf(input.itemId)}”`;
        return `notified ${nameOf(input.userId)} about ${item}`;
      }
      case 'createDocument':
        return `created “${nameOf(output?.documentId)}”`;
      case 'uploadFile':
        return `uploaded “${nameOf(output?.documentId)}”`;
      case 'editDocument':
        return `revised “${nameOf(input.documentId)}”`;
      case 'suggestOutline':
        return `suggested an outline for “${nameOf(input.documentId)}”`;
      case 'catalogueMaterial':
        return `catalogued the material “${String(input.name)}”`;
      case 'catalogueComponent':
        return `catalogued the component “${String(input.name)}”`;
      case 'listProduct':
        return `listed “${String(input.name)}”`;
      case 'catalogueService':
        return `catalogued the service “${String(input.name)}”`;
      case 'recordTransaction':
        return `recorded “${String(input.label)}” in the ledger`;
      case 'recordFlow':
        // The tracked item carries no name fact, so the flow is said by its
        // stage and where it happened.
        return `counted a ${String(input.stage).toLowerCase()} flow at ${String(input.site)}`;
      default:
        return action.name;
    }
  })();

  return { actorName, phrase };
};
