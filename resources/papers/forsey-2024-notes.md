# Designing for Learnability: Improvement Through Layered Interfaces (2024)

**Authors:** Helen Forsey, David Leahy, Bob Fields, Shailey Minocha, Simon Attfield, Tom Snell
**Source:** Ergonomics in Design, July 2025
**Keywords:** progressive disclosure, human-machine interface, training demand, interface design, experiment

## Summary
The paper explores using **Layered Interfaces** (a form of Progressive Disclosure) to improve the **learnability** of complex systems, specifically in a military context (Mission Planner software). The goal is to reduce "training demand"—the time and cost required to achieve competence.

They compared a "Full Interface" (all features available) vs. a "Layered Interface" (advanced/irrelevant features "greyed out" for novice tasks).

## Key Findings
- **Progressive Disclosure reduces initial complexity:** restricting features allows users to focus on the task at hand without being overwhelmed.
- **"Greying out" vs. Hiding:** The experiment used "greying out" to show existence without availability.
- **Context matters:**
    - **Progressive Disclosure** is best for: Infrequent users, Intermittent users, Novices, Refresh/Re-learning, Prevention of destructive errors.
    - **Full Functionality** is best for: Power/Expert users, Dedicated applications.
- **Individual Differences:** User experience and visual scanning strategies (methodical vs. random) significantly impacted performance, sometimes masking the experimental condition effects.

## Concepts for Pattern Playground

### 1. Progressive Disclosure (Layered Interfaces)
The paper reinforces `ProgressiveDisclosure` as a primary learnability mechanism.
- **Mechanism:** "Training Wheels" approach.
- **Technique:** Multi-layered interfaces where users can "level up".
- **Visuals:** Greying out items (Ghosting) allows users to build a mental model of *where* things are, even if they can't use them yet, aiding transition to expert layers.

### 2. Learnability vs. Efficiency
There is a trade-off. Layered interfaces speed up *initial* meaningful action (Time to Competence) but might hinder *deep* mastery if users become reliant on the simplified view.
- **Guidance:** "Context/priority should dictate what intervention method to adopt."

### 3. AI & Adaptive Interfaces
The paper explicitly mentions AI's role in the future of learnability:
- **Context-sensitive help:** Tool-tips and progress graphics.
- **Transparent Reasoning:** "Allowing users to view the reasoning behind advice and reject it if desired." -> Directly links to our `TransparentReasoning` pattern.
- **Skill Monitoring:** AI could track competence and suggest moving to the next layer (auto-scaffolding).

## Mapping to Existing Patterns
- **`ProgressiveDisclosure`:** Update to include "Layered Interfaces" as a specific variant/implementation. Discuss "Greying out" vs "Hiding".
- **`Onboarding`:** Layered interfaces are a "structural onboarding" technique (as opposed to tour-based).
- **`Mastery`:** (If exists) or `Expertise`. How to transition from Layer 1 to Layer N.
- **`TransparentReasoning`:** Cite the paper's point on explaining AI advice.
- **`Help`:** Context-sensitive help is a key support for learnability.
