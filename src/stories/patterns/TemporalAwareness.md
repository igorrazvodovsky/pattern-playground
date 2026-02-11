import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Patterns/Temporal Awareness" />

# Temporal Awareness

**A pattern for systems that respect the user's time and attention.**

Temporal Awareness enables a system to understand the "right time" to interact by weighing the urgency of a message against the user's current focus and context.

## When to use

### High-Focus Work
When the user is in a "flow state" (e.g., coding, writing), the system should hold non-critical interruptions.

### Asynchronous Collaboration
When working with an agent that performs long-running tasks, the system needs to decide when to report back—immediately upon completion, or batched with other updates?

## Anatomy

1.  **Context Monitor**: A mechanism to estimate user focus (e.g., "User is typing", "User has been idle for 5m").
2.  **Urgency Classifier**: A way to rank system events (Critical, Normal, Low).
3.  **Delivery Mechanism**:
    *   *Immediate*: Toast/Modal (Critical).
    *   *Batched*: Summary in Activity Feed (Normal).
    *   *Passive*: Badge/Status update (Low).

## Variants

### Artificial Latency
Sometimes, the system *should* be slower than it can be.
*   **Trust**: If a complex analysis returns in 10ms, users may doubt it was thorough. Adding a 2-second "Thinking..." animation builds trust.
*   **Pacing**: If an agent replies too fast in a chat, it can feel overwhelming. Adding a "typing" delay mimics human turn-taking.

### Notification Batching
Instead of sending 5 notifications in 1 minute, the system waits and sends 1 summary: "5 files were updated."

## Decision Tree

*   **Is the information critical to the user's *current* action?**
    *   Yes -> **Interrupt** (Immediate).
    *   No -> Check **Focus State**.
*   **Is the user in a high-focus state?**
    *   Yes -> **Batch** or **Defer**.
    *   No -> **Notify** (Gentle).

## Related Patterns

**Precursors**
*   [Temporality](?path=/docs/qualities-temporality--docs): The underlying philosophy of "Lived Time".

**Complementary**
*   [Notification](?path=/docs/patterns-notification--docs): The UI component for delivery.
*   [Activity Feed](?path=/docs/patterns-activityfeed--docs): The destination for batched/passive updates.

## Resources
*   Collaborative Rhythm: Temporal Dissonance and Alignment in Collaborative Scientific Work (Jackson et al., 2011)
