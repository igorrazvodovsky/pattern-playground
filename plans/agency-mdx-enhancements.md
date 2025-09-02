# Agency.mdx Enhancement Suggestions

## 1. Expand the Agency Spectrum

### Replace current 4-level spectrum with paper's 5-level model
**Current**: User-driven → Assistance → Automation → Autonomy

**Replace with paper's 5-level spectrum**:

#### Passive
- **Definition**: System acts only when explicitly invoked by user
- **Control**: Fully user-driven, system waits for commands
- **Example**: Manual spell-check, on-demand calculator
- **Agency balance**: Maximum user agency, minimal system agency

#### Reactive
- **Definition**: System responds directly to user actions with immediate feedback
- **Control**: User-initiated actions trigger system responses
- **Example**: Auto-complete, real-time validation, grammar suggestions
- **Agency balance**: User leads, system follows immediately

#### Semi-active
- **Definition**: System provides contextual support when specific conditions are met
- **Control**: Condition-triggered assistance, user retains override
- **Example**: "Looks like you're writing a letter" assistance, smart suggestions
- **Agency balance**: System monitors and suggests, user decides

#### Proactive
- **Definition**: System initiates actions and introduces insights based on analysis
- **Control**: System-initiated suggestions, user approval required
- **Example**: "Have you considered this approach?", workflow optimizations
- **Agency balance**: System proposes, user disposes

#### Co-operative
- **Definition**: System collaborates as equal partner in problem-solving
- **Control**: Dynamically negotiated between system and user
- **Example**: Pair programming with AI, collaborative design sessions
- **Agency balance**: Shared agency with negotiated handoffs

### Enhanced spectrum characteristics
Each level builds upon the previous, adding capabilities while maintaining lower-level functionality:

**Control Granularity by Level**:
- Passive: No autonomous control
- Reactive: Immediate response control
- Semi-active: Contextual suggestion control
- Proactive: Initiative and proposal control
- Co-operative: Shared strategic control

**Trust Requirements by Level**:
- Passive: Minimal (user controls everything)
- Reactive: Low (predictable responses)
- Semi-active: Medium (some system judgement)
- Proactive: High (system makes suggestions)
- Co-operative: Very high (shared decision-making)

## 2. Add Agency Distribution Dimensions

### New section: "Agency Distribution"
The paper identifies three critical dimensions:

**Locus** (Who has control?)
- Human-centric: User retains ultimate authority
- AI-centric: System executes autonomously
- Hybrid/Shared: Authority distributed dynamically

**Dynamics** (How does control change?)
- Static: Fixed roles determined at design time
- Dynamic: Control shifts based on context and negotiation

**Granularity** (At what level is control exercised?)
- High-level: Strategic goals and workflows
- Fine-grained: Specific actions and parameters

## 3. Expand Related Patterns with Control Mechanisms

### Update "Related patterns" section
Instead of a new section, integrate control mechanisms as related patterns mapped to the paper's Input-Action-Output-Feedback framework:

**Input Stage Patterns**
- [Command menu](../?path=/docs/patterns-command-menu--docs) - Guided input with templates and suggestions
- [Prompt](../?path=/docs/patterns-prompt--docs) - Context-aware input with history
- [Commenting](../?path=/docs/patterns-commenting--docs) - Multimodal annotation and feedback

**Action Stage Patterns**
- [Focus and Context](../?path=/docs/patterns-focus-and-context--docs) - Attention focusing and exploration
- [Bot](../?path=/docs/patterns-bot--docs) - Role coordination in human-AI interaction
- [Activity log](../?path=/docs/patterns-activity-log--docs) - Action tracking and coordination

**Output Stage Patterns**
- [Suggestion](../?path=/docs/patterns-suggestion--docs) - Intervention points for user modification
- [Progressive disclosure](../?path=/docs/patterns-progressive-disclosure--docs) - Adaptive scaffolding
- [Transparent reasoning](../?path=/docs/patterns-transparent-reasoning--docs) - Chain-of-thought display
- [Generated content](../?path=/docs/patterns-generated-content--docs)

**Feedback Stage Patterns**
- [Explanation](../?path=/docs/patterns-explanation--docs) - Explanatory emphasis
- [Status feedback](../?path=/docs/patterns-states-status-feedback--docs) - Confidence visualization
- [Notification](../?path=/docs/patterns-notification--docs) - Iterative refinement signals

## 4. Enhance Design System Relationships

### Update each level with specific agency patterns:

**Primitives**:
- Add: Confidence indicators, agency state badges
- Example: `<pp-confidence level="0.8" />`

**Components**:
- Add: Control panels, intervention interfaces
- Example: Toolbar with agency mode selector

**Compositions**:
- Add: Negotiation dialogs, handoff sequences
- Example: Card that shows AI reasoning

**Patterns**:
- Add specific agency patterns from paper
- Link to control mechanism implementations

## 6. Expand Balancing Section

### Add from paper's findings:

**Trust Calibration**
- Progressive disclosure of AI capabilities
- Confidence communication strategies
- Uncertainty handling

**Agency Negotiation**
- Turn-taking protocols
- Initiative transfer mechanisms
- Conflict resolution

**Skill Preservation**
- Adaptive scaffolding based on expertise
- Progressive automation
- Learning safeguards

## 9. Connect to Conversational Concepts

### Add links to relevant concepts:
- Link Task → Agency distribution
- Link Delegation → Control mechanisms
- Link Planning → Iterative feedback
- Link Intervention → Modification patterns
- Link Interpretation → Transparency

## 11. Update Resources

### Add paper references:
- The HCI agency paper itself
- Related work on control mechanisms
- Case studies of agency patterns
- Implementation examples

## 12. Add Visual Diagrams

### Suggested diagrams:
1. Agency spectrum visualization
2. Control mechanism flowchart
3. Agency distribution matrix
4. Modality comparison chart
5. Pattern progression diagram

## Implementation Priority

1. **Immediate**: Add agency distribution dimensions
2. **Next**: Expand spectrum to 5 levels
3. **Then**: Reorganize related patterns by control stage (Input/Action/Output/Feedback)
4. **Later**: Examples and case studies
5. **Future**: Interactive demos