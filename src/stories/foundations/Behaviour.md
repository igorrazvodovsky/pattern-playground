import { Meta } from '@storybook/blocks';

<Meta title="Foundations/Behavior*" />

> **Fun meter: 4/5**. Exploring how to design for LLMs revealed the need for a framework to support and structure actor intent.

# Behavior

Different ways in which an actor might use a system—not just to find information, but also to act on it. Specific types of looking and doing provide a foundation for choosing components and patterns that meet those demands delightfully and deliberately.

Behaviours are organised into four broad categories—each containing behaviour sets that reflect the actor’s intent, motivation, and level of confidence.

The approach is based on [Dan Ramsden’s model for navigation and information-seeking](https://danramsden.com/2017/01/27/model-navigation-information-seeking/), but it pushes further—into the territory of task performance, workflow, and long-form engagement.

{/* Purpose (Why) */}
{/* •	Core motivations: What’s driving the actor? (e.g. curiosity, urgency, obligation, exploration, improvement) */}
{/* •	Job to be done: High-level, often recurring goal (e.g. “make an informed decision”, “fix a problem”, “learn something new”) */}

{/* Intent (What) */}
{/* •	Stated or inferred goals: Ranges from explicit (“I want to find X”) to vague (“Just browsing”, “Not sure yet”). */}
{/* •	Clarity spectrum: clear + expressed, clear + inferred, vague + inferred, evolving */}

{/* Modes */}

## Motivated movement

Purposeful progress through a known or emerging structure. The actor is motivated by a specific outcome, and although the level of precision may vary, the intent is directional. Feedback from the system reinforces progress, and transitions often emerge as clarity and confidence increase.

{/* TODO: compare with: */}
{/* Movement implies that an actor can judge their progress. Their motion through a structure gives them a sense of achievement as they move towards satisfying their need. */}
{/* Their behaviour has a pre-defined goal – occasionally vague or coarse, but nonetheless directed. */}

### Navigating

Movement with precision and high intent. The actor knows both what they’re looking for and how the structure is likely organised.
Success is driven by targeting (choosing a specific goal) and predictive understanding of the structure.

{/* TODO: compare with: */}

{/* Navigation describes a mode of interaction where the actor moves through a system with purpose and precision. Following Ramsden,
I use the term *navigating* to describe a type of highly directed *browsing*. They know what they want, and where they need to go.
It’s a highly intentional activity driven by a clear target in mind.

Before actor begins, they often already pinpointed their focus (a step Ramsden calls “targeting”), even if it happens unconsciously.
With that target defined, the behaviour follows ordered information-seeking strategies. They either understand the structure or can predict
it accurately, and that mental map lets them navigate swiftly and efficiently.

Along the way, they might briefly *sweep* the environment—scanning broadly to reassure themselves they’re on the right track—but these moments are confirmations, not detours.
Because *navigation* combined a precise intent with a solid grasp of the space, every step carries actor closer to their goal with minimal friction. */}

#### Transitions
Can emerge from browsing when confidence increases, or from transactional search when results are explored.

#### Related patterns
<div>
- Navigation is used at the very start of a session.
– Tree for lateral and vertical movement.
- Breadcrumbs show the travelled path and lets actors return (or go sideways).
- Step by step navigation
- Contextual actions — localised controls (“edit”, “share”, “export”) tied to the reached content.
- Related content links that leverage the current location to propose a subsequent path.
- Bookmark captures the reached node for later re-finding.
- Command bar – jumps anywhere.
- Bot
- Filtering trims large sets rather than switching sections, but actors mentally treat every filter change as a micro-navigation.
{/* - Detail view — the destination template (article, product page, data sheet). success of navigating is measured here; appears one step after the hop. */}
</div>

### Browsing

Less precise but still purposeful movement. The actor works within a known part of the system, refining both their goal and their understanding as they go.
They engage in sweeping (broad scanning) to reveal patterns or next steps. Browsing supports learning-in-action, often serving as a bridge between low and high precision behaviours.

#### Transitions
Can sharpen into navigating, or loosen into exploring if uncertainty grows.

#### Related patterns
- Filtering and grouping
- Progressive disclosure | auto-load plus expanding details. | keeps sweep motion fluid; prevents premature transitions.
- Semantic highlight – LLM spots entities and highlights them in views. Speeds pattern-spotting and helps shift into monitoring.
- Timeline
– Tree for lateral and vertical movement.

### Transactional search

A focused, tool-based method for retrieving specific results. The actor constructs inputs (queries, filters, prompts) with care and intention,
relying on the system to evaluate, discriminate, and deliver. This is not exploratory—interrupting or failing to deliver damages trust.
Transitions out of this mode are usually unwanted, unless the actor gives up and switches strategies.

#### Transitions
Navigational transitions are discouraged – switching into browsing or navigating can feel like system failure unless clearly supported. Successful search results in doing the job.

#### Related patterns
Search or command bar

{/* ### Browsing to Navigating */}

{/* ... */}

## Delightful discovery

Discovery happens when actors encounter information they didn’t explicitly seek—but which they find valuable, relevant, or exciting.
This category rewards designs that support curiosity, enable surprise, and create psychological safety for getting a little lost.
Transitions often depend on motivation and momentary clarity of purpose.

### Exploring

Movement through loosely bounded content or ideas, often triggered by a vague goal or simply curiosity. The actor’s understanding of both the content
and their own need sharpens as they go. Sweeping dominates early stages; conditioning emerges as patterns form.
Exploration can either settle into more directed behaviour or remain open-ended.

#### Transitions
May mature into browsing or navigating once a goal crystallises

#### Related patterns
- Personalisation – enables “start somewhere sensible” rather than dumping the actor at a generic wall.
- "Focus & context" shifts actor into browsing.
- Breadcrumbs preserves context so the next hop can be precise navigating if curiosity crystallises.

### Monitoring

A strategy for staying updated about known areas of interest. Can be active (manual checks) or passive (automated updates).
Monitoring creates continuity over time and can either lead to deeper engagement or enable light, ongoing awareness.
It’s a low-friction way to maintain relevance and context.

#### Transitions

Can lead into exploring, transactional search, or navigating when something changes or catches attention.

### Passive discovery

Serendipitous encounters with unexpected relevance. The actor may not have been looking for anything, but good design sparks interest,
prompting targeting and movement almost simultaneously. This is where systems surprise and delight—turning idle moments into value.

#### Transitions

Often initiates movement or exploration; can also feed directly into the "job".

## Foggy finding

Here, the actor knows what they want, but can’t access it easily. This friction may stem from memory gaps, unclear structures, or unhelpful tools.
The risk is high frustration, especially when actors believe the system is “hiding” something from them.
Transitions here are about either clarifying the goal or improving system feedback to allow escape into more fluent modes.

### Re-finding

The actor wants to return to something they’ve seen before, but lacks the exact pathway. They rely on cues, memory, or system support (like history or recognisable patterns). This mode rewards good differentiation, meaningful labels, and predictable paths.

#### Transitions
May evolve into navigating or transactional search if memory strengthens

#### Related patterns
Recently accessed, activity history

### Uncovering

Systematic trial-and-error. The actor is motivated but blocked by structural opacity or unclear interaction rules.
This is often a sign of poor affordance or overly strict syntax (e.g. voice commands, search logic).
Good design reduces the opacity of systems to make uncovering unnecessary.

#### Transitions
May improve into transactional search or navigating when actor figures out “how the system thinks”

### Hunting

Similar to uncovering but more adaptable and determined. The actor doesn’t care where the solution comes from—only that they find it.
They may use multiple strategies simultaneously (search, scanning, filtering, backtracking). This is an intense,
high-motivation behaviour that thrives when systems reward skill and persistence.

#### Transitions
Can resolve into navigating or browsing; if prolonged, risks frustration or abandonment

## Doing the job

What happens after information-seeking has delivered something of value. It’s where intent becomes action.
The actor shifts from orienting and acquiring to applying, manipulating, integrating, or acting on what they’ve found.
Interaction becomes task-centric. Feedback loops narrow, focus sharpens, and the system should support fluency, flow, and continuity.

### Executing

Deliberate, goal-oriented manipulation of content, data, configurations, or systems. The actor is actively “doing something” with precision, intent,
and awareness of impact. The system becomes a tool to enact change—whether that’s submitting a form, editing content, or configuring logic.

{/* •	Performing stepwise actions */}
{/* •	Making decisions and confirming changes */}
{/* •	Referencing prior information or rules */}
{/* •	Expecting immediate, visible outcomes from actions */}

#### Transitions
In: often from *navigating*, *browsing*, or *transactional search* when a specific object or views is reached
Out: success (completion), failure (error or confusion), or escalation (new information need → *foggy finding* or *exploring*)

### Integrating

The actor is weaving the outcome of another behaviour (like *discovery*) into a larger system, artefact, or workflow.
This behaviour is about connecting the dots, embedding, and recontextualising.

{/* •	Referencing or inserting content into another document/system */}
{/* •	Associating items (e.g. tagging, linking) */}
{/* •	Saving for later use within a larger workflow */}
{/* •	Creating dependencies between items or processes */}

#### Transitions
In: often from *consuming*, *browsing*, or *executing*—when a found object is acted on
Out: often flows into *executing* again, or returns to one of the information-seeking behaviours if integration raises new questions or issues

### Consuming

Active, purposeful engagement with content for entertainment, comprehension or decision-making.
The actor’s goal is often to understand or retain something that will inform later action.

#### Transitions
In: from *discovery*, *monitoring*, or *exploring*
Out: to *executing* (after understanding), or to *exploring* (if needs remain unclear)

### Flow

Sustained, immersive task engagement where the actor moves fluidly through a long or complex activity. Distractions feel costly; interruptions break momentum.
The system must support continuity, rhythm, and re-entry.

#### Transitions
In: from *executing* or *consuming*, once a rhythm is established
Out: caused by task completion, interruptions, errors, or fatigue—may return to *browsing* or *hunting*

### Learning

Engagement aimed at increasing knowledge or skills relevant to system use or domain understanding. The actor may be new or unfamiliar, or may be developing
mastery over time. Learning is often layered into other behaviours but becomes foregrounded during onboarding, upskilling, or exploratory tinkering.

#### Transitions
In: from *exploring*, *browsing*, or even error states in *executing*
Out: to *executing* when confidence increases, or back to *exploring* if understanding is still shaky

## Resources & references

- Ramsden (2017) [model for navigation and information-seeking](https://danramsden.com/2017/01/27/model-navigation-information-seeking/)
- Bates (1989) [The design of browsing and berrypicking techniques for the online search interface](https://pages.gseis.ucla.edu/faculty/bates/berrypicking.html)
- Spencer (2006) [Four Modes of Seeking Information and How to Design for Them](http://boxesandarrows.com/four-modes-of-seeking-information-and-how-to-design-for-them/)
- Ellis (1989). A behavioural approach to information retrieval design. Journal of Documentation, 45(3), 171-212.
- Ellis, Haugan (1997). Modelling the information seeking patterns of engineers and research scientists in an industrial environment. Journal of Documentation, 53(4), 384-403.
{/* - Ambient Findability by Peter Morville */}
