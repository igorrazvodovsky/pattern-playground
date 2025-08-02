## Software = concepts

Any software app, service or system can be viewed as a **collection of interacting concepts**.

### Concepts are the building blocks of software

Imagine explaining Twitter to someone who’s never used it. You might tell them about the _Tweet_ and _Follower_ concepts, then maybe _Hashtag_ and _Like_ (aka Upvote), and if they’re keen to know even more, you could explain _VerifiedAccount_ or _Bookmark_.

Each concept can be explained with a purpose (what it’s for) and an operational principle (how you use it):

- **Follower**. _Purpose_: let you see content from preferred users. _OP_: if you follow someone, then their content will appear in your feed.
- **VerifiedAccount**. _Purpose_: prevent impersonators. _OP_: if someone verifies their identity to Twitter’s satisfaction (eg, by showing a link to it on their official website), then their account gets marked with a blue tick that tells people it’s real.

I picked the word _concept_ because its informal meaning is close to what I want to express. Technical usages of the term “concept” have meant specific and different things. A concept in software is something richer than a concept in concept lattices or conceptual models (where it usually means a class, so that “dog” refers to the class of all dogs, for example). A software concept has a rich behavior that serves a purpose. You can define the full behavior of a concept with a state machine, by declaring a state space (aka a data model) and some actions that read and write states.

### Concepts are software genes

Concepts are like a kind of genetic code. Just as the behavior of an organism is determined by its genes, so the behavior of an app is determined by its concepts.

And like genes, most concepts are common across apps. All social media apps have _Friend_ or _Follower_ (or both); any app with content from many users has _Upvote_; almost all apps have _Password_ or something similar for user authentication; and so on. This is why it’s usually easy to learn a new app: you know almost all the concepts already.

And like genes, concepts can mutate. Twitter’s _Tweet_, Facebook’s _StatusUpdate_ and WhatsApp’s _Message_ are all mutants of a basic _Post_ concept.

### Concepts are life patterns

Most concepts in software apps are just software equivalents of real world concepts: patterns of behavior that humans have enacted for centuries.

Concepts such as _Post_ (sharing content with the public) or _Message_ (conveying content to one or more specified recipients) are communication patterns that have been around for millennia, ever since people carved words into stone tablets. _Folder_ and _Label_ reflect traditional ways to organize things: partitioning into groups, or attaching visible classification marks.

### Concepts are technological inventions

But even the most well established life patterns were invented, by some person at some time. Restaurant reservations? Late 1800s. Social security accounts? 1930s. Using passports to identify people when traveling to foreign countries? Apparently Henry V in 1400s England. Publishing content? From short after the advent of writing, I’d guess.

Not surprisingly, people keep inventing new concepts. Some are life patterns first and only become software concepts when apps or systems are built to support them. Most banking concepts are like this.

Some concepts don’t mirror a pattern in daily life, or do it only weakly (and so we think of these as “metaphors”). Photoshop’s _Layer_ concept is a tiny bit like an artist’s acetate layer, but it’s so much richer and more powerful that it counts as an invention in its own right.

I suspect there are also concepts that appear for the first time in software and then make their way into daily life. Let me know if you can think of one!

### What’s new about this?

Perhaps you’re wondering: aren’t these concepts you’re talking about just what people call “features”?

The fundamental difference is that concepts, unlike features, can be defined independently. A concept is free standing, and can be reused between one app and another. That’s what makes concepts understandable: when you learning how to use HackerNews and you discover that is has an _Upvote_ concept, you know what it’s for and how to use it, because you’ve seen the same concept in other apps (for upvoting comments in your newspaper, for example).

Features are generally inseparable from the app they belong to, and their effect is often defined as an extension of modification of some existing behavior. This means that features are much more general than concepts, and almost any step in the development of a program can be viewed as adding or removing a feature. But this generality means that features provide less leverage for thinking about design, because they can’t be designed and analyzed independently.

### What are concepts most like?

Some people see a connection between concepts and object-oriented classes, but that seems confusing to me. Classes are a very code-oriented notion, and a class (traditionally) defines a collection of objects. A concept typically involves multiple collections of objects and relationships between them: for _Follower_, there are the users who follow each other and the posts they publish.

A better analogy is that a concept is like a tiny service—a microservice, but even smaller. You could call it a _nanoservice_. Like a service, and unlike a class, a concept provides value by itself, and interacts directly with the outside world.

### How do concepts fit together?

Concepts are independent only in the sense that they can be _understood_ independently. They can’t _execute_ fully independently of each other or they wouldn’t need to be part of the same app.

In a social media app, the _Friend_ concept will ensure that users can view content published by their friends; and the _Post_ and _Comment_ concepts will govern how users create posts and add comments. But these can’t execute independently, because the comments will have to be added (by _Comment_) to posts (from _Post_), and both comments and posts will have to be treated as published content (by _Friend_).

This is what concept synchronization is for: a way to compose concepts so that they interact together without requiring one concept to be defined in terms of another.

### Tips

Ways to use these ideas:

- Inventory the concepts of an app to understand it and identify its strengths and weaknesses.
- Define a product family by the concepts that its members share.
- Point to “differentiator” concepts (like Photoshop’s _Layer_) that give a product an advantage over its competitors.
- When designing an app, steal existing (and familiar) concepts before inventing new ones.
- Whenever possible, align concepts with life patterns.

## Operational principles

A compelling way to explain how something works is to tell a story. Not any story, but a kind of defining story that shows, through a typical scenario, why the thing is useful and fulfills its purpose.

The Minuteman Library Network, for example, offers a wonderful service. If I request a book, then when it becomes available at my local library, I get an email notifying me that it’s ready to be picked up.

Note the form this scenario takes: _if_ you perform some actions, _then_ some result occurs that fulfills a useful purpose. Many kinds of mechanism can be described in this way:

- If you make social security payments every month while you work, then you will receive a basic income from the government after you retire.
- If you insert a slice of bread into the toaster and press down the lever, then a few minutes later the lever will pop up and your bread will be toast.
- If you become someone’s friend and they then publish an item, you will be able to view it.

