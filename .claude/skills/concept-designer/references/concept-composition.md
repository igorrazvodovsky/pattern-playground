# Concept Composition and Synchronization

How concepts work together via synchronization without losing their independence.

## The Challenge

Concepts must be **independent** (understandable on their own) yet **collaborative** (work together in applications). This apparent contradiction is resolved through **synchronization** - a way to compose concepts so they interact without requiring one to be defined in terms of another.

## Understanding Independence vs Interaction

### Two Types of Dependencies

**Intrinsic Dependencies**: One concept is defined in terms of another
- Example: A badly designed Comment concept that inherits from Post
- Problem: Comment cannot be understood or reused without Post

**Extrinsic Dependencies**: Concepts make sense together in a specific application context  
- Example: Comment concept works with any kind of content (posts, articles, photos)
- Benefit: Comment remains independent and reusable across contexts

### The Resolution

Concepts achieve independence through **genericity** - they're defined in terms of abstract types that can be instantiated in different ways:

```
concept Comment [Item]
  purpose share reactions to content
  state
    comments: Item -> set String
    author: (Item, String) -> one User
  actions
    addComment (i: Item, text: String, u: User)
    getComments (i: Item, out cs: set String)
```

## Synchronization Mechanics

### Basic Synchronization

Applications compose concepts by **synchronizing** their actions - coordinating when actions from different concepts occur together:

```
app SocialMedia
  include User
  include Post [User.User]  
  include Comment [Post.Post]

  sync publishPost (u: User, content: String)
    User.authenticate (session, u)        // verify user is logged in
    Post.create (u, content, post)        // create the post
    
  sync addComment (u: User, p: Post, text: String)  
    User.authenticate (session, u)        // verify user is logged in
    Post.exists (p)                       // verify post exists
    Comment.addComment (p, text, u)       // add the comment
```

### Sync Patterns

**Sequential Synchronization**: Actions happen in order
```
sync login (username, password: String, out s: Session)
  when User.authenticate (username, password, user)    // first authenticate
  Session.start (user, s)                              // then create session
```

**Conditional Synchronization**: Actions depend on conditions
```  
sync viewPost (u: User, p: Post, out content: String)
  Post.getContent (p, content)                         // get post content
  when Friend.canView (u, p.author)                    // only if authorized
```

**Parallel Synchronization**: Multiple things happen together
```
sync deleteAccount (u: User)
  User.remove (u)                                      // remove user
  Post.removeByAuthor (u)                              // remove their posts  
  Comment.removeByAuthor (u)                           // remove their comments
```

## Composition Strategies

### 1. Type Instantiation

Connect concepts by instantiating generic types:

```
app EmailClient  
  include User
  include Email [User.User]          // Email works with User objects
  include Label [Email.Message]     // Label works with Message objects
```

### 2. Shared Actions  

Multiple concepts participate in the same user action:

```
sync sendMessage (from, to: User, body: String, label: String)
  Email.send (from, to, body, msg)     // create and send message
  Label.addLabel (msg, label)          // tag it with label
```

### 3. Event Propagation

Actions in one concept trigger actions in others:

```
sync expireSession (s: Session)
  when ExpiringResource.expire (s)     // resource management triggers this
  Session.end (s)                      // session concept responds
```

## Real-World Examples

### User Authentication with Sessions

Traditional monolithic approach would create a complex UserSession concept. With composition, we separate concerns:

```
concept User
  purpose authenticate participants  
  actions
    register (username, password: String, out u: User)
    authenticate (username, password: String, out u: User)

concept Session [User]  
  purpose maintain temporary authenticated access
  state
    active: set Session
    user: active -> one User
  actions
    start (u: User, out s: Session)
    getUser (s: Session, out u: User)  
    end (s: Session)

// Composition
concept UserSession
  include User
  include Session [User.User]
  
  sync register (username, password: String, out u: User)
    User.register (username, password, u)

  sync login (username, password: String, out u: User, out s: Session)
    when User.authenticate (username, password, u)
    Session.start (u, s)

  sync logout (s: Session)  
    Session.end (s)
```

### Adding Expiration

Easy to add session expiration by composing with a resource management concept:

```
concept ExpiringUserSession
  include User
  include Session [User.User] 
  include ExpiringResource [Session.Session]

  sync login (username, password: String, out u: User, out s: Session)
    when User.authenticate (username, password, u)
    Session.start (u, s)
    ExpiringResource.allocate (s, 300)    // 5 minute timeout

  sync terminate (s: Session)
    when ExpiringResource.expire (s)       // automatic expiration  
    Session.end (s)
```

