# NeuroSync Paper - Working Notes

## Paper Metadata
- **Title**: NeuroSync: Intent-Aware Code-Based Problem Solving via Direct LLM Understanding Modification
- **Authors**: Wenshuo Zhang, Leixian Shen, Shuchang Xu, Jindu Wang, Jian Zhao, Huamin Qu, Lin-Ping Yuan (HKUST, University of Waterloo)
- **Type**: System paper with formative study and user evaluation
- **Domain**: Human-LLM Interaction, AI-assisted programming for non-programmers

## Core Problem: Bidirectional Ambiguity

Unlike IntentFlow which focuses on writing tasks, NeuroSync addresses coding tasks for domain users with limited programming experience.

### Bidirectional Ambiguity Definition
Both user intents and coding tasks are inherently **nonlinear**, yet must be expressed and interpreted through **linear** prompts and code sequences.

#### User-to-LLM Ambiguity
Three key issues:
1. **Nonlinear intent loss**: Hierarchical goals flatten into linear prompts, losing structure and global context
2. **Contextual omissions**: Delayed articulation and limited memory cause missing information
3. **Vague modification guidance**: Domain users describe outcomes without specifying what to change

#### LLM-to-User Ambiguity
Users with limited programming experience struggle to:
- Unpack nonlinear task structures embedded in code
- Identify task boundaries
- Understand the model's reasoning
- Spot unintended logic or partial completions

## Solution: Direct Intent-Task Matching Paradigm

### LLM Understanding
The **LLM understanding** refers to the coding tasks and their relationships that the LLM infers from user prompts—the implicit structure that guides code generation.

### Direct Intent-Task Matching Process
1. **Externalize** LLM understanding before code generation
2. Allow users to **directly inspect and modify** task representations
3. Users can **diagnose and correct** misalignments at task level
4. **Feed corrected understanding** back to LLM for aligned code generation

### Key Difference from Traditional Paradigm
- **Traditional**: Prompt → Code (black box)
- **NeuroSync**: Prompt → LLM Understanding (visible & editable) → Code

## NeuroSync System Architecture

### Three-Panel Interface
1. **LLM Conversation Panel**: Standard chat interface
   - But incorporates Understanding Graph into generation process
   - Can iterate on graph without new prompt

2. **Understanding Graph Manipulation Panel**:
   - **Graph-level modification**: Natural language instructions for large-scale edits
   - **Node-level modification**: Manual adjustment of individual tasks/links
   - Direct editing of task descriptions, adding/deleting nodes

3. **Intent-Task Mapping View**:
   - **Intent Tree View**: Hierarchical representation of user's goals
   - **Simplified Understanding Graph**: Filtered version highlighting relevant nodes
   - Intent-aware simplification reduces cognitive load

### Triple Extraction
A **triple** consists of three components:
1. **Intent Tree**: Hierarchical user goal decomposition
2. **Understanding Graph**: Directed graph of coding tasks and dependencies
3. **Mapping**: Links between intent nodes and understanding graph nodes

### Technical Components

#### 1. Knowledge Distillation Pipeline
**Problem**: Two-stage extraction is slow (2 LLM calls: prompt → code → triples)

**Solution**: Fine-tune Small Language Model (SLM) to extract triples directly from prompts
- Teacher path: Two-stage extractor with intermediate code
- Student path: SLM extracts triples directly (prompt → triples)
- Alignment via MSE loss
- **Result**: 13-43× faster on different hardware

#### 2. Multi-Agent Data Generation
Four agents simulate domain user behavior:
- **Intent Tree Constructor**: Decomposes problems into hierarchical subtasks
- **Code Generator**: Generates code like ChatGPT
- **Execution Analyzer**: Simulates code execution and result comparison
- **Domain User Simulator**: Crafts prompts like non-programmer users

**Process**:
1. General task description → Intent tree
2. Loop: User prompt → Code → Execution → Update intent tree status
3. Terminate when all tasks [COMPLETED] or no progress for 5 rounds

