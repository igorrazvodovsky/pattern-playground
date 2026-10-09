import type { Spec, StateStore } from '@json-render/core';
import { actions, nameOf } from '@shared/data';
import type { RulePart, RuleSlotOption } from '../../components/rule-sentence';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './rule-composition.json' with { type: 'json' };

// Megan edits the rule that decides which comments reach her. The saved rule is
// the world's own comment rule (notify a document's author about comments by
// others); every case the preview shows is a comment or reply from the action
// log, so the saved rule reproduces exactly the notifications the log holds.
//
// The spec carries the layout, save and discard (setState between /draft and
// /saved), the drawer's open state, and the preview's shape. What stays here is
// the rule model: deriving the sentence from it ($computed), applying an edit
// to it (editRule), and replaying the log against it (updatePreview, bound to a
// watch on the rule).

const ME = 'user-1';

type TargetKind = 'document' | 'task' | 'project' | 'quote';

interface CommentCase {
  id: string;
  verb: 'comment' | 'reply';
  authorId: string;
  targetKind: TargetKind;
  targetName: string;
  creatorId: string;
  text: string;
}

const creatorOf = new Map<string, string>();
for (const action of actions) {
  for (const key of ['projectId', 'documentId', 'taskId', 'quoteId']) {
    const id = action.output?.[key];
    if (typeof id === 'string') creatorOf.set(id, action.actor);
  }
}

const kindOf = (id: string): TargetKind =>
  id.startsWith('PRJ') ? 'project' : id.startsWith('task') ? 'task' : id.startsWith('quote') ? 'quote' : 'document';

const cases: CommentCase[] = (() => {
  const targetOfComment = new Map<string, string>();
  const result: CommentCase[] = [];
  for (const action of actions) {
    if (action.name !== 'addComment' && action.name !== 'replyToComment') continue;
    const targetId = action.name === 'addComment'
      ? String(action.input.targetId)
      : targetOfComment.get(String(action.input.commentId));
    const commentId = action.output?.commentId;
    if (!targetId) continue;
    if (typeof commentId === 'string') targetOfComment.set(commentId, targetId);
    result.push({
      id: action.id,
      verb: action.name === 'addComment' ? 'comment' : 'reply',
      authorId: action.actor,
      targetKind: kindOf(targetId),
      targetName: nameOf(targetId),
      creatorId: creatorOf.get(targetId) ?? '',
      text: String(action.input.text ?? ''),
    });
  }
  return result;
})();

// --- The rule -----------------------------------------------------------

type Phrase = 'question' | 'data';

type Condition =
  | { id: string; field: 'author'; op: 'is' | 'is-not'; who: string }
  | { id: string; field: 'text'; op: 'contains' | 'lacks'; phrase: Phrase };

interface Rule {
  event: 'comment' | 'any';
  kinds: TargetKind[];
  creator: 'me' | 'anyone';
  conditions: Condition[];
  action: 'notify' | 'digest';
}

const savedRule: Rule = {
  event: 'comment',
  kinds: ['document'],
  creator: 'me',
  conditions: [{ id: 'c0', field: 'author', op: 'is-not', who: ME }],
  action: 'notify',
};

const kindLabels: Record<TargetKind, string> = {
  document: 'a document', task: 'a task', project: 'a project', quote: 'a quote',
};
const phraseLabels: Record<Phrase, string> = {
  question: 'a question mark',
  data: 'the word “data”',
};
const phraseTests: Record<Phrase, (text: string) => boolean> = {
  question: text => text.includes('?'),
  data: text => /\bdata\b/i.test(text),
};
const personLabel = (id: string) => (id === ME ? 'me' : nameOf(id));

const people: RuleSlotOption[] = [
  { value: ME, label: 'me' },
  ...[...new Set(cases.map(c => c.authorId))]
    .filter(id => id !== ME)
    .map(id => ({ value: id, label: nameOf(id) }))
    .sort((a, b) => a.label.localeCompare(b.label)),
];

