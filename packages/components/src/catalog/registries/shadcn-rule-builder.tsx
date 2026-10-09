import clsx from 'clsx';
import type { RulePart, RuleSlot } from '../rule-parts';
import { Parts, SentenceSlot, type Send } from './shadcn-parts';

// A rule as one statement whose condition may hold groups. The spec's module
// derives the tree (lead words, the condition group, an optional tail); this
// file only decides how it reads.
//
// A flat run of conditions that all have to hold joins with "and" on one
// line, as people read it as intended, and shows no head: the only way to
// make such a root "any" is to add a group, which is a different rule. The
// moment a group holds alternatives, or holds another group, the statement
// breaks into lines. The logic then lives in two places and nowhere else:
// between lines, as the head of the group, stated once and marked by the
// colour of the rail the lines hang from; and inside a line, as the operator
// on its part ("is not", "is any of"). The word "and" or "or" never stands
// between two lines or two groups.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

export interface RuleLine {
  id: string;
  parts: RulePart[];
  remove: RuleSlot;
}

export interface RuleGroup {
  id: string;
  /** How the items combine: a choice between all and any. */
  head: RuleSlot;
  items: (RuleLine | RuleGroup)[];
  /** An add slot listing the fields a new line can be about. */
  addCondition: RuleSlot;
  /** An add slot with one option: a nested group. */
  addGroup: RuleSlot;
  remove?: RuleSlot;
}

export interface RuleTree {
  /** The words before the condition, ending so the condition can follow directly. */
  lead: RulePart[];
  where: RuleGroup;
  /** What follows the condition, if anything: an acting rule's action clause. */
  tail?: RulePart[];
}

const isGroup = (item: RuleLine | RuleGroup): item is RuleGroup => 'items' in item;

/** All of the following, with nothing nested: reads as one line. */
const isFlat = (group: RuleGroup) => group.head.value?.[0] === 'all' && !group.items.some(isGroup);

// One colour per combinator, so a nested "any" is told apart from its "all"
// parent at a glance. The pill repeats the head's first word; the rail
// carries the colour down the group's extent.
const tone = {
  all: { rail: 'border-sky-400/70', pill: 'bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100' },
  any: { rail: 'border-violet-400/70', pill: 'bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100' },
} as const;

const toneOf = (group: RuleGroup) => tone[group.head.value?.[0] === 'any' ? 'any' : 'all'];

const Head = ({ group, send }: { group: RuleGroup; send: Send }) => (
  <span className="inline-flex items-baseline gap-2">
    <span
      aria-hidden="true"
      className={clsx('rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide', toneOf(group).pill)}
    >
      {group.head.value?.[0] === 'any' ? 'Any' : 'All'}
    </span>
    <span>
      <SentenceSlot slot={group.head} send={send} />:
    </span>
  </span>
);

const Remove = ({ slot, send }: { slot: RuleSlot; send: Send }) => (
  <span className="ml-auto self-center">
    <SentenceSlot slot={slot} send={send} />
  </span>
);

const Group = ({ group, send }: { group: RuleGroup; send: Send }) => (
  <li className="flex flex-col gap-1">
    <div className="flex items-baseline gap-x-1">
      <Head group={group} send={send} />
      {group.remove && <Remove slot={group.remove} send={send} />}
    </div>
    <GroupItems group={group} send={send} />
  </li>
);

const GroupItems = ({ group, send }: { group: RuleGroup; send: Send }) => (
  <ul className={clsx('ml-2 flex flex-col gap-1 border-l-2 pl-4', toneOf(group).rail)}>
    {group.items.map(item =>
      isGroup(item) ? (
        <Group key={item.id} group={item} send={send} />
      ) : (
        <li key={item.id} className="flex flex-wrap items-baseline gap-x-1">
          <Parts parts={item.parts} send={send} />
          <Remove slot={item.remove} send={send} />
        </li>
      ),
    )}
    <li className="-ml-2 flex flex-wrap items-center gap-1">
      <SentenceSlot slot={group.addCondition} send={send} labelled />
      <SentenceSlot slot={group.addGroup} send={send} labelled />
    </li>
  </ul>
);

export const RuleBuilder = ({ label, tree, send }: { label: string; tree: RuleTree; send: Send }) => {
  const { lead, where, tail } = tree;
  if (isFlat(where)) {
    return (
      <p role="group" aria-label={label} className="text-base leading-8">
        <Parts parts={lead} send={send} />
        {where.items.map((item, i) => (
          <span key={item.id}>
            {i > 0 && ' and '}
            <Parts parts={(item as RuleLine).parts} send={send} />
            <SentenceSlot slot={(item as RuleLine).remove} send={send} />
          </span>
        ))}
        <SentenceSlot slot={where.addCondition} send={send} />
        <SentenceSlot slot={where.addGroup} send={send} />
        {tail && <>, <Parts parts={tail} send={send} /></>}
      </p>
    );
  }
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-1 text-base leading-8">
      <p className="flex flex-wrap items-baseline gap-x-1">
        <Parts parts={lead} send={send} />
        <Head group={where} send={send} />
      </p>
      <GroupItems group={where} send={send} />
      {tail && (
        <p>
          <Parts parts={tail} send={send} />
        </p>
      )}
    </div>
  );
};