One reason that scenarios are so compelling is that we observe them all around us. Using an elevator is actually quite complicated, but we learned how to do it by watching other people. Many people haven’t yet learned how to use [Schindler’s PORT elevator](https://www.youtube.com/watch?v=Q8aaz3NTvgg), so the story needs to be told explicitly:

- Enter the floor you want to go to on the keypad and note the elevator number that is subsequently displayed; now wait for the elevator with that number, and it will stop at your floor.

Each concept has one or more such stories that explain how to use the concept, and show that the concept fulfills its purpose. I call such a story an **operational principle** (OP), a term introduced by the chemist philosopher Michael Polanyi.

### Use cases, OPs and snooze alarms

Because an OP is a scenario, you might confuse it with a use case. But these are very different things. Use cases are for specifying the requirements of a software system, so even a simple system will have a large number of use cases, covering not only ones in which the user succeeds but also those in which the user fails.

In contrast, the OPs of a concept aren’t intended to specify it fully, so they can be few and brief. The OPs characterize a concept’s essential behavior, explaining how it works and fulfills its intended purpose. All details that are not fundamental to the design are left unspecified.

Consider a digital snooze alarm clock. The first OP is this:

- If you set the alarm for a given time, and turn the alarm on, then when that time comes around, the alarm will ring (for some fixed time or until you turn it off).

We can add a second OP to explain the snooze function:

- When the alarm starts ringing, you can press the snooze button, and it will stop ringing and start ringing again after some fixed time, and you can then turn it off.

These OPs tell you enough to use the alarm clock, and they justify its design. But they barely begin to answer all the questions you might have about the details of its behavior. What happens if you press the snooze button again? If you turn the alarm off after pressing the snooze button but before the alarm rings again?

Of course the designer will have to answer all these questions in a reasonable way, but they’re not the essence of the design. That doesn’t mean that we won’t come across additional scenarios that matter enough to be recorded as OPs. This one, for example:

- If you set the alarm for a given time, do any sequence of actions except for setting the time, and then turn the alarm on, then it will ring when the given time comes around.

This ensures that when you set the alarm time it “sticks” from day to day, and snoozing (in particular) won’t change it. It’s not the only possible design. You could imagine a clock that resets the alarm time to 8:05am if it was set previously to 8:00am and then snoozed.

### Specifying full behavior

So if the OP doesn’t fully specify the behavior of a concept, how do you do that? I’ll cover that in detail in another post, but here’s the idea. In short, you define the state of the concept and then define the effect of each action on the state (just like writing high-level code):

```
state
  alarmTime, ringTime, now: Time
  on: Bool
  ringing: Bool = on && 0 < (ringTime - now) < RINGT

actions
  setAlarmTime (t: Time)
    alarmTime := t
  tick (t: Time)
    now := t
  alarmOn ()
    on := true; ringTime := alarmTime
  alarmOff ()
    on := false;
  snooze ()
    if ringing
      ringTime := ringTime + SNOOZET
```

**Notes**. The alarm is defined to ring for a time RINGT after it goes off and to snooze for a time SNOOZET. The passage of time is modeled explicitly by an action that updates the current time.

**Exercises for the reader**. (1) How must SNOOZET be related to RINGT, and why? (2) What happens if you set the alarm time to just before the current time?

If what you’re trying to do is fully specify a concept’s behavior, this kind of state machine model is the way to go. It’s much more succinct than scenarios (and so better than use cases, in my view, in this role).

But OPs offer something else. In a technical sense, you can infer all scenarios from the state machine, but that doesn’t mean you can make sense of them. To understand the snooze function you need to know how it’s typically used: the alarm rings, you press snooze and then it rings again a bit later.

So the OP helps by distinguishing the archetypal scenario from other scenarios that are equally plausible (in terms of the state machine) but play no role in explaining the concept’s purpose. For example, you can let the alarm ring until _just_ before the moment at which it switches off and press snooze then. This scenario is as valid (to the state machine) as our first OP (in which you press snooze when it starts ringing) but it’s not helpful in understanding why the snooze function was invented.

### How many OPs?

A simple concept may have just one OP. Here’s an example of a concept whose OP is almost too trivial to explain:

- **Comment**. If you add a comment to an item, then the comment will appear in the list of comments displayed with it.

Some concepts, though, need two or more OPs to explain their essential functionality:

- **Trash**. (1) If you delete a file, you can then restore it by moving it out of the trash. (2) If you delete a file and then empty the trash, the file is gone forever and its storage space can be reused.
- **Password**. (1) If you register with a user name and password, and then you login with that same user name and password, you will be authenticated as the user who registered (that is, able to act in their name). (2) If you register with a username and password, and then you login with that same username but a different password, you will not be authenticated.
- **Personal access token (PAT)**. (1) If you create an access token for a resource and pass it to another user, then that user can enter the token string and obtain access. (2) If you create an access token, pass it to another user, and then revoke it, the other user will not be able to access the resource with it.

It’s not unusual for a more elaborate OP to be the one that actually motivates the concept design. For the _PAT_ concept, it’s the revocation that’s the essence: without it, a simple password would do.

### Generic and context-specific OPs

Most concepts are generic, which means that they can be instantiated in different contexts, applying to different kinds of objects. The _Trash_ concept, for example, can be applied to files and folders in a file system; or to messages in an email client; or to photos in a catalog.

When writing an OP as part of a concept design, you’ll have to decide whether to write it in a generic form, or instantiated for the context at hand. My recommendation is that you write it initially in its instantiated, more concrete form, as this will let you assess more easily whether the concept will provide the value that’s expected. Then, once you’re happy that the concept is the right one, you can reformulate it in a more generic way to gain the benefit of a simpler and more flexible concept, and to ensure that you haven’t specialized the concept in some way that will make it unfamiliar.

Here’s an example. Suppose you’re designing an email client, and realize that it would be convenient if the app were to automatically complete email addresses when they are typed in to the _to_ or _cc_ fields. You might start with an OP like this:

- **PreviousRecipientCompletion**. After you have sent emails to a variety of addresses, each time you send an email and start to type an address, the app automatically suggests a completion based on the addresses previously used.

Having written this, you realize there is nothing email-specific about this; this is just a simplified form of a generic concept:

- **Autocompletion**. When you start typing a string, the system suggests suffixes that would extend the string to one that appears in a predefined dictionary, or to one that you previously typed.

### Purposes, not user goals

The design of a concept is driven by some purpose that the concept fulfills. In some cases, this purpose is aligned with a simple user goal. The purpose of the _TextMessage_ concept is to convey messages between users; a user following the OP (if you send a message to another user, then they will receive it) has the simple goal of conveying a single message.

In general, however, user goals are not so easily aligned with purposes. A user always has some _motivation_ to perform some action or sequence of actions, but the motivation is often inchoate and not worth dwelling on in the design process.

The purpose of the _Password_ concept, for example, is to authenticate users. Neither the user who successfully logs in nor the user who fails has a goal that fully matches this purpose, whose essence is to _distinguish_ the two cases.

One of the risks of focusing on user goals is that it becomes tempting to articulate shorter scenarios that have no relationship to the purpose at all. There’s no point writing a scenario for registering a password, for example. It provides no value in itself to the user, and matters only in the context of the OP in which it’s followed by a successful (or unsuccessful) login.

### OPs with multiple users

Another reason an OP might have no user goal is that the purpose involves collaboration of multiple users. The purpose of _Upvote_ is to let users rank items by their popularity. When you as a user give a thumbs-up to an item, you’re not fulfilling a goal worth articulating, but simply contributing to a larger communal purpose. The OP for _Upvote_ must include upvotes by multiple users on multiple items, to illustrate the key idea that the ranking of items depends on the number of upvotes they receive.

### The danger of “secondary” goals

One final problem with goals: they encourage you to think that some goals are primary and others secondary. But it may well be the supposedly secondary goal that motivates the design of the concept.

Take the _ShoppingCart_ concept, for example. You might be tempted to label as primary the OP in which a user adds an item and checks out immediately (thus buying the item in the most efficient way), and label as secondary the OPs in which the user adds multiple items, or adds and then removes items.

But just as the purpose of the _Trash_ concept is not deletion but _undeletion_, which is illustrated by the OP in which an item is deleted and then restored, so the purpose of _ShoppingCart_ is to allow items to be selected for purchase without commitment. If it were merely to make it easy to buy items, a different, simpler concept would suffice (such as Amazon’s one-click _BuyNow_).

### Writing good OPs

OPs offer a lightweight and provocative way to explore a new design or record an existing one. Here are some tips on writing good OPs.

- **Purpose**. Have the concept purpose in mind: that the purpose of _Trash_ is undeletion (and not deletion), or that the purpose of _Password_ is authentication (and not creating accounts or anything like that).
- **Full history**. Remember to include a long enough history of actions to demonstrate the purpose. Registering a password is useless by itself; it only becomes interesting when you log in later.
- **One concept**. If your OP looks complicated, you may be mixing the OPs of distinct concepts. A scenario in which a user logs in, views a friend’s post and then comments on it involves at least three concepts (_Password_, _Friend_, _Comment_).
- **Actions not buttons**. Write the OP in terms of the actions and states that form the concept (and the user’s mental model), not the realization of the concept in the user interface. So keep out details of UI buttons and views, and avoid especially breaking a single action (such as a login attempt) into multiple steps (enter name, enter password, press submit).

## Concept purposes

### The role of purposes

**From what to why**. The beginning of wisdom for a designer is to stop asking “what?” and start asking “why?”.

This applies at every level. You can ask “what application shall I design?”. But a better question is “why would I design that?”. And at a finer grain, the question “what features should my app have?” gives way to “why should my app have these particular features?”.

**Granular justifications**. Software designs are always taught to think about the purpose of the product as a whole: who it serves, and what value it delivers. This is an essential part of needfinding (as it’s called in the HCI community) or requirements analysis (as it’s called by software engineers).

But they’re rarely taught to justify the _elements_ of their designs. Instead, a designer will often assemble an elaborate array of functions and will ask only whether the totality of the design meets the users’ needs. No case is made for each individual element; it’s included just because it’s part of the overall design. The result of this is a lot of functionality that is poorly targeted, or worse, unnecessary.

The alternative is that each element of functionality gets its own justification. But what’s an element? Do we have to explicitly justify every line of code?

**Concept purposes**. In concept design, each concept is given a justification called a _purpose_. You might sometimes find it helpful to record justifications for smaller elements (such as the actions of a concept), but in practice that’s too much work, and justifying entire concepts is good enough.

**A rationale for existing**. A concept purpose is an explanation of why the concept exists; it’s the rationale for going to the trouble of designing it, or when the concept already exists, the rationale for including it. This is critical input to the designer’s decision of whether including the concept is worth the cost (in design, implementation, user interface complexity, etc).

**Knowing why**. The concept purpose is useful to the user too. Knowing why a piece of functionality exists is usually the first thing a user needs to understand, before they even consider how to use it.

- _Example: Melania Trump’s mistake_. In my [book](https://essenceofsoftware.com/) I tell the story of how Melania Trump “favorited” a tweet that made fun of her husband. She presumably thought that this would save the tweet for her privately; unfortunately, her action made public that she had “liked” the tweet. Her mistake was understandable, because Twitter’s explanation of the _Favorite_ concept didn’t explain what it was _for_, so she confused what was essentially an _Upvote_ concept for a _Bookmark_ concept (which in fact was missing, and added to Twitter later).

### Some examples of purposes

Articulating the purpose of a concept can be hard, but the effort pays off in deeper understanding and making the design work that follows more effective (because you know what you’re really trying to do).

Here are some examples of purposes for familiar concepts:

- _Trash_. The purpose of the _Trash_ concept, introduced originally in the Apple Macintosh in 1984, is not to make deletion easy. On the contrary, its purpose is to allow _undeletion_.
- _Style_. The purpose of the _Style_ concept, widely used in all desktop publishing tools and word processors, is not to let you change the typographic settings of a piece of text; the _Format_ concept is sufficient for that. Its purpose is to help you keep a document consistent by changing the formatting of a whole collection of paragraphs (eg, all the headings) in one go.
- _Notification_. The purpose of the _Notification_ concept in social media apps is to draw your attention to activity that may be of interest. At least, that was the original purpose, and that’s the purpose that most users would like it to have. Unfortunately, in many cases its purpose seems to be to increase user engagement by drawing users back to the app even when there is nothing of value for them there.
- _AuthenticationToken_. This purpose of this concept, used for example by OAuth and many other schemes, is to allow users to grant access to some resource in some service (for example, the contacts in your Gmail account) to different parties. The idea is that each party gets a different token, so the user can revoke access for one party without revoking it for another.

### Criteria for good purposes

What makes a good purpose definition for a concept? Here are some criteria:

- **Need-focused**. The purpose should be stated in terms of the needs of the user. For example, the purpose of the _Upvote_ concept should not be to “express your approval of an item” since that has no tangible benefit; a better purpose might be to “use crowd-sourced approval to rank items.”
- **Specific**. The purpose should be specific to the design of the concept at hand. For example, even though an _Autocomplete_ concept in Gmail may make the app more attractive to consumers, it wouldn’t be useful to say that its purpose is to “increase the Gmail user base” since presumably all concepts have that goal. A better purpose might be “to save the user typing effort.”
- **Evaluable**. A purpose should be a yardstick against which to measure a concept design. For example, a good purpose for the _Trash_ concept is “to allow undeletion.” The apparently similar purpose “to prevent accidental deletion” is not good because evaluating the concept design against that goal would require all kinds of assumptions about user behavior.

### Concept specificity

Obviously, a concept should have at least one purpose. If it has no purpose, there’s no reason for it to exist.

More controversially, a concept should have _at most_ one purpose. This might seem strange, especially since some people think that a good design decision solves multiple problems at once (or feeds many birds with one scone, as the politically correct version of the old adage goes).

In fact, this is a misconception, and rigorously separating purposes so that each concept has only one purpose is the path to more flexible software. The chapter on specificity in my book has many examples of design flaws that arose because a concept was given more than one purpose.

- _Example: Facebook’s Reaction concept._ In Facebook, the _Reaction_ concept is used both to register approval (for deciding which posts to include in users’ feeds) and to send an emotional reaction back to a post’s author. Users are especially confused by the fact that clicking on the _angry_ emoticon is a _positive_ upvote for a post. The entangling of purposes means that it’s not possible for a user to do one with the other: you can’t approve a post, for example, without conveying a reaction back to the author, or vice versa.
- _Example: Facebook’s Friend concept_. In Facebook, the _Friend_ concept serves two purposes. One is to provide access control so you can limit who sees your posts. The other is to filter your own incoming content, so you can choose whose posts you want to see. (Arguably the design of the _Feed_ concept has undermined this second purpose, but that’s another matter.) These two purposes are not always in alignment; you might want to see someone’s posts but not share yours with them, or vice versa.

Avoiding having more than one purpose for a design component is an idea that appears in many different domains. Programming advice often recommends that each function should do only one thing (and David Parnas identifies combining purposes in a single function as one of the main causes of a program not being amenable to [extension or contraction](https://essenceofsoftware.com/tutorials/concept-basics/dependency)). In mechanical engineering, ensuring that each design parameter corresponds to at most one functional requirement is one of the “axioms” of [axiomatic design](https://en.wikipedia.org/wiki/Axiomatic_design).

## Apps are state machines

If user experience runs [deeper](https://essenceofsoftware.com/tutorials/design-general/beyond-ui) than the user interface, we need a way to talk about an app that isn’t just visual, and that captures behavior in a more fundamental way.

Programmers think in terms of complicated things like objects, callbacks, streams, functionals, and so on. They’re essential for structuring code, but for behavior a much simpler model is effective.

### State machines

That model is the **state machine**. You’ve probably come across state machines, either in a class about the theory of computation, or seeing diagrams like this:

![[Pasted image 20250724164800.png]]

This diagram describes the state machine of a shopping cart. You start with an empty cart; adding an item produces a non-empty cart; then you can add and remove more items; checkout; and then return to the initial state.

Diagrams like this are useful for capturing basic control flow. But they’re not rich enough for modeling behavior, because the number of states must be finite (and small enough to draw!). This diagram doesn’t say that the order you submit when you checkout contains the items you added and didn’t remove. And because individual items aren’t tracked, it needs some non-determinism to model the fact that when you remove an item from a non-empty cart you might end up back with an empty cart (if it was the last item) or you might not (if it wasn’t).

### What exactly is a state machine?

To understand exactly what a state machine is, let’s look at an example that’s so simple we can draw it in full. Here’s a rather basic egg timer:

![[Pasted image 20250724164813.png]]

It works like this. You start in the state _s0_, and then press the _up_ button to increment the timer to _s1_ corresponding to one minute, _s2_ for two minutes, or _s3_ for three minutes; you can press the _down_ button to decrement the timer; and then when you’re ready, you press _start_ and a countdown begins, with _r3_ meaning running for three minutes, etc; and then when no time is remaining (_r0_) the timer rings.

We could write down this state machine as a collection of explicit transitions, but to be more succinct we could introduce two separate variables:
```
time: 0..3
running: bool
```
and then define an action like this:
```
up ()
  when not running and time < 3
  time += 1
start ()
  when not running and time > 0
  running := true
```
This looks more like a program but it’s still a state machine. The states are all the possible _environments_ (that is, bindings of values to variables), and the actions are sets of transitions like _(e, a, e’)_ where _e_ and _e’_ are the environments before and after and _a_ is the action name. To be pedantic, we might use the term _action_ for the name of an action (and its transitions) and _action occurrence_ for a particular transition.

For example, the action up has three occurrences, of which the first (corresponding to the leftmost arrow in the diagram) is
```
({time: 0, running: false}, up, {time: 1, running: false})
```

### States

In a more realistic app, the variables won’t have primitive values. Instead, each variable will be a data structure itself. The easiest way to represent such data structures uniformly is to think of them as relations.

The variables representing the state of an online store, for example, might include one holding the number of each item in stock:

```
stock: Item -> one Number
```

sets of pending and fulfilled orders for each user:

```
pending, fulfilled: User -> set Order
```

a shopping cart for each user:

```
cart: User -> one Cart
```

and, for each cart or order, the items it contains:

```
items: (Cart + Order) -> set Item
```

The value of each of these variables is a _binary relation_. The _fulfilled_ variable, for example, is a set of pairs of the form _(u, o)_ where _u_ is a user and _o_ is one of _u_’s fulfilled orders. Viewed as a table, there’s a separate row for each user and order. So if there are two fulfilled orders for Alice and one for Bob, the table might look like this:

| User  | Order   |
| ----- | ------- |
| Alice | Order_1 |
| Alice | Order_3 |
| Bob   | Order_2 |

### Actions

Just as the states of a real app are richer, so the actions are a bit richer too. The label of the action includes not only the action name, but often some parameters too.

For example, here’s an action for adding an item to a cart:

```
add (c: Cart, i: Item)
  when i.stock > 0
  c.items += i
  i.stock -= 1
```

An example occurrence might be _add (c0, i1)_, meaning an addition of item _i1_ to cart _c0_.

The definition of actions is just like it was with the simple egg timer, except now we have to read and write relating values. Here I’m using an [Alloy-like](http://alloytools.org/) notation, in which

```
c.items += i
```

means that item _i_ is added to the set associated with the cart _c_ by the _items_ relation. In traditional mathematical notation, it’d be written like this

```
items' = items U {(c, i)}
```

where _items’_ is the value of the _items_ relation after. So this action definition says that when the requested item is in stock, the item is added to the given cart and its inventory count is reduced by one. The _when_ condition is a guard; if it doesn’t hold the action can’t happen. So you can’t add an item to your cart if the item is out of stock.

Removing an item from a cart looks like this:

```
remove (c: Cart, i: Item)
  when i in c.items
  c.items -= i
  i.stock += 1
```

When you checkout, a new order is created and made pending, the cart is deleted from the user’s carts, and the order is given the set of items that were in the cart:

```
checkout (u: User, c: Cart, o: Order)
  new o
  u.pending += o
  c in u.carts
  u.carts -= c
  o.items := c.items
```

Finally, when an order gets fulfilled, it’s moved from the set of pending orders to the set of fulfilled orders:

```
fulfill (u: User, o: Order)
  when o in u.pending
  u.pending -= o
  u.fulfilled += o
```

### ER diagrams

An entity-relationship diagram offers a nice way to show the state variables:
![[Pasted image 20250724165034.png]]

There are a few differences from the textual declarations. I’ve used symbols rather than words for multiplicity (_!_ in place of _one_, for example). I’ve shown the multiplicity on both ends of a relation: the _!_ on the source end of the cart arrow says that each cart belongs to one user. You can do both of these textually too. The diagram doesn’t naturally accommodate unions of sets, so for the items relation I introduced a superset called _Bag_, with each _Bag_ being either a _Cart_ or an _Order_.

These diagrams are very lightweight and contain lots of information. Working out the details of the state as you the draw the diagram always reveals interesting questions. Can a user have more than one cart, for example? That’s certainly possible for Amazon, because a client-side cart is created before you even log in.

### What’s the point?

1. **UI-independent view**. Viewing an app in terms of its state and actions lets you think about its behavior concretely, but without having to consider the details of the user interface. And when you come to design the UI, you can ask yourself how to _map_ the states and actions to UI views and widgets.
2. **More succinct than use cases**. A use case can be useful for describing the details of a workflow, but often a single action will suffice. The _checkout_ action, for example, could encompass all the steps in checking out a shopping cart, and the flow would be better described using wireframes than text. For capturing a fuller journey (that a user adds and removes items from a cart, then checks it out, then the order is fulfilled), I recommend using an [operational principle](https://essenceofsoftware.com/tutorials/concept-basics/operational-principle) written in terms of actions.
3. **Path to implementation**. It’s easy to extract a relational database schema from the ER diagram. [OMT](https://en.wikipedia.org/wiki/Object-modeling_technique) showed how to do this systematically. You can also generate a class hierarchy for an object-oriented approach.
4. **Small details expose big issues**. The biggest advantage of writing down a state machine is that as you work out small details you inevitably encounter questions that expose serious design issues. For example, when I wrote the _add_ action, I had to decide whether it should check the _stock_ of the item, and if so, whether it should decrement it. I decided to do both, which means that (a) you can only add an item that is in stock; and (b) you’re assured that when you checkout, the item you wanted won’t have been taken by someone else. But this convenience for the user comes at a cost for the company, because it means that items will be shown as unavailable when they haven’t yet been paid for. And there will need to be a way to return an item to the inventory if too much time elapses with the cart not being checked out.

Describing a whole app as a single state machine rarely makes sense (unless it’s a very small app). Concepts to the rescue! Just as you can describe an app as a state machine, we’ll see that you can do the same thing for an individual concept. Then an app is just a composition of concepts, and you can define in detail only the concepts that seem tricky or interesting.

## Concepts are state machines

As I explained in another [tutorial](https://essenceofsoftware.com/tutorials/concept-basics/apps-are-state-machines), the easiest and most effective way to define the behavior of an app precisely is to model it as a state machine. The app has a set of possible states, and actions that update and query the states. An execution of the app is just a sequence of actions (or more correctly, action instances that include particular action arguments), and the behavior as a whole is the set of all possible executions.

Describing concepts themselves as state machines brings the same advantages. The state machine of the app as a whole is just a combination of the machines of the individual concepts. This is how concepts bring modularity to thinking about the functionality of an app.

### An example of a concept as a state machine

Let’s model the core concept of [Yellkey](https://yellkey.com/), a URL shortening service that many teachers use. The novelty of Yellkey is that the short URLs it generates use common English words, so you get short URLs like “https://yellkey.com/hello” rather than ones that contains strange sequences of letters that are harder to transcribe.

Here’s the Yellkey concept as a state machine:

```
concept Yellkey
purpose shorten URLs to common words
principle
  after registering a URL u for t seconds
  and obtaining a shortening s, looking up s
  will yield u until the shortening expires
  t seconds from now:
  register (u, t, s); lookup (u, s') {s' = s}
state
  used: set String
  shortFor: used -> one URL
  expiry: used -> one Date
  const shorthands: set String
actions
  // register URL u for t seconds
  // resulting in shortening s
  register (u: URL, t: int, out s: String)
    s in shorthands - used
    s.shortFor := u
    s.expiry := // t secs after now
    used += s

  // lookup shortening s and get u back
  lookup (s: String, out u: URL)
    s in used
    u := s.shortFor

  // system action: shorthand s expires
  system expire (out s: String)
    s.expiry is before now
    used -= s
    s.shortFor := none
    s.expiry := none
```

Actions are a good place to start because they capture what the user does to use the concept. There are two actions that are performed by the user: **register**, which takes a URL and some duration in seconds, and returns a shortening; and **lookup**, which takes a shortening and expands it by returning a URL. In Yellkey, the user doesn’t get to choose an arbitrary duration, but selects one from a dropdown (which has a few options between 1 and 24 hours).

The fact that a shortening can expire is represented by an action that is performed by the system: **expire** occurs for a given shortening when it has passed its registered duration.

### Defining state

To design the state, you consider what must be remembered by the concept in order to support the actions. In this case, what’s needed is: a mapping from shortenings to URLs, and a mapping from shortenings to their expiry times. Since the shortenings must be drawn from a set of common words, that set is stored as part of the state also.

For convenience, I’ve also included a component that remembers which shortenings are currently being used. Strictly, this isn’t necessary because the shortenings in use are just the ones mapped by the two mappings. But this makes it a bit easier to define the actions, and to make explicit (in the declarations of the mappings) that every shortening being used maps to exactly one URL and exactly one expiry time.

### Defining Actions

Each action has a header that names the action and lists some arguments, and a body that defines the action’s behavior:

```
register (u: URL, t: int, out s: String)
  s in shorthands - used
  s.shortFor := u
  s.expiry := // time now plus secs
  used += s
```

The arguments that are marked with the keyword _out_ are outputs that are returned by the action; the others are all inputs. (Using a keyword rather than having a special return value turns out to be more convenient, because it allows more than one output, and introduces names for them).

The body includes two kinds of statements: preconditions that limit when the action can occur, and postconditions that say what effect the action has.

Let’s look at each line in turn. The first line

```
s in shorthands - used
```

says that any value can be picked for s that is in the set _shorthands - used_, that is the set of words that are shorthands but not used.

The second line

```
s.shortFor := u
```

says that the mapping between shortenings and their URLs is updated so that the new shortening s maps to the given URL u.

The third line

```
s.expiry := // t secs after now
```

says (informally) that the mapping between shortenings and their expiry times is updated so that the new shortening s maps to the time corresponding to t seconds after the current time.

And finally

```
used += s
```

says that the set of used shortenings has s added to it.

**A note on notation**. I’ve used a simple notation for the action formulas based on [Alloy](https://alloytools.org/), extended with some C-style operators. Given a relation _r: A -> B_, and variables _a_ and _b_ holding values drawn from the sets A and B, the statement _a.r := b_ makes _a_ map to _b_ in _r_—that is, adds the pair (a, b) to r.

### Non-determinism

The register action doesn’t say how the shortening is chosen. It says any shortening is acceptable so long as it’s in the set of shorthands that are not currently being used.

This is called “non-determinism”. It doesn’t mean that the selection has to be random, or that if you could somehow undo the action and do it again that you might get a different result.

All it means is that the specification doesn’t say how the shortening is chosen, and whoever implements the concept can decide how it’s done (so some prefer the term “under-determined” to “non-deterministic”).

For example, the set of shorthands could be represented as a ring with a pointer to the last shorthand issued. When register is called, it returns the next shorthand in the ring, or skips it if it’s being used, carrying on round the ring until it finds an unused one.

### Design is in the details

_The details are not the details. They make the design_.—Charles Eames

Being precise about the states and actions helps in several ways. The first is communication: it helps you convey the concept behavior unambiguously to others.

The second is that it counters _wishful thinking_. As anyone who’s written software knows, it’s easy to convince yourself that some function is obvious until you actually try and code it, and then you discover you don’t even understand what it should do. Writing a model is like writing code in this respect, except that it’s less work and lets you know sooner that you’re confused.

The third is that different options come up as you formalize the behavior, prompting you to address design questions you might not even have noticed.

For example, an alternative specification of the register action might not just _add_ a new shortening for a URL but might _replace_ any existing ones.

On the one hand, one could argue that it’s not in the spirit of Yellkey to support multiple shortenings for a single URL, and it would also save resources to do this.

On the other hand, this would open up a potential malicious attack. Suppose a lecturer writes a Yellkey short URL on the board for a class quiz. A naughty student in the class could register a new one for the same URL, causing the old one to stop working.

### Concepts aren’t classes

People are sometimes confused about the difference between concepts and classes in object-oriented languages. With our concept example in hand, we can now see how different a concept is from a class.

- **User-facing, end-to-end functionality**. A concept provides user-facing functionality, in an end-to-end way. A class, in contrast, is usually hidden from users, and provides only a piece of functionality that is combined with functionality in other classes to deliver some value to the user. For example, an implementation of Yellkey might have a _Shorthand_ class each of whose instances holds a shorthand and its associated URL. But this class doesn’t offer lookups; that would have to be in another class.
- **No intrinsic dependencies**. Concepts don’t have [intrinsic dependencies](https://essenceofsoftware.com/tutorials/concept-basics/dependency) on other concepts, and can be understood in isolation. Classes almost always use other classes, and can’t operate without making calls to them.
- **System actions**. Concepts can have both user and system actions; the methods of a class are called from outside (and if they were called internally, the call would not be visible to the outside).
- **Richly associative state**. Concepts hold state that associates different objects and values in rich ways, and allows flexible navigation. Classes, in classic OOP, are more constrained. A class is represented by a set of objects, and each object can contain references to other objects or collections of objects. But this structure does not support querying for particular objects within a class. For example, as I just noted, given a _Shorthand_ class whose objects represent registrations of shorthand/URLs, you can’t ask for the objects that match a particular shorthand. The OOP workaround for this is to introduce another class whose instances are shorthand-to-URL mappings.

None of this means that concepts can’t be implemented in an object-oriented language. In fact, a reasonable approach is to implement each concept as a class, supported by whatever other classes are needed to fulfill its functionality (but avoiding any references to the classes of other concepts).

## Concept state

### Motivation: Defining Behavior

The operational principle of a concept explains its archetypal behavior: how it’s typically used, and how it fulfills its purpose. But for a concept to be flexible and powerful, it should work in many different scenarios, so we need a way to pin down the behavior in detail.

Using the notion of a state machine, we can define how a concept will behave in every possible situation. Then we can analyze the design to make sure that the behavior is always acceptable. And as we transition from design to code, the state machine provides an ideal stepping stone. The state of the state machine will become the state of the program and the actions of the state machine will become the functions of its API.

A relational formulation of state is the best, in my view, because it is abstract enough to avoid making any premature implementation commitments, but at the same time is easily translated into code. For traditional or object-oriented data structures (in languages like JavaScript and Python) or collection databases (like Mongo.db), the translation is usually straightforward; for a relational database (where the state is defined by a schema in SQL) the translation is even easier.

### The Role of State

Novices are sometimes confused about what the actual role of the state of a concept is. Part of the reason for the confusion is that state declarations are very similar to ontologies or knowledge graphs, and this encourages novices to think that the state should somehow embody everything that is known about the relevant objects in the domain and their relationships.

But that’s a mistake. The state of a concept plays a very straightforward role, and that’s to determine what the concept _remembers_ at runtime. The state is the concept’s _memory_. If some piece of information is needed in an action, then it will have to be in the memory; if it will never be needed, it shouldn’t be there, even if it’s interesting.

For example, suppose we’re designing a concept called _Group_ for messaging within a group of users. The state will certainly need to include which users belong to which groups, because there will be actions that depend on this (the action _post_ for posting a message will likely check that the user is a member of the group they’re posting in). The state will also need to distinguish regular members of a group from the owner of the group, since some actions (such as approving new members) will only work for owners. Should the state also include the date at which a user joined a group? That would depend on the details of the behavior. If a user who joins a group can only see messages posted after they joined, the date will be necessary, since otherwise this check can’t be performed. But if a user can see all old messages, the date wouldn’t play a useful role, and can be omitted.

This criterion of only including in a concept’s state what the concept behavior requires helps divide state up between concepts too. Suppose we’re designing an app for a lending library. We might have a _Catalog_ concept for finding books, and a _Hold_ concept for putting a hold on a book. Since the _Hold_ concept seems to be about books, you might be tempted to include in its state things like the name of a book, or the email address of a user issuing a hold. But this would be a mistake: the _Hold_ concept should support just the actions of creating and tracking holds on books, and for those functions it doesn’t need to know anything about a book except for its identity. The _Catalog_ concept will contain information about a book, including its title. Likewise, the _Hold_ concept will only need to know the identity of a user, and the user’s contact details will be stored in another concept.

### Defining State

We’ll define the state of a concept as a series of variable declarations. Each variable will correspond to a set, or to a relation. A relation may map one set to another (in which case it’s called a _binary_ relation), or may associate elements of more than two sets (in which case I call it a _multirelation_). If you think of a relation as a table, then a binary relation has two columns, and a multirelation has three or more. A set is just a table with one column, so it’s a relation too.

This way of thinking about state is taken from the Alloy language, and we’ll use some basic Alloy-like syntax to define the relations.

For example, suppose we are designing a concept called _Invitation_ that captures the kind of functionality that appears in many apps in which one user can issue an invitation to another user, to be a friend, to access some files, or whatever. The state of the concept might include

```
invited: User -> User
```

which introduces a relation called _invited_ between users. You can think of a relation like this in several ways: as a _mapping_ from users to users which can be access by a lookup (where _u.invited_ might represent the set of users invited by the user _u_), as a _tuple set_ or _predicate_ that contains the tuple _(u1, u2)_ when user _u1_ has invited user _u2_; or as a _table_ with two columns, with the understanding that the first column represents the inviting user and the second the invited user, and each row represents an invitation. These are all equivalent ways to view a relation.

If we want to store the date on which invitation was issued, we could use a three-way relation:

```
invited: User -> User -> one Date
```

where _(u1, u2, d)_ would be included when user _u1_ invited user _u2_ on date _d_. (The multiplicity keyword _one_ says that each pair of users maps to a single date.)

Another way to model this would be to introduce a set of invitation objects, and then we can define the date of an invitation and who it’s from and to as additional projections:

```
from, to: Invitation -> one Person
date: Invitation -> one Date
```

As an example of a set declaration, we might have a set of pending invitations that have yet to be accepted:

```
Pending: set Invitation
```

Novices sometimes wonder why it’s preferable to use a set rather than a mapping to a boolean value. Why not, for example, represent the pending invitations as a relation like this?

```
isPending : Invitation -> one Bool
```

The answer is that it’s much easier to write relational expressions about the state using the set rather than the boolean function. For example, the set of users who have issued invitations that are pending can be written as _Pending.from_; to write this with the boolean function you’d need to construct a set comprehension with a formula.

Also, introducing sets lets you include certain invariants in the declaration of the state. For example, suppose the Invitation concept includes a _remind_ action which reminds a user who has received an invitation to accept or reject it, and this action is triggered some fixed time after the invitation is issued. We could represent the time for the reminder like this:

```
remindOn: Pending -> one Date
```

which says that each pending invitation has a reminder date. Without the _Pending_ set, we’d need to associate the reminder date with all invitations:

```
remindOn: Invitation -> lone Date
```

which says that each invitation is associated with zero or one dates at which the reminder should occur. Because the declaration maps all invitations, not just pending invitations, we have to weaken the multiplicity from _one_ to _lone_ (zero or one), and the invariant that says that every pending invitation has a reminder date is no longer expressed.

### Diagram notation

The relation declarations of the state can also be represented in a diagrammatic form. Here, for example, is a diagram for the _Invitation_ concept:
![[Pasted image 20250724165335.png]]

This kind of diagram is called an _extended entity-relationship_ diagram. It’s “extended” because it lets you show that one set is a subset of another, in this case that the _Pending_ invitations are a subset of all invitations.

Note how the diagram expresses the constraint that only pending invitations have reminder dates. This kind of constraint requires subsets and can’t be expressed in standard entity-relationship diagrams.

### Principles

Here are some principles to help you design the state of a concept:

**Sufficiency**. The state must be rich enough to support the actions. Put another way, the concept must remember enough about actions in the past to be able to perform actions in the future correctly. Example: an _Upvote_ concept, which tracks how many times users have approved some item, must remember which user issued each upvote in order to prevent double voting, but the date of the upvote would likely not be needed.

**Necessity**. Generally, the state should not include components that are not necessary to support the actions. Example: a _Reservation_ concept need not store reservations that have been canceled; a _Trash_ concept need not store the original location of an item if there is no _restore_ action; a _Voting_ concept need not store the time at which a vote occurred, if all votes received before some deadline are treated equally.

There is a subtle qualification to this principle. Sometimes it is useful to enrich the state in ways that anticipate future functionality. Example: in a _Moderation_ concept, there might be no actions that require storage of posts that have been rejected by a moderator, but it might be sensible to store them anyway if you anticipate adding, for example, functionality that recommends acceptance or rejection based on treatment of prior posts from the same user.

**Relation direction**. The direction in which you declare a relation usually corresponds to the most common direction of lookup. Example: in the _Folder_ concept, the relation between folders and the objects they contain would be declared as

```
contents: Folder lone -> set Object
```
and not
```
parent: Object -> lone Folder
```

since you expect to navigate from a folder to its objects, not vice versa. But like tables in a relational database (and unlike mappings in a programming language), the direction of a relation doesn’t fundamentally matter, and you can always do it either way, so you long as you’re consistent in how you refer to it. Example: if an _Invitation_ concept included the relation

```
inv: Person -> Person
```

you would have to make sure that you interpreted it consistently, so that _p.inv_ means either the persons invited by _p_ or the persons who have invited _p_, but not both!

**Unordered relationships**. Mathematically, a relation is always directed, and corresponds to a set of ordered pairs or arrows between objects. To represent a symmetric, unordered relationship, you can define a symmetric relation that includes pairs in both directions. Example: the _Friend_ concept may have a relation

```
friends: User -> User
```

that contains both _(u1, u2)_ and _(u2, u1)_ when users _u1_ and _u2_ are friends.

**Most abstract structures**. The state should not include structural decisions that needlessly complicate the state and limit the freedom of the implementer. In particular, don’t use a sequence (ordering some elements) when a set suffices. Example: you might think that the messages in a _Group_ concept should be stored as a sequence, but since none of the actions involve sequence manipulations, and each message can appear only once, a set of messages is better. If you want the concept to contain enough information for messages to be displayed in order, you can associate a date with each message and assume the mapping of the concept to the user interface sorts messages by date.

**Abstract types**. Don’t use a primitive type that has properties that aren’t necessary for the concept behavior. Example: a _Ticket_ concept may generate identifiers for tickets which, in the implementation, will happen to be integers that are generated in order. In the concept design, however, all that matters is that the ticket identifiers are distinct, so you should introduce an abstract type _TicketId_ to represent them rather than using _Int_.

**Richer abstract types**. Another reason to introduce an abstract type is to record in the design that a type will have _more_ properties than a primitive type. Example: rather than representing an email address as _String_, represent it as an abstract _EmailAddress_ type, to capture the fact that email addresses have a particular form that can be validated.

**Polymorphism**. In an app that you’re designing, a concept will often be motivated by a need that is related to a particular kind of object, but the concept itself will not rely on any properties of that object. Example: a _Hold_ concept in a library app that governs how borrowers place holds on books need only associated borrowers with books, and doesn’t need the borrowers or the books to have any particular properties.

Types of objects that are not specific to the concept (and are generated by it) should be represented by type parameters, making the concept _polymorphic_ or generic. Example: the _Hold_ concept might be declared as _Hold<User, Item>_, where _User_ and _Item_ are type variables (that is placeholders for concrete types that will be provided when the concept is used).

**Carrier types**. A concept will often introduce a type to represent a set of objects that is central to the concept. In this case, you can overload the name and use it for both the concept and the type, disambiguating them by context. Example: the _Group_ concept has a set of groups of type _Group_; the _Post_ concept has a set of posts of type _Post_; the _Invitation_ concept has a set of invitations of type _Invitation_. When instantiating a polymorphic concept, you can refer to these types in a qualified name. Example: an _Upvote_ concept is defined polymorphically over a generic type of _Item_ (the items that are upvoted).

Example: the _Hold<User, Item>_ from the library app might be instantiated as _Hold<User.User, LibraryCatalog.Book>_ with a _User_ type from a _User_ concept and a _Book_ type from a _LibraryCatalog_ concept.

**No external types**. Concepts should be fully independent of one another. This is what makes them understandable to users and reusable across applications and even domains. So a concept’s state should never refer to types that are introduced in another concept. Example: an _Upvote_ concept in a social media app should not refer to the type of posts of a Post concept through a state component such as

```
concept Upvote
state
  upvotes: Post -> set Vote
```

Instead, any type whose objects will (at runtime) come from another concept should be declared as a type parameter so that the concept is fully generic (see _polymorphism_ above):

```
concept Upvote <Item>
state
  upvotes: Item -> set Vote
```

This principle will actually force you to introduce polymorphism whenever objects are to be shared between concepts, because there’s no other way to say that a type in one concept matches a type in another (except for the primitive types such as _String_).

**Primitive types**. The standard primitive types are assumed to be defined globally, so a concept can refer to types such as _String_, _Integer_, _Bool_, etc., and use their standard operations (such as concatening strings, adding integers) in defining actions.

**Sequences**. When an ordered collection of elements is needed, a sequence can be used. Example: in a _Chatbot_ concept, the transcript is a sequence of queries and responses:

```
Query, Response: set Entry
transcript: seq (Query + Response)
```

(The plus is a union operator, so _Query + Response_ is the set that includes both queries and responses.)

**Concepts aren’t classes.** A common misunderstanding is to think of a concept as a class that has instances, with the concept’s state variables being the instance variables of the class. Example: you might write

```
concept User
  state
    friends: set User
```

imagining a collection of user objects each of which points to a set of friends. This is wrong, and assumes a much more complicated set up in which types occurring in state declarations can themselves be concepts. The correct view is that a concept is a state machine whose non-primitive types denote objects only in the sense that they have identity, not in the object-oriented sense of carrying methods and so on. The correct way to write this concept is

```
concept Friend <User>
  state
    friends: User -> User
```

which introduces a _Friend_ concept that stores a friend graph.

## Concept criteria: what's a concept?

### Two sides of a coin

The key to concept design is, perhaps not surprisingly, the idea of _concepts_. A concept is two things at once. On the one hand, a “concept” means you’d expect it to mean: a mental construct that you need to understand to be able to use an app effectively. So you might that to use Photoshop you need to understand the “concept of a layer”; to use Facebook you need to understand the “concept of friending”; and so on. But if concepts were just vague mental constructs, there wouldn’t be much you could do with them.

On the other hand, a concept is a coherent unit of functionality. In this sense, concepts belong to the long line of modularity mechanisms in software that include procedures, classes, abstract data types, processes, and so on.

The novelty of concepts comes in part from the way in which these two views are aligned. The concept as a mental construct is the same concept as the functional unit. The alignment of these two makes concepts a little unusual when viewed through these two perspectives.

### A new kind of mental construct

Because the concept as a mental construct corresponds to a unit of function, it is inherently dynamic. Many people think of concepts as static, often as a form of classification in which a concept (“pond”, say) is defined as a set of objects (bodies of water, say) that have certain properties (small, still, land-based, etc). In concept design, however, concepts are defined by their dynamic behavior. A _restaurant reservation_ isn’t a category of things in the world that you’d identify by classifying all possible things (dogs, car dealerships, headaches, etc) and then rejecting the ones that don’t match. Imagine a Martian appearing on Earth and asking you to explain what a _restaurant reservation_ is. You wouldn’t explain how to distinguish one from other things (a social security number, a tax return). You’d explain it by saying what it’s for (to help diners so they can be confident a table will be available, and to help restaurant owners fill their tables) and how to use (call the restaurant, pick an available time, and then turn up at that time).

### Three parts

This explanation has demonstrated three essential parts of a concept: the _name_ (“restaurant reservation”), the _purpose_ (ensuring a table will be available) and the _operational principle_ (picking a time in advance and turning up at that time).

### A new kind of functional unit

Just as the requirement to correspond to functionality makes a concept an unusual kind of mental construct, so the requirement to a mental construct makes a concept an unusual kind of functional unit. Most importantly, a mental construct has to be understandable without reference to other mental constructs. This property of _independence_ is what makes mental constructs understandable.

For example, the concept of a “comment” in a social media app is easy to understand because you don’t need to know anything else. The purpose is for people to share their reactions to particular artifacts, and the operational principle is simply that you pick your artifact, write your thoughts, and they then appear associated with the artifact.

In practice of course that artifact that the comment is about will be a social media post, or perhaps a reply, or maybe even another comment. But you don’t need to know that to understand what the concept of a “comment” means; the concept is independent of whatever it’s attached to. In computer science lingo, the concept is “polymorphic.”

**Why go to the trouble?** The reason for defining concepts this way isn’t just to align the mental model and functional units views. It’s that the properties concepts end up having make them a particularly way to modularized function. In particular, the independence of concepts makes them more likely to be reusable in different contexts, not only at the design level but at the implementation level too.

## Concept Criteria

### Uses of criteria

A more comprehensive list of criteria can be given for distinguishing concepts from other things. These criteria are useful for a variety of purposes:

- When learning concept design, they help you understand the difference between concepts and other kinds of software notions (such as entities, classes, features, microservices, etc).
- When analyzing an application, they help you identify coherent units of functionality that shape the app and characterize it.
- When designing an app, they help you recognize the larger units of functionality whose design can be pursued independently.

### The criteria

Here is a list of criteria that every concept must satisfy:

- **User facing**. Concepts are always experienced by the user of an application. So the structures that are only internal to an application and are hidden from the user are not concepts. Of course an implementation structure may support a user-facing concept. And programmers themselves should be viewed as users when considering the design of an API.
- **Semantic**. Concepts are made of static and dynamic structures that are abstract and semantic in nature. A user interface widget is not a concept, nor is a color scheme or a UI skin.
- **Independent**. A concept can be understood by itself without reference to other concepts. In contrast to classes in OOP, there are no “dependencies” that link one concept to another and prevent the former from being used without the latter.
- **Behavioral**. Every concept has a behavior associated with it. Usually the behavior is quite simple. For example, in the upvoting concept, when people upvote items, the items with the most upvotes rise to the top of the ranking. Applications can have much more complex behaviors, of course, but these are often due to the interactions of many small concepts.
- **Purposive**. A concept serves a particular purpose that is intelligible to its users and that brings real value by itself. Something pretending to be a purpose may just be a role played in a larger context. For example, the concept of a social security number has the purpose of allowing the government to associate pensions with individuals. The action of obtaining a social security number may seem at first to have a purpose (“getting a social security number”?) but on reflection you’ll realize that’s just a role it plays in the larger concept, and by itself it delivers no real value.
- **End-to-end**. A criterion related to being purposive and independent is that a concept’s functionality must be end-to-end. A user authentication concept, for example, couldn’t include actions for registering an account but not also include the authentication action itself. (To check that a concept is end-to-end, try writing an operational principle, and if it takes the form “when this action happens, the state is updated in this way” you’ll know something is missing.)
- **Familiar**. Most concepts are familiar to users. This is what makes it possible for users to start using a new app without reading a manual. Of course an app can have new concepts, but novelty can come even more a new combination of old concepts, or subtle adjustments to them. The key concepts used in social media (post, friend/follow, upvote, reply, comment, hashtag, etc) appear in almost an identical form in every app (Facebook, Twitter/X, Instagram), albeit with some small variations that may have significant impacts on usage (such as Instagram’s better support for images, or Twitter/X’s restricted post length).
- **Reusable**. As a consequence of many of these criteria (being purposive, embodying end-to-end functionality, independence, etc), concepts are often reusable in different contexts. For example, Zoom introduced the concept of a meeting identifier (whose purpose was to allow parties to join a meeting without requiring each participant to be called), but it was eventually copied by Google Meet and Microsoft Teams.

### Distinctions

We can apply these criteria to distinguish concepts from some other software constructs:

- **Classes**. Classes in OOP (and similarly abstract data types) are not generally user-facing, and are rarely independent.
- **Features**. Application features are indeed user facing, but they are usually not independent. Typically a feature is defined in terms of some base functionality; without that, the feature may be hard to understand. For example, one feature of Instagram is that “accounts can be made private”; from a concept design point of view, this is an augmentation of the follower concept with an approval mechanism that some users can elect to use.
- **User stories**. In agile development, user stories are a popular way to organize requirements. A single user story, however, may not be end-to-end (or purposive). For example, the story “As a teacher, I would like to record which students in my class are present today” does not, by itself, bring any value. From a concept design point of view, the concept might be attendance, and it would cover not only daily entry of attendance data but also end-of-term summaries, and perhaps also repeated absence warnings, etc. Because user stories are not end-to-end, I am concerned that they cannot be properly evaluated and so are not appropriate increments of functionality for implementation.
- **Microservices**. Microservices are a popular way to structure large applications. But because they aggregate many distinct pieces of functionality with distinct purposes, and because they are not generally independent of one another, they are not usually reusable either.

## Concept composition and sync

In another [tutorial](https://essenceofsoftware.com/tutorials/concept-basics/concept-as-machine), I showed a concept definition for [Yellkey](https://yellkey.com/), a popular URL shortening service:

```
concept Yellkey
purpose shorten URLs to common words
principle
  if you register a URL u for t seconds
  and obtaining a shortening s, looking up s
  will yield u until the shortening expires
  t seconds from now
state
  used: set String
  shortFor: used -> one URL
  expiry: used -> one Date
  const shorthands: set String
actions
  // register URL u for t seconds
  // resulting in shortening s
  register (u: URL, t: int, out s: String)
    s in shorthands - used
    s.shortFor := u
    s.expiry := // t secs after now
    used += s

  // lookup shortening s and get u back
  lookup (s: String, out u: URL)
    s in used
    u := s.shortFor

  // shorthand s expires
  system expire (out s: String)
    s.expiry is before now
    used -= s
    s.shortFor := none
    s.expiry := none
```

Although it’s fairly simple and straightforward, there’s something unsatisfying about this concept.

The [criteria](https://essenceofsoftware.com/tutorials/concept-basics/criteria/) for concepts include being familiar and reusable. The essential functionality that this concept offers—shortening URLs—is common to many different shortening services, some freestanding (such as tinyurl.com) and others embedded in larger applications (eg, Google short URL option in Google Forms). But this concept would not be a good match for those other settings because it includes the expiration functionality.

What’s going on here is that we seem to have two concepts: one about URL shortening and the other about expiry. Can we disentangle these?

## Factoring concepts

Here’s how we might factor the Yellkey concept into two more basic and reusable concepts. First, we define a concept that provides shorthands:

```
concept Shorthand [Target]
purpose provide access via shorthand strings
principle
  after registering a target t and obtaining
  a shorthand s, looking up s will yield t:
  register (t, s); lookup (s, t') {t' = t}
state
  used: set String
  shortFor: String -> opt Target
  const shorthands: set String
actions
  register (t: Target, out s: String)
    s in shorthands - used
    s.shortFor := t
    used += s
  unregister (s: String)
    s in used
    used -= s
    s.shortFor := none
  lookup (s: String, out t: Target)
    s in used
    t := s.shortFor
```

This is just like our Yellkey concept, but the expiry-tracking functionality has been removed. Note also that I’ve made the concept _polymorphic_: it no longer translates shorthands into URLs, but into objects of some unspecified type _Target_. This would allow the _Shorthand_ concept to be used in many more contexts; you could have shorthands for file paths in a file system, for example, or for commands in a user interface.

Now we turn the expiry-tracking functionality into its own concept:

```
concept ExpiringResource [Resource]
purpose handle expiration of short-lived resources
principle
  after allocating a resource r for t seconds,
  after t seconds the resource expires:
  allocate (r, t); expire (r)
state
  active: set Resource
  expiry: Resource -> one Date
actions
  allocate (r: Resource, t: int)
    r not in active
    active += r
    r.expiry := // t secs after now
  deallocate (r: Resource)
    r in active
    active -= r
    r.expiry := none
  renew (r: Resource, t: int)
    r in active
    r.expiry := // t secs after now
  system expire (out r: Resource)
    r in active
    r.expiry is before now
    active -= r
    r.expiry := none
```

Again, I’ve made this polymorphic, so that any kind of resource can have its expiry tracked. This concept could be used to implement (the rather mean) control that turns off wifi access after the time paid for has passed.

And because I’m anticipating using this concept in a more general setting, I’ve included two additional actions that let you deallocate a resource before it expires, or renew so that its life is extended.

## Composing concepts with syncs

Now we need to put our two concepts together to recover the functionality of our original Yellkey concept. We do this by first instantiating the concepts with the appropriate types:

```
app YellKey
  include HTTP
  include Shorthand [HTTP.URL]
  include ExpiringResource [HTTP.URL]
```

I’ve included a concept called HTTP that I haven’t specified that defines the URL type. In a fuller description of Yellkey, this concept would allow us to augment the lookup with a redirect.

With the concepts in hand, we now associate their actions through _synchronizations_:

```
  sync register (url: URL, short: String, life: int)
    when Shorthand.register (url, short)
    ExpiringResource.allocate (short, life)

  sync expire (out short: String)
    when ExpiringResource.expire (short)
    Shorthand.unregister (short)

  sync lookup (short: String, url: URL)
    Shorthand.lookup (short, url)
```

A synchronization (or “sync”) constrains the executions of the concepts so that whenever one particular action occurs in one concept, some other actions occur in other concepts. So the first one says that when a shorthand is registered (in the Shorthand concept) that same shorthand is allocated as a resource (in the ExpiringResource concept). The second one says that when a shorthand expires (in ExpiringResource) it is unregistered (in Shorthand). The third sync includes only one action; its effect is just to make the lookup action (in Shorthand) available as an application action.

Concept actions that aren’t mentioned in syncs don’t occur in the application. Actions like Shorthand.unregister are excluded because Yellkey only lets you register shorthands and doesn’t let you unregister them. Similarly, you can’t renew a shorthand (even though the ExpiringResource includes an action to describe that functionality).

## Concept synergy

In any design, composing concepts brings to whole (the overall app) the benefits of each of the parts (the constituent concepts). In some designs, something magical happens, and the benefit to the whole is more than the sum of the benefits of the parts. This is _compositional synergy_.

Such a synergy occurs here. You might think that composing with ExpiringResource would add only a limitation from the user’s perspective: that a resource that would otherwise be free is now limited. But in this case, there is a real benefit that comes with this limitation. Because the shorthands have brief lifetimes, it’s possible to serve the same size user base with a much smaller dictionary of possible shorthands (the set-valued _shorthands_ component in Shorthand), and that means that the shorthands can all be familiar words.

## Another example: user sessions

Factoring Yellkey into more basic concepts may not seem very surprising since it’s not (yet at least) a design pattern that is used elsewhere. But sometimes even a concept that seems to be a widely used pattern can profitably be broken down into more elemental concepts.

The standard functionality that governs website sessions is such a case. Although we could easily describe it as a single concept, we can expose more structure (along with more opportunities for reuse) by treating it as a composition.

First, let’s define the most basic form of user authentication in which a user registers with a username and password and can later authenticate by entering the same username and password:

```
concept User
purpose authenticate users
principle
  after a user registers with a username and password,
  they can authenticate as that user by providing a matching
  username and password:
  register (n, p, u); authenticate (n, p, u') {u' = u}
state
  registered: set User
  username, password: registered -> one String
actions
  register (n, p: String, out u: User)
    u not in registered
    registered += u
    u.username := n
    u.password := p
  authenticate (n, p: String, out u: User)
    u in registered
    u.username = n and u.password = p
```

The state holds the set of registered users, and for each of them, a username and password. The _register_ action allocates a user identity (which is an output of the action) and associates the provided name and password with it. The _authenticate_ action has no effect on the state; its specification consists only of a precondition that the provided name and password match those of some registered user, whose identity is returned.

Now we define a separate concept to represent session management:

```
concept Session [User]
purpose authenticate user for extended period
principle
  after a session starts (and before it ends),
  the getUser action returns the user identified at the start:
  start (u, s); getUser (s, u') {u' = u}
state
  active: set Session
  user: active -> one User
actions
  start (u: User, out s: Session)
    s not in active
    active += s
    s.user := u
  getUser (s: Session, out u: User)
    s in active
    u := s.user
  end (s: Session)
    active -= s
```

The state here holds the set of active sessions, and for each one, the user associated with it. There’s an action to start a session, which takes a user and returns a fresh session identifier; an action to end a session; and an action (performed mid-session that obtains the associated user).

Now we can assemble the conventional user session by synchronizing these two concepts:

```
concept UserSession
  include User
  include Session [User.User]

  sync register (username, password: String, out user: User)
    User.register (username, password, user)

  sync login (username, password: String, out user: User, out s: Session)
    when User.authenticate (username, password, user)
    Session.start (user, session)

  sync authenticate (s: Session, u: User)
    Session.getUser (s, u)

  sync logout (s: Session)
    Session.end (session)
```

The actions of the composition are:

- _register_: the user registers with a username and password; this is just the _register_ action of the User concept;
- _login_: the user authenticates with a username and password (in the User concept) and a fresh session is allocated (in the Session concept);
- _authenticate_: the user is spontaneously authenticated mid-session by the execution of the _getUser_ action of Session;
- _logout_: the user closes the session with the _end_ action of Session.

## Concepts are abstract

It’s important to understand that a concept describes a pattern of behaviors that users may observe. It may be implemented in a single computing device, but that is not necessary. The state may be distributed, with even a single component spread across nodes, and the actions likewise can be performed at different locations.

In a standard web stack, the User and Session states are both stored on the server. To enable the client to present a session identifier to the server, there is usually an additional piece of distributed state, which could be modeled like this:

```
cookies: Client -> opt Session
```

Each client is optionally associated with a session identifier; this information is typically stored in a cookie that the server sends to the client browser that is then set aside and sent back to the server with every request to its domain.

Actions likewise are abstractions, and a single action typically corresponds to a (potentially elaborate) sequence of steps. For example, when the user executes _login_, the following steps typically occur:

- The user enters a username and a password in a web form and clicks the submit button;
- The client program running in the user’s browser makes an HTTP request to the server with this data;
- A controller method executes in the server, and requests are made to a database, often running on another machine;
- The session identifier is returned, encrypted, in a cookie to the client, which saves the cookie locally.

## Why more basic concepts are better

To see why factoring this functionality into two concepts makes sense, consider some variant designs:

- _Biometric authentication_. Suppose the user logs in not with a username and password, but rather using some biometric property. To accommodate this, we can just swap out the password based authentication for a biometric authentication concept. The Session concept remains unchanged.
- _Mid-session authentication_. Some apps that have sessions still require an explicit user authentication in the middle of a session for extra security. For example, if you try to execute a large financial transaction on a banking app, you will typically be required to enter your username and password again even if you’re already logged in. This is easily accommodated with the existing _authenticate_ action in User. If we hadn’t had a separate concept, we would have needed to add a new action.
- _Non-session authentication_. Some situations use authentication without sessions at all. For example, some apps let you unsubscribe from a service by clicking on a link that opens a browser but then requires you to enter your username and password to perform that one action. And operating systems often require you to authenticate for certain actions: MacOS requires authentication for opening apps for the first time, for example, and for any action that requires superuser status. This functionality would require the creation of the User concept if it hadn’t already been defined.

## Making sessions expire

It’s regarded as good security practice to terminate sessions automatically after some time has passed. This is especially important when the app is running on a public machine, and if a user forgot to check out, the next user would be able to use their existing session.

How can we achieve this? You saw this coming: we can use our friend the ExpiringResource concept. All we need to do is treat sessions as resources, allocating them when sessions start, and ending sessions when the resources expire:

```
concept ExpiringUserSession
  include User
  include Session [User.User]
  include ExpiringResource [Session.Session]

  sync register (username, password: String, out user: User)
    User.register (username, password, user)

  sync login (username, password: String, out user: User, out s: Session)
    when User.authenticate (username, password, user)
    Session.start (user, session)
    ExpiringResource.allocate (session, 300) // set expiration to 5 mins

  sync logout (s: Session)
    when Session.end (session)
    ExpiringResource.deallocate (session)

  sync authenticate (s: Session, u: User)
    Session.getUser (s, u)

  sync terminate (s: Session)
    when ExpiringResource.expire (s)
    Session.end (s)
```

## Concept dependencies and subsets

### An idea you need to know

One of the most important and useful ideas in software also happens to be one of the least well known. It was introduced in a [paper](https://ieeexplore.ieee.org/document/1702607) that David Parnas wrote in 1979, entitled _Designing Software for Ease of Extension and Contraction_.

**Program families**. Following on from an earlier paper that introduced the idea of “program families”—that when you design software you should realize that you’re designing a whole family of programs, not just one—this paper addresses the question of how to do this. How do you come up with one design that can be easily extended (by adding new functionality) or contracted (by removing functionality)?

**Four flaws**. Parnas starts with four flaws that make programs hard to extend or contract. Two are particularly relevant to concept design. One is having a component that serves two different functions. Concept design avoids this by demanding _specificity_: that each concept has only one purpose. The other is the presence of excessive dependencies. Concept design avoids this by requiring that there are _no_ dependencies between concepts.

**The uses relation**. Parnas then introduces his big idea as a way to address these problems. He calls it the “uses relation.” Today we’d call it a _dependency diagram_.

**A snarky remark**. Even back in 1979, Parnas was aware of the fact that this idea was getting less attention than it deserved. He wrote rather snarkily:

> After studying a number of such systems, I have identified some simple concepts that can help programmers to design software so that subsets and extensions are more easily obtained. These concepts are simple if you think about software in the way suggested by this paper. Programmers do not commonly do so.

In writing this post, I hope to do my part in putting this right, albeit 40 years later!

### Defining subsets

**The dependency diagram**. Here’s the idea. Suppose our program has components A, B, C, D, etc. We draw a graph with components as nodes and an edge from one component _x_ to another component _y_ if any member of the program family that includes _x_ must also include _y_.

For example, in this diagram the edges from A to B and C mean that any program that includes A also includes B and C; and the edge from B to D means that any program including B includes D.

![[Pasted image 20250724170011.png]]

This diagram now implicitly defines a collection of subsets corresponding to each of the programs that might be built. So one subset, for example, is the program that contains only D; another contains B and D. On the other hand, B and C do not form a legitimate program, because any program containing B must also contain D.

Listing all the possible subsets, we get:

```
{}, {C}, {D}, {B, D}, {C, D}, {B, C, D}, {A, B, C, D}
```

(I’ve rather pedantically included the empty subset, since it obeys the rules, but admittedly it’s not a very useful program.)

## Concept subsets

Let’s apply this idea to concepts. Suppose we have a social media app that has the following concepts:

```
Post: share content with others
Comment: share reactions to content
Friend: limit access to your content
User: authenticate a participant
```

Now let’s construct the diagram by taking each of these concepts in turn and asking which other concepts it would require.

This question is more subtle than it first appears to be, because it forces you to think about variants of a program that might be unfamiliar.

So we start with _Post_. Now you might assume that a post needs a user to author it. But that’s not true. It would be perfectly possible to have an app in which someone can create a post (and even write in their name as the author) without any kind of user authentication. Admittedly, this might not work too well for a large-scale social media app, but it might be just fine for a noticeboard inside an organization. (A puzzle for curious readers: what would the consequences be of not having a _User_ concept if the _Post_ concept included an _edit_ action?)

The _Comment_ concept is simpler. It clearly requires the _Post_ concept, because if there are no posts, there’s nothing to comment on!

How about _Friend_? You might imagine that _Friend_ could be present without _Post_, in an app that lets you navigate a graph of friendships independently of any content. And indeed, that’s how friending worked in the earliest social media apps (notably [Friendster](https://en.wikipedia.org/wiki/Friendster)).

But the _Friend_ concept that we’re familiar with (from Facebook) is a very different beast. Its purpose is to not support navigation through the graph of connections but to control access to content (and also to filter what content you see, although that’s arguably a different purpose that should be separated out). Moreover, if the _Friend_ concept were to play the role it played in apps like Friendster, we’d need an additional concept to hold information about a user (such as _Profile_ or _HomePage_), but no such concept is present in our design.

Consequently, _Friend_ must require _Post_, because without content there can be no access to control. _Friend_ also requires _User_, because it can’t work without authors of posts being authenticated.

Finally, _User_ itself requires _Friend_, because without _Friend_ there is no reason to include _User_.

The resulting diagram looks like this:
![[Pasted image 20250724170030.png]]

### Using the dependency diagram

So now you have a dependency diagram, what can you do with it?

**Clarifying the role of concepts**. First, let’s recognize that the construction of the diagram alone forced us to think hard about the role the concepts play in our design. If we’d just thrown the concepts together and not considered their dependencies, we would surely have realized that _Comment_ builds on _Post_, but we might not have understood how _Friend_ and _Post_ are related.

**Subsets: a family of programs**. One dependence diagram defines a collection of possible subsets. For our social media app, we have the following subsets

```
1. {Post}
2. {Comment, Post}
3. {User, Friend, Post}
4. {User, Friend, Post, Comment}
```

each corresponding to a different app: (1) a noticeboard app in which people can post anonymous or unauthenticated messages; (2) the same app with comments; (3) a rudimentary social media app with user authentication and a friend network; (4) the same app with comments.

**Explanation order**. An advantage of using familiar concepts is that they don’t need to be explained to most users. But there will always be a need for training material that explains how to use an app, especially when the app is complex or contains novel concepts. Because concepts are freestanding and can be understood independently of one another, they can be presented separately.

But if you’re explaining concepts in some order, or encouraging users to learn them in some order, the diagram can suggest orders that make the most sense. The rule is that if concept A requires concept B, you want to explain B before A. So that means that an order such as

```
<Post, Comment, Friend>
```

is good, but

```
<Friend, Comment, Post>
```

is less good, because the _Friend_ concept isn’t motivated until you see _Post_ (when you can explain that the idea is to share posts with your friends), and likewise _Comment_ doesn’t make sense until you’ve seen _Post_.

Note, by the way, that the mutual relationship between _Friend_ and _User_ means that there’s no order of one concept at a time that satisfies the rule: those two have to be explained together.

### Intrinsic dependencies

**Concrete descriptions**. Let’s move to thinking of software components not in terms of abstract functionality but in terms of their description, whether some text describing a component at the design level, or some code that implements a component.

**Intrinsic dependencies**. Now the possibility arises that a component contains an explicit reference to another component. At the abstract level, its design mentions the other component; or at the code level, it makes a call to it (for example). I call such a dependency an “intrinsic dependency” because it’s part of the component itself rather than a property of the overall design. When is such a dependency legitimate?

**Parnas’s rule**. In his paper, Parnas gives the following rule: if a component A has an intrinsic dependency on a component B, then there should be no plausible subset that contains A but not B.

That sounds complicated, but it’s really very simple. Putting it more simply:

```
If you can’t use A without B, you should never want to use A without B.
```

**The uses relation**. True confessions: Parnas doesn’t start with the interpretation of the diagram that I started with. In fact, he follows exactly the reverse path. He suggests that you construct a “uses relation” with an edge from A to B whenever A _uses_ B (that is, has an intrinsic dependency on it). The diagram you obtain from this then defines the subsets that are actually _possible_; you then check it to see if they are _desirable_ (or more accurately that some important subsets are _not possible_).

**Example of bad code**. For example, suppose we were building our social media app in an object-oriented style, and we defined two classes _Post_ and _Comment_ that implemented those concepts. Now suppose that each post contained a list of the associated comments:

```
class Post {
  List<Comment> comments;
  ...
  }
```

This is, in fact, the way many inexperienced programmers might write this code. Notice that this introduces an intrinsic dependency of _Post_ on _Comment_. According to Parnas’s rule, that means there should be no variant of the app in which there are posts but no comments.

Clearly that’s absurd! The intrinsic dependency is exactly the wrong way round. If there were to be a dependency, it should be of _Comment_ on _Post_, and not _Post_ on _Comment_.

Unfortunately, achieving that is not so easy in OOP. The problem is that dependencies tend to follow the direction of data navigation, and since the programmer will likely want to go from a post to its associated comments (so they can displayed along with the post), the dependency goes in that direction too.

There are various ways around this in OOP, but that’s another subject. So I’ll just point out here that the problem doesn’t arise in a relational setting, in which the _Post_ and _Comment_ concepts are implemented as modules each with their own database tables. The _Comment_ concept can then hold a table mapping posts to comments, and navigating from a post to its comments just involves performing a relational join.

**Applying this to concepts**. Back to concepts. Unlike many other kinds of software modules, concepts are always [independent](https://essenceofsoftware.com/tutorials/concept-basics/criteria/), so there are no intrinsic dependencies. That’s why I started with subset interpretation of the dependency diagram: it’s the only one that matters.

**Independent? What?**. Aren’t I contradicting myself? I’ve just said that concepts are always mutually independent, but doesn’t the dependency diagram show dependencies? The resolution of this apparent contradiction is that we’re talking about two different kinds of dependencies. Concepts have no _intrinsic_ dependencies, but they have dependencies in the _context_ of the application design.

So the _Comment_ concept has no intrinsic dependence on the _Post_. To understand comments, you don’t need to know about posts. This is achieved by describing the _Comment_ concept generically in terms of some arbitrary targets that comments can point to; they could be posts, but they could also be newspaper columns or answers in a Q&A forum. In computer science lingo, _Comment_ is _polymorphic_.

But in the context of our social media app, including the _Comment_ concept makes no sense without the _Post_ concept, because there aren’t any other suitable targets for the comments. So there is an _extrinsic_ dependency of _Comment_ on _Post_, but not an intrinsic one.

**A parting thought**. Lest you imagine that intrinsic dependencies are simple, let me make your life a bit harder. When you try to pin down exactly what it means for one component to “use” another, most simple attempts fail. You might start by saying that A uses B if A makes a call to B. But then a round-robin scheduler that calls each of its tasks in turn “uses” those tasks (even though it’s actually the tasks that depend on the scheduler). In a [paper](https://groups.csail.mit.edu/sdg/pubs/2020/demystifying_dependence_published.pdf) I wrote with [Jimmy Koppel](https://www.jameskoppel.com/), we present a collection of such puzzles, and suggest some ideas for a more robust notion of intrinsic dependency.

## Concept modularity

### Why modularity matters

To see why modularity is so critical in software design, consider what goes wrong when it’s missing.

For the programmer, life becomes miserable. Whenever you need to understand or modify some piece of functionality, there’s no single place in the code to go to, and you may have to visit many widely separated locations (and just finding them can be a major challenge). Even removing (let alone adding) functionality is hard, because the parts of the codebase are all interconnected in subtle ways, and taking anything away risks breaking the parts that remain.

For the user, things are bad too. It’s possible that the code has no modularity but that, viewed from the user’s perspective, the app is perfectly modular. But this is unlikely, and poor modularity in the code is usually reflects a lack of structure in the app’s functionality. Consequently, users have trouble understanding how the software works, because the individual functions aren’t separable. Everything is interconnected, and to understand one part you have to understand another, and then another…

### Modularity: the holy grail of software

Not surprisingly, then, achieving modularity has been a central goal of programming practice, and a primary motivation in software engineering and programming language research for decades.

We’ve invented a host of new abstractions (functions, closures, abstract types, objects/classes, streams, etc), new programming paradigms (functional, object-oriented, [aspect-oriented](https://en.wikipedia.org/wiki/Aspect-oriented_programming), [subject-oriented](https://en.wikipedia.org/wiki/Subject-oriented_programming), [role-oriented](https://en.wikipedia.org/wiki/Role-oriented_programming), [process-oriented](https://en.wikipedia.org/wiki/Process-oriented_programming), [reactive](https://en.wikipedia.org/wiki/Reactive_programming), [prototype-based](https://en.wikipedia.org/wiki/Prototype-based_programming), [actor-based](https://en.wikipedia.org/wiki/Actor_model), …), principles ([information hiding](https://en.wikipedia.org/wiki/Information_hiding), [representation independence](https://web.mit.edu/6.031/www/sp17/classes/12-abstract-data-types), the [Liskov substitution principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle), the [Law of Demeter](https://en.wikipedia.org/wiki/Law_of_Demeter)), and patterns (for [object-oriented code](https://www.oreilly.com/library/view/design-patterns-elements/0201633612/), [enterprise architectures](https://www.oreilly.com/library/view/patterns-of-enterprise/0321127420/) and more)—all of which are motivated by improvements in modularity.

And it’s not just in software; modularity may be the [most valuable asset](https://direct.mit.edu/books/book/1856/Design-RulesThe-Power-of-Modularity) in design.

### Where concept design comes in

The new idea in concept design is that modularity is born not in the code, but in the _function_ of the software. If you can structure an app’s functionality in a modular way, then you can carry over that modularity to the code.

And because the function is modular, users will be able to understand it in a modular way. This is essential for usability, because it lets users learn how to use an app in pieces incrementally, and reuse their knowledge across systems.

A concept is a bundling of functionality that meets three modularity criteria:

- _Specificity_: The concept fulfills a specific [purpose](https://essenceofsoftware.com/tutorials/concept-basics/purpose/) that brings real value to the user, and does not mix, multiple separable purposes.
- _Completeness_: The concept’s functionality meets its purpose fully.
- _Independence_: The concept stands by itself, without reference to other concepts.

Let’s now look at each of these criteria in turn, see why they’re needed, how they might be violated, and what you have to do make them hold.

### Specificity

Having a specific purpose includes having enough function to bring real value, but not so much that separable purposes are being mixed.

For example, consider a _User_ concept whose purpose is to provide authentication of users. Almost all web-based apps include this concept. Suppose the concept just included registration, in which a user creates an identity by providing a username and a password.

This might be regarded as a reasonable increment of functionality in some approaches. As a [user story](https://en.wikipedia.org/wiki/User_story), it might be expressed like this: “As a customer, I can create register as a user so that I can go shopping.”

But in fact registering brings no real value to the user, because without the functionality associated with the subsequent authentication check, registration does nothing useful. The value that the user receives (which is more about other users bring prevented from acting on their behalf) is provided by the authentication mechanism in its entirety. So the purpose must be user authentication, and not user registration alone.

This would be apparent if you tried to write an [operational principle](https://essenceofsoftware.com/tutorials/concept-basics/principle/):

```
concept User
purpose
  help users register for services
principle
  after a user registers... ???
actions
  register (name, password: String, out u: User)
```

There’s no way to complete the scenario because there aren’t any other actions to include! And when you start trying to figure out what action you might add, you’ll see that the one you need is the authentication checking action.

You might be tempted to expand the purpose to include all user-specific settings. For example, perhaps each user has a display name, and an avatar. These are not relevant to the purpose of authentication, however; they serve a different purpose (letting users choose how to present their identities to others), and should be part of a different concept.

Ensuring that a concept has a single, specific purpose makes it more understandable. If _User_ included the avatar feature, you might start wondering whether that plays a role in authentication somehow. And it makes it more reusable by unbundling features: you might want authentication without avatars, for example.

In practice, formulating a suitably narrow purpose can be tricky, and often the easiest way to do it is to consider which particular features would be included in the concept’s functionality. Then, as you realize that certain features should be included (both registering and checking) and that others should be excluded (display names and avatars), you can refine your purpose accordingly (in this case, that the purpose is simply authentication and nothing more).

### Completeness

Completeness just means that the concept includes all the functionality needed to fulfill the purpose. So if the purpose of _User_ is authentication, then offering registering without checking is obviously insufficient.

A concept may fail to be complete for more subtle reasons. Suppose our _User_ concept supported checking by offering an action that, given a user id, username and password, returns an indication of whether or not the username and password are correct for that user. This design fails to fulfill the purpose completely, because when the check is applied, the identity of the purported user isn’t known! Instead, the concept must include a lookup, for example by having the action take the username and password and return the user identity (if a matching one exists).

This example might seem silly and pedantic, but it illustrates a key difference between concepts and classes in object-oriented languages. In an object-oriented implementation of user authentication, you might have a _User_ class with each instance holding a username and password. The functionality I just mentioned would be exactly what such a class provides, and it wouldn’t support the lookup. For that, you’d need to add a static component to the class that maps usernames to _User_ objects. Using static state isn’t really in the spirit of object-oriented programming through, so you might instead create a _Registry_ class each instance of which holds such a mapping. Thus a single concept becomes several classes that are tightly coupled together.

Finally, it’s worth noting that completeness only means that the purpose is _minimally_ satisfied. There are always additional features that might be desirable; for example, it would be useful for users to be able to change their passwords (and even their usernames).

Being complete ensures that all the functionality associated with the concept’s purpose is in one place, encapsulated within the concept.

### Independence

A concept not only has to meet its purpose completely, but it has to do it without the help of other concepts.

Recognizing that storing and checking passwords involves some non-trivial functionality (notably encrypting and salting), you might think to put it in its own concept.

That would be mistake, however. First, encrypting and salting passwords is not user-facing functionality, so it doesn’t make a good concept. Second, suppose you did factor it out, say into a Password concept, assuming the _User_ concept could delegate some functionality to it. Now your _User_ concept would fail the independence test, since it would require the Password concept to operate.

Concepts have no [dependencies](https://essenceofsoftware.com/tutorials/concept-basics/dependency/) of this sort, and have to self-contained. As a result a concept can’t fail because of a bug in another concept, and functionality is truly localized.

You may wonder whether this rule undermines some modularity in the code. It doesn’t, because nothing prevents you from implementing password salting and encryption in a separate module, which can be one of several modules realizing the concept.

Concept implementations will also inevitably depend on libraries for general services (such as string manipulation, arithmetic, file management, etc). So concept structuring won’t spare you entirely from the problem that fixing a bug in a function may require looking in multiple places. For example, your password encryption might fail because of a bug in a mathematical library.

But, in contrast to conventional design approaches, there won’t be pieces of connected functionality at the same _level_ in scattered locations (for example, passwords being encrypted in one place and decrypted in another, far away).

### Genericity

A concept may be functionally independent of other concepts while still mentioning them in its design.

Here, for example is a very rudimentary _Email_ concept:

```
concept Email
  purpose exchange of messages
  principle
    after a user sends a message to another user,
    they can receive that message
  state
    from, to: Msg -> one User
    body: Msg -> one String
  actions
    send (from, to: User, body: String, out m: Msg)
    recv (u: User, m: Msg)
```

This is obviously very simplified; the state is a global set of messages each of which is associated with the users it’s from and to, and some body. A more realistic description might include state components for holding sent and received messages, and an explicit system action for transferring messages from one to the other.

Here’s another concept, commonly used in mail clients:

```
concept Label
  purpose organize and filter messages
  principle after adding a label to a message m,
  if you get messages with that label, the message m will be included in the results
  state
    labels: Msg -> set String
  actions
    addLabel (msg: Msg, l: String)
    // return messages that have all labels in ls
    getMessages (ls: set String, out msgs: set Msg)
```

Again, this is obviously simplified: the concept would usually support rich queries over label combinations.

Notice that the _Label_ concept appears to depend on the _Email_ concept, because it mentions the _Msg_ type that it generates. But if you think about the behavior of _Label_, since it involves only the _identity_ of the messages (and not their content), the fact that the labeled items are messages is completely irrelevant. It matters only in understanding the role that the concept plays in the application as a whole.

So to make this clear and improve the concept, we can eliminate the reference to messages, and make it generic over some unspecified _Item_ type:

```
concept Label [Item]
  purpose organize and filter items
  principle after adding a label to an item i,
  if you get items with that label, the item i will be included in the results
  state
    labels: Item -> set String
  actions
    addLabel (i: Item, l: String)
    // return items that have all labels in ls
    getItems (ls: set String, out items: set Item)
```

This is much better because it makes it clear that _Label_ is a more general concept that allows the organization and filtering of any kind of item.

More subtly, our _Email_ concept has the same problem, because it refers to the type _User_, which presumably is the type of user objects generated by our _User_ concept. But again, the concept does not depend on the user objects having any particular properties, so we can make the _User_ type a parameter:

```
concept Email [User]
```

In this case, we could keep the references to “users” in the description of the concept, but if we wanted to be really pedantic we could replace it by a name (such as _Principal_ or _Account_) that makes it clearer that a human user might not be involved.

With all these generic concepts in hand, to describe our application we need to instantiate the type parameters:

```
app EmailClient
includes
  User
  Email [User.User]
  Label [Email.Msg]
```

This says that the type of users in the _Email_ concept will be the _User_ type from the User concept, and the type of the targets in the _Label_ concept will be the _Msg_ type from the _Email_ concept.

### Permutation invariant: for experts

We can make precise this idea that a type is generic with the notion of _permutation invariance_. Suppose there is some execution of the concept comprising a sequence of actions interleaved with the resulting states. Now imagine taking the elements of the set in a given type, for example all the user objects in the set _User_, and permuting them, swapping _u0_ and _u1_, swapping _u2_ and _u5_, and so on. If you applied this permutation to the execution, would the result also be a valid execution? This is just a fancy way of saying that all that matters is the _identity_ of the objects. If the answer is yes, then this permuted type is being treated generically.

This reasoning will tell you that the _Msg_ type in _Label_ and the _User_ type in _Email_ are generic. But it will also tell you that the _String_ type in both concepts is generic! That’s because the concepts don’t do any string-specific operations: they just store the strings. So the _Email_ concept, for example, could be written even more generically like this

```
concept Email [User, Content]
  purpose exchange of messages
  principle
    after a user sends a message to another user,
    they can receive that message
  state
    from, to: Msg -> one User
    body: Msg -> one Content
  actions
    send (from, to: User, body: Content, out m: Msg)
    recv (u: User, m: Msg)
```

making it clear that the concept works with any kind of content. For email this might seem a bit artificial, since email messages are always textual, But for a social media post concept the genericity is more important (since a post’s body might be text, image or a combination), and factoring out the content into specialized concepts (such as a concept for creating and formatting rich text) would be helpful.