## Design Patterns

### The Repository Pattern
Separate data management from business logic:

```
concept User
  purpose authenticate users
  // business logic only
  
concept UserRepository [User]
  purpose persist user data
  // data access only

app UserManagement
  include User
  include UserRepository [User.User]
  
  sync registerUser (username, password: String)
    User.register (username, password, u)
    UserRepository.store (u)
```

### The Decorator Pattern
Add capabilities without changing core concepts:

```
concept BasicSearch [Item]
  purpose find items by text query
  
concept IndexedSearch [Item]  
  purpose provide fast text search
  
concept AnalyticsSearch [Item]
  purpose track search behavior

// Compose for full-featured search
app SearchApp
  include BasicSearch [Document]
  include IndexedSearch [Document] 
  include AnalyticsSearch [Document]
```

### The Observer Pattern  
Coordinate concepts through event propagation:

```
sync newPost (u: User, content: String)  
  Post.create (u, content, p)             // create post
  when Friend.isFollowed (u)              // if user has followers
  Feed.distribute (p, u.followers)        // add to their feeds
  Analytics.trackActivity (u, "post")     // record activity
```

## Benefits of Composition

### 1. Modularity
Each concept remains focused on a single purpose:
- **User**: Authentication only  
- **Session**: Temporary access only
- **ExpiringResource**: Resource management only

### 2. Reusability  
Concepts can be reused in different combinations:
- **User** + **Session**: Basic authenticated sessions
- **User** + **Session** + **ExpiringResource**: Sessions with timeout
- **User** + **TwoFactorAuth**: Enhanced security
- **Session** + **ExpiringResource**: Timeouts for any session-based system

### 3. Flexibility
Easy to swap implementations or add features:
- Replace **BasicAuth** with **BiometricAuth**  
- Add **AuditLog** to track all user actions
- Compose **RateLimiting** to prevent abuse

### 4. Testing  
Each concept can be tested independently:
- Unit test **User** authentication logic
- Unit test **Session** management  
- Integration test the synchronized **login** action

## Advanced Synchronization

### Conditional Composition

```
sync viewContent (u: User, c: Content, out content: String)
  Content.get (c, content)
  case c.privacy of
    PUBLIC: // no additional checks needed  
    FRIENDS: when Friend.areFriends (u, c.author)
    PRIVATE: when u = c.author
```

### Transaction-Like Behavior

```  
sync transferFunds (from, to: User, amount: Number)
  when Account.getBalance (from) >= amount    // check sufficient funds
  Account.debit (from, amount)               // remove from sender
  Account.credit (to, amount)                // add to receiver  
  AuditLog.record (from, to, amount)         // log transaction
```

### Error Handling

```
sync processOrder (u: User, items: set Item)
  when User.authenticate (session, u)        // must be logged in
  when Inventory.checkAvailable (items)      // items must be in stock  
  Order.create (u, items, o)                 // create order
  Inventory.reserve (items)                  // reserve inventory
  Payment.charge (u, o.total)               // charge payment
  on Payment.failed:                         // if payment fails
    Inventory.release (items)                // release reserved items
    Order.cancel (o)                         // cancel order
```

## Design Guidelines

### Keep Concepts Independent
Never define one concept in terms of another's internal structure:

❌ **Bad**: Comment concept knows about Post's internal fields
```
concept Comment
  state  
    comments: Post.id -> set String    // depends on Post internals
```

✅ **Good**: Comment concept works with any item type
```  
concept Comment [Item]
  state
    comments: Item -> set String       // generic over item type
```

### Synchronize at the Right Level
Synchronize user-visible actions, not internal operations:

❌ **Bad**: Synchronizing low-level state changes
```
sync updateFriendCount (u: User)
  when Friend.add (u1, u2)
  User.incrementFriendCount (u1)       // internal bookkeeping
```

✅ **Good**: Synchronizing user actions  
```
sync befriend (u1, u2: User)
  Friend.add (u1, u2)                  // user action
  Notification.send (u2, "Friend request from " + u1.name)
```

### Design for Common Patterns
Anticipate how concepts will be composed:

```
concept Authenticatable
  // designed to be extended with different auth methods
  
concept Expirable  
  // designed to add expiration to any resource
  
concept Auditable
  // designed to add logging to any actions
```

## Further Reading

- **@agent-rules/concept-design-guide.md** - Overview and methodology
- **@agent-rules/concept-state-modeling.md** - Formal state machine modeling
- **@agent-rules/concept-criteria.md** - What qualifies as a good concept