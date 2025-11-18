# 🤖 IntentFlow Framework - Visual Reference

## Four Aspects of Intent Communication (Cycle)

```
                    ┌─────────────────────┐
                    │   User has Goal     │
                    │  (stable, explicit) │
                    └──────────┬──────────┘
                               │
                               ▼
                ┌──────────────────────────────┐
                │  1. INTENT ARTICULATION      │
                │  ─────────────────────────   │
                │  • Parse prompt → goals +    │
                │    intents                   │
                │  • Extract explicit +        │
                │    implicit intents          │
                │  • Present as editable UI    │
                │                              │
                │  Convergent process          │
                └──────────┬───────────────────┘
                           │
                           ▼
                ┌──────────────────────────────┐
                │  2. INTENT EXPLORATION       │
                │  ─────────────────────────   │
                │  • Generate intent           │
                │    dimensions                │
                │  • Provide UI controls       │
                │  • Show value descriptions   │
                │  • Enable quick variation    │
                │                              │
                │  Divergent process           │
                └──────────┬───────────────────┘
                           │
                           ▼
                ┌──────────────────────────────┐
                │  3. INTENT MANAGEMENT        │
                │  ─────────────────────────   │
                │  • Maintain structured form  │
                │  • Keep/pin effective intents│
                │  • Version history +         │
                │    rollback                  │
                │  • Remove outdated intents   │
                │                              │
                │  Temporal continuity         │
                └──────────┬───────────────────┘
                           │
                           ▼
                ┌──────────────────────────────┐
                │  4. INTENT SYNCHRONIZATION   │
                │  ─────────────────────────   │
                │  • Link intents to output    │
                │  • Highlight on hover        │
                │  • Preview changes           │
                │  • Verify realization        │
                │                              │
                │  Bi-directional verification │
                └──────────┬───────────────────┘
                           │
                           │ Refinement loop
                           └───────────┐
                                      │
                    ┌─────────────────▼───────┐
                    │  Refined intents feed   │
                    │  back into articulation │
                    │  for next iteration     │
                    └─────────────────────────┘
```

## IntentFlow System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                         │
├─────────────────┬───────────────────────┬───────────────────┤
│                 │                       │                   │
│  CHAT PANEL     │    INTENT PANEL       │   OUTPUT PANEL    │
│                 │                       │                   │
│  • Free-form    │  ┌─────────────────┐ │  • Generated text │
│    prompts      │  │  Goal Section   │ │  • With headers   │
│                 │  │  • Task         │ │  • Version history│
│  • Chat history │  │  • Domain       │ │  • Diff view      │
│                 │  │  • Topic        │ │  • Pagination     │
│  • Status       │  └─────────────────┘ │                   │
│    updates      │                       │  • Hover to see   │
│                 │  ┌─────────────────┐ │    linked intents │
│                 │  │  Intent List    │ │                   │
│                 │  │  • Editable     │ │                   │
│                 │  │  • Keep/delete  │ │                   │
│                 │  │  • Add new      │ │                   │
│                 │  │  • Intent-based │ │                   │
│                 │  │    prompting    │ │                   │
│                 │  └─────────────────┘ │                   │
│                 │                       │                   │
│                 │  ┌─────────────────┐ │                   │
│                 │  │ Intent          │ │                   │
│                 │  │ Dimensions      │ │                   │
│                 │  │                 │ │                   │
│                 │  │ • Sliders       │ │                   │
│                 │  │ • Radio buttons │ │                   │
│                 │  │ • Hashtags      │ │                   │
│                 │  │ • Hover for     │ │                   │
│                 │  │   descriptions  │ │                   │
│                 │  └─────────────────┘ │                   │
│                 │                       │                   │
└─────────────────┴───────────────────────┴───────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND PIPELINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Prompt                                                │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────┐                                   │
│  │ Entrypoint Chat     │ Which modules to update?          │
│  │ Module (GPT-4o)     │                                   │
│  └──────────┬──────────┘                                   │
│             │                                               │
│      ┌──────┼──────┬────────────┐                         │
│      ▼      ▼      ▼            ▼                          │
│   ┌───┐  ┌───┐  ┌────┐      ┌────┐                       │
│   │ G │  │ I │  │ D  │      │ P  │                       │
│   │ o │  │ n │  │ i  │      │ r  │                       │
│   │ a │  │ t │  │ m  │      │ e  │                       │
│   │ l │  │ e │  │ e  │      │ v  │                       │
│   │   │  │ n │  │ n  │      │ i  │                       │
│   │ M │  │ t │  │ s  │      │ e  │                       │
│   │ o │  │   │  │ i  │      │ w  │                       │
│   │ d │  │ M │  │ o  │      │    │                       │
│   │ u │  │ o │  │ n  │      │ M  │                       │
│   │ l │  │ d │  │    │      │ o  │                       │
│   │ e │  │ u │  │ M  │      │ d  │                       │
│   │   │  │ l │  │ o  │      │ u  │                       │
│   │   │  │ e │  │ d  │      │ l  │                       │
│   │   │  │   │  │ u  │      │ e  │                       │
│   │   │  │   │  │ l  │      │    │                       │
│   │   │  │   │  │ e  │      │    │                       │
│   └─┬─┘  └─┬─┘  └─┬──┘      └─┬──┘                       │
│     │      │      │            │                           │
│     └──────┴──────┴────────────┘                          │
│                   │                                        │
│                   ▼                                        │
│          ┌─────────────────┐                              │
│          │  Output Module  │                              │
│          │    (GPT-4o)     │                              │
│          └────────┬────────┘                              │
│                   │                                        │
│                   ▼                                        │
│          ┌─────────────────┐                              │
│          │ Linking Module  │                              │
│          │   (GPT-4o)      │                              │
│          └────────┬────────┘                              │
│                   │                                        │
│                   ▼                                        │
│            Output with Links                              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Behavioral Shift: Baseline vs IntentFlow