#### 3. Intent-Aware Graph Simplification
**Problem**: As interaction progresses, graph becomes complex and hard to track

**Solution**: Two-stage algorithm
1. **Intent tracking**: NFA-based automatic intent tree updates
2. **Graph simplification**: Recursive topological reduction
   - Focus node set F contains nodes related to intent changes
   - Subgraphs not containing F are collapsed into supernodes
   - Preserves structures containing F, merges unrelated branches

## Formative Study Findings

### Study 1: Understanding Misalignment (N=6)
Analyzed real conversation histories from domain users.

**Key Finding**: Bidirectional ambiguity is the major cause of misalignment

**User-to-LLM issues observed**:
- Nonlinear intent (tree-like) flattened into linear prompts
- Missing contextual information
- Vague modification requests without specifying what to change

**LLM-to-User issues observed**:
- Users need to reconstruct code structure themselves
- Difficult to map linear code back to nonlinear task logic
- Low programming ability leads to ambiguity

### Study 2: Graph Representation Exploration (N=6)
Tested graph-based tech probe with two-stage extractor.

**Benefits identified**:
- Improved task comprehension through dependency visualization
- Enhanced efficiency in locating logic points
- Better than direct code reading for non-programmers

**Challenges identified**:
- Graph complexity grows with interaction rounds
- Need for abstracted overviews with zoom capabilities
- Need for node-level exploration
- Need for grouping and annotating task clusters

### Design Considerations
**DC1**: Support bidirectional disambiguation through intent and task externalization
- User-to-LLM: Make intent explicit, editable, preserve structure
- LLM-to-User: Externalize tasks in interpretable form

**DC2**: Enhance fluid modification with low-latency interactions
- Avoid disrupting user focus
- Use lightweight extraction mechanisms

**DC3**: Leverage structured graph representations with intent-aware abstraction
- Graph for tasks, tree for intent
- Dynamic abstraction based on evolving intent

## User Study Results (N=12)

### Participants
Domain users (design, linguistics, education, economics, finance, architecture)
- Limited programming experience (M=2.0/5)
- Some LLM experience (M=4.16/5)

### Tasks
1. Web crawler for WeChat articles
2. Audio processing: MP3 → text + keyword extraction

### Quantitative Results

**System Usability** (7-point Likert scale, all p<.05):
- Q1 Learnability: Baseline 4.58 → NeuroSync 5.75
- Q2 Task attention: 3.83 → 6.08 (Diff: 2.25)
- Q3 Code understanding: 3.67 → 6.42 (Diff: 2.75)
- Q4 Intuitive modification: 3.83 → 5.83 (Diff: 2.00)
- Q5 Flexible modification: 3.33 → 6.25 (Diff: 2.92)
- Q6 Sense of control: 3.08 → 6.42 (Diff: 3.33)
- Q7 Alignment: 4.08 → 6.67 (Diff: 2.58)

**Cognitive Load** (NASA-TLX):
- Overall: 13.26 → 8.93 (p<.001)
- Time demand (D3): Diff = 9.3 (p<.001)
- Frustration (D6): Diff = 7.3 (18% → 10%)

**Coding Efficiency**:
- Task completion time: 23.8 min → 13.9 min (p<.001)
- LLM calls: 3.9 → 1.3 (p<.001)
- Task focus time: 42.3% → 62% of total time

### Qualitative Insights

**Improved Task Understanding** (P1-7, P9-10, P12):
- "I didn't need to understand every line of code—I just looked at the flow and knew what was going on" (P3)

**Reduced Programming Barrier** (P1, P3-5, P8-9, P12):
- "The graph helped me break down what I wanted into manageable parts—without thinking about how to write it in code" (P4)

**More Accurate Modifications** (P3-9, P12):
- "Instead of rewriting everything, I just fixed the node that was wrong and got what I wanted" (P6)

**Fewer Dialog Turns** (P2-3, P5, P7-10):
- "Normally it takes me five tries to get it right. With this, I got most of it on the first go" (P8)

