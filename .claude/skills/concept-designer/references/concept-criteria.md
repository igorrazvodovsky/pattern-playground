# Concept Design Criteria

What qualifies as a good concept and how to distinguish concepts from other software constructs.

## Why Criteria Matter

Concept criteria help you:
- **Learn concept design** by understanding what makes concepts different from features, classes, etc.
- **Analyze existing applications** to identify coherent units of functionality  
- **Design new applications** by recognizing larger functional units that can be pursued independently
- **Evaluate design quality** by checking whether proposed concepts meet the standards

## The Essential Criteria

Every concept must satisfy these criteria to be considered a true concept:

### 1. User-Facing
**Concepts are always experienced by users of an application**

✅ **Examples**: Login, Search, Comment, Upvote, Shopping Cart
- Users directly interact with these functionalities
- They're part of the user's mental model of the application

❌ **Non-Examples**: Database connections, memory management, encryption algorithms
- These are implementation details hidden from users
- **Exception**: When programmers are the users (e.g., API design), internal structures can be concepts

### 2. Semantic  
**Concepts are made of abstract, semantic structures with meaning**

✅ **Examples**: Friend relationship, Message thread, Task status
- These represent meaningful abstractions users understand
- They have semantic content beyond their technical implementation

❌ **Non-Examples**: Button widgets, color schemes, UI layouts
- These are presentation details, not semantic functionality
- They support concepts but aren't concepts themselves

### 3. Independent
**A concept can be understood without reference to other concepts**

✅ **Example**: Comment concept
- Purpose: Share reactions to particular content
- Principle: Add comment to item → comment appears associated with item
- **Polymorphic**: Works with posts, articles, photos, videos, etc.
- You don't need to know what kind of content to understand commenting

❌ **Counter-Example**: Badly designed concepts with dependencies
- A Comment that can only work with specific Post structures
- Concepts that require deep knowledge of other concepts to understand

### 4. Behavioral
**Every concept has associated behavior, usually quite simple**

✅ **Example**: Upvote concept
- Behavior: When people upvote items, items with most upvotes rise to top of rankings
- Simple core behavior that's easy to understand

✅ **Example**: Trash concept  
- Behavior: Deleted items go to trash; you can restore or permanently delete them
- Complex applications often get complexity from interactions between many simple concepts

❌ **Counter-Example**: Static data structures with no behavior
- Pure data models without actions or state changes

### 5. Purposive
**A concept serves a particular purpose that brings real value**

✅ **Examples**:
- **Authentication**: Verify user identity to prevent unauthorized access
- **Search**: Help users find relevant content by query
- **Bookmark**: Let users save and easily retrieve interesting content

❌ **Fake Purposes**: Roles played in larger contexts without standalone value
- "Getting a social security number" seems purposeful but provides no value by itself
- The real purpose is the broader authentication/benefits system

**Single Purpose Rule**: Each concept should have **at most one purpose**
- Enables flexibility and modularity
- Prevents feature entanglement and confusion

**Bad Example**: Facebook's Reaction concept serves dual purposes:
1. Register approval (for feed algorithm)  
2. Send emotional reaction to author
- Result: Clicking "angry" is a positive upvote, confusing users
- Can't approve without sending reaction, or vice versa

### 6. End-to-End  
**A concept's functionality must be complete from start to finish**

✅ **Example**: Authentication concept includes both:
- Registration (create credentials)
- Login checking (verify credentials)  
- Without both, the concept provides no real value

❌ **Incomplete Example**: Registration-only concept
- Operational principle can't be completed: "After user registers... ???"
- No way to demonstrate the purpose without the checking action

**Test**: Try writing an operational principle. If it's just "when this action happens, the state updates," something's missing.

### 7. Familiar
**Most concepts are familiar to users from other contexts**

✅ **Examples**: Post, Friend, Follow, Upvote, Comment, Hashtag
- Appear in almost identical form across different apps
- Users can transfer knowledge between applications
- Enables users to start using new apps without manuals

✅ **Variations**: Small changes can have big impact
- Instagram's image focus vs Twitter's text focus  
- Twitter's length limit vs Facebook's unlimited posts
- Same core concepts, different implementations

**Novelty Strategy**: Innovation often comes from:
- New combinations of familiar concepts
- Subtle adjustments to existing concepts  
- Rather than completely new concepts

### 8. Reusable
**Concepts can be used in different contexts and applications**

✅ **Example**: Meeting identifier concept
- **Origin**: Zoom (join meetings without individual calls)
- **Reuse**: Copied by Google Meet and Microsoft Teams
- Same concept, different implementations