```
BASELINE (Chat-based interface)
─────────────────────────────────────────────────────────────
User action pattern:
  Prompt → Output → [Not what I want] → Correct → Repeat
            ↓
  Intents scattered in chat history
  System forgets previous context
  User must restate intents

Action distribution:
  • Correct: 32.1% (HIGH - frustrated error correction)
  • Adjust:  8.4%  (LOW - limited refinement)
  • Add:    33.7%
  • Delete:  1.2%  (LOW - awkward negative prompting)

Rollback usage:
  • Primarily after failures
  • To restate lost intents
  • Symptom of breakdown


INTENTFLOW (Structured intent interface)
─────────────────────────────────────────────────────────────
User action pattern:
  Prompt → Structured Intents → Explore → Refine → Curate
                    ↓
  Intents preserved in Intent Panel
  System maintains context
  User adjusts dimensions

Action distribution:
  • Correct:  4.7% (LOW - reduced error correction)
  • Adjust:  35.2% (HIGH - active refinement)
  • Add:     51.7%
  • Delete:   9.4% (HIGHER - natural intent removal)

Rollback usage:
  • Part of exploration
  • To compare variations
  • Deliberate strategy


BEHAVIORAL TRANSFORMATION
─────────────────────────────────────────────────────────────
FROM: Reactive error correction
  "This is not what I want, do it again"

TO: Proactive intent refinement
  "Let me adjust this dimension and see what changes"

Result: 21% lower cognitive workload (NASA-TLX)
```

## Design Implications Checklist

```
DI1: Distinguish & Externalize Goals and Intents
  ☐ Parse prompts into two layers (goals vs intents)
  ☐ Extract both explicit and implicit intents
  ☐ Map each to system behaviours/subtasks
  ☐ Present in editable form
  ☐ Make system's interpretation visible

DI2: Provide Easily Adjustable Exploratory Spaces
  ☐ Surface alternative options (tones, structures, emphases)
  ☐ Use direct manipulation interfaces
  ☐ Enable smooth probing of variations
  ☐ Reduce effort of exploration
  ☐ Help uncover latent/subconscious intents

DI3: Support Versioning & Curation
  ☐ Maintain intents in structured, persistent form
  ☐ Allow revisiting and comparing versions
  ☐ Enable marking/fixing effective intents
  ☐ Support selective retention or release
  ☐ Facilitate gradual curation of intent sets
  ☐ Enable reuse in future similar tasks

DI4: Make Intent-Output Connections Transparent
  ☐ Explicitly link each intent to output parts
  ☐ Make connections clearly visible
  ☐ Show which segments correspond to which intents
  ☐ Preview effects of modifying intents
  ☐ Help users anticipate outcomes before committing
  ☐ Foster transparency and alignment
```

## Generalization Template

**Apply to any generative AI domain:**

| Aspect | Writing | Data Analysis | Image Editing | Your Domain |
|--------|---------|---------------|---------------|-------------|
| **Articulation** | Goals + intents as editable UI | Goals + analysis intents in panel | Goals + design intents as layers | ? |
| **Exploration** | Sliders for tone, length, focus | Widgets for granularity, filtering | Controls for color, layout, style | ? |
| **Management** | Version history of drafts + intents | Intent-version history for notebooks | Edit history tied to intent sets | ? |
| **Synchronization** | Hover highlights text | Hover highlights chart regions | Hover outlines impacted layers | ? |

## Connections Map

```
IntentFlow Framework ←→ Existing Patterns
─────────────────────────────────────────

FOUNDATIONS:
  Intent & Interaction
    ├─ Navigation behaviors → need Articulation/Exploration
    ├─ Action categories → need Management/Synchronization
    └─ Conversational alignment → all four aspects support

  Agency
    └─ Manifests through intent control

PATTERNS:
  Prompt
    ├─ Current: basic input mechanism
    └─ Add: Four aspects framework, dual prompting

  Bot
    └─ Add: Bot as intent interpreter

  Suggestion
    └─ Add: Two types (articulation vs exploration)

  Generated Content
    └─ Add: Intent-linked generation

NEW PATTERNS NEEDED:
  1. Intent Articulation Pattern
  2. Intent Exploration Pattern
  3. Intent Management Pattern
  4. Intent Synchronization Pattern
  5. Dual Prompting Pattern
```
