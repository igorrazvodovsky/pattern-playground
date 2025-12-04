# Time and Temporality in HCI Research - Notes

## Metadata
- **Title**: Time and Temporality in HCI Research
- **Authors**: Mikael Wiberg, Erik Stolterman
- **Year**: 2021
- **Source/Conference**: Interacting with Computers, Vol. 33 No. 3
- **Link**: https://doi.org/10.1093/iwc/iwab025
- **Tags**: #research, #temporality, #time, #hci, #literature-review, #framework

## 1. Executive summary

This paper is a **literature review** surveying 30 years of HCI research on time and temporality. The authors analysed 529 papers from the ACM Digital Library to understand *what* has been studied and *how* it has been studied regarding temporal aspects of HCI.

**Why selected**: To strengthen the theoretical grounding of temporal concepts in Pattern Playground, particularly the Density and Interaction foundations, and to identify gaps in how we address time as a design material.

**Paper type**: Descriptive survey/review paper (not prescriptive). It organises existing research rather than proposing new design methods.

## 2. Key concepts & frameworks

### 2.1 The HCIoT model (Human-Computer Interaction over Time)

A 4-category model for *what* is studied in temporal HCI research:

| Category | Focus |
|----------|-------|
| **HUMANS** | Pace and rhythms of work and life - how technology influences temporal structure of human activity |
| **COMPUTERS** | Fundamental principles for computing and visualisations - clock cycles, timelines, temporal data representation |
| **INTERACTION** | Temporal explorations of interaction itself - pace, rhythm, turn-taking models |
| **over TIME** | Historical phases and how the field has changed - waves of HCI research |

### 2.2 Four approaches to studying temporality (HOW)

1. **Empirical approaches** - Case studies of work/leisure, studying practice arranged around computers
2. **Methodological approaches** - Developing methods to capture temporal aspects (recent growth area, 2015-2020)
3. **Theoretical approaches** - Conceptual frameworks, vocabularies (temporal form, dynamic gestalt, slow interaction)
4. **Design approaches** - Temporality as design material, exploring time as resource not constraint

### 2.3 The 4×4 matrix

Combines WHAT (Human, Computer, Interaction, over Time) with HOW (Empirical, Methodological, Theoretical, Design) to map the research landscape. Key finding: empirical/human intersection is heavily researched; design/interaction is emerging.

### 2.4 Three waves of temporality studies

| Wave | Characterisation | Focus |
|------|------------------|-------|
| **First wave** | Time optimisation | Efficiency, task performance, multitasking, interruptions |
| **Second wave** | Temporality as dimension of practice | Methodological and design-oriented attitude |
| **Third wave** (emerging) | Theorising temporality | New conceptualisations of time, slow technology as subfield |

### 2.5 Key conceptual distinctions

- **Time vs. temporality**: Time is clock-based measurement; temporality is "the state of existing within or having some relationship with time" (broader, experiential)
- **Things vs. events**: HCI traditionally focused on artifacts/objects; temporality lens shifts focus to flow, pace, rhythms of information and computing
- **Pace vocabulary**: pace, frequency, rhythm, interruption, lag, speed, fast, slow

### 2.6 Time/space matrix (Ellis et al., 1991)

Classic framework referenced:

|  | Same Time | Different Times |
|--|-----------|-----------------|
| **Same Place** | Face-to-face | Asynchronous |
| **Different Places** | Synchronous distributed | Asynchronous distributed |

### 2.7 Slow interaction movement

Major design research area treating pace as malleable:
- Hallnäs & Redström (2001) - foundational slow technology work
- Odom et al. (2018) - time and temporality as design material
- Designs for reflection, rest, health rather than efficiency

## 3. Design implications (general)

**DI1: Temporality is a first-class design material** - Time should be consciously designed, not just a consequence of system capacity or user patience.

**DI2: Pace can be intentionally varied** - Not all interactions should be fast. Slow interactions support reflection, meaning-making, intimate communication.

**DI3: The "things to events" shift** - Consider designing for temporal flow and experience, not just static artifacts.

**DI4: Methods need development** - Capturing temporal aspects of interaction requires purpose-built methodologies.

**DI5: Turn-taking models are fundamental** - Any interaction model implicitly contains a temporal model of exchange.

**DI6: Historical context matters** - The phase of technology/HCI research shapes what temporal concerns are foregrounded.

## 4. Technical architecture / implementation details

Not applicable - this is a literature review without implementation details.

## 5. Application to Pattern Playground

### 5.1 Existing foundations analysis

The codebase already demonstrates sophisticated temporal thinking:

#### Aligned implementations

- **Density foundation** (`src/stories/foundations/Density.mdx`)
  - Explicitly names "temporal density" as a design dimension
  - Distinguishes system latency from cognitive latency
  - Treats time as first-class alongside visual/information density
  - **Strong alignment** with paper's "temporality as design material" position

- **Interaction foundation** (`src/stories/foundations/Interaction.mdx`)
  - Seek-Use-Share provides temporal structure
  - Turn-taking and pacing explicitly addressed
  - Cooperation maxims (Grice) imply temporal exchange
  - **Strong alignment** with paper's interaction-temporal focus

- **Collaboration foundation** (`src/stories/foundations/Collaboration.mdx`)
  - Addresses synchronicity dimension explicitly
  - Distinguishes real-time, asynchronous, hybrid rhythms
  - **Strong alignment** with Ellis et al. time/space matrix

- **Conversation foundation** (`src/stories/foundations/Conversation.mdx`)
  - Conversational loop models temporal exchange
  - Turn-taking and repair mechanisms
  - **Strong alignment** with paper's emphasis on interaction temporality

