# Concept State Modeling

How to define concept behavior using formal state machine models.

## Overview

State machines provide a precise way to define how concepts behave in every possible situation. By modeling concepts as state machines, you can:

- **Analyze designs** to ensure behavior is always acceptable
- **Bridge design to code** with clear implementation guidance  
- **Expose design issues** through working out small details
- **Think independently of UI** by focusing on essential state and actions

## Core Concepts

### What is a State Machine?

A **state machine** defines:
- **State**: What the concept remembers (its memory)
- **Actions**: Operations that read and modify state
- **Behavior**: All possible sequences of actions and resulting states

### From Diagrams to Formal Models

While simple state diagrams are useful for basic control flow, they're not rich enough for modeling real concept behavior. Instead, we use **relational state machines** where:

- State consists of relations (mappings between sets)
- Actions have preconditions (when they can occur) and postconditions (what they change)
- Behavior is defined precisely for every possible situation

## Defining State

### State as Memory

The state of a concept determines what it **remembers** at runtime. Include only what's needed to support the concept's actions - if information is never used by any action, it shouldn't be in the state.

### Relational Approach

State is defined as a series of **variable declarations**, where each variable is a set or relation:

```
concept LibraryHold
state
  holds: User -> Item -> one Date    // who holds what, when requested
  pending: set (User, Item)          // holds awaiting fulfillment
  available: Item -> one Number      // available copies per item
```

### Design Principles

**Sufficiency**: Include everything needed to support all actions
- Example: _Upvote_ concept must remember which user issued each upvote to prevent double voting

**Necessity**: Generally exclude what's not needed for actions
- Example: _Reservation_ concept need not store canceled reservations
- Qualification: Sometimes include anticipated future functionality

**Relation Direction**: Declare relations in the most common lookup direction
- Example: `contents: Folder -> set Object` (not `parent: Object -> lone Folder`)
- Note: Direction doesn't fundamentally matter, just be consistent

**Most Abstract Structures**: Avoid premature structural decisions
- Use sets when ordering isn't essential
- Don't impose sequences unless order matters for behavior

## Defining Actions

### Action Structure

Each action has:
- **Header**: Name and parameters (with `out` keyword for outputs)
- **Preconditions**: When the action can occur  
- **Postconditions**: What effects the action has

### Example: URL Shortener

```
concept Yellkey
purpose shorten URLs to common words
principle
  if you register a URL with a duration,
  then you can use the shortening to access the URL
  until that time has elapsed

state
  shortenings: set String           // available short words
  used: set String                  // shortenings currently in use  
  url: used -> one String          // mapping from shortening to URL
  expires: used -> one Date        // when each shortening expires

actions
  register (target: String, duration: Number, out s: String)
    s in shortenings - used        // pick unused shortening
    used += s                      // mark as used
    s.url := target               // store URL mapping
    s.expires := now + duration   // set expiration time

  lookup (s: String, out target: String)  
    s in used                     // shortening must be active
    target := s.url               // return the URL

  expire (s: String)
    s in used                     // must be an active shortening
    s.expires <= now              // expiration time has passed
    used -= s                     // remove from active set
    url -= s                      // clear URL mapping
    expires -= s                  // clear expiration time
```

## Key Benefits

### 1. UI-Independent View

State machines let you think about behavior without UI details. You can:
- Design the essential functionality first
- Map states and actions to UI views and widgets later
- Focus on what the concept does, not how it looks

### 2. More Succinct Than Use Cases

A single action often captures what would require a lengthy use case. The implementation flow is better described with wireframes, while the essential behavior is captured in the action definition.

### 3. Path to Implementation

State machine models translate directly to code:
- **Relational databases**: State relations become database tables
- **Object-oriented**: Actions become API methods, state becomes object fields
- **Functional**: State becomes immutable data structures with transformation functions

### 4. Small Details Expose Big Issues

Working out precise action definitions forces you to confront important design decisions:

**Example**: Shopping cart `add` action - should it check stock? Decrement inventory?
- If yes: Users can't add out-of-stock items, but items appear unavailable while in carts
- If no: Users might try to buy unavailable items at checkout
- Design decision has major business implications

## Advanced Modeling Techniques

### Multi-relation State

For complex relationships involving more than two sets:

```
// User invited another user on a specific date
invited: User -> User -> one Date

// Alternative: introduce invitation objects
invitations: set Invitation
from, to: Invitation -> one User  
date: Invitation -> one Date
pending: set Invitation
```

### Generic Types

Make concepts reusable by parameterizing over types:

```
concept Label [Item]
state
  labels: Item -> set String
actions
  addLabel (i: Item, l: String)
    i.labels += l
  getItems (ls: set String, out items: set Item)
    items = {i: Item | ls in i.labels}
```

### Multiplicity Constraints

Use keywords to specify cardinality:
- `one`: exactly one
- `lone`: at most one  
- `some`: at least one
- `set`: any number (default)

```
email: User -> lone String     // users may have at most one email
owner: Group -> one User       // every group has exactly one owner
members: Group -> some User    // every group has at least one member
```

## Common Patterns

### Resource Management
```
concept ResourcePool [Resource]
state
  available, allocated: set Resource
  assignedTo: allocated -> one User
actions
  allocate (u: User, out r: Resource)
    r in available
    available -= r
    allocated += r  
    r.assignedTo := u
```

### Expiration Tracking
```
concept ExpiringResource [Resource]  
state
  active: set Resource
  expires: active -> one Date
actions
  allocate (r: Resource, duration: Number)
    active += r
    r.expires := now + duration
  expire (r: Resource)
    r in active
    r.expires <= now
    active -= r
```

### Access Control
```
concept AccessControl [User, Resource]
state
  permissions: User -> Resource -> set Permission
actions  
  grant (u: User, r: Resource, p: Permission)
    u.permissions[r] += p
  check (u: User, r: Resource, p: Permission)
    p in u.permissions[r]
```

## Integration with Other Concept Elements

### Operational Principles
State machines implement the behavior described in operational principles. The OP shows the archetypal usage; the state machine handles all edge cases and exceptional conditions.

### Purpose Alignment  
Every component of the state should serve the concept's stated purpose. If state components aren't needed to fulfill the purpose, consider whether they belong in a different concept.

### Action Coverage
The set of actions should be sufficient to achieve the concept's purpose end-to-end. If you can't write a compelling operational principle using only the defined actions, the concept may be incomplete.

## Implementation Considerations

### Database Schema Generation
Relational state translates directly to database schemas:
- Each relation becomes a table
- Primary and foreign keys follow from relation structure  
- Multiplicity constraints become database constraints

### API Design
Actions become API endpoints:
- Preconditions become validation logic
- Postconditions become the main implementation
- Parameters map to request/response structures

### Testing Strategy
State machines enable systematic testing:
- Test each action's preconditions and postconditions
- Test invalid state transitions are rejected
- Test complex sequences match operational principles

## Best Practices

### Start Simple
Begin with the essential state and actions needed for the core operational principle. Elaborate gradually as you understand the concept better.

### Maintain Invariants
Document and maintain important state invariants:
```
// Invariant: used shortenings are exactly those with URLs
used = url.domain
```

### Consider Concurrency
For multi-user systems, think about which actions can occur concurrently and whether additional state is needed to handle conflicts.

### Version Carefully
When evolving concepts, consider how state schema changes affect existing implementations and data migration requirements.

## Further Reading

- **@agent-rules/concept-design-guide.md** - Overview and methodology
- **@agent-rules/operational-principles.md** - Writing compelling "if...then" scenarios  
- **@agent-rules/concept-composition.md** - How concepts work together via synchronization