**Effective Graph Simplification** (All participants):
- "It's like zooming out and zooming in at the same time" (P9)

**Changed Interaction Patterns**:
1. **Misalignment resolution**: From partial/sequential to complete/parallel
   - Baseline: Fix one issue → introduce new issues
   - NeuroSync: Fix all issues in one pass by modifying graph

2. **Timing of instruction**: From reactive to proactive
   - Baseline: Instructions after each code generation
   - NeuroSync: Align intent before generation (after reviewing intent tree)

**Changed Debugging Behaviors**:
1. **Code-free testing**: Task-directed without understanding code
2. **Parallel debugging**: From sequential step-by-step to one-shot

## Technical Evaluation Results

### Similarity to Two-Stage Extractor (Ground Truth)
Fine-tuned SLMs vs Zero-shot baselines on ROUGE and BLEU metrics:

**LLaMA 8B** (best performance):
- ROUGE-1: 0.8621 → 0.9274
- ROUGE-2: 0.7277 → 0.8545
- ROUGE-L: 0.8214 → 0.9126
- BLEU: 0.8741 → 0.9434

All achieve >90% alignment with ground truth after fine-tuning.

### Efficiency Gains
**Valid tokens per second** (excluding intermediate tokens):

3090 GPU:
- Llama 8B: 7.7× faster than baseline
- Qwen 7B: 13.1× faster

A800 GPU:
- Llama 8B: 20.2× faster than Qwen-Max baseline
- Llama 8B: 22.9× faster than DeepSeek R1 baseline

## Connections to Broader Research

### Compared to IntentFlow
Both papers address intent communication but in different domains:
- **IntentFlow**: Writing tasks, general LLM use
- **NeuroSync**: Coding tasks, non-programmers

### Related Concepts

**Human-LLM Alignment in Coding**:
- Similar to abstract matching (Sarkar et al.)
- Addresses gulf of envisioning (Subramonyam et al.)

**Graph-Based Interfaces**:
- Similar to WaitGPT (data analysis), CoLadder (structured decomposition)
- Different: Dynamic simplification based on evolving intent

**LLM Reasoning and Task Structuring**:
- Related to Chain-of-Thought, Tree-of-Thought, Graph-of-Thoughts
- Different: Externalizes structure for user manipulation, not just improving internal reasoning

**Feedforward Mechanisms**:
- Previews LLM understanding before code generation
- Reduces abstraction gap and iteration cost

**Program Synthesis**:
- Traditional: Code-level interactions (input-output examples, execution traces)
- NeuroSync: Task-level interactions (high-level understanding)

## Key Terminology

**Bidirectional Ambiguity**: Mismatch where both user intents and coding tasks are nonlinear but must be expressed through linear representations

**LLM Understanding**: The coding tasks and their relationships inferred by LLM from user prompts, serving as basis for code generation

**Direct Intent-Task Matching**: Paradigm allowing users to engage directly with LLM understanding before code generation to address bidirectional ambiguity

**Triple**: Combined structure of Intent Tree, Understanding Graph, and their Mapping

**Intent-Aware Graph Simplification**: Dynamic algorithm that highlights nodes related to intent changes and collapses irrelevant nodes

**Knowledge Distillation Pipeline**: Teacher-student framework where SLM learns to extract triples directly from prompts without intermediate code generation

## Design Takeaways

1. **Externalization enables parallel resolution**: When LLM understanding is visible, users can shift from sequential to parallel misalignment resolution

2. **Dynamic adaptation to changing intent**: Multi-round interactions require targeted information aligned with updated user intents

3. **Personalization opportunities**: Users have varying preferences for granularity, metadata, and layout—adaptive strategies could further improve usability

## Generalization Beyond Coding

While focused on code generation, the paradigm extends to:
- Writing assistance
- Data analysis
- Data visualization
- Creative design

Any complex reasoning task with:
- Intent drift
- Semantic ambiguity
- Nonlinear task structures
