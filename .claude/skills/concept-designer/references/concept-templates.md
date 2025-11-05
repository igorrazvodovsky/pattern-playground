# Concept Templates and Quick Reference

Practical tools for applying Daniel Jackson's concept design methodology.

## Concept Definition Template

```
concept ConceptName [GenericTypes]
  purpose: [one sentence describing what problem this solves]
  principle: 
    [if user does X, then system provides Y value]
  state:
    [key data structures and relationships]
  actions:
    [main operations users can perform]
```

## Example Concept Definitions

### Upvote Concept
```
concept Upvote [Item]
  purpose: Let users collectively rank content by quality
  principle: 
    If you upvote good content and downvote bad content, 
    then popular items will rise to the top of rankings
  state:
    items: set Item
    votes: Item -> Int  // net score per item
    userVotes: User x Item -> {up, down, none}
  actions:
    upvote(user: User, item: Item)
    downvote(user: User, item: Item) 
    getScore(item: Item) -> Int
    getRanking() -> seq Item
```

### Follow Concept
```
concept Follow [User]
  purpose: Let users see content from preferred users
  principle:
    If you follow someone, then their new content 
    appears in your personal feed
  state:
    following: User -> set User
    followers: User -> set User
  actions:
    follow(follower: User, followed: User)
    unfollow(follower: User, followed: User)
    getFollowing(user: User) -> set User
    getFollowers(user: User) -> set User
    getFeed(user: User) -> seq Content
```

### Tag Concept
```
concept Tag [Item]
  purpose: Enable categorisation and discovery of content
  principle:
    If you tag content with keywords, then you can 
    find related items by searching those tags
  state:
    tags: Item -> set String
    itemsByTag: String -> set Item
  actions:
    addTag(item: Item, tag: String)
    removeTag(item: Item, tag: String)
    searchByTag(tag: String) -> set Item
    getTags(item: Item) -> set String
```

## Operational Principle Templates

### Basic Template
"If [user action], then [system response that provides value]"

### Examples by Pattern

**Discovery/Search:**
- "If you tag content with keywords, then you can find related items by searching those tags"
- "If you bookmark an item, then you can easily find it later in your saved list"

**Social/Communication:**
- "If you follow someone, then their new content appears in your feed"
- "If you send a message to someone, then they can read it in their inbox"

**Quality/Curation:**
- "If you upvote quality content, then the best items rise to the top of rankings"
- "If you report inappropriate content, then moderators can review and remove it"

**Organisation:**
- "If you put items in folders, then you can find related items grouped together"
- "If you create a playlist, then you can play songs in your chosen order"

## Design Process Checklist

### 1. Concept Identification
- [ ] List all user-facing functionality in your domain
- [ ] Group related features together
- [ ] Name each concept with a familiar, everyday term
- [ ] Ensure each concept has a single, clear purpose
- [ ] Check if similar concepts exist in other apps

### 2. Concept Definition  
- [ ] Write one-sentence purpose statement
- [ ] Create "if...then" operational principle showing user value
- [ ] Identify minimum required state (data structures)
- [ ] List essential actions only (avoid implementation details)
- [ ] Make concepts generic where possible

### 3. Concept Validation
- [ ] Can users understand the concept independently?
- [ ] Does it solve a real problem users have?
- [ ] Is it reusable across different contexts?
- [ ] Does it align with real-world patterns people know?
- [ ] Is the operational principle compelling and clear?

### 4. Concept Composition
- [ ] Identify how concepts need to work together
- [ ] Define synchronisation points between concepts
- [ ] Ensure concepts remain independent
- [ ] Avoid unnecessary concept dependencies
- [ ] Plan how concepts share data types

## Common Concept Patterns

### Authentication & Access
- **Account**: User registration and identity management
- **Session**: Temporary authenticated access
- **Password**: Secret-based authentication  
- **TwoFactor**: Additional security verification
- **Role**: Permission-based access control

### Content & Publishing
- **Post**: Publishing content for others to see
- **Comment**: Adding responses to existing content
- **Like/Upvote**: Collective quality ranking
- **Share**: Redistributing content to new audiences
- **Draft**: Work-in-progress content creation

### Organisation & Discovery  
- **Tag**: Multi-category content classification
- **Folder**: Hierarchical content organisation
- **Search**: Content discovery by query
- **Filter**: Content refinement by criteria
- **Bookmark**: Personal content saving
- **History**: Tracking past user actions

### Communication & Social
- **Message**: Private content exchange
- **Notification**: System-initiated user alerts
- **Follow**: Subscribing to user content
- **Mention**: Directing attention to specific users
- **Group**: Collective user organisation

### Commerce & Transactions
- **Cart**: Collecting items before purchase
- **Wishlist**: Saving items for future consideration
- **Payment**: Processing financial transactions
- **Order**: Managing purchase fulfillment
- **Review**: Rating and feedback on items

## Quick Concept Analysis Questions

When evaluating existing software or designing new features:

1. **What concepts does this app/feature contain?**
2. **What is each concept's core purpose?**
3. **How do users understand and use each concept?**
4. **Which concepts are innovative vs. familiar?**
5. **Are there any missing concepts users would expect?**
6. **Could any concepts be simplified or combined?**
7. **How do the concepts work together?**
8. **Which concepts differentiate this product?**

## Anti-Patterns to Avoid

### Concept Confusion
- **Multi-purpose concepts**: One concept trying to solve multiple unrelated problems
- **Implementation leakage**: Including technical details in concept definition
- **User interface conflation**: Confusing UI elements with underlying concepts

### Poor Operational Principles
- **Vague benefits**: "If you use X, then good things happen"
- **Missing user action**: "The system does X automatically"
- **No clear value**: "If you do X, then Y occurs" (but Y isn't valuable)

### Composition Problems
- **Tight coupling**: Concepts that can't work independently
- **Missing synchronisation**: Concepts that should work together but don't
- **Circular dependencies**: Concepts that depend on each other

## Further Reading

- **@agent-rules/concept-design-guide.md** - Overview and principles
- **@agent-rules/operational-principles.md** - Deep dive on writing effective scenarios
- **@agent-rules/concept-composition.md** - How concepts work together
- **@agent-rules/concept-criteria.md** - What makes a good concept