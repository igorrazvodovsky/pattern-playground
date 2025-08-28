# Concept definitions from "Understanding Computers and Cognition" Dress Shop Case

## 1. Conversation

## 2. ConditionOfSatisfaction

## 3. Task
```
concept AlterationRequest [Item, Party]
purpose modify an item to meet specific requester requirements within agreed timeframe
principle
  if a requester submits an alteration request for an item and it is accepted,
  the alteration must be completed by the agreed time to meet satisfaction
state
  active: set Req
  item: Req -> one Item
  requester, fulfiller: Req -> one Party
  deadline: Req -> one Date
  completed: set Req
actions
  submit (reqr: Party, fulf: Party, it: Item, by: Date, out r: Req)
    r not in active
    active += r
    r.item := it
    r.requester := reqr
    r.fulfiller := fulf
    r.deadline := by
  complete (r: Req)
    r in active
    completed += r
```

## 4. Breakdown
```
concept Breakdown [Conversation]
purpose detect and respond to failures in meeting conversation conditions
principle
  if a conversation fails or becomes impossible to complete,
  trigger a follow-up to repair or renegotiate
state
  broken: set Conversation
  repair: Conversation -> opt Conversation
actions
  detect (c: Conversation)
    broken += c
  startRepair (orig: Conversation, repairConv: Conversation)
    orig in broken
    repair[orig] := repairConv
```

## 5. Triggering
```
concept Triggering [Conversation]
purpose link conversations so that one’s completion or breakdown starts another
principle
  if conversation A meets a trigger condition,
  start conversation B
state
  triggers: Conversation -> set Conversation
actions
  addTrigger (from: Conversation, to: Conversation)
    triggers[from] += to
  fire (from: Conversation)
    from in triggers
    // start each conversation in triggers[from]
```

## 6. InventoryCount
```
concept InventoryCount [Item]
purpose anticipate and prevent stock-outs while managing investment in stock
principle
  if stock level for an item falls below threshold,
  initiate a replenishment request
state
  stock: Item -> one Int
  threshold: Item -> one Int
actions
  setThreshold (i: Item, t: Int)
    threshold[i] := t
  adjustStock (i: Item, delta: Int)
    stock[i] += delta
  checkAndReorder (i: Item)
    stock[i] < threshold[i]
    // trigger reorder in another concept
```

## 7. CoordinationSystem
```
concept CoordinationSystem [Task]
purpose enable reliable task completion with flexible scheduling
principle
  if a task is committed to, progress and completion are tracked in real time
  so dependencies can adjust dynamically instead of using only fixed schedules
state
  commitments: Task -> one Date
  progress: Task -> one Percent
actions
  commit (t: Task, due: Date)
    commitments[t] := due
  updateProgress (t: Task, p: Percent)
    progress[t] := p
```

## 8. Address
```
concept Address [Party]
purpose associate a contact or delivery location with a party for a specific context
principle
  if the address type matches the purpose, it can be used to meet that purpose
state
  addresses: Party -> set (AddressType * String)
actions
  addAddress (p: Party, type: AddressType, value: String)
    addresses[p] += (type, value)
  getAddress (p: Party, type: AddressType, out addr: String)
    (type, addr) in addresses[p]
```

## 9. DomainOfAnticipation
```
concept DomainOfAnticipation [Request, Domain]
purpose model a set of standardised properties to pre-empt breakdowns
principle
  if a new request falls within the domain, it can be handled without new interpretation
state
  activeDomains: set Domain
  membership: Request -> set Domain
actions
  addDomain (d: Domain)
    activeDomains += d
  assignDomain (r: Request, d: Domain)
    d in activeDomains
    membership[r] += d
```

## 10. ComputerBasedTool
```
concept ComputerBasedTool [Conversation]
purpose support conversation structures to improve completion and coordination
principle
  if used as part of a conversation, the tool enables visibility, priority handling, and reduced breakdown risk
state
  linked: Conversation -> set Tool
actions
  linkTool (c: Conversation, t: Tool)
    linked[c] += t
```

## 11. StructuralCoupling
```
concept StructuralCoupling [Organisation, Environment]
purpose maintain fit with environment through stable patterns of conversation
principle
  if conversations adapt to breakdowns while preserving essential roles,
  the organisation maintains viability
state
  patterns: Organisation -> set ConversationPattern
actions
  updatePattern (o: Organisation, p: ConversationPattern)
    patterns[o] += p
```

## 12. Interpretation

## 13. InnovationViaConversationDesign

