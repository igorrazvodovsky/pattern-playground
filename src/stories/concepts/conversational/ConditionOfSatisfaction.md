import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Concepts/Satisfaction condition" />

# Satisfaction condition

## Purpose

Let a designated authority (usually the requester) decide when a task’s success criteria have been met,
so the work can be accepted (or rejected) explicitly.

## Operational principle

If a request has an agreed condition and the designated authority declares that the condition is met,
the request is accepted; otherwise it remains open (or can be rejected with reasons).

## State

- condition: condition attached to each task
- authority: actor allowed to declare acceptance/rejection (often the requester)
- outcome: accepted, rejected
- outcomeAt: Date
- reason: rejected -> one String

## Actions

- setCondition (r: Request, c: Criteria, a: Actor)
- declareAccepted (r: Request, by: Actor, now: Date)
- declareRejected (r: Request, by: Actor, why: String, now: Date)

Criteria can be anything: "mark as done" action, a structured SLA, a checklist, or even a short text (“customer likes the drape”).

## Polymorphism

- Request = any unit of work (alteration, purchase order, repair ticket, delivery, etc).
- Criteria = any representation of success (numeric tolerances, due time, visual ref, etc).
- Actor = any actor (person, team, role, system).

## Synchronisations

- Conversation ↔ Satisfaction condition: Attach a condition (and authority) when a conversation starts; close the conversation only on acceptance.
{/* - AlterationRequest ↔ Satisfaction condition */}