/** The clauses a case fails, worded as reasons. Empty when the rule matches. */
const failures = (rule: Rule, c: CommentCase): string[] => {
  const reasons: string[] = [];
  if (rule.event === 'comment' && c.verb === 'reply') reasons.push('it is a reply');
  if (!rule.kinds.includes(c.targetKind)) reasons.push(`it is on ${kindLabels[c.targetKind]}`);
  if (rule.creator === 'me' && c.creatorId !== ME) reasons.push(`${nameOf(c.creatorId)} created it`);
  for (const condition of rule.conditions) {
    if (condition.field === 'author') {
      const from = c.authorId === condition.who;
      if (condition.op === 'is' && !from) reasons.push(`it is not from ${personLabel(condition.who)}`);
      if (condition.op === 'is-not' && from) reasons.push(`it is from ${condition.who === ME ? 'you' : nameOf(condition.who)}`);
    } else {
      const has = phraseTests[condition.phrase](c.text);
      if (condition.op === 'contains' && !has) reasons.push(`it has no ${phraseLabels[condition.phrase]}`);
      if (condition.op === 'lacks' && has) reasons.push(`it has ${phraseLabels[condition.phrase]}`);
    }
  }
  return reasons;
};

const matches = (rule: Rule, c: CommentCase) => failures(rule, c).length === 0;

const sameRule = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// --- Rule → sentence ----------------------------------------------------

const toSentence = (rule: Rule): RulePart[] => {
  const parts: RulePart[] = [
    'When someone ',
    {
      id: 'event', kind: 'choice', name: 'Change what they do',
      label: rule.event === 'comment' ? 'comments on' : 'comments or replies on',
      value: [rule.event],
      options: [
        { value: 'comment', label: 'comments on' },
        { value: 'any', label: 'comments or replies on' },
      ],
    },
    ' ',
    {
      id: 'kinds', kind: 'choice', name: 'Change what it is on', multiple: true,
      label: rule.kinds.map(kind => kindLabels[kind]).join(' or '),
      value: rule.kinds,
      options: (Object.keys(kindLabels) as TargetKind[]).map(kind => ({ value: kind, label: kindLabels[kind] })),
    },
    ' ',
    {
      id: 'creator', kind: 'choice', name: 'Change who created it',
      label: rule.creator === 'me' ? 'I created' : 'anyone created',
      value: [rule.creator],
      options: [
        { value: 'me', label: 'I created' },
        { value: 'anyone', label: 'anyone created' },
      ],
    },
  ];

  for (const condition of rule.conditions) {
    if (condition.field === 'author') {
      parts.push(
        ', and it is ',
        {
          id: `${condition.id}:op`, kind: 'choice', name: 'Change the comparison',
          label: condition.op === 'is' ? 'from' : 'not from',
          value: [condition.op],
          options: [{ value: 'is', label: 'from' }, { value: 'is-not', label: 'not from' }],
        },
        ' ',
        {
          id: `${condition.id}:who`, kind: 'choice', name: 'Change who it is from',
          label: personLabel(condition.who), value: [condition.who], options: people,
        },
      );
    } else {
      parts.push(
        ', and the comment ',
        {
          id: `${condition.id}:op`, kind: 'choice', name: 'Change the comparison',
          label: condition.op === 'contains' ? 'contains' : 'does not contain',
          value: [condition.op],
          options: [{ value: 'contains', label: 'contains' }, { value: 'lacks', label: 'does not contain' }],
        },
        ' ',
        {
          id: `${condition.id}:phrase`, kind: 'choice', name: 'Change what the comment contains',
          label: phraseLabels[condition.phrase], value: [condition.phrase],
          options: (Object.keys(phraseLabels) as Phrase[]).map(p => ({ value: p, label: phraseLabels[p] })),
        },
      );
    }
    parts.push({ id: condition.id, kind: 'remove', name: 'Remove this condition' });
  }

  parts.push(
    { id: 'add', kind: 'add', name: 'Add a condition', options: [
      { value: 'author', label: 'Who it is from' },
      { value: 'text', label: 'What the comment says' },
    ] },
    ', ',
    {
      id: 'action', kind: 'choice', name: 'Change what happens',
      label: rule.action === 'notify' ? 'notify me' : 'add it to my daily digest',
      value: [rule.action],
      options: [
        { value: 'notify', label: 'notify me' },
        { value: 'digest', label: 'add it to my daily digest' },
      ],
    },
    '.',
  );
  return parts;
};