✅ **Cross-Domain Reuse**:
- **Upvote**: Reddit posts → Restaurant reviews → Product ratings
- **Search**: Documents → Products → People → Photos  
- **Folder**: File systems → Email → Bookmarks

**Why Reusability Matters**:
- Validates the concept's independence and completeness
- Reduces cognitive load for users (familiar patterns)
- Enables modular design and implementation

## Distinguishing Concepts from Similar Constructs

### vs. Classes (Object-Oriented Programming)

| Concepts | Classes |
|----------|---------|
| User-facing functionality | Implementation structures |  
| Always independent | Often have dependencies |
| Focus on behavior and purpose | Focus on data and methods |
| Reusable across applications | Specific to implementation context |

**Example**: A User concept (authentication) vs User class (data storage)

### vs. Features

| Concepts | Features |
|----------|---------|  
| Independent, standalone value | Usually extensions of base functionality |
| End-to-end functionality | May be partial increments |
| Can be understood alone | Often require context to understand |
| Reusable across apps | Typically app-specific |

**Example**: "Private accounts" is a feature (extends following), but "Follow" is a concept

### vs. User Stories

| Concepts | User Stories |
|----------|---------|
| End-to-end value delivery | May be partial functionality |  
| Purposive (brings real value) | May not bring value alone |
| Can be properly evaluated | Hard to evaluate in isolation |
| Good implementation increments | May not be suitable increments |

**Example**: 
- ❌ User story: "As a teacher, I want to record student attendance"  
- ✅ Concept: Attendance (includes recording, reporting, absence tracking, etc.)

### vs. Microservices

| Concepts | Microservices |
|----------|---------|
| Single, focused purpose | Often aggregate multiple purposes |
| Independent understanding | Usually depend on other services |  
| Reusable across domains | Typically application-specific |
| User-facing functionality | Technical service boundaries |

**Example**: An Authentication microservice might handle user management, sessions, permissions - multiple concepts bundled together.

## The Three Pillars of Modularity

Good concepts must satisfy three modularity criteria:

### 1. Specificity
- **Definition**: Fulfills a specific purpose without mixing separable purposes
- **Benefit**: Makes concepts more understandable and reusable
- **Test**: Can you state a single, clear purpose? Are all features necessary for that purpose?

### 2. Completeness  
- **Definition**: Includes all functionality needed to fulfill the purpose
- **Benefit**: Ensures all related functionality is encapsulated in one place
- **Test**: Can you achieve the stated purpose with only the concept's actions?

### 3. Independence
- **Definition**: Stands alone without reference to other concepts  
- **Benefit**: Enables true modularity and reusability
- **Test**: Can you explain the concept without mentioning other concepts?

## Practical Application

### When Analyzing Existing Apps
1. **Identify user-facing functionality** that meets the criteria
2. **Group related actions** that serve the same purpose  
3. **Check independence** - can each group be understood alone?
4. **Validate completeness** - does each group deliver end-to-end value?

### When Designing New Apps
1. **Start with familiar concepts** from similar applications
2. **Ensure each concept has a single, clear purpose**
3. **Check that concepts can work independently** 
4. **Verify end-to-end functionality** for each concept
5. **Plan composition** through synchronization, not dependencies

### Red Flags to Watch For

**Mixing Purposes**: 
- Concept tries to solve multiple unrelated problems
- Features seem unrelated to the stated purpose

**Incomplete Functionality**:
- Can't write a compelling operational principle  
- Concept provides no standalone value to users

**Hidden Dependencies**:
- Concept can't be explained without referring to others
- Implementation would require tight coupling

**Non-User-Facing**:
- Concept is purely technical/internal
- Users don't directly interact with the functionality

## Quality Assessment Checklist

For each proposed concept, verify:

- [ ] **User-facing**: Do users directly experience this functionality?
- [ ] **Semantic**: Does this represent meaningful behavior beyond UI/implementation?  
- [ ] **Independent**: Can I explain this without referring to other concepts?
- [ ] **Behavioral**: What specific behaviors does this concept enable?
- [ ] **Purposive**: What single, valuable purpose does this serve?
- [ ] **End-to-end**: Can users achieve the full purpose with this concept alone?
- [ ] **Familiar**: Have users seen similar functionality elsewhere?  
- [ ] **Reusable**: Could this concept work in other applications or contexts?

## Further Reading

- **@agent-rules/concept-design-guide.md** - Overview and methodology
- **@agent-rules/operational-principles.md** - Writing effective "if...then" scenarios
- **@agent-rules/concept-composition.md** - How concepts work together via synchronization