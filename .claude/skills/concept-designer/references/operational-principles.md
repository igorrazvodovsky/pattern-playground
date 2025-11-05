# Operational Principles

How to write compelling "if...then" scenarios that explain concept value.

## What is an Operational Principle?

An **operational principle (OP)** is a defining story that shows, through a typical scenario, why a concept is useful and fulfills its purpose. It takes the form:

**"If [user performs actions], then [system provides valuable result]"**

## Why Operational Principles Matter

OPs are compelling because they:
- **Show value**: Demonstrate why users would want this functionality
- **Enable learning**: People understand by observing scenarios around them
- **Guide design**: Focus on essential behavior, not implementation details
- **Facilitate communication**: Easy to explain concepts to stakeholders

## Operational Principles vs Use Cases

| Operational Principles | Use Cases |
|---|---|
| Few and brief | Comprehensive and numerous |
| Show essential value | Specify all requirements |
| Focus on success scenarios | Cover success and failure cases |
| Design communication tool | Requirements specification tool |
| Leave details unspecified | Define detailed behaviors |

## Examples of Good Operational Principles

### Real-World Systems
- **Library reservation**: "If I request a book, then when it becomes available at my local library, I get an email notifying me that it's ready to be picked up"
- **Social security**: "If you make payments every month while you work, then you will receive a basic income from the government after you retire"
- **Toaster**: "If you insert bread and press the lever, then after a few minutes the lever will pop up and your bread will be toast"

### Software Concepts
- **Follow**: "If you follow someone, then their new content appears in your feed"
- **Upvote**: "If you upvote quality content, then the best items rise to the top of rankings"
- **Bookmark**: "If you bookmark an item, then you can easily find it later in your saved list"
- **Tag**: "If you tag content with keywords, then you can find related items by searching those tags"

## Multiple OPs for Complex Concepts

Some concepts need multiple operational principles to explain different aspects:

### Snooze Alarm Example
1. **Basic alarm**: "If you set the alarm for a given time and turn it on, then when that time comes around, the alarm will ring"
2. **Snooze function**: "When the alarm starts ringing, you can press the snooze button, and it will stop ringing and start ringing again after some fixed time"
3. **Time persistence**: "If you set the alarm for a given time, do any sequence of actions except setting the time, and then turn it on, then it will ring when the given time comes around"

## Writing Effective Operational Principles

### Template Structure
```
If [user action/condition], then [system response that provides value]
```

### Quality Criteria

**Specific and Concrete**
- ❌ "If you use the system, then good things happen"
- ✅ "If you upvote quality content, then the best items rise to the top"

**Shows Clear Value**
- ❌ "If you click save, then the data is stored"  
- ✅ "If you bookmark an item, then you can easily find it later"

**User-Centered Action**
- ❌ "The system automatically does X"
- ✅ "If you do X, then the system responds with Y"

**Essential, Not Exhaustive**
- Focus on core value proposition
- Leave implementation details unspecified
- Don't try to cover every edge case

### Common Patterns

**Discovery/Access**
- "If you [organize/tag/search], then you can [find/access] what you need"
- Example: "If you create folders, then you can find related items grouped together"

**Social/Communication** 
- "If you [connect/share/communicate], then [others receive/you stay informed]"
- Example: "If you mention someone, then they get notified about the discussion"

**Quality/Curation**
- "If you [rate/moderate/curate], then [quality improves/best content surfaces]"
- Example: "If you report spam, then moderators can remove inappropriate content"

**Persistence/Memory**
- "If you [save/remember/track], then you can [retrieve/recall] later"
- Example: "If you add items to your cart, then you can purchase them all at once"

## Common Mistakes to Avoid

### Vague Benefits
- ❌ "If you use X, then it helps with Y"
- ✅ "If you use X, then specific outcome Z occurs"

### Implementation Focus
- ❌ "If you click the button, then the database is updated"
- ✅ "If you save your work, then you can continue where you left off later"

### Missing User Action
- ❌ "The system learns your preferences automatically" 
- ✅ "If you like posts you enjoy, then the system shows you similar content"

### No Clear Value
- ❌ "If you do X, then Y happens" (but Y isn't valuable to users)
- ✅ "If you do X, then you achieve goal Z that you care about"

## Testing Your Operational Principles

Ask these questions:
1. **Is the user action clear and concrete?**
2. **Is the system response valuable to users?**
3. **Does this explain why someone would use this concept?**
4. **Can you easily explain this to a non-technical person?**
5. **Does this differentiate the concept from alternatives?**

## Examples by Domain

### E-commerce
- **Cart**: "If you add items to your cart, then you can purchase them all together in one transaction"
- **Wishlist**: "If you save items to your wishlist, then you can easily find and buy them later"
- **Review**: "If you read reviews from other buyers, then you can make more informed purchase decisions"

### Social Media
- **Post**: "If you publish content, then your followers can see and engage with it"
- **Like**: "If you like content you enjoy, then the creator knows it resonated with people"
- **Share**: "If you share interesting content, then your network can discover it too"

### Productivity
- **Task**: "If you create a task with a due date, then you'll be reminded before the deadline"
- **Calendar**: "If you schedule events, then you can see what's coming up and avoid conflicts"
- **Note**: "If you capture important information, then you can search and find it when needed"

## Advanced: Generic vs Context-Specific OPs

### Generic OPs
Work across many contexts and applications:
- **Follow**: "If you follow someone, then their content appears in your feed"
- **Search**: "If you enter keywords, then you get relevant results"

### Context-Specific OPs  
Tailored to particular domains:
- **Medical appointment**: "If you book an appointment, then the doctor will see you at the scheduled time"
- **Restaurant reservation**: "If you reserve a table, then you'll have a guaranteed seat when you arrive"

Both are valuable - generic OPs enable reuse, specific OPs clarify domain requirements.

## Further Reading

- **@agent-rules/concept-design-guide.md** - Overview and methodology
- **@agent-rules/concept-templates.md** - Practical templates and examples
- **@agent-rules/concept-composition.md** - How concepts work together