// --- Edits --------------------------------------------------------------

interface Edit { kind: 'change' | 'add' | 'remove'; slotId: string; value: unknown }

const applyEdit = (rule: Rule, edit: Edit, nextId: () => string): Rule => {
  if (edit.kind === 'remove') {
    return { ...rule, conditions: rule.conditions.filter(c => c.id !== edit.slotId) };
  }
  if (edit.kind === 'add') {
    const id = nextId();
    const condition: Condition = edit.value === 'author'
      ? { id, field: 'author', op: 'is', who: people[1].value }
      : { id, field: 'text', op: 'contains', phrase: 'question' };
    return { ...rule, conditions: [...rule.conditions, condition] };
  }
  const value = edit.value as string[];
  const [conditionId, part] = edit.slotId.split(':');
  if (edit.slotId === 'event') return { ...rule, event: value[0] as Rule['event'] };
  if (edit.slotId === 'kinds') return { ...rule, kinds: value as TargetKind[] };
  if (edit.slotId === 'creator') return { ...rule, creator: value[0] as Rule['creator'] };
  if (edit.slotId === 'action') return { ...rule, action: value[0] as Rule['action'] };
  return {
    ...rule,
    conditions: rule.conditions.map(condition =>
      condition.id === conditionId ? { ...condition, [part]: value[0] } as Condition : condition),
  };
};

// --- Preview ------------------------------------------------------------

const describeCase = (c: CommentCase) =>
  `${c.authorId === ME ? 'You' : nameOf(c.authorId)} ${c.verb === 'comment' ? 'commented on' : 'replied in a thread on'} ${c.targetKind} “${c.targetName}”`;

const caseRow = (c: CommentCase, reason?: string) => ({
  id: c.id,
  description: describeCase(c),
  detail: reason ? `${c.text} Missed because ${reason}.` : c.text,
});

const group = (id: string, title: string, empty: string, rows: ReturnType<typeof caseRow>[]) => ({
  id, title, empty, count: String(rows.length), hasCases: rows.length > 0, cases: rows,
});

const preview = (draft: Rule, saved: Rule) => {
  const now: ReturnType<typeof caseRow>[] = [];
  const dropped: ReturnType<typeof caseRow>[] = [];
  const nearMisses: ReturnType<typeof caseRow>[] = [];
  let total = 0;
  for (const c of cases) {
    const before = matches(saved, c);
    const reasons = failures(draft, c);
    if (reasons.length === 0) total++;
    if (reasons.length === 0 && !before) now.push(caseRow(c));
    if (reasons.length > 0 && before) dropped.push(caseRow(c));
    if (reasons.length === 1) nearMisses.push(caseRow(c, reasons[0]));
  }
  const reach = draft.action === 'notify' ? 'notified you about' : 'put in your digest';
  const savedTotal = cases.filter(c => matches(saved, c)).length;
  return {
    summary: `Run against the ${cases.length} comments and replies made so far, this rule would have ${reach} ${total} of them. The saved rule reached you for ${savedTotal}.`,
    groups: [
      group('now', 'Would now reach you', 'No new comments.', now),
      group('dropped', 'Would no longer reach you', 'Nothing the saved rule caught is lost.', dropped),
      group('near', 'Missed by one part', 'No comment misses by a single part.', nearMisses),
    ],
  };
};

const handlers = (store: StateStore) => {
  let next = 1;
  return {
    editRule: ({ edit }: Record<string, unknown>) => {
      if (!edit) return;
      store.set('/draft', applyEdit(store.get('/draft') as Rule, edit as Edit, () => `c${next++}`));
    },
    updatePreview: () => {
      store.set('/preview', preview(store.get('/draft') as Rule, store.get('/saved') as Rule));
    },
  };
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      draft: savedRule,
      saved: savedRule,
      edit: null,
      previewOpen: false,
      preview: preview(savedRule, savedRule),
    },
    handlers,
    functions: {
      ruleSentence: ({ rule }) => toSentence(rule as Rule),
      sameRule: ({ a, b }) => sameRule(a, b),
    },
  } satisfies SpecSetup,
};
