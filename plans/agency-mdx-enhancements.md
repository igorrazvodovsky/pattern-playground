# Agency.mdx Enhancement Suggestions

## 1. Expand the Agency Spectrum

### Current spectrum is too simplified
**Current**: User-driven → Assistance → Automation → Autonomy

**Proposed based on paper**:
- **Passive**: System acts only when explicitly invoked
- **Reactive**: System responds directly to user actions
- **Semi-active**: System provides support when conditions are met
- **Proactive**: System initiates actions and introduces insights
- **Co-operative**: System collaborates as equal partner

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

## 3. Add Control Mechanisms Section

### New section: "Control Mechanisms"
Map to the paper's Input-Action-Output-Feedback framework:

**Input Controls**
- Guided input (templates, suggestions)
- Context awareness (history, environment)
- Multimodal integration

**Action Controls**
- Role coordination
- Attention focusing
- Exploration spaces

**Output Controls**
- Intervention points
- Adaptive scaffolding
- Chain-of-thought display

**Feedback Controls**
- Confidence visualization
- Iterative refinement
- Explanatory emphasis

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

## 5. Add Interaction Modalities

### New section: "Modality-Specific Agency"

**Textual**
- Natural language negotiation
- Prompt refinement loops
- Conversational handoffs

**Visual**
- Sketch-to-suggestion mapping
- Visual confidence indicators
- Spatial control distribution

**Multimodal**
- Combined input strategies
- Cross-modal feedback
- Unified control interfaces

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

## 7. Add Practical Examples

### New section: "Agency Patterns in Practice"

**Example 1: Writing Assistant**
- Passive: Spell check on demand
- Reactive: Grammar suggestions as you type
- Proactive: Style improvements offered
- Co-operative: Collaborative editing

**Example 2: Data Visualization**
- User-driven: Manual chart creation
- Assisted: Smart defaults
- Automated: Auto-generate from data
- Autonomous: Adaptive dashboards

## 8. Add Implementation Guidelines

### New section: "Implementation Considerations"

**State Management**
- Track agency distribution
- Handle control transitions
- Maintain interaction history

**Visual Design**
- Agency state indicators
- Control affordances
- Confidence visualization

**Interaction Design**
- Smooth handoffs
- Clear intervention points
- Predictable behavior

## 9. Connect to Conversational Concepts

### Add links to relevant concepts:
- Link Task → Agency distribution
- Link Delegation → Control mechanisms
- Link Planning → Iterative feedback
- Link Intervention → Modification patterns
- Link Interpretation → Transparency

## 10. Add Challenges & Ethics

### New section: "Challenges"

**Technical**
- Real-time agency negotiation
- Consistency across modalities
- Performance optimization

**Ethical**
- Responsibility attribution
- Bias in agency distribution
- Transparency requirements

**Social**
- Skill preservation
- Trust calibration
- Power dynamics

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
3. **Then**: Add control mechanisms
4. **Later**: Examples and case studies
5. **Future**: Interactive demos