#### Partial implementations

- **Motion foundation** (`src/stories/foundations/Motion.mdx`)
  - Addresses animation timing and perceived speed
  - Could be strengthened with more explicit connection to interaction pace
  - **Partial alignment** - focuses on animation, less on broader temporal design

- **Temporality foundation** (`src/stories/foundations/Temporality.md`)
  - Placeholder file exists but undeveloped
  - **Gap** - opportunity to consolidate temporal thinking

#### Pattern-level temporal implementations

The following patterns address temporal concerns well:

| Pattern | Temporal aspect addressed |
|---------|--------------------------|
| Undo | History, reversal, branching timelines |
| Activity Log/Feed | Chronological record, reverse-chronological ordering |
| Timeline | Visual temporal representation |
| Wizard | Enforced temporal sequencing |
| Transparent Reasoning | Before/during/after execution modes |
| Collaboration | Sync vs async modes |
| Saving | Autosave timing, commit cadence |
| Action Consequences | Recovery time metric |
| Task (concept) | State transitions, temporal constraints |

### 5.2 Gap analysis

#### Missing concepts from the paper

1. **Slow interaction patterns** - The paper identifies slow technology as a major design research area (almost a subfield). Pattern Playground lacks explicit patterns for:
   - Intentionally slow disclosure
   - Reflection-oriented timing
   - Intimate/meaningful interaction pacing
   - Contrast: current patterns favour efficiency/responsiveness

2. **Things-to-events framing** - The paper argues HCI is shifting from designing artifacts to designing temporal experiences. Current patterns focus on:
   - Components (things)
   - States (snapshots)
   - Less on: flow, rhythm, experiential arc

3. **Rhythm as design dimension** - Paper mentions rhythm, pace, frequency as core vocabulary. The codebase addresses:
   - Turn-taking (discrete)
   - Timing (animation)
   - Less explicit: rhythmic patterns, cadence design, interaction frequency

4. **Lag and delay as design material** - Paper notes lag is typically treated as problem to minimise. Missing:
   - Intentional delay patterns
   - Waiting as design opportunity
   - Perceived time manipulation

5. **Temporal form vocabulary** - Löwgren & Stolterman's "temporal form" and "dynamic gestalt" concepts not reflected in documentation vocabulary.

6. **Long-term interaction** - Paper references Odom's work on long-term relationships with artifacts. Current patterns focus on:
   - Session-level interactions
   - Less on: day/week/month timescales, accumulation over time

### 5.3 Proposed features / refactors

#### Proposal A: Develop the Temporality foundation

**Goal**: Consolidate temporal thinking into a proper foundation document.

**Content to include**:
- Temporal density (from Density foundation - could be primary home)
- Pace spectrum: fast → responsive → considered → slow → deliberate
- The three waves of temporal design thinking
- Rhythm and cadence principles
- Clock time vs. experienced time distinction
- Things-to-events framing

**Files affected**:
- `src/stories/foundations/Temporality.md` → `Temporality.mdx` (develop fully)
- Cross-reference from Density, Interaction, Motion foundations

#### Proposal B: Add "Pace" pattern family

**Goal**: Explicitly address pace as a designable dimension.

**New patterns to consider**:
- **Pacing** - When to use fast vs. slow interaction modes
- **Rhythm** - Establishing and varying interaction cadence
- **Intentional delay** - Using wait time productively (loading screens that inform, delays that build anticipation)
- **Reflection pause** - Designed moments for user contemplation

#### Proposal C: Enhance existing patterns with temporal modes

**Goal**: Add explicit temporal mode documentation to key patterns.

**Patterns to enhance**:
- **Conversation**: Add timing mode variants (rapid exchange, considered dialogue, reflective conversation)
- **Suggestion**: Expand timing section (when suggestions appear affects creativity - paper cites this)
- **Notification**: Add temporal batching/rhythm considerations

#### Proposal D: Add "Interaction arc" compositional guidance

**Goal**: Address "things to events" shift at composition level.

**Content**:
- How patterns combine over time in a session
- Interaction rhythm across a workflow
- Transition pacing between modes/contexts

### 5.4 Action items

- [ ] Develop `Temporality.mdx` foundation with consolidated temporal concepts
- [ ] Review Density foundation - consider if "temporal density" should live in Temporality
- [ ] Add pace/rhythm vocabulary to documentation standards
- [ ] Consider "Pacing" pattern for patterns directory
- [ ] Enhance Conversation pattern with temporal mode variants
- [ ] Add "Intentional delay" to related patterns in Loading/Progress areas
- [ ] Cross-reference slow interaction research in relevant patterns

## 6. Limitations of application

This paper is a **descriptive survey**, not a prescriptive framework. It:
- Does not provide specific design guidelines
- Does not propose new methods or techniques
- Organises what exists rather than creating new knowledge

Application value is primarily in:
- Vocabulary and framing (things→events, temporality as material)
- Validation of existing approach (temporal density concept aligns)
- Gap identification (slow interaction under-represented)
- Historical contextualisation (understanding waves of research)

## 7. Related papers to explore

Referenced works worth following up:
- Hallnäs & Redström (2001) - Slow Technology (foundational)
- Odom et al. (2018) - Time, temporality, and slowness
- Löwgren & Stolterman (2007) - Temporal form, interaction gestalt
- Benford & Giannachi (2008) - Temporal trajectories
- Huang & Stolterman (2011, 2012) - Temporality in interaction design
