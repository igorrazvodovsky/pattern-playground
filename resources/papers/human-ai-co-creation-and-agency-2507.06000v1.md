

# Exploring Collaboration Patterns and Strategies in Human-AI Co-creation through the Lens of Agency: A Scoping Review of the Top-tier HCI Literature

SHUNING ZHANG, Tsinghua University, China

HUI WANG, University of Duisburg Essen, Germany

XIN YI, Tsinghua University, China and Zhongguancun Laboratory, China

![](2cb4ae7af8981b4179851b065f41dab8_img.jpg)

Figure 1 illustrates the research framework for the scoping review of human-AI co-creation analyzed through the lens of agency. The framework is structured into five main dimensions:

- **Context** (Top Left): Includes Interaction Stage (Perceive, Think, Express, Test, Build, Collaborate) and Modality (Textual, Visual, Auditory, Multimodal and Hybrid).
- **Control Mechanisms** (Middle Left): Categorized into Input, Action, Output, and Feedback. Specific mechanisms listed are:
  - Input: Guided Input, Context Awareness, Transparency Explainability.
  - Action: Multimodal Exploration, Action Coordination, Attention Processing.
  - Output: Modification Intervention, Adaptive Scaffolding, Chain-of-Thought.
  - Feedback: Confidence Visualization, Explanatory Emphasis, Iterative Loop.
- **Patterns and Distributions of Agency** (Middle Right): Includes Agency Patterns (Passive, Reactive, Semi-proactive, Co-operative, Proactive) and Agency Distribution (Locus, Dynamics, Granularity).
- **Application Domains** (Bottom Center): Includes News, Accessibility, Healthcare, Art, Education & Research, Entertainment, and Software Development.
- **Challenges & Directions** (Bottom Right): Includes Creativity and Ownership, Trust and Transparency, Data Privacy and Security, Interoperability, Social Impact and Equity, Ethical and Bias Concerns, and Long-term Paradigm Shift.

Fig. 1. The research framework for the scoping review of human-AI co-creation analyzed through the lens of agency. Reflecting on core user-centric design principles, the framework integrates the following dimensions: context (including interaction stage and modality), patterns and distributions of agency (including agency patterns and distribution), control mechanisms (including categories encompassing input, action, output and feedback), application domains, and challenges & directions. Due to space constraints, we abbreviated the control mechanisms.

As Artificial Intelligence (AI) increasingly becomes an active collaborator in co-creation, understanding the distribution and dynamic of agency is paramount. The Human-Computer Interaction (HCI) perspective is crucial for this analysis, as it uniquely reveals the interaction dynamics and specific control mechanisms that dictate how agency manifests in practice. Despite this importance, a systematic synthesis mapping agency configurations and control mechanisms within the HCI/CSCW literature is lacking. Addressing this gap, we reviewed 134 papers from top-tier HCI/CSCW venues (e.g., CHI, UIST, CSCW) over the past 20 years. This review yields four primary contributions: (1) an integrated theoretical framework structuring agency patterns, control mechanisms, and interaction contexts, (2) a comprehensive operational catalog of control mechanisms detailing how

Authors' addresses: Shuning Zhang, zsn23@mails.tsinghua.edu.cn, Tsinghua University, Beijing, China; Hui Wang, hw1361376751@gmail.com, University of Duisburg Essen, Essen, Germany; Xin Yi, yixin@tsinghua.edu.cn, Tsinghua University, Beijing, China and Zhongguancun Laboratory, Beijing, China.

Permission to make digital or hard copies of all or part of this work for personal or classroom use is granted without fee provided that copies are not made or distributed for profit or commercial advantage and that copies bear this notice and the full citation on the first page. Copyrights for components of this work owned by others than ACM must be honored. Abstracting with credit is permitted. To copy otherwise, or republish, to post on servers or to redistribute to lists, requires prior specific permission and/or a fee. Request permissions from permissions@acm.org.

© 2025 Association for Computing Machinery.

XXXX-XXXX/2025/7-ART \$15.00

<https://doi.org/10.1145/nnnnnnn.nnnnnn>

agency is implemented; (3) an actionable cross-context map linking agency configurations to diverse co-creative practices; and (4) grounded implications and guidance for future CSCW research and the design of co-creative systems, addressing aspects like trust and ethics.

Additional Key Words and Phrases: Human-AI Interaction, Co-creation, Literature review, Human Agency, Machine Agency

## ACM Reference Format:

Shuning Zhang, Hui Wang, and Xin Yi. 2025. Exploring Collaboration Patterns and Strategies in Human-AI Co-creation through the Lens of Agency: A Scoping Review of the Top-tier HCI Literature. 1, 1 (July 2025), 39 pages. <https://doi.org/10.1145/nnnnnnn.nnnnnnn>

## 1 INTRODUCTION

Artificial Intelligence (AI) are increasingly transitioning from tools performing static tasks [50] to integral partners in collaborative processes like co-creation [200] and human-supervised autonomous systems [203]. This evolution marks a significant shift for Computer Supported Cooperative Work (CSCW), moving beyond traditional Human-Computer Interaction (HCI) paradigms [52] to encompass scenarios where AI actively collaborates [51, 133, 186]. As AI develops into a collaborative partner capable of proactive and potentially autonomous action [56, 124, 194], it introduces fundamental challenges to the CSCW community in terms of the *distribution and negotiation of agency* (e.g. initiative, control), *the operational mechanisms that enable this distribution*, and how these factors perform in various co-creative contexts and application domains [83, 119].

The concept of agency provides a critical lens for addressing the aforementioned complexities. Agency is understood here as the ability to act intentionally and exert control within a specific context [3, 100, 131], encompassing both human intentional action and the apparent agency perceived in machines. Although other valuable frameworks detail collaborative workflows [58, 124] or communication patterns [139], they often underexplored AI's proactive capabilities. Consequently, they may not inherently provide the tool to systematically investigate the *dynamic patterns of initiative* or the *concrete operational mechanisms* through which control is enacted. The agency perspective is crucial, as it directly addresses these aspects, enabling a structured analysis of *how* collaboration unfolds in terms of distributed action capabilities within various co-creative contexts.

Despite its importance, research applying the agency lens to human-AI co-creation is fragmented. Existing conceptualizations [56, 194] and frameworks [124, 200, 208] often lack granular detail on the specific operational control mechanisms needed to guide the design of practical systems. Although empirical studies [58, 63, 65] offer valuable situated insights, their focus on individual contexts limits the cross-context synthesis required to identify overarching patterns and design principles applicable across the co-creative landscape. Furthermore, investigations into mediating factors (e.g., interaction design [140], explainability [209]) typically occur in isolation, limiting the structured mapping of how agency patterns, control mechanism, and contextual factors interrelate. This reveals a critical gap: **the lack of a comprehensive and systematic overview mapping the interplay between agency patterns, the control mechanisms implementing them, and the co-creative contexts (modalities, domains) where they are employed.**

To address this critical gap—particularly the need for a systematic synthesis of agency patterns and the operational control mechanisms implementing them across diverse contexts, this paper presents a scoping review. We focus specifically on research published in prominent HCI venues (e.g., CHI, UIST, CSCW) over the past 20 years, as this body of literature provides a concentrated documentation of the interaction designs and implemented control strategies relevant to operationalizing agency in co-creation systems. Our analysis covers 134 papers, employing the methodology detailed in Section 3 and proposing a novel framework (Figure 1) to structure our investigation. The structure of the framework is informed by considerations of both system-level organization (integrating context, control, and application) [72] and user-centric design principles [28].

Applying our analytical framework, the analysis yields specific insights into how the agency is operationalized in practice. We first elaborate on the context dimension (Section 4), identifying key situational factors from the reviewed literature. We then identify and classify the principal forms of AI agency currently employed in co-creative systems, revealing a spectrum from passive tools to cooperative partners (Section 5). We systematically catalog the concrete control mechanisms documented across interaction stages (input, action, output, feedback) used to manage agency distribution (Section 6). Furthermore, our synthesis reveals recurring associations linking specific control strategies (e.g. transparency, iterative feedback loops) and agency patterns with particular application domains and reported collaboration dynamics (Section 7). These findings directly inform our core contributions: the integrated analytical framework itself, the comprehensive catalog of operational control mechanisms, an actionable cross-context map of current practices, and grounded implications for the CSCW community (Sections 8-9).

## 2 RELATED WORK

Agency is a foundational concept that is studied in diverse fields. Psychology clarifies its cognitive origins and perception mechanisms [168, 188], sociology addresses complex questions of intentionality and responsibility [25, 103], while AI examines emerging machine capabilities and their perceptual effects [41, 147]. These diverse inquiries collectively shape our understanding of human action, machine behavior, and their societal implications. Based on this broad context, our review adopts an HCI/CSCW lens. Here, AI's growing capabilities drive human-AI partnerships, bringing agency, control, and autonomy into the CSCW community's focus [2, 34, 99]. We synthesize literature on agency allocation, the distinction between agency and control, and examine co-creation frameworks relevant to this scope.

### 2.1 Agency and Its Distribution in Human-AI Collaboration

Agency, central to HCI [157], yet often ambiguously defined [17], encompasses both human and machine agency. Humans exhibit intentional agency, machines display apparent agency, the perception of thinking and acting capacities that machines seem to possess during interaction [24, 169]. The interplay between these forms, particularly in the closely coupled systems characteristic of human-AI collaboration [39, 126], requires understanding the dynamic distribution of the agency between partners [17].

With regard to this distribution, previous work explores both conceptual models and empirical studies. Conceptual frameworks, like multi-level models [200] or user-centered approaches [124], provide high-level structures but often lack granular detail on specific operational control mechanisms for practical design across diverse contexts [56, 194, 208]. For instance, Zhang et al. [200] did not categorize specific control mechanisms. While proposing dimensions for user configuration, Moruzzi et al. [124] did not systematically synthesize the spectrum of control mechanisms or embed these in various contexts reported in the literature. Similarly, Zhou et al. [208] proposed nonlinear co-design frameworks, but did not focus on synthesizing agency patterns and control mechanisms. Holter et al. [68] proposed an adaptation model to agency interactions, but did not provide a granular and operational analysis of specific control mechanisms.

Furthermore, empirical studies, while offering valuable insights [58, 63, 65], are often limited to a specific context, limiting generalizability between settings. Gao et al. [58] for instance, emphasized interaction patterns, leaving agency dynamics and control mechanisms less examined. Furthermore, mediating factors like interaction design [140] or explainability [209] are often analyzed separately, obscuring their integrated role in agency dynamics. **Consequently, a systematic synthesis mapping agency patterns to their operational control mechanisms in various co-creative contexts is needed. This review aims to provide this integration.**

### 2.2 Distinguishing Agency and Control in Human-AI Collaboration

Analyzing human-AI collaboration requires clearly distinguishing between agency and control, although these concepts are often conflated [17, 198]. Agency primarily concerns intentional initiation, while control refers to the operational means of executing those intentions [100, 131]. This differentiation is crucial when interacting with AI partners capable of autonomous action [3], where high-level user intent (agency) must interface with low-level system manipulation (control) [186]. The relevant theoretical work offers different perspectives [3, 17]. Specifically, Ågerfalk et al. [3] conceptualized AI as ‘a digital agency’ capable of autonomous action (control) on behalf of humans (agency) and used context, communication and practice as key factors for analyzing this dynamic. Bennett et al. [17] synthesized dimensions from the HCI literature on agency and autonomy (often used interchangeably with control). These dimensions include distinctions like self-causality versus identity, experience versus material reality, differing time-scales, and independence versus interdependence. While insightful, these abstract dimensions do not readily map to concrete control mechanisms. This review clarifies how the agency operates through specific controls by identifying and categorizing mechanisms from the literature.

### 2.3 Human AI Co-Creation Framework

Prior research offers foundational principles, conceptual models, and user-centric views relevant to human-AI co-creation, yet lacks a systematic synthesis detailing the interplay between agency patterns and the operational control mechanisms. Early foundational work established crucial interaction principles. Horvitz et al. [71] defined mixed initiative principles that optimize interaction based on utility and uncertainty, while Amershi et al. [7] provided validated general human-AI interaction guidelines. While pioneering, this foundational work did not specify how the agency is operationally distributed through control mechanisms.

Conceptual models later structured the co-creation process. Wu et al. [194] conceived AI roles (e.g. collaborator, tool) throughout creative stages, and Zhang et al. [200] proposed a three-level structure for AI involvement. Others specifically mapped text generation stages and controls [32] or co-writing patterns [46]. These structural views offer valuable abstractions but lack detailed mapping of the concrete control mechanisms implementing agency variations, particularly across diverse, non-textual modalities.

Other studies adopted user-centered or context-specific lenses. Gmeiner et al. [60] highlighted designers’ struggles to understand outputs and communicate goals when learning specific AI manufacturing tools. Kim et al. [87] classified ten AI roles prevalent in daily life and compared the perceptions of laypeople. Moruzzi et al. [124] synthesized a user-centered framework that structures interactions through guidance, configuration, and dynamics. Although these studies illuminate user experiences and situated difficulties, they do not systematically map the underlying control mechanisms or the resulting agency distributions across different human-AI co-creative domains.

## 3 SCOPE, DEFINITIONS AND METHODOLOGY

This paper presents a scoping review of human-AI co-creation, examining collaboration dynamics through the lens of agency. Our central aim is to understand how perceived human agency and machine agency influences the co-creative process and its results. This section first delineates the review’s scope, and defines key terms (Section 3.1). We then propose the research framework (Section 3.2) and the systematic methodology employed for literature selection and analysis (Section 3.3). Finally, we summarize our contributions (Section 3.4).

### 3.1 Scope and Definitions

To ensure clarity and focus, this section defines the operational boundaries and key terminology used throughout this survey. These definitions are tailored to the objectives of our paper.

**Human-AI Co-creation:** Generally recognized as a sub-field of human-AI collaboration [58, 194], it lies at the intersection of Computational Creativity (CC) and HCI [124]. This process often entails a dynamic partnership where humans and AI contribute unique strengths towards shared creative goals [134], frequently involving what is termed “AI creativity”. “AI creativity” emerged aside human creativity [174], marking its change towards a potential collaborator [22, 120]. Building on concepts like computational creativity [38] and synergistic human-AI relationships [194], we adopt Wu et al.’s [194] definition of “AI creativity” for this survey as: *the capacity of AI systems to support and mutually facilitate human creative work by contributing distinct capabilities towards shared creative goals*. Integrating this aspect, we scope Human-AI Co-creation as: *the activity where AI assists humans, often with a dynamic partnership and leveraging AI creativity, to complete creative works with each contributing unique efforts*. For this scope, we excluded: (1) works where AI performs only routine automation without creative contribution (e.g., basic spell checkers [127], simple data retrieval [95]); (2) studies solely on human-human co-creation [170]; (3) AI assistance in purely analytical tasks lacking generative output [57].

**Agency (as an Analytical Lens):** To investigate the dynamics within co-creation, this review adopts agency as the central lens. Fundamentally, agency signifies the capacity to act or exert power [104, 144]. Human agency is often linked to notions of intentionality, self-causality [17], and the experience of control over one’s actions and their effects, sometimes conceptualized via ‘locus of control’ [157]. Concurrently, advancements in AI have led to systems exhibiting increasingly autonomous behaviors [167], giving rise to the concept of machine agency. Generally, this is understood as the capacity of machines to act autonomously and interact with users or environments [24]. Despite the general concepts, analyzing agency within interactive systems requires a focused viewpoint.

**The HCI/CSCW Perspective on Agency:** The fundamentally interactive nature of human-AI co-creation necessitates an analytical approach grounded in HCI/CSCW, a discipline concentrating on the design, evaluation, and implementation of interactive computing systems for human use [28]. Distinct from philosophical inquiries into true intentionality [53] or AI research concentrated on autonomous capabilities [141], our HCI/CSCW viewpoint specifically examines how agency, including both human agency and the agency attributed to machines, is *manifested, perceived, negotiated, and managed through the design and use of the interactive system* [155]. This perspective prioritizes user experience, the allocation and dynamics of control, system transparency, and the practical effectiveness of the human-AI partnership in forming a “closely coupled system” [39, 126]. Key concerns involve supporting users’ sense of control and understanding how system behaviors are interpreted as agentic [17].

**Agency and Control within HCI/CSCW:** Operating from this HCI/CSCW perspective, we delineate agency and control, two core definitions. Agency, within this context, primarily pertains to the intentional initiation of action and the subjective experience of directing outcomes toward specific goals [100, 131]. Crucially for HCI and CSCW communities, this includes not only human intentional action but also the apparent agency attributed to AI systems [169]. It is imperative to distinguish this higher-level sense of agency from Control. Control denotes the operational aspect, specifically the concrete mechanisms, commands, and manipulations employed by the user (or system) to execute intentions and influence system parameters during interaction [3, 131, 186]. This distinction, often blurred but critical [17, 198], allows for a multi-level analysis of co-creative interaction, examining both high-level goal-directed guidance (agency) and the specific means of execution (control) [17].

**Literature Scope and Justification:** To ensure the quality and relevance of the literature underpinning this review, we implement a focused scoping strategy. Our analysis concentrates primarily on research published within leading, peer-reviewed HCI/CSCW conferences, the principal forums where state-of-the-art HCI/CSCW research is presented, scrutinized, and debated. Our strategic focus is essential for engaging directly with methodologically sound studies and central theoretical advancements pertinent to human-AI co-creation and agency. Prioritizing these high-impact venues allows us to capture the core discourse and significant contributions within the field. **Crucially, this selective methodology guarantees that our synthesis is built upon a**

**foundation of rigorously reviewed research shaping the HCI/CSCW understanding of human-AI partnership.**

### 3.2 Framework

To systematically address the identified gap regarding the operationalization of agency across diverse human-AI co-creation contexts [83, 119], specifically the lack of a comprehensive overview linking agency patterns, control mechanisms and context factors, we developed the analytical framework in Figure 1. This framework provides a structured lens to synthesize fragmented HCI literature [58, 65, 124, 200, 208]. Its design integrates a multi-level, system-oriented perspective [72] with user-centric design principles [28] to analyze the agency landscape and address practical CSCW challenges. The framework integrates key dimensions reflecting a logical flow: the surrounding **context**, the core **patterns and distributions of agency**, the implementing **control mechanisms**, specific **application domains**, and overarching **challenges & directions**, enabling a systematic mapping of how agency manifests, where, and how it is interactively achieved, and the associated difficulties.

Each dimension is critical for understanding the operationalization of agency. Because interaction fundamentally depends on its specific circumstances (e.g., task, environment) [161], analyzing **context** is essential for synthesis beyond isolated case studies. We thus examine interaction stage [194, 200] to account for stage-specific agency patterns, and interaction modality [152], as the channel shapes control possibilities. The **patterns and distributions of agency** dimension serves as the core theoretical lens, through which we examine AI initiative via agency patterns (e.g., passive to co-operative [136]) and authority management via agency distribution (locus, dynamics, granularity), extending prior conceptualizations [68] to enable structured analysis. The **control mechanisms** dimension catalogues the concrete means through which agency is operationalized, offering actionable design insights for the CSCW community, with mechanisms (e.g., Guided Input, Iterative Feedback Loops [70, 107, 191]) organized within an Input-Action-Output-Feedback interaction cycle [192]. The **application domains** dimension grounds the analysis by mapping these findings onto specific fields (e.g., healthcare, software development [194]), thereby increasing the actionability of the insights. Finally, the **challenges & directions** dimension synthesizes persistent issues (e.g., societal implications, ethics, long-term paradigm shift), guiding future research and responsible design.

### 3.3 Methodology

We wanted to select conferences that are the most central and concentrated area where this type of interaction-centric HCI research is typically presented and debated. Thus, we conducted a scoping review on top-tier HCI conferences. Our methodology followed the principles outlined in the PRISMA-ScR (Preferred Reporting Items for Systematic Reviews and Meta-Analyses, Extended for Scoping Reviews) guidelines [173]. The process involved structured literature searching and selection, followed by analysis and synthesis of the identified papers (detailed justifications and figures shown in Appendix A and Figure 9).

**Literature Search and Selection:** Our primary search database was the ACM Digital Library, selected for its comprehensive coverage of premier HCI venues. Targeting publications up to August 2024, the search terms included combinations of (“co-creation” OR “co-writing” OR “co-drawing” OR “co-design”) AND (“agency”), applied to titles and full text. This strategy aimed to capture research at the intersection of HCI processes and agency manifestation. This resulted in 2799 records. After selecting HCI venues and scoping the time to recent 20 years, this resulted in 728 records.

**Screening** The initial search yielded 728 records. These underwent a screening process conducted by two researchers based on pre-defined criteria. We screened titles and abstracts for relevance to the core topic of human-AI co-creation and agency. We excluded records for two reasons: SC1. irrelevant topics: papers whose titles or abstracts clearly indicated a focus outside the scope of human-AI co-creation and agency (N=146 excluded).

SC2. not full paper: records that were not peer-reviewed full papers (e.g., workshop summaries, posters) (N=46 excluded). A total of 192 records were excluded during this initial screening, leaving 536 papers eligible for full-text review.

**Eligibility** The remaining 536 papers were assessed for eligibility through full-text review. We applied three criteria: EC1. Relevance to Co-creation: papers not focused on collaborative or co-creative processes within an HCI context were excluded (N=185 excluded, e.g., algorithm optimization, autonomous navigation). EC2. Focus on concrete HCI contributions: papers discussing agency or co-creation at a conceptual, philosophical, ethical level without detailing or evaluating HCI techniques, interaction designs, or systems were excluded (n=95 excluded, e.g., high-level framework proposals). EC3. Focus on human-AI interaction: papers involved only human-human or AI-AI collaboration were excluded (N=122 excluded). This process resulted in 134 papers for detailed analysis.

**Analysis and Synthesis:** We used a hybrid thematic analysis approach [26], a methodology well-suited for literature reviews requiring applications of existing theories and discovery of emergent patterns [160]. Two researchers jointly coded the final 134 papers, with intermittent discussions to solve disagreements. Our coding framework integrated both deductive and inductive dimensions: deductive coding applied established theoretical frameworks, while inductive coding identified and refined themes directly from data presented in the papers (details see Appendix B).

**Overview of Selected Papers:** The final corpus of 134 papers reflects diverse research approaches. As illustrated in Figure 2, qualitative research (N=62) and user-centric design (N=61) were the most common methods, followed by mixed-methods research (N=49). In terms of contribution types, design (N=98) and system implementation (N=66) were predominant, with significant contributions also coming from interviews (N=59). These papers were primarily from recent years (Figure 3), which reflected that the active role of AI propelled discussions of agency and co-creation. These papers are drawn from top-tier conferences with the following distribution: 108 CHI<sup>1</sup> papers, 4 CSCW<sup>2</sup> papers, 5 DIS<sup>3</sup> papers, 9 IUI<sup>4</sup> papers and 8 UIST<sup>5</sup> papers.

![](4279c8be6ec4ed56f4b3349be98bb426_img.jpg)

Figure 2 displays two pie charts illustrating the research methods and contribution types of the papers.

(a) Research methods: Qualitative research (31.3%), User-centric design (30.8%), Mixed-methods research (24.7%), Theoretical framework (8.1%), Quantitative research (4.5%), Novel research methods (0.5%).

(b) Contribution types: Design (35.3%), System implementation (23.7%), Interview contribution (21.2%), Concept generation (12.9%), Comparison studies (6.1%), Evaluation (0.7%).

Fig. 2. The research methods and contribution types of the papers.

<sup>1</sup>The ACM Conference on Human Factors in Computing Systems

<sup>2</sup>The ACM Conference on Computer Supported Cooperative Work

<sup>3</sup>The ACM Conference on Designing Interactive Systems

<sup>4</sup>International Conference on Intelligent User Interfaces

<sup>5</sup>ACM Symposium on User Interface Software and Technology

![Line graph showing the number of publications per year from 2011 to 2024. The Y-axis is 'Number of Publications' (0 to 60) and the X-axis is 'Year'. The data points are: 2011 (1), 2012 (1), 2013 (1), 2014 (1), 2015 (2), 2016 (1), 2017 (2), 2018 (3), 2019 (1), 2020 (7), 2021 (17), 2022 (41), 2023 (56). The graph shows a sharp increase in publications starting around 2020.](3121afa7ca030b22ee0345864ca6f38b_img.jpg)

Line graph showing the number of publications per year from 2011 to 2024. The Y-axis is 'Number of Publications' (0 to 60) and the X-axis is 'Year'. The data points are: 2011 (1), 2012 (1), 2013 (1), 2014 (1), 2015 (2), 2016 (1), 2017 (2), 2018 (3), 2019 (1), 2020 (7), 2021 (17), 2022 (41), 2023 (56). The graph shows a sharp increase in publications starting around 2020.

Fig. 3. The publication numbers per year from our selected 134 papers.

### 3.4 Contributions

Our review adopts **agency as a central analytical lens** to offer distinct contributions, aimed at informing the CSCW community’s understanding and design of human-AI collaboration:

**[Theoretical] An integrated framework for agency analysis:** We propose a multi-dimensional analytical framework (Figure 1) unifying agency patterns, operational control mechanisms, and interaction contexts, providing a necessary theoretical structure for analyzing human-AI co-creation.

**[Operational] Comprehensive catalog of control mechanisms:** We deliver a comprehensive categorization of concrete control mechanisms from HCI practice, detailing how agency is operationalized and informing system design.

**[Actionable] Cross-context map of co-creation practices:** Through extensive synthesis (134 papers in HCI venue), we construct an actionable map linking agency configurations (patterns, mechanisms) to co-creative contexts, offering a structured, cross-context overview that counters research fragmentation.

**[Implications] Grounded guidance for CSCW:** We derive specific design implications and future research directions from the synthesis, providing evidence-based material for deeper CSCW discussions on trust, ethics, and the design of future co-creative systems.

## 4 CONTEXT

### 4.1 Interaction Stage

There are many frameworks for classifying interaction stages. Although co-creation literature presents frameworks such as Guo et al.’s discover, define, develop, deliver model [63], their framework were refined to designers and may not reflect the broad practice in co-creation. Wu et al. [194] proposed a process-oriented classification—perceive, think, express, collaborate, build, and test—which Zhang et al. [200] subsequently utilized for co-creation taxonomies. Recognizing that agency manifests dynamically throughout this interactive process, we adopt Wang et al.’s six-stage classification to systematically analyze the context of agency.

**Stage-1. Perceive:** This initial stage involves both human and AI actors gathering and interpreting information to establish a shared understanding of the task context and goals. The human formulates intent and provides initial input, which can range from textual prompts [55] and visual data [51, 178] to audio [84, 109], video [113, 185], or embodied inputs like gestures [21, 40, 206]. The clarity and specificity of human input critically shape the AI’s perception and subsequent actions, representing a primary locus of human agency in directing the process. Concurrently, the AI perceives user input and contextual data, activating its internal models. The effectiveness of

this stage affects the AI's ability to accurately interpret diverse inputs and the human's skill in articulating goals, directly influencing human and AI agency.

**Stage-2. Think:** Following perception, this stage encompasses the internal cognitive or computational processes where both human and AI formulate ideas, strategies, and potential solutions. For the AI, this involves processing the perceived input using underlying algorithms for tasks such as natural language understanding [45, 148, 191], image recognition or generation [16, 51, 102], data analysis [11], qualitative reasoning [59, 171], or decision-making [18]. Human agency is exercised through mental modeling, planning, and evaluating possibilities, often informed by prior knowledge and intuition. AI agency in this stage relates to its computational capabilities and algorithmic autonomy to generate novel or relevant intermediate representations based on its task interpretation. The alignment (or misalignment) between human and AI 'thinking' critically impacts the collaborative trajectory.

**Stage-3. Express:** This stage involves articulating and externalizing internally generated ideas or results. The AI expresses its 'thoughts' by generating outputs, manifested as text [55, 148, 165], images [51, 178], sounds [109, 164], multimodal content [11], embodied actions [40, 122], or decisions [18]. The clarity, relevance, and interpretability of the AI's expression are crucial for human comprehension and subsequent action, influencing the perceived usefulness and agency of the AI partner. Simultaneously, humans express their ideas, refinements, or directives, often through further input or manipulation of the AI's output. Human agency is prominent here in selecting, filtering, and communicating ideas, while AI agency is perceived through the form and content of its generated expressions.

**Stage-4. Collaborate:** The stage embodies the core interactive partnership, characterized by iterative exchanges aimed at refining ideas, resolving discrepancies, and jointly advancing the creative endeavor [68, 139]. It often involves turn-taking and negotiation [10], where humans critique or modify AI suggestions [195, 197], and the AI responds to human feedback, potentially asking clarifying questions [67] or offers alternatives [122, 193]. Agency during collaboration becomes highly distributed and dynamically negotiated [68, 93]. Effective collaboration requires mechanisms that foster mutual understanding and coordinated action. Transparency and explainability regarding AI actions [70, 187, 209] are crucial for enabling humans to appropriately trust and engage with AI contributions [191, 201]. Furthermore, well-designed communication protocols and interaction modalities [117, 140] are vital for balancing human directorial control [55] with productive AI initiative [71], facilitating synergistic outcomes [162, 191]. The perceived role of the AI (tool, teammate, or expert) significantly shapes these dynamics [87, 206].

**Stage-5. Build:** This stage translates collaboratively refined concepts into tangible artifacts or implemented solutions. It involves concrete construction, where humans might assemble physical components [21], write or finalize code [79, 191], render detailed designs [88], or structure narrative elements [130]. AI contributions generated in earlier stages often serve as foundational blocks, templates [76], or reference materials during building. Furthermore, AI can actively participate in this stage by automating specific construction tasks (e.g., code translation [191], component generation [66]), simulating outcomes to guide refinement [85], performing detailed modifications under human guidance [84, 153], or assisting in the fabrication process itself [5, 207]. Human agency often pivots towards execution, integration, and fine-grained control [178] during this stage, materializing the co-created vision. The manifestation of AI agency can vary significantly, ranging from a passive resource provider to an active co-constructor [177], contingent upon the system's capabilities and the predefined collaborative workflow [206].

**Stage-6. Test:** Finally, this stage encompasses evaluating the co-created output against initial goals or emergent criteria. Humans assess the artifact's quality, functionality, and alignment with their vision. This evaluation often involves providing feedback, which can loop back to earlier stages for iteration. Feedback modalities can range from explicit interface-based adjustments [84, 201] and natural language corrections [51] to ratings [146] or embodied reactions [14], reflecting nuanced qualitative assessments [146] or sometimes minimal explicit

feedback [182]. Human agency is paramount in judging the outcome and deciding on revisions, while AI agency might exist in automated testing or learning from evaluations to improve future performance. This stage closes the loop, fostering adaptation and learning for both partners.

### 4.2 Interaction Modality

Human-AI co-creation systems facilitate collaboration through diverse interaction modalities, shaping the nature of the partnership and the distribution of agency [152]. While prior work has proposed categorizations based on the type of creative output or domain, such as text and language, visual arts, music/audio, and software development [80], or the specific data type involved like textual, 2D visual, layout, numerical, audio and 3D graphics [152], this section classifies interaction based on the primary channel through which humans and AI exchange information and exert influence during the collaborative process. We identify four principal modalities, acknowledging that practical applications often involve hybrid approaches.

**Modality-1. Textual Interaction:** This modality centers on the collaborative manipulation of symbolic language. Humans and AI partners engage primarily through written text for generation, refinement, and analysis. Examples include AI assisting in generating or suggesting edits for code [35, 191, 193], where AI suggestions can reduce errors [190], or enhancing academic writing [45, 132, 165], where appropriate scaffolding significantly improves outcomes, especially for less experienced users [45]. This modality also underpins collaborative ideation [148, 199], story editing [197], and structured exploration of AI-generated responses to advance creative workflows [163]. The core interaction involves linguistic exchange, leveraging AI's capacity for processing and generating coherent and contextually relevant text.

**Modality-2. Visual Interaction:** Collaboration in this modality revolves around the creation, modification, and interpretation of visual information, encompassing both static and dynamic forms. This includes co-drawing, where AI assists in generating sketches or suggesting palettes or visual artworks [6, 44, 153] or daily images [51, 102, 113], with text-to-image prompts notably facilitating verbal articulation in design ideation [102]. It also extends to video co-editing for applications like filmmaking [135], short video generation [185], and content moderation [35, 112]. Here, AI capabilities in scene detection, clip selection, or effect application augment human creative direction. Studies highlight factors influencing adoption in areas like robotic cinematography [135], the impact of algorithmic recommendations on user agency [112], creator adaptation strategies [35], and the use of visual media for cultural heritage promotion [185]. Reframing co-creative practices through post-human perspectives also informs this space [171].

**Modality-3. Auditory Interaction:** This modality focuses on collaborative engagement through sound, including music creation, audio synthesis, and soundscape design. AI partners can generate musical ideas, manipulate sonic parameters, or assist in refining audio compositions. Examples include leveraging AI ambiguity creatively in sound design through generative Creative Support Tools (CSTs) [84], developing tools for steering music AI with various constraints [109], and integrating musical AIs into co-design processes for therapeutic applications [164]. The interaction involves manipulating acoustic properties and structures, enabling novel forms of sonic expression and exploration.

**Modality-4. Multimodal and Hybrid Interaction:** Many co-creative endeavors integrate multiple modalities or involve complex artifact creation that transcends a single interaction channel. This category encompasses the collaborative making of physical or digital products [16, 23, 85, 105, 177, 200], interactive installations [40, 172], and the co-design of user interfaces [11], experiences [31, 37, 206], systems [60, 84, 101], and clinical decision support tools [202]. AI might contribute through design generation, simulation, user data analysis [172, 182], prototyping [14, 84], or providing feedback [146], complementing human insight. Research in this area explores critical perspectives on AI's role [16, 40], develops design principles for generative AI interfaces [189], investigates tools for specific contexts like triage autonomy [18] or community health [37], enhances prototyping

methods [187], designs multi-sensory collaborative systems [14], explores embodied AI collaboration [177, 200], and leverages techniques like LLM-enhanced brainwriting [146]. This modality often involves intricate interplay between different forms of input and output, supporting complex design and making processes [85, 201].

![](10c82dcc5f2c237961329dd29d65859c_img.jpg)

Figure 4 illustrates the Levels of Agency, showing five stages of interaction between a human and an AI system:

- (a) Passive: The AI is waiting for a human input labeled "GENERATE".
- (b) Reactive: The human provides input, and the AI system responds with output. The interaction is cyclical, involving Human's Input, Output, and Human's Feedback.
- (c) Semi-active: The AI system initiates actions based on a Condition.
- (d) Proactive: The AI system suggests "The next step..." to the human.
- (e) Co-operative: The human and AI system collaborate on a task, such as drawing a picture.

Fig. 4. The illustration of different levels of agency: (a) [162], (b) [129], (c) [191], (d) [73], (e) [11]. The illustrations were generated by ChatGPT and modified by authors.

## 5 AGENCY: PATTERNS AND DISTRIBUTION

Of the 134 papers identified, for the classification of agency, we specifically focused on the 106 papers that presented concrete system implementations or detailed interaction designs. This selection criterion was crucial because assessing agency types requires a clear description of how humans and AI interact within a defined system. The remaining 28 papers were excluded from this specific analysis as they primarily discussed theoretical concepts, users studies without sufficiently detailing the underlying system, or lacked the necessary implementation details to allow for a classification of agency dynamics.

### 5.1 Agency Patterns

To understand how AI agency manifests in co-creative systems, we analyzed the 106 selected papers based on the AI's role and initiative during interaction, drawing conceptually from frameworks classifying AI behavioral patterns [136]. This approach focuses on the nature of the AI's contribution to the interaction flow, ranging from passive assistance to proactive partnership. Our analysis revealed a spectrum of AI agency patterns across the reviewed systems. The distribution (Figure 5, using the terminology from [136]), was as follows: 18 systems exhibited **Passive** agency (acting only upon direct user invocation), 34 demonstrated **Reactive** agency (responding directly to user input/actions), 12 featured **Semi-active** agency (initiating actions under specific conditions), 9 showed **Proactive** agency (taking independent initiative), and 33 involved **Co-operative** agency (acting collaboratively alongside the user). These patterns are detailed below with specific examples:

**Pattern-1. Co-operative Agency:** Research demonstrates co-operative agency through AI collaborating with humans to enhance various processes and outcomes. Examples of co-operative agency include AI tools identifying potential harms during prototyping [187], systems aiding academic meta-review by summarizing peer reviews [165], algorithms enabling users to aesthetically personalize prosthetics [207], and computational notebooks using interactive visualizations for shared stakeholder understanding of healthcare ML models [11].

**Pattern-2. Proactive Agency:** Proactive agency is when AI takes initiative or introduces unique insights early in co-creation. Examples include: AI offering unique “non-human” perspectives that users might not reach alone, even if this potential isn’t fully tapped yet [73], AI proactively providing next-sentence or next-paragraph suggestions to steer the writing process [45], generative AI tools initiating the creation of novel sound options for designers [84], and interactive tools proactively highlighting relevant news or generating specific use cases to make users consider potential AI harms early on [187].

**Pattern-3. Semi-active Agency:** Semi-active agency involves AI providing support when requested by users. Examples include AI performing code translation upon a user's request [191]. Researchers also designed AR applications where features likely activate based on user interaction to enhance social experiences [137]. Others demonstrated computational plug-ins for design software, allowing users to actively call upon machine learning tools when needed [66]. Additionally, peer-mentoring systems were developed, presumably offering students support or connections upon their engagement with the system [8].

**Pattern-4. Re-active Agency:** Re-active agency is when AI responds directly to user actions or behaviors. For example, Gmeiner et al. developed AI design tools react to designer inputs, highlighting interaction challenges [60]. Lukoff et al. designed tools with different reactions, including implicit responses towards autoplay and explicit ones towards searching [112]. Personalization systems, such as news recommenders, also operate reactively based on user data [138]. This reactive function pervasive also for generative AI, which responds directly to children's prompts [129].

**Pattern-5. Passive Agency:** Passive agency describes AI's subtle influence on human dynamics. Examples include: AI implicitly shaping musicians' collaborative dynamics by affecting common ground and roles [162], generative AI impacting educational interactions through generated content while passively raising concerns about authorship and bias [64], and AI being used within therapist-guided family stormaking sessions, setting a context where it might subtly influence group interactions [105].

![Pie chart showing the distribution of AI Agency Patterns. The segments are: Co-operative (31.1%), Passive (17.0%), Re-active (32.1%), Semi-active (11.3%), and Proactive (8.5%).](252ea48d02dce93965b91746fb376f35_img.jpg)

Pie chart showing the distribution of AI Agency Patterns. The segments are: Co-operative (31.1%), Passive (17.0%), Re-active (32.1%), Semi-active (11.3%), and Proactive (8.5%).

Fig. 5. Distribution of AI Agency Patterns.

### 5.2 Agency Distribution

A foundational aspect of human-AI co-creation is the **distribution of agency**, defined as the distribution and dynamics of decision-making authority between human and AI agents. Extending the work from Holter et al. [68], which classified agency along distribution (human, mixed, AI) and allocation (pre-determined, negotiated) dimensions, we incorporate these and add granularity as a third key aspect. Effectively designing and analyzing such systems requires a framework that comprehensively captures how agency is structured. We propose characterizing agency distribution through three fundamental, orthogonal dimensions: the **locus** (determining who holds primary decision-making authority), the **dynamics** (addressing how this authority is managed or shifted over time and interaction), and the **granularity** (specifying the level of abstraction or detail at which authority is exercised).

**Dimension-1. Locus:** This dimension specifies where primary decision-making authority resides along a spectrum. In human-centric control, humans retain ultimate authority, with AI serving assistive or advisory roles [93]. Conversely, AI-centric control involves autonomous AI execution based on defined objectives, common in full automation [171]. Between these poles, hybrid or shared control models distribute authority (e.g., as collaborators [8, 109]), significantly impacting interaction dynamics and user perception. Precisely defining this locus gains complexity and relevance as AI capabilities evolve from tools to more autonomous agents.

**Dimension-2. Dynamics:** This dimension involves two primary modes for managing control authority during interaction. **Static allocation** assigns agency based on fixed rules, roles, or predefined stages determined during system design, offering predictability. Examples include specifying distinct human-AI cooperative roles [102], implementing predetermined control levels through interface design [148], or structuring interaction based on distinct task phases [164]. **Dynamic allocation** determines control situationally during the interaction itself, adapting to evolving contexts but posing significant challenges in negotiation and alignment [47]. Such dynamics are evident when interaction control shifts based on evolving factors, like the quality of AI contributions influencing a collaborative process [191].

**Dimension-3. Granularity:** This dimension defines the level of detail at which agency is exercised. Control can operate at a **high level**, concerning strategic goals or overall workflow [61], or at a **fine-grained level**, involving specific actions or parameter adjustments within a process [208]. Selecting appropriate granularity is crucial for complex tasks [163], as finer control points can enhance user agency and transparency, mitigating “black box” issues by enabling steerable interactions [124]. Examples include implementing varying levels of AI scaffolding, like sentence versus paragraph suggestions [45], or providing distinct control types, such as domain-specific versus technology-specific parameters in generation [84].

## 6 CONTROL MECHANISMS

We first broadly categorized four types of processes including control according to the Input-Process-Output-Process (IPOF) model [192], forming a space ranging from human-initiated methods to AI-initiated methods [142]. We then summarized three types of control mechanism within each process. We opted not to use other co-creation processes because not all tasks and mechanisms emerge in the stages for these classifications [81]. For example, Kabir et al. [81] classified the co-creation process to contain preparation, exploration, collaboration, development, implementation and evaluation. Wu et al. [194] classified the human-AI co-creation as perceive, think, express, collaborate, build and test.

### 6.1 Input: Information Access

**Mechanism-1. Guided Input Interaction:** This mechanism encompasses methods that structure and facilitate how users provide input to AI systems. It includes user-centered optimization, interface-supported guidance and multimodal input integration. **User-centered input optimization** enhances users control to align AI outputs with expectations. Users actively refine prompts iteratively based on AI responses [102, 171] or tailor their experience via customizable interface elements like adjustable parameters and views [70, 124]. Users can also strategically design prompts to shape AI behavior or manipulate bias for specific goals [40, 148]. **Interface-supported input guidance** employs interface design to actively direct user input, improving interaction efficiency. Interfaces provide interactive visual feedback (e.g., confidence highlighting, code comparison) to help users understand and refine inputs [5, 191]. Techniques like multi-panel layouts with progressive disclosure organize complex information [107, 187], while context-aware conversational interfaces reduce cognitive load with intuitive response mechanisms [51, 55]. **Multimodal input integration** incorporates diverse input types to enrich interaction. Systems map user gestures or movements to algorithmic parameters [59, 207], create synergy

between specialized tools and interfaces for cohesive input environments [11, 178], or utilize cross-platform approaches to facilitate collective AI guidance [8, 45].

**Mechanism-2. Context Awareness and Memory Retention:** This mechanism enables AI systems to leverage historical, environmental, task, and user information, enhancing contextual understanding and collaboration continuity, encompassing several detailed approaches. For **interaction history integration**, systems incorporate past conversational or operational history into decision-making [55, 148]. Process tracking features preserve provenance, helping users follow idea evolution or reflect on progress [8, 107]. For **environmental and spatial awareness**, AI recognizes and adapts to physical or digital surroundings. Systems may track user position and movement to adjust interactions [14, 135] or collect real-time contextual data (e.g., location, weather, sensor data) to provide relevant recommendations [51]. For **task-oriented context management**, systems maintain awareness of specific tasks, objectives, and histories to ensure consistency. They might enable retrieving artifacts for context-aware iteration [178], track design goals [60], adapt interfaces to workflow stages [201], or use history to inform alerts [187]. For **personalized context adaptation**, AI tailors its behavior to individual user backgrounds, needs and preferences. This includes adapting content for specific users [11], designing culturally responsive activities [98], considering community sensitivities [21] or reflecting situated literacies [16].

**Mechanism-3. Transparency and Explainability:** this mechanism enhance user understanding of AI operations and build trust. They range from tracking concrete operations to prompting reflection on abstract concepts, encompassing four main approaches. For **interaction tracking**, systems document and present interaction histories, allowing users to review contributions from both humans and AI. This clear record supports trust. For example, Hoque et al. [70] implement history tracking for writers to manage AI contributions, while Anthraper et al. [8] visualize progress bars and goal achievement in a mentoring system. For **decision visualization**, interfaces visualize AI's decision-making processes or influencing factors understandably. For instance, Berge et al. [18] provides nurses with clear interface suggestions highlighting urgent symptom combinations, and Zhou et al. [207] make algorithmic processes transparent by visually linking dancers' actions to evolving design results. For **system explanation**, these systems explain the reasoning behind AI-generated outputs to clarify internal workings. Examples include providing rationales for generated research questions [107], documenting iterative project changes to track solution evolution [206], surfacing relevant incident reports to explain potential harms [187], or explaining AIMC tool suggestions [55]. For **ideological reflection**, designs prompt users to reflect critically on technology's underlying ideologies and opacity. Cremaschi et al. [40], for example, juxtapose a typewriter with modern AI to provoke thoughts on transparency, while Benjamin et al. [16] use a camera-based 'entoptic metaphor' enabling non-technical users to explore AI's influence.

### 6.2 Action: Exploration

**Mechanism-4. Multimodal Action Space Exploration:** This mechanism facilitates human-AI collaboration by enabling interaction through diverse modalities beyond traditional text and graphics. Systems explore actions using various channels: **Text-based interaction** remains fundamental, supporting communication tools [55] or integrating text feedback with graphical interfaces [107], though differences from visual interaction are noted [171]. **Visual interaction** employs graphical elements, such as visual body representations for symptom localization [18] or interfaces combining text prompts with sketch editing for image generation [153, 178]. **Multi-sensory and physical interaction** integrates rich channels. Systems may use visual, auditory and kinesthetic elements [11]: visual supports with tactile experiences [21], map physical movements via motion capture [207], or incorporate full-body actions, gestures, smart objects, and haptics [5, 14, 27]. **Combined and integrated modalities** explicitly merge interaction modes. Systems might integrate goal-setting, messaging, and calendars [8]: combine sound generation with visual feedback [84], support diverse inputs like sketches

and gestures [189], or integrate various data types (e.g., text, voice, photos, sensor data) for comprehensive context [51, 187].

Within these applications, systems regulate agency through strategies like combining modalities for user choice [178], integrating multiple sensory channels [11], mapping physical actions directly to controls [207], and adapting interaction methods based on context [51].

**Mechanism-5. Action Coordination:** This mechanism addresses how human-AI co-creation systems distribute responsibilities, decision-making authority, and interaction dynamics based on the assumed roles of human and AI agents. Five primary patterns emerge: For **complementary role distribution**, systems assign distinct, interdependent roles leveraging respective strength. Humans typically provide strategic direction or creative input, while AI handles data processing or routine tasks [8, 60, 70, 107, 201]. For **human-dominated agency with AI support**, humans retain primary decision-making authority, utilizing AI as an auxiliary tool or assistant that provides suggestions or analysis but lacks autonomous agency [21, 45, 55, 98, 178]. For **shared creative agency**, humans and AI engage jointly with mutual influence on the creative output. Both participate throughout idea generation, refinement and evaluation, fostering an emergent process [11, 27, 40, 206, 207]. For **technical precision and control**, systems focus on enabling users to exert detailed, fine-grained control over AI outputs through interfaces offering parameter tuning, prompt refinement, or direct manipulation [51, 59, 84, 153, 187]. For **autonomous AI contribution with human frameworks**, AI operates with significant autonomy on specific sub-tasks within parameters established by humans, contributing independently while remaining accountable to human oversight [14, 73, 135, 146, 189].

**Mechanism-6. Attention-focused Processing:** Attention mechanisms direct the system's focus to specific parts of the data or the processing pipeline. For example, in a machine-translation system, attention mechanisms can focus on certain words or phrases in the source text to generate a more accurate translation output. By allocating more processing resources to these key elements, the system can improve the quality of its actions and outputs. This mechanism is particularly useful in complex tasks where certain aspects of the input data are more critical than others. Hoque et al. [70] uses interface design to focus writer attention on key areas like text editing and interaction history. Systems like PromptCharm [186] use cross-attention techniques and interactive interfaces to visualize attention distributions, further enhancing explainability and user engagement.

### 6.3 Output: Direct Intervention

**Mechanism-7. Modification and Intervention:** This mechanism detail how users exert control over AI systems by intervening in processes or modifying outputs. We observed four main approaches. For **direct editing and adjustment**, user directly alter AI outputs. This includes manually labeling or modifying generated text [70], identifying and correcting errors in AI-generated code [191], or manipulating visual design elements through gestures [207]. For **parameter and prompt control**, users influence AI outcomes indirectly through system settings or inputs, rather than altering the output itself. Examples include shaping generative processes via prompts and parameters [189], controlling the sequence or level of AI assistance [45], or adjusting AI decision-making parameters [27]. For **real-time intervention and adjustment**, users intervene during an ongoing AI process. Cinematographers might adjust robot paths live [135], developers may integrate real-time alerts into workflows [187], or artists can intervene mid-creation by adding strokes or selecting suggestions [153]. For **acceptance or rejection or AI suggestions**, users act as gatekeepers by explicitly accepting or rejecting AI contributions. This includes users overriding suggestions and documenting their own assessments [18], clinicians manually acknowledging or dismissing system-identified problems [201], or users controlling code annotations by accepting/rejecting recommendations [59].

**Mechanism-8. Adaptive Scaffolding:** This mechanism dynamically adjusts the level and type of AI assistance provided to users, operating on a spectrum from system-controlled to user-driven approaches, often incorporating

hybrid models. For **system-controlled adaptive scaffolding**, the AI autonomously modifies support based on pre-defined rules, learned models, or analysis of user behavior and context. Examples include AI suggesting relevant questions based on conversation flow [18], adjusting guidance based on analyzed user progress [178, 189], adapting assistance levels to designer skill [60], tailoring support based on learner understanding [98], structuring learning based on observed behavior [11], adapting based on user interaction interpretation [107], or curating data views based on clinical context [201]. For **user-driven adaptive scaffolding**, users explicitly control the adaptation of support mechanisms. They might manually adjust settings, select different assistance levels [5], request specific types of support [8], trigger or dismiss system hints [14], specify proficiency levels [45], or set goals to modify assistance intensity [55]. For **hybrid adaptive scaffolding**, these approaches combine system autonomy with user control, where the system might make adjustments but allow user overrides or modifications. Adaptation factors include user proficiency [18, 45], task phase or context [55, 178], explicit user feedback [5, 107], and observed task progress [11, 189].

**Mechanism-9. Chain-of-Thought:** This mechanism directly intervenes in the output phase to explicitly display the AI's step-by-step reasoning process used to reach a solution or suggestion. Making the system's logic transparent helps users understand and evaluate the output. For instance, Liu et al. [107] employ CoT prompting to improve LLM reasoning and make the thought process visible when generating research questions. Zheng et al. [206] use CoT documentation to analyze reasoning behind AI suggestions, fostering deep evaluation. Others mention CoT as a technique for providing rationales for AI outputs [189], or use few-shot CoT approaches to enhance LLM problem-solving within specific contexts like ContextCam [51].

### 6.4 Feedback: Stressing

**Mechanism-10. Confidence Visualization:** This mechanism communicates AI reliability or influence user confidence regarding AI outputs and actions. Systems employ several approaches: For **confidence/uncertainty visualization**, interface visually represent the AI's confidence level (e.g., via scores, intervals or alternatives) for its outputs or actions [189]. This helps users gauge reliability and make informed decisions about interpreting or acting upon AI contributions. For **user feedback and trust management**, systems incorporate feedback channels to measure how design choices influence users' perception of system reliability, bias, and overall trust [148]. For **confidence-based ranking and prioritization**, algorithms order or rank AI suggestions based on calculated confidence metrics. This guides user attention towards reliable items first, as seen in pattern prioritization based on model confidence [59]. For **user self-efficacy enhancement**, some systems include psychological or social support mechanisms designed to boost users' confidence. For example, PeerConnect aims to increase students' self-efficacy and sense of belonging, thereby enhancing confidence in their engagement [8].

**Mechanism-11. Explanatory Feedback Emphasis:** this mechanism employs transparency strategies to help users understand AI operations and reasoning, facilitating informed decisions via targeted approaches. For **model explanation and reasoning disclosure**, systems provide explicit insights into AI decision-making. This involves interpreting ambiguous outputs [102, 171], offering views into model operations [124], using visualizations like feature importance plots [11], explaining design outcomes [60], displaying flags based on clinical rules [201], or providing interpretive metaphors [16]. For **visual highlighting and differentiation**, interfaces use visual cues to distinguish AI contributions or guide user attention. Examples include color-coding AI-written text [70], highlighting key points in peer reviews [165], emphasizing generative variability [189], or visually marking text portions matching code patterns [59]. For **user control and interactive transparency**, interfaces allow users to interactively explore AI behavior or control processes. Learners might see the direct impact of their decisions [98], users might examine training data and methods [73], track machine states during fabrication [5], or review incident reports explaining potential harms [187]. For **contrast and metaphorical representation**, designs may use contrast or metaphors to explain AI operations or highlight opacity. This includes designs aiming

for process clarity [178], systems providing understandable results based on clear inputs [153], or contrasting old and new technologies to critique opacity [40].

**Mechanism-12. Iterative Feedback Loop:** This mechanism enables continuous refinement of AI systems and co-created outputs through dynamic exchanges based on user input or environmental changes. Feedback can be primarily user-directed, system-initiated or bidirectional. For **user-directed feedback**, users explicitly provide feedback to guide AI performance and improvements. Examples include using AI outputs to inform subsequent prompts [102], offering direct interaction feedback or ratings [18, 70, 124], providing textual feedback on generated content [107], adjusting movements based on real-time visualizations [207], iteratively testing outputs with parameter adjustments [60], manually indicating alignment with assessments [201], refining computational methods [66], or correcting model outputs for retraining [59]. For **system-initiated feedback**, these systems proactively provide these feedback to enhance the interaction process or guide users. AI might respond to users' additional queries [171], provide real-time suggestions with system adaptations [153], use generated sounds for rapid iteration [84], offer immediate visual feedback via interfaces [135], monitor user actions and adjust responses [5, 14], serve as a feedback tool during ideation [146], track goals for immediate feedback [8], propose updated content based on input [51], or establish user-system response cycles for refinement [40, 148, 178, 187, 206]. For **bidirectional interaction feedback**, the feedback flows dynamically in both directions between users and the AI. This occurs through iterative refinement in workshops [11], designers interpreting non-verbal participant behaviors [21], iterative design sessions involving discussion [98], continuous feedback mechanisms [27], or incorporating user experiences into development [16].

## 7 APPLICATIONS

While Wu et al. [194] categorize AI creativity applications broadly (e.g., Culture, Industry), our review's specific focus on HCI literature and co-creative agency patterns reveals granular domains emerging from the analyzed papers. We therefore detail how agency and control mechanisms are operationalized within these application domains, analyzing the commonalities and limitations of agency frameworks.

**Application-1. News:** Agency dynamics in news curation typically involve *semi-proactive* and *reactive* mechanisms. Dhillon et al. [45] reveal tensions between AI-augmented cognitive support (automatic) and authorial control (reactive), where writers actively revise AI suggestions. Hoque et al. [70] employ reactive provenance tracking via HALLMARK to ensure transparency in LLM interactions. Rezk et al. [138] identify a *passive* behavioral-intention gap in news recommenders, where users desire agency but avoid active intervention. Sharma et al. [148] test *proactive* exposure through biased LLMs that either reinforce or challenge user viewpoints. However, when AI offers automated cognitive support, yet writers retain final authorial control through active revision, the tension is evident [45].

**Application-2. Healthcare:** Medical AI employs *expert-supervised reactive* agency, where clinicians maintain final decision-making authority (*reactive*). Berge et al. [18] emphasize *semi-proactive* workflow integration to balance AI decision-support with documentation demands. Claisse et al. [37] adopt *participatory proactive* design for culturally sensitive mHealth tools. Sun et al. [164] implement *modality-specific reactive control* in music therapy, while Zhou et al. [207] use *creative semi-proactive* co-production for prosthetic design.

**Application-3. Art:** *Tool-mediated passive* and *semi-proactive* agency dominate here. Lin et al. [102] show how *prompt engineering* (*reactive*) enhances design ideation through forces verbal articulation. Tholander et al. [171] highlight *interface-driven reactive* control affecting user expectations. Kamath et al. [84] deploy *mixed-initiative semi-proactive* systems with iterative refinement capabilities.

**Application-4. Education & Research:** Educational AI systems integrate *curriculum-bound reactive* and *proactive* mechanisms. Weisz et al. [191] demonstrate *error-correction reactive* agency in code tools, while Gebreegziabher et al. [59] design pattern-interpretable proactive systems like PaTAT. Liu et al. [107] contrast

*exploration strategy proactive* (breadth-first) and *reactive* (depth-first) approaches in research question generation. Sun et al. [165] use *context-aware semi-proactive* meta-review systems.

**Application-5. Entertainment:** Creative industries employ *vision-aligned proactive* and *semi-proactive* agency. Fan et al. [51] develop *context-aware proactive* co-creation systems integrating environmental data. Louie et al. [109] implement *slider-based reactive* controls for music parameters. Verheijden et al. [178] demonstrate *collaborative semi-proactive* editing via BrainFax’s chatbot interfaces.

**Application-6. Software Development:** Development workflows prioritize *value-aligned proactive* strategies. Varanasi et al. [176] identify *proactive value lever* strategies for ethical alignment. Wang et al. [187] introduce *harm-aware reactive* control through FARSIGHT’s incident-linked prototyping tools.

**Application-7. Accessibility:** Assistive technologies emphasize *empowerment proactive* and *semi-proactive* mechanisms. Shen et al. [151] design *keyword-driven proactive* communication systems for motor-impaired users. Bircanin et al. [21] operationalize *participatory proactive* principles like “maximizing choice” to inform inclusive HCI methods.

![](df7cb4ea9bd6c3f445f3e264773b125f_img.jpg)

Figure 6 illustrates human-AI co-creation applications across different domains:

- (a) News Media: Visualization of contribution to support agency.
- (b) Healthcare: Proactive AI-assisted diagnostic decision making.
- (c) Artistic Creation: Design ideation with AI.
- (d) Education & Research: AI-enabled qualitative analysis.
- (e) Entertainment: AI-steered music creation.
- (f) Software Development: Harm signaling for application prototyping.
- (g) Accessibility: Augmentative and alternative communication system.

Fig. 6. Illustration of human-AI co-creation applications across different domains: (a) [70], (b) [18], (c) [171], (d) [59], (e) [109], (f) [187], (g) [151]. The illustrations were generated by ChatGPT and modified by authors.

## 8 CHALLENGES & DIRECTIONS

We structure these co-creation challenges into: **collaborative experience** (Challenges 1, 2) concerning creativity, ownership, and trust, **collaboration infrastructure** (Challenges 3, 4) addressing data security and system interoperability, and **social implications** (Challenges 5, 6, 7) covering equity, ethics, and future paradigms. These research directions guide the design of responsible human-AI collaborative systems.

**Challenge-1. Creativity and Ownership:** While enhancing human creativity with suggestions and process facilitation, AI simultaneously complicates ownership and intellectual property rights. Distinguishing human input from AI contributions grows critical yet complex. Research indicates co-creation raises unique authorship

questions and copyright concerns, distinct from solely AI outputs [166]. Kamath et al. [82] argue that AI completing tasks, instead of humans, potentially blurs authorship and diminishes users' sense of agency. Consequently, developing clear legal frameworks and guidelines for co-created content becomes imperative. System designers must prioritize user control and perceived ownership, designing interactions that foster collaboration while preserving human agency. Although current studies investigate factors influencing ownership feelings [62], fully resolving the intertwined legal, ethical, and experiential dimensions of ownership in human-AI co-creation demands significant ongoing effort and innovation.

**Challenge-2. Trust and Transparency:** Building user trust necessitates AI systems with transparent decision-making processes and clear mechanisms for user influence or correction. Yet, significant obstacles impede this goal; AI's role within teams is often ambiguous, and its "inhuman" reasoning patterns challenge user comprehension and acceptance [73]. This lack of clarity can correlate with broader distrust, including data privacy concerns [138]. Although approaches like explainable AI offer promise in demystifying AI actions, rendering complex models truly understandable remains a persistent difficulty, potentially undermining user confidence. Consequently, balancing the operational autonomy of AI with sufficient human oversight is crucial for cultivating and sustaining user confidence, representing a core design challenge.

**Challenge-3. Data Privacy and Security:** AI's reliance on extensive data creates a fundamental tension with the imperative to protect user privacy and security, especially when processing sensitive information like children's [199]. Effectively safeguarding user data demands robust encryption and access controls, coupled with mechanisms granting users clear control and transparency regarding data usage [184], including opt-in/out choices to foster trust. Despite these safeguards, striking the necessary balance between leveraging vast datasets for optimal personalized AI performance (and for monetization [184]) and upholding privacy standards constitutes a primary challenge. This complexity is further underscored by the fact that conceptualizing AI as persons obscures distinct legal, safety, security, trust, and reliability issues inherent in human-AI relationships [70].

**Challenge-4. Interoperability:** Seamless user experience requires effective interaction between diverse AI systems, platforms, and tools. AI must integrate smoothly with other technologies, various human workflows, and preferred interfaces (e.g., text, image, voice) to smooth task and context transitions. However, ensuring compatibility across disparate software/hardware, particularly with varying standards and protocols, poses significant technical challenges. Maintaining consistent performance, efficiency, and usability across interconnected AI tools is also a substantial hurdle. This challenge manifests in user experiences of limited controllability in GenAI systems [166]. While specific tools like BrainFax demonstrate efforts to enhance collaborative affordance and bridge systems [178], establishing robust, widespread interoperability remains a critical design and engineering goal.

**Challenge-5. Social Impact and Equity:** AI should yield socially responsible and equitable outcomes, promoting diversity while avoiding the reinforcement of inequalities. Key risks include potential job displacement via automation [191], generating inappropriate or harmful content [199], and disrupting creative economies, which may face user objections [122]. The core challenge, therefore, is ensuring AI benefits society broadly and equitably, actively mitigating harms ranging from human task erasure [191] to economic disruption [122]. Furthermore, addressing this challenge is compounded by inherent difficulties in reliably assessing societal harm, as noted by Wang et al. [187]. While human-centered frameworks [191], harm-aware prototyping [187], and inclusive designs [98] offer valuable pathways, achieving genuine social equity with AI demands ongoing evaluation and profound design shifts.

**Challenge-6. Ethical and Bias Concerns:** AI systems pose ethical issues including generating inaccuracies [165], violating academic integrity [107], amplifying dominant views [148], and fostering human biases like confirmation bias and over-reliance [107]. As bias originates from diverse sources (data, models, interaction), addressing these concerns is challenging. Developing inherently unbiased AI and effective feedback mechanisms for bias detection and mitigation is complex, requiring continuous, resource-intensive monitoring and user

involvement. While integrating ethical considerations into design shows promise for promoting awareness and practice [101], comprehensively resolving these multifaceted issues remains an insufficient, ongoing effort demanding further research.

**Challenge-7. Long-term Paradigm Shift:** A key challenge stems from the limited scope in current discussions concerning AI's impact on co-creation and collaboration models. There is a failure to adequately address the long-term implications of AI's increasing autonomy. This gap results in insufficient consideration of potential significant shifts in the human-machine collaboration paradigm, hindering proactive adaptation and strategy development for future co-creation scenarios. Fu et al. [55] highlighted that by changing the language users in interpersonal communication can change how we interact with each others and influence the self-perceptions, thus their developed AI-mediated communication tools could act as catalyst for change. They highlighted several design suggestions including balancing learning and dependency, supporting and augmenting self-expression, including feedback and reflection mechanisms, etc. Liu et al. [107] pointed out the ideation system may cause human to blindly accept AI in the future, leading to negative impacts in the future.

![](9260ae281f6b6470331f4a0f82dbc2b1_img.jpg)

Figure 7 illustrates design implications and key challenges across seven categories:

- (a) Data Privacy and Security: Illustration shows a person interacting with a laptop displaying binary code and a shield icon, labeled "Privacy-preserving recognition".
- (b) Creativity and Ownership: Illustration shows a person interacting with a robot, labeled "Attribution disputes".
- (c) Interoperability: Illustration shows a person interacting with a virtual environment, labeled "Multiple Interoperability".
- (d) Social Impact and Equity: Illustration shows a person interacting with a scale labeled "AI Accountable and Fair", labeled "Responsibility for social justice".
- (e) Trust and Transparency: Illustration shows AI-generated images with similarity scores (e.g., 0.4 similar, 0.8 similar), labeled "Prototypical explanation".
- (f) Ethical and Bias Concerns: Illustration shows a person interacting with a screen displaying a woman's face and a "Flag bias" button, labeled "Identifying and Flagging AI Bias".
- (g) Long-term Paradigm Shift: Illustration shows a person interacting with a smartphone, with thought bubbles and a globe icon, labeled "Changing people's communication habits".

Fig. 7. Illustration of design implications and key challenges. The illustrations were generated by ChatGPT and modified by authors.

## 9 FLOW ANALYSIS, CASE ANALYSIS AND DISCUSSIONS

Our literature survey systematically analyzes human-AI co-creation, focusing on agency dynamics. We visualize these findings using a Sankey diagram (Figure 8), which maps the flow and relationships across critical dimensions. This structured representation reveals prevalent patterns, interaction dynamics, and potential gaps within co-creative systems, offering concrete application guidelines relevant to CSCW research and design.

### 9.1 Node Analysis: Highlighting Core Component Cases

Node analysis identifies frequently instantiated categories, indicating dominant system configurations. Significant flow through “**Textual Interaction**” confirms language as the predominant modality. This centrality is evident in systems from academic writing support (e.g., MetaWriter [165]) to AI-assisted coding [191, 193], where text

![Sankey diagram showing connections across Interaction Stage, Modality, Agency Patterns, Agency Distribution, Control Mechanisms, Application Domains, and Challenges & Directions.](f8630b0582d6e5b1d81f877880ef0dda_img.jpg)

The Sankey diagram illustrates the flow of connections across seven dimensions: Interaction Stage, Modality, Agency Patterns, Agency Distribution, Control Mechanisms, Application Domains, and Challenges & Directions. The flow thickness indicates the frequency of observed connections.

**Interaction Stages (Left):** Express, Perceive, Think, Collaborate, Test, Build.

**Modalities (Second Column):** Multimodal and Hybrid Interaction, Textual Interaction, Visual Interaction, Auditory Interaction.

**Agency Patterns (Third Column):** Semi-proactive, Reactive, Proactive, Co-operative, Passive.

**Agency Distribution (Fourth Column):** Locus, Granularity, Dynamics.

**Control Mechanisms (Fifth Column):** Guided Input Interaction, Transparency and Explainability, Attention-focused Processing, Iterative Feedback Loop, Multimodal Action Space Exploration, Action Coordination, Explanatory Feedback Emphasis, Modification and Intervention, Context Awareness and Memory Retention, Confidence Visualization, Adaptive Scaffolding, Chain-of-Thought.

**Application Domains (Sixth Column):** Art, Education & Research, Entertainment, Accessibility, Healthcare, Software Development Interoperability, News.

**Challenges & Directions (Right):** Trust and Transparency, Creativity and Ownership, Ethical and Bias Concerns, Data Privacy and Security, Social Impact and Equity, Long-term Paradigm Shift.

Sankey diagram showing connections across Interaction Stage, Modality, Agency Patterns, Agency Distribution, Control Mechanisms, Application Domains, and Challenges & Directions.

Fig. 8. A Sankey diagram summarizing the surveyed literature across critical dimensions we proposed. Flow thickness indicates the frequency of observed connections between concepts. From left to right, the columns represent: **Interaction Stage, Modality, Agency Patterns, Agency Distribution, Control Mechanisms, Application Domains, and Challenges & Directions**.

(natural language or code) forms the primary input and output. While robust NLP remains crucial, the comparative lack of flow through other modalities suggests underexplored design spaces.

High frequency for the “**Collaborate**” interaction stage signals a strong field emphasis on iterative human-AI partnership. Systems enabling cycles of critique and refinement, like WordCraft [197] for story editing, or those requiring explicit turn-taking and human validation [10, 195], exemplify this stage. This necessitates careful design attention to feedback mechanisms, transparency [70, 209], and managing negotiated agency [68, 93].

“**Co-operative Agency**”, where AI actively partners with the user, constitutes another significant node. Examples include FARSIGHT [187] exploring AI harms and Zhou et al.’s [207] prosthesis personalized systems. This pattern suggests a design trajectory positioning AI as a collaborator, not merely a tool, demanding interfaces that support mutual contribution and shared control.

### 9.2 Pathway Analysis: Visualizing Interaction Flow Cases

Examining dominant pathways through the Sankey diagram (Figure 8) reveals recurrent workflows in human-AI co-creation, illuminating the interplay between interaction stages, modalities, agency patterns, control mechanisms, and application domains. These pathways characterize how systems orchestrate collaboration. A prevalent pathway, particularly in writing and software development, centers on textual interaction and co-operative agency: **Pathway: Perceive/Collaborate/Build → Textual Modality → Co-operative → Feedback Loops/Transparency and Explainability → Education & Research**

This workflow typically commences with the system perceiving textual input (e.g., data, prompts, code). Collaboration unfolds primarily via the textual modality, progressing through iterative cycles of thinking, expressing, and refining (Collaborate/Build stages). The AI commonly exhibits co-operative agency, functioning as an active partner [118]. Agency distribution often involves a shared locus of control, potentially managed through dynamic allocation negotiated via interaction [47, 68], with varying granularity depending on the task [208]. Critical control mechanisms supporting this pathway include iterative feedback loops and transparency/explainability features [70, 124] to manage the joint effort. Systems like MetaWriter [165] (meta-review generation) and AI coding assistants [191, 193] exemplify this trajectory.

Visual co-creation frequently follows a pathway initiated by prompts and emphasizes reactive or co-operative AI roles: **Pathway: Perceive/Collaborate/Build → Visual Modality → Reactive/Co-operative → Guided Input Interaction/Iterative Feedback Loop → Artistic Creation**

In this flow, systems perceive visual data or textual prompts. Interaction proceeds through visual modalities (e.g., image generation interfaces) during the Build and Collaborate stages. AI agency often starts as reactive to the initial prompt [60, 112] (AI-centric locus) but may shift towards co-operative during refinement (shared locus) [118]. Control is frequently exerted through guided input (e.g., prompt engineering [102, 171]) and iterative refinement cycles [124]. The locus of control can be dynamic, shifting between human guidance and AI generation [8, 109], often operating at a fine granularity for detailed adjustments [208]. Examples include text-to-image generation systems [102] and context-aware image tools like ContextCam [51].

Complex co-creation, often involving multiple modalities and leading to sophisticated outputs, necessitates integrated control mechanisms: **Pathway: Perceive/Collaborate/Build/Test → Multimodal Modality → Co-operative/Semi-active → Guided Input Interaction/Iterative Feedback Loop/Action Coordination → Software Development**

This pathway characterizes processes involving diverse inputs perceived by the system, followed by interaction via multimodal or hybrid modalities during Build/Collaborate stages. AI agency patterns are typically co-operative or semi-active [66, 191], often involving a shared or dynamically negotiated locus of control [8, 47, 109]. Effective management relies heavily on integrated control mechanisms, including guided input, action coordination frameworks, and robust feedback loops [70, 124, 207]. The granularity of control might be high-level (strategic direction [61]) or fine-grained (parameter tuning [208]) depending on the phase. Zhou et al.'s prosthetic personalization system [207], involving multimodal interaction (movement affecting form generation) and co-operative agency, fits this pattern, likely leveraging guided input. Similarly, Ayobi et al.'s use of computational notebooks for healthcare co-design [11] involves multimodal interaction, co-operative agency, and relies on guided input and transparency mechanisms within the notebook structure.

### 9.3 Implications from Case Analysis: Guiding Design and Research

This taxonomy and Sankey analysis (Figure 8) yield actionable insights for the CSCW community. Mapping interaction flows reveals prevalent patterns and underexplored areas, such as the sparse use of “*Auditory Interaction*” [84, 109, 164], signaling innovation opportunities in domains like assistive technology or music co-creation. Observed correlations between *Interaction Stages* (e.g., “*Collaborate*” [68]), *AI Agency Patterns* (e.g., “*Proactive*” [73] vs. “*Passive*” [162]), and *Modalities* [152] directly inform *Control Mechanism* design. For instance, frequent “*Collaborate*” stages demand robust “*Iterative Feedback Loops*” [124, 146] and “*Transparency and Explainability*” mechanisms [70, 187, 209] for effective partnership management. Systems targeting high AI initiative may require distinct control granularity [208] or dynamic agency allocation strategies [68], unlike systems with primarily reactive or assistive AI.

The framework also helps navigate critical design challenges and enables systematic system comparison. Tracing pathways to “*Ethical and Bias Concerns*” or “*Data Privacy*” nodes highlights areas demanding rigorous consideration during design and deployment [176]. For example, *textual interaction* employing *reactive agency* for *personalized news media* [138] surfaces complex ethical questions about filter bubbles, user autonomy, and accountability [148]. Similarly, applications in sensitive domains like *healthcare* [11, 18] or *education* [64, 98] mandate careful balancing of utility against privacy risks and bias mitigation.

Moreover, the taxonomy provides a structured foundation for comparing diverse co-creation systems. Researchers can accurately situate new contributions [93], and practitioners can select tools aligned with specific collaborative goals by evaluating systems—such as FARSIGHT [187], MetaWriter [165], or text-to-image tools [51]—based on their distinct multidimensional profiles. This integrated analysis offers a dynamic tool for understanding the complex human-AI co-creation landscape, thereby fostering principled design innovation within CSCW.

### 9.4 Long-term Implications of AI's Impact on Co-Creation Models

Our synthesis indicates AI autonomy drives long-term shifts [55] theoretically, technically and socio-economically. Theoretically, AI's evolution from functional tool [156] to autonomous, proactive partner [3, 162, 172] challenges human-centric assumptions about creativity and requires new collaboration theories beyond mixed-initiative [71], potentially involving co-agency or emergent interaction structures [68, 194]. This evolution may also profoundly alter human cognition and self-perception [55], risking deskilling [202] or over-reliance [84, 104, 107], yet simultaneously offering strong augmentation to human [45]. Investigating how to foster beneficial cognitive relationships with autonomous AI is thus crucial for CSCW community [55].

Technically, increasing AI autonomy necessitates collaborative models extending beyond supervisory control [68] towards peer-like or even AI-coordinated dynamics. This demands novel technical solutions and interaction mechanisms for negotiating agency dynamically [68], ensuring accountability for autonomous actions [187], providing explainability that clarifies AI reasoning and agency [189, 209], managing complex power dynamics [97], enabling graceful human intervention, and fostering calibrated trust [91, 104]. Addressing potential conflicts between humans and autonomous AI [67] and ensuring interoperability within complex human-AI ecosystems [194] represent significant steps for future systems.

Societally, the integration of autonomous AI into co-creation could significantly restructure creative industries and labor markets [18, 60, 118], raising critical questions about the future of creative work, including intellectual property [83], fair compensation [82], and evolving skill requirements [202]. Furthermore, AI autonomy intensities ethical challenges concerning bias amplification [147], fairness [179], transparency [70], accountability for harms [187], and overall societal responsibility [143]. Proactive development of adaptable governance frameworks and commitment to value-aligned design practices [101, 176] are essential for navigating these complexities.

### 9.5 Connection to Agency Theories, Broad Fields and Limitations

This review's findings offer empirical grounding for established agency theories, inform broad AI/ML fields and highlight areas for future theoretical development.

The observed diversity in agency configurations (Sections 5.1, 5.2) provides concrete empirical support for theories framing agency as distributed, situated, and dynamically negotiated [68, 161, 194]. Our synthesis shows systems instantiating varied distributed agency arrangements [68], from human-centric [45] to shared partnerships [206]. Furthermore, the comprehensive catalog of control mechanisms (Section 6) illuminates the crucial operational layer linking user intention (agency) to system execution. This aligns with theories distinguishing agency from control [100, 131], detailing the practical interface mechanisms (e.g., 'Guided Input' [102], 'Intervention' [70]) that shape the user's experience of agency [100]. The emergence of co-operative agency patterns (Section 5.1), particularly when supported by mechanisms enabling 'Action Coordination' (Section 6), invites consideration of human-AI dyads through the lens of group agency [103].

This operational perspective underscores that raw AI capabilities [147] (e.g., predictive accuracy, generative power) developed in ML are necessary but insufficient for effective co-creation [123]. Mitelut et al. [123] proposed that alignment need to optimize for agency preservation, which our paper from the human-centric perspective provide the detailed control mechanisms for agency preservation. Researchers also proposed data agency theory [4], a precise theory of justice to evaluate and improve current consent procedures used in AI applications. Our work proposed the control mechanisms at the next step of their evaluation.

Despite these connections, our review also underscores theoretical areas requiring further development for this context. First, existing agency theories offer limited frameworks for modeling the dynamic transitions in roles and control observed in our findings (Sections 5.2, 9.2). This limitation implies that our categorization of agency patterns (Section 5.1) and interaction pathways (Section 9.2) may not fully capture the moment-to-moment negotiations occurring in practice. Future theoretical work could develop more fine-grained models, perhaps

drawing on process theories [54] or computational approaches [1]. Second, a significant theoretical gap persists in reconciling the AI's designed, computational nature with the user's subjective experience and attribution of agency [100, 167]. This impacts the interpretation of our findings on trust, ethics and ownership (Section 8), as the discrepancy between how AI functions (Section 6) and how users perceive its intentionality [17, 145] influences responsibility alignment and bias perception [148, 176] in ways our current framework only partially addresses. Third, the applicability of general agency theories (Section 7) is less clear for the open-ended, emergent goals characteristic of many co-creative applications (e.g., artwork). Our analysis highlights diverse practices, but the theoretical underpinnings of agency in highly exploratory versus goal-directed co-creation need further distinction.

## 10 CONCLUSION

This scoping review systematically mapped the HCI literature on human-AI co-creation through the lens of agency. Analyzing 134 papers from premier HCI venues, we proposed an analytical framework integrating context, agency patterns/distribution, control mechanisms, and embedded them in practical applications. We cataloged operational control mechanisms detailing agency implementation. Findings highlight diverse agency configurations and underscore the critical role of specific control mechanisms (e.g., transparency, feedback loops) in shaping collaboration, user experience, and trust. The synthesis offers grounded implications for CSCW, guiding the design of future co-creative systems concerning ethical, societal and long-term implications.

## ACKNOWLEDGMENTS

We sincerely thank all reviewers for providing their valuable feedback. We thank Yongquan Hu for providing valuable help during the work. This work was supported by the Natural Science Foundation of China under Grant No. 62472243, 62132010 and 2022YFB3105201. This work was also supported by Deng Feng Fund.

## REFERENCES

1. Ajith Abraham, Aboul-Ella Hassanien, and Vaclav Snášel. 2009. Computational social network analysis: Trends, tools and research advances. (2009).
2. Iyadunni J Adenuga and Jonathan E Dodge. 2024. Agency Flow in a Multi-user Ridesharing System. In *Companion Publication of the 2024 Conference on Computer-Supported Cooperative Work and Social Computing*. 336–341.
3. Pär J Ågerfalk. 2020. Artificial intelligence as digital agency. *European Journal of Information Systems* 29, 1 (2020), 1–8.
4. Leah Ajmani, Logan Stapleton, Mo Houtti, and Stevie Chancellor. 2024. Data Agency Theory: A Precise Theory of Justice for AI Applications. In *Proceedings of the 2024 ACM Conference on Fairness, Accountability, and Transparency*. 631–641.
5. Lea Albaugh, Scott E Hudson, and Lining Yao. 2023. An Augmented Knitting Machine for Operational Assistance and Guided Improvisation. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–15.
6. Shm Garanganao Almeda, JD Zamfirescu-Pereira, Kyu Won Kim, Pradeep Mani Rathnam, and Bjoern Hartmann. 2024. Prompting for discovery: Flexible sense-making for ai art-making with dreamsheets. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–17.
7. Saleema Amershi, Dan Weld, Mihaela Vorvoreanu, Adam Fourney, Besmira Nushi, Penny Collisson, Jina Suh, Shamsi Iqbal, Paul N Bennett, Kori Inkpen, et al. 2019. Guidelines for human-AI interaction. In *Proceedings of the 2019 chi conference on human factors in computing systems*. 1–13.
8. Nisha Anthraper, Prachee Javiya, Sai Iluru, Lujie Karen Chen, and Andrea Kleinsmith. 2024. PeerConnect: Co-Designing a Peer-Mentoring Support System with Computing Transfer Students. In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems*. 1–7.
9. Riku Arakawa, Hiromu Yakura, and Masataka Goto. 2023. CatAlyst: domain-extensible intervention for preventing task procrastination using large generative models. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–19.
10. Zahra Ashktorab, Casey Dugan, James Johnson, Qian Pan, Wei Zhang, Sadhana Kumaravel, and Murray Campbell. 2021. Effects of communication directionality and AI agent differences in human-AI interaction. In *Proceedings of the 2021 CHI conference on human factors in computing systems*. 1–15.

[11] Amid Ayobi, Jacob Hughes, Christopher J Duckworth, Jakub J Dylag, Sam James, Paul Marshall, Matthew Guy, Anitha Kumaran, Adriane Chapman, Michael Boniface, et al. 2023. Computational notebooks as co-design tools: engaging young adults living with diabetes, family carers, and clinicians with machine learning models. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–20.

[12] Hannah K Bako, Alisha Varma, Anuoluwapo Faboro, Mahreen Haider, Favour Nerrise, Bissaka Kenah, John P Dickerson, and Leilani Battle. 2023. User-driven support for visualization prototyping in D3. In *Proceedings of the 28th International Conference on Intelligent User Interfaces*. 958–972.

[13] Paulo Bala, Pedro Sanches, Vanessa Cesário, Sarah Leão, Catarina Rodrigues, Nuno Jardim Nunes, and Valentina Nisi. 2023. Towards Critical Heritage in the wild: Analysing Discomfort through Collaborative Autoethnography. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–19.

[14] Valentin Bauer, Tommaso Padovano, Mattia Gianotti, Giacomo Caslini, and Franca Garzotto. 2024. MusicTraces: A collaborative music and paint activity for autistic people. In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems*. 1–7.

[15] Yasmine Belghith, Atefeh Mahdavi Goloujeh, Brian Magerko, Duri Long, Tom Mcklin, and Jessica Roberts. 2024. Testing, Socializing, Exploring: Characterizing Middle Schoolers’ Approaches to and Conceptions of ChatGPT. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–17.

[16] Jesse Josua Benjamin, Heidi Biggs, Arne Berger, Julija Rukanskaitė, Michael B Heidt, Nick Merrill, James Pierce, and Joseph Lindley. 2023. The entoptic field camera as metaphor-driven research-through-design with AI technologies. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–19.

[17] Dan Bennett, Oussama Metatla, Anne Roudaut, and Elisa D Mekler. 2023. How does HCI understand human agency and autonomy?. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–18.

[18] Arngeir Berge, Frode Guri bye, Siri-Linn Schmidt Fotland, Gro Fonne, Ingrid H Johansen, and Christoph Trattner. 2023. Designing for control in nurse-ai collaboration during emergency medical calls. In *Proceedings of the 2023 ACM Designing Interactive Systems Conference*. 1339–1352.

[19] Tao Bi, Yiyi Zhang, Chongyang Wang, and Amid Ayobi. 2019. Characterizing HCI research in China: Streams, methodologies and future directions. *arXiv preprint arXiv:1903.08915* (2019).

[20] Agnieszka Billewicz. 2018. Silly Lamp: Study of a Relationship with Engaging Machine Learning Artefacts. In *Extended Abstracts of the 2018 CHI Conference on Human Factors in Computing Systems*. 1–6.

[21] Filip Bircanin, Margot Brereton, Laurianne Sibton, Bernd Ploderer, Andrew Azaabanye Bayor, and Stewart Koplick. 2021. Including adults with severe intellectual disabilities in co-design through active support. In *Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems*. 1–12.

[22] Margaret A Boden. 1998. Creativity and artificial intelligence. *Artificial intelligence* 103, 1-2 (1998), 347–356.

[23] Nico Brand, William Odom, and Samuel Barnett. 2023. Envisioning and understanding orientations to introspective AI: Exploring a design space with Meta. Aware. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–18.

[24] Petter Bae Brandtzaeg, Yukun You, Xi Wang, and Yucong Lao. 2023. “Good” and “bad” machine agency in the context of human-AI communication: The case of ChatGPT. In *International Conference on Human-Computer Interaction*. Springer, 3–23.

[25] Michael E Bratman. 2013. *Shared agency: A planning theory of acting together*. Oxford University Press.

[26] Virginia Braun and Victoria Clarke. 2006. Using thematic analysis in psychology. *Qualitative research in psychology* 3, 2 (2006), 77–101.

[27] Tara Capel and Margot Brereton. 2023. What is human-centered about human-centered AI? A map of the research landscape. In *Proceedings of the 2023 CHI conference on human factors in computing systems*. 1–23.

[28] Stuart K Card. 2018. *The psychology of human-computer interaction*. Crc Press.

[29] Tuhin Chakrabarty, Philippe Laban, Divyansh Agarwal, Smaranda Muresan, and Chien-Sheng Wu. 2024. Art or artifice? large language models and the false promise of creativity. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–34.

[30] Minsuk Chang, John Joon Young Chung, Katy Ilonka Gero, Ting-Hao Kenneth Huang, Dongyeop Kang, Vipul Raheja, Sarah Sterman, and Thiemo Wambsganss. 2024. Dark Sides: Envisioning, Understanding, and Preventing Harmful Effects of Writing Assistants-The Third Workshop on Intelligent and Interactive Writing Assistants. In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems*. 1–6.

[31] Michael Alan Chang, Richmond Y Wong, Thomas Breideband, Thomas M Philip, Ashieda McKay, Arturo Cortez, and Sidney K D’Mello. 2024. Co-design partners as transformative learners: Imagining ideal technology for schools by centering speculative relationships. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–15.

[32] Ruijia Cheng, Alison Smith-Renner, Ke Zhang, Joel R Tetreault, and Alejandro Jaimes. 2022. Mapping the design space of human-ai interaction in text summarization. *arXiv preprint arXiv:2206.14863* (2022).

[33] EunJeong Cheon and Norman Makoto Su. 2017. Configuring the User: “Robots have Needs Too”. In *Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing*. 191–206.

[34] EunJeong Cheon, Cristina Zaga, Hee Rin Lee, Maria Luce Lupetti, Lynn Dombrowski, and Malte F Jung. 2021. Human-machine partnerships in the future of work: exploring the role of emerging technologies in future workplaces. In *Companion Publication of the*

2021 Conference on Computer Supported Cooperative Work and Social Computing. 323–326.

[35] Yoonseo Choi, Eun Jeong Kang, Min Kyung Lee, and Juho Kim. 2023. Creator-friendly algorithms: Behaviors, challenges, and design opportunities in algorithmic platforms. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–22.

[36] John Joon Young Chung. 2022. Artistic user expressions in AI-powered creativity support tools. In *Adjunct Proceedings of the 35th Annual ACM Symposium on User Interface Software and Technology*. 1–4.

[37] Caroline Claisse, Abigail C Durrant, and Mabel Lie. 2024. Understanding Antenatal Care Needs through Co-Creation with Roma Women to Inform the Design of mHealth Technologies. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–16.

[38] Simon Colton and Geraint A Wiggins. 2012. Computational creativity: The final frontier? In *ECAI 2012*. IOS Press, 21–26.

[39] Patricia Cornello, Patrick Haggard, Kasper Hornbaek, Orestis Georgiou, Joanna Bergström, Sriram Subramanian, and Marianna Obrist. 2022. The sense of agency in emerging technologies for human-computer integration: A review. *Frontiers in Neuroscience* 16 (2022), 949138.

[40] Michele Cremaschi, Max Dorfmann, and Antonella De Angeli. 2024. A Steampunk Critique of Machine Learning Acceleration. In *Proceedings of the 2024 ACM Designing Interactive Systems Conference*. 246–257.

[41] Jessica Dai. 2024. POSITION: beyond personhood: agency, accountability, and the limits of anthropomorphic ethical analysis. In *Forty-first International Conference on Machine Learning*.

[42] Hai Dang, Karim Benharrak, Florian Lehmann, and Daniel Buschek. 2022. Beyond text generation: Supporting writers with continuous automatic text summaries. In *Proceedings of the 35th Annual ACM Symposium on User Interface Software and Technology*. 1–13.

[43] Nicholas Davis, Chih-Pin Hsiao, Kunwar Yashraj Singh, Lisa Li, and Brian Magerko. 2016. Empirically studying participatory sense-making in abstract drawing with a co-creative cognitive agent. In *Proceedings of the 21st International Conference on Intelligent User Interfaces*. 196–207.

[44] Fabio de Almeida and Sónia Rafael. 2024. Bias by Default.: Neocolonial Visual Vocabularies in AI Image Generating Design Practices.. In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems*. 1–8.

[45] Paramveer S Dhillon, Somayeh Molaei, Jiaqi Li, Maximilian Golub, Shaochun Zheng, and Lionel Peter Robert. 2024. Shaping Human-AI Collaboration: Varied Scaffolding Levels in Co-writing with Language Models. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–18.

[46] Zijian Ding and Joel Chan. 2023. Mapping the Design Space of Interactions in Human-AI Text Co-creation Tasks. *arXiv preprint arXiv:2303.06430* (2023).

[47] John J Dudley and Per Ola Kristensson. 2018. A review of user interface design for interactive machine learning. *ACM Transactions on Interactive Intelligent Systems (Tiiis)* 8, 2 (2018), 1–37.

[48] Abigail Durrant, Duncan Rowland, David S Kirk, Steve Benford, Joel E Fischer, and Derek McAuley. 2011. Automics: souvenir generating photoware for theme parks. In *Proceedings of the SIGCHI Conference on Human Factors in Computing Systems*. 1767–1776.

[49] Passant Elagroudy, Jie Li, Kaisa Väänänen, Paul Lukowicz, Hiroshi Ishii, Wendy E Mackay, Elizabeth F Churchill, Anicia Peters, Antti Oulasvirta, Rui Prada, et al. 2024. Transforming HCI Research Cycles using Generative AI and “Large Whatever Models”(LWMs). In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems*. 1–5.

[50] Marc Eulerich, Aida Sanatizadeh, Hamid Vakilzadeh, and David A Wood. 2023. Can artificial intelligence pass accounting certification exams? ChatGPT: CPA, CMA, CIA, and EA. *Social Science Research Network* (2023). <https://doi.org/10.2139/ssrn.4452175>

[51] Xianzhe Fan, Zihan Wu, Chun Yu, Fenggui Rao, Weinan Shi, and Teng Tu. 2024. ContextCam: Bridging Context Awareness with Creative Human-AI Image Co-Creation. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–17.

[52] Tira Nur Fitria. 2023. Artificial intelligence (AI) technology in OpenAI ChatGPT application: A review of ChatGPT in writing English essay, In *ELT Forum: Journal of English Language Teaching*. *ELT Forum: Journal of English Language Teaching* 12, 1, 44–58. <https://doi.org/10.15294/elt.v12i1.64069>

[53] Luciano Floridi. 2014. *The fourth revolution: How the infosphere is reshaping human reality*. OUP Oxford.

[54] Kenneth D Forbus. 1984. Qualitative process theory. *Artificial intelligence* 24, 1-3 (1984), 85–168.

[55] Yue Fu, Sami Foell, Xuhai Xu, and Alexis Hiniker. 2024. From Text to Self: Users’ Perception of AIMC Tools on Interpersonal Communication and Self. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–17.

[56] Zhiyong Fu and Yuyao Zhou. 2020. Research on human-AI co-creation based on reflective design practice. *CCF Transactions on Pervasive Computing and Interaction* 2 (2020), 33–41.

[57] Jie Gao, Kenny Tsu Wei Choo, Junming Cao, Roy Ka-Wei Lee, and Simon Perrault. 2023. CoAlcoder: Examining the Effectiveness of AI-assisted Human-to-Human Collaboration in Qualitative Analysis. *ACM Trans. Comput.-Hum. Interact.* 31, 1, Article 6 (Nov. 2023), 38 pages. <https://doi.org/10.1145/3617362>

[58] Jie Gao, Simret Araya Gebreegziabher, Kenny Tsu Wei Choo, Toby Jia-Jun Li, Simon Tangi Perrault, and Thomas W Malone. 2024. A Taxonomy for Human-LLM Interaction Modes: An Initial Exploration. In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems*. 1–11.

[59] Simret Araya Gebreegiabher, Zheng Zhang, Xiaohang Tang, Yihao Meng, Elena L Glassman, and Toby Jia-Jun Li. 2023. Patat: Human-ai collaborative qualitative coding with explainable interactive rule synthesis. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–19.

[60] Frederic Gmeiner, Humphrey Yang, Lining Yao, Kenneth Holstein, and Nikolas Martelaro. 2023. Exploring challenges and opportunities to support designers in learning to co-create with AI-based manufacturing design tools. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–20.

[61] Ken Gu, Madeleine Grunde-McLaughlin, Andrew McNutt, Jeffrey Heer, and Tim Althoff. 2024. How do data analysts respond to ai assistance? a wizard-of-oz study. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–22.

[62] Alicia Guo, Pat Pataranutaporn, and Pattie Maes. 2024. Exploring the impact of AI value alignment in collaborative ideation: Effects on perception, ownership, and output. In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems*. 1–11.

[63] Xinyu Guo, Yi Xiao, Jiaqi Wang, and Tie Ji. 2023. Rethinking designer agency: A case study of co-creation between designers and AI. (2023).

[64] Ariel Han, Xiaofei Zhou, Zhenyao Cai, Shenshen Han, Richard Ko, Seth Corrigan, and Kylie A Peppler. 2024. Teachers, Parents, and Students’ perspectives on Integrating Generative AI into Elementary Literacy Education. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–17.

[65] Qingyang He, Weicheng Zheng, Hanxi Bao, Ruiqi Chen, and Xin Tong. 2023. Exploring designers’ perceptions and practices of collaborating with generative AI as a co-creative agent in a multi-stakeholder design process: Take the domain of avatar design as an example. In *Proceedings of the Eleventh International Symposium of Chinese CHI*. 596–613.

[66] Lena Hegemann, Yue Jiang, Joon Gi Shin, Yi-Chi Liao, Markku Laine, and Antti Oulasvirta. 2023. Computational Assistance for User Interface Design: Smarter Generation and Evaluation of Design Ideas. In *Extended Abstracts of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–5.

[67] Rania Hodhod and Brian Magerko. 2016. Closing the cognitive gap between humans and interactive narrative agents using shared mental models. In *Proceedings of the 21st international conference on intelligent user interfaces*. 135–146.

[68] Steffen Holter and Mennatallah El-Assady. 2024. Deconstructing Human-AI Collaboration: Agency, Interaction, and Adaptation. In *Computer Graphics forum*, Vol. 43. Wiley Online Library, e15107.

[69] Matt-Heun Hong, Lauren A Marsh, Jessica L Feuston, Janet Ruppert, Jed R Brubaker, and Danielle Albers Szafr. 2022. Scholastic: Graphical human-AI collaboration for inductive and interpretive text analysis. In *Proceedings of the 35th Annual ACM Symposium on User Interface Software and Technology*. 1–12.

[70] Md Naimul Hoque, Tasfia Mashiat, Bhavya Ghai, Cecilia D Shelton, Fanny Chevalier, Kari Kraus, and Niklas Elmqvist. 2024. The HaLLMark Effect: Supporting Provenance and Transparent Use of Large Language Models in Writing with Interactive Visualization. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–15.

[71] Eric Horvitz. 1999. Principles of mixed-initiative user interfaces. In *Proceedings of the SIGCHI conference on Human Factors in Computing Systems*. 159–166.

[72] Yongquan’Owen’ Hu, Jingyu Tang, Xinya Gong, Zhongyi Zhou, Shuning Zhang, Don Samitha Elvitigala, Florian’Floyd’ Mueller, Wen Hu, and Aaron J Quigley. 2025. Vision-Based Multimodal Interfaces: A Survey and Taxonomy for Enhanced Context-Aware System Design. *arXiv preprint arXiv:2501.13443* (2025).

[73] Angel Hsing-Chi Hwang. 2022. Too late to be creative? AI-empowered tools in creative processes. In *CHI conference on human factors in computing systems extended abstracts*. 1–9.

[74] Nanna Inie, Jeanette Falk, and Steve Tanimoto. 2023. Designing participatory ai: Creative professionals’ worries and expectations about generative ai. In *Extended Abstracts of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–8.

[75] Gaurav Jain, Basel Hindi, Connor Courtien, Xin Yi Therese Xu, Conrad Wyrick, Michael Malcolm, and Brian A Smith. 2023. Front row: Automatically generating immersive audio representations of tennis broadcasts for blind viewers. In *Proceedings of the 36th Annual ACM Symposium on User Interface Software and Technology*. 1–17.

[76] Ellen Jiang, Kristen Olson, Edwin Toh, Alejandra Molina, Aaron Donsbach, Michael Terry, and Carrie J Cai. 2022. Promptmaker: Prompt-based prototyping with large language models. In *CHI Conference on Human Factors in Computing Systems Extended Abstracts*. 1–8.

[77] Mirabelle Jones, Christina Neumayer, and Irina Shklovski. 2023. Embodying the algorithm: exploring relationships with large language models through artistic performance. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–24.

[78] Shuli Jones, Isabella Pedraza Pimeros, Daniel Hajas, Jonathan Zong, and Arvind Satyanarayan. 2024. “Customization is Key”: Reconfigurable Textual Tokens for Accessible Data Visualizations. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–14.

[79] Martin Jonsson and Jakob Tholander. 2022. Cracking the code: Co-coding with AI in creative programming education. In *Proceedings of the 14th Conference on Creativity and Cognition*. 5–14.

[80] Just Think AI. 2024. Human-AI Co-Creation: Collaborative creation processes between humans and AI. Webpage. Accessed on 2025-04-03. URL not provided in the source image.

[81] Mitt Nowshade Kabir. [n. d.]. Unleashing Human Potential: A Framework for Augmenting Co-Creation with Generative AI. In *Proceedings of the International Conference on AI Research*. Academic Conferences and publishing limited.

[82] Kowe Kadoma, Marianne Aubin Le Quere, Xiyu Jenny Fu, Christin Munsch, Danaë Metaxa, and Mor Naaman. 2024. The Role of Inclusion, Control, and Ownership in Workplace AI-Mediated Communication. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–10.

[83] Zeynep Ülkü Kahveci. 2023. Attribution problem of generative AI: a view from US copyright law. *Journal of Intellectual Property Law and Practice* 18, 11 (2023), 796–807. https://doi.org/10.1093/jiplp/jpad076

[84] Purnima Kamath, Fabio Morreale, Priambudi Lintang Bagaskara, Yize Wei, and Suranga Nanayakkara. 2024. Sound Designer-Generative AI Interactions: Towards Designing Creative Support Tools for Professional Sound Designers. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–17.

[85] Sol Kang and William Odom. 2024. On the Design of Quologue: Uncovering Opportunities and Challenges with Generative AI as a Resource for Creating a Self-Morphing E-book Metadata Archive. In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems*. 1–16.

[86] Rilla Khaled, Mark J Nelson, and Pippin Barr. 2013. Design metaphors for procedural content generation in games. In *Proceedings of the SIGCHI conference on human factors in computing systems*. 1509–1518.

[87] Taenyun Kim, Maria D Molina, Minjin Rheu, Emily S Zhan, and Wei Peng. 2023. One AI does not fit all: A cluster analysis of the laypeople’s perception of AI roles. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–20.

[88] Tomas Lawton, Francisco J Ibarrola, Dan Ventura, and Kazjon Grace. 2023. Drawing with reframer: Emergence and control in co-creative ai. In *Proceedings of the 28th International Conference on Intelligent User Interfaces*. 264–277.

[89] Amanda Lazar, Jessica L Feuston, Caroline Edasis, and Anne Marie Piper. 2018. Making as expression: Informing design with people with complex communication needs through art therapy. In *Proceedings of the 2018 CHI conference on human factors in computing systems*. 1–16.

[90] Jungeun Lee, Suwon Yoon, Kyoosik Lee, Eunae Jeong, Jae-Eun Cho, Wonjeong Park, Dongsun Yim, and Inseok Hwang. 2024. Open Sesame? Open Salami! Personalizing Vocabulary Assessment-Intervention for Children via Pervasive Profiling and Bespoke Storybook Generation. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–32.

[91] John D Lee and Katrina A See. 2004. Trust in automation: Designing for appropriate reliance. *Human factors* 46, 1 (2004), 50–80.

[92] Mina Lee, Katy Ilonka Gero, John Joon Young Chung, Simon Buckingham Shum, Vipul Raheja, Hua Shen, Subhashini Venugopalan, Thiemo Wambsganss, David Zhou, Emad A Alghamdi, et al. 2024. A Design Space for Intelligent and Interactive Writing Assistants. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–35.

[93] Seo-young Lee, Matthew Law, and Guy Hoffman. 2024. When and How to Use AI in the Design Process? Implications for Human-AI Design Collaboration. *International Journal of Human-Computer Interaction* (2024), 1–16.

[94] Joanne Leong, Pat Pataranutaporn, Valdemar Danry, Florian Perteneder, Yaoli Mao, and Pattie Maes. 2024. Putting things into context: Generative AI-enabled context personalization for vocabulary learning improves learning motivation. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–15.

[95] Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, and Douwe Kiela. 2020. Retrieval-augmented generation for knowledge-intensive NLP tasks (NIPS ’20). Curran Associates Inc., Red Hook, NY, USA, Article 793, 16 pages.

[96] Franklin Mingzhe Li, Lotus Zhang, Maryam Bandukda, Abigale Stangl, Kristen Shinohara, Leah Findlater, and Patrick Carrington. 2023. Understanding visual arts experiences of blind people. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–21.

[97] Jingyi Li, Eric Rawn, Jacob Ritchie, Jasper Tran O’Leary, and Sean Follmer. 2023. Beyond the artifact: power as a lens for creativity support tools. In *Proceedings of the 36th Annual ACM Symposium on User Interface Software and Technology*. 1–15.

[98] Yinniao Li, Jennifer Nwogu, Amanda Buddemeyer, Jaemarie Solyst, Jina Lee, Erin Walker, Amy Ogan, and Angela EB Stewart. 2023. “I Want to Be Unique From Other Robots”: Positioning Girls as Co-creators of Social Robots in Culturally-Responsive Computing Education. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–14.

[99] Q Vera Liao, Yi-Chia Wang, Timothy Bickmore, Pascale Fung, Jonathan Grudin, Zhou Yu, and Michelle Zhou. 2019. Human-agent communication: Connecting research and development in HCI and AI. In *Companion Publication of the 2019 Conference on Computer Supported Cooperative Work and Social Computing*. 122–126.

[100] Hannah Limerick, David Coyle, and James W Moore. 2014. The experience of agency in human-computer interactions: a review. *Frontiers in human neuroscience* 8 (2014), 643. https://doi.org/10.3389/fnhum.2014.00643

[101] Phoebe Lin and Jessica Van Brummelen. 2021. Engaging teachers to co-design integrated AI curriculum for K-12 classrooms. In *Proceedings of the 2021 CHI conference on human factors in computing systems*. 1–12.

[102] Pei-Ying Lin, Kristina Andersen, Ralf Schmidt, Sanne Schoenmakers, Hèrm Hofmeyer, Pieter Pauwels, and Wijnand IJsselsteijn. 2024. Text-to-Image AI as a Catalyst for Semantic Convergence in Creative Collaborations. In *Proceedings of the 2024 ACM Designing Interactive Systems Conference*. 2753–2767.

[103] Christian List and Philip Pettit. 2011. *Group agency: The possibility, design, and status of corporate agents*. Oxford University Press.

[104] Bingjie Liu. 2021. In AI we trust? Effects of agency locus and transparency on uncertainty reduction in human-AI interaction. *Journal of computer-mediated communication* 26, 6 (2021), 384–402.

[105] Di Liu, Hanqing Zhou, and Pengcheng An. 2024. "When He Feels Cold, He Goes to the Seahorse"—Blending Generative AI into Multimaterial Storymaking for Family Expressive Arts Therapy. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–21.

[106] Vivian Liu, Han Qiao, and Lydia Chilton. 2022. Opal: Multimodal image generation for news illustration. In *Proceedings of the 35th Annual ACM Symposium on User Interface Software and Technology*. 1–17.

[107] Yiren Liu, Si Chen, Haocong Cheng, Mengxia Yu, Xiao Ran, Andrew Mo, Yiliu Tang, and Yun Huang. 2024. CoQuest: Exploring Research Question Co-Creation with an LLM-based Agent. In *2024 CHI Conference on Human Factors in Computing Systems, CHI 2024*. Association for Computing Machinery, 17.

[108] Yiren Liu, Si Chen, Haocong Cheng, Mengxia Yu, Xiao Ran, Andrew Mo, Yiliu Tang, and Yun Huang. 2024. How ai processing delays foster creativity: Exploring research question co-creation with an llm-based agent. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–25.

[109] Ryan Louie, Andy Coenen, Cheng Zhi Huang, Michael Terry, and Carrie J Cai. 2020. Novice-AI music co-creation via AI-steering tools for deep generative models. In *Proceedings of the 2020 CHI conference on human factors in computing systems*. 1–13.

[110] Ryan Louie, Jesse Engel, and Cheng-Zhi Anna Huang. 2022. Expressive communication: Evaluating developments in generative models and steering interfaces for music creation. In *Proceedings of the 27th International Conference on Intelligent User Interfaces*. 405–417.

[111] Yuwen Lu, Chengzhi Zhang, Iris Zhang, and Toby Jia-Jun Li. 2022. Bridging the Gap between UX Practitioners' work practices and AI-enabled design support tools. In *CHI Conference on Human Factors in Computing Systems Extended Abstracts*. 1–7.

[112] Kai Lukoff, Ulrik Lyngs, Himanshu Zade, J Vera Liao, James Choi, Kaiyue Fan, Sean A Munson, and Alexis Hiniker. 2021. How the design of youtube influences user sense of agency. In *Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems*. 1–17.

[113] Yao Lyu, He Zhang, Shuo Niu, and Jie Cai. 2024. A Preliminary Exploration of YouTubers' Use of Generative-AI in Content Creation. In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems*. 1–7.

[114] Wookjae Maeng and Joonhwan Lee. 2022. Designing and evaluating a chatbot for survivors of image-based sexual abuse. In *Proceedings of the 2022 CHI conference on human factors in computing systems*. 1–21.

[115] Atefeh Mahdavi Goloujeh, Anne Sullivan, and Brian Magerko. 2024. Is It AI or Is It Me? Understanding Users' Prompt Journey with Text-to-Image Generative AI Tools. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–13.

[116] Elena Márquez Segura, Laia Turmo Vidal, Asreen Rostami, and Annika Waern. 2016. Embodied sketching. In *Proceedings of the 2016 CHI Conference on Human Factors in Computing Systems*. 6014–6027.

[117] Jon McCormack, Toby Gifford, Patrick Hutchings, Maria Teresa Llano Rodriguez, Matthew Yee-King, and Mark d'Inverno. 2019. In a silent way: Communication between ai and improvising musicians beyond sound. In *Proceedings of the 2019 chi conference on human factors in computing systems*. 1–11.

[118] Hannah Nicole Mieczkowski. 2022. *AI-Mediated Communication: Examining Agency, Ownership, Expertise, and Roles of AI Systems*. Stanford University.

[119] Martin Miernicki and Irene Ng. 2021. Artificial intelligence and moral rights. *Ai & Society* 36, 1 (2021), 319–329. https://doi.org/10.1007/s00146-020-01027-6

[120] Arthur I Miller. 2019. *The artist in the machine: The world of AI-powered creativity*. Mit Press.

[121] Ashlee Milton, Leah Ajmani, Michael Ann DeVito, and Stevie Chancellor. 2023. "I see me here": Mental health content, community, and algorithmic curation on TikTok. In *Proceedings of the 2023 CHI conference on human factors in computing systems*. 1–17.

[122] Piotr Mirowski, Kory W Mathewson, Jaylen Pittman, and Richard Evans. 2023. Co-writing screenplays and theatre scripts with language models: Evaluation by industry professionals. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–34.

[123] Catalin Mitelut, Benjamin Smith, and Peter Vamplew. 2024. Position: intent-aligned AI systems must optimize for agency preservation. In *Forty-first International Conference on Machine Learning*.

[124] Caterina Moruzzi and Solange Margarido. 2024. A user-centered framework for human-ai co-creativity. In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems*. 1–9.

[125] Henrik Mucha, Dennis Mevissen, Sebastian Robert, Ricarda Jacobi, Kirsten Meyer, Winfried Heusler, and Daniel Arztmann. 2020. Co-design futures for AI and space: A workbook sprint. In *Extended abstracts of the 2020 CHI conference on human factors in computing systems*. 1–8.

[126] Florian Floyd Mueller, Pedro Lopes, Paul Strohmeier, Wendy Ju, Caitlyn Seim, Martin Weigel, Suranga Nanayakkara, Marianna Obrist, Zhuying Li, Joseph Delfa, et al. 2020. Next steps for human-computer integration. In *Proceedings of the 2020 CHI Conference on human factors in computing systems*. 1–15.

[127] J. Murray and A. Williamson. 2024. WHAT'S IN A SPELLCHECKER: ARE WE SIMPLY WITNESSING THE NEXT EPOCH IN TOOLS FOR SUPPORTING LEARNING?. In *EDULEARN24 Proceedings* (Palma, Spain) (16th International Conference on Education and New Learning Technologies). IATED, 5076–5084. https://doi.org/10.21125/edulearn.2024.1244

[128] Timothy Neate, Abi Roper, Stephanie Wilson, and Jane Marshall. 2019. Empowering expression for users with aphasia through constrained creativity. In *Proceedings of the 2019 CHI conference on human factors in computing systems*. 1–12.

[129] Michele Newman, Kaiwen Sun, Ilana B Dalla Gasperina, Grace Y Shin, Matthew Kyle Pedraja, Ritesh Kanchi, Maia B Song, Rannie Li, Jin Ha Lee, and Jason Yip. 2024. "I want it to talk like Darth Vader": Helping Children Construct Creative Self-Efficacy with Generative AI. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–18.

[130] Hiroyuki Osone, Jun-Li Lu, and Yoichi Ochiai. 2021. BunCho: ai supported story co-creation via unsupervised multitask learning to increase writers' creativity in japanese. In *Extended Abstracts of the 2021 CHI Conference on Human Factors in Computing Systems*. 1–10.

[131] Elisabeth Pacherie. 2007. The sense of control and the sense of agency. *Psyche* 13, 1 (2007), 1–30.

[132] So Yeon Park and Sang Won Lee. 2023. Why "why"? the importance of communicating rationales for edits in collaborative writing. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–25.

[133] Olga Pavlova and Andrii Kuzmin. 2024. Analysis of artificial intelligence based systems for automated generation of digital content. *Khmu.edu.ua* (2024). https://elar.khmu.edu.ua/items/cb57cdbe-03d5-49fe-aa5b-23c84dff51c

[134] Coimbatore K Prahalad and Venkat Ramaswamy. 2004. Co-creating unique value with customers. *Strategy & leadership* 32, 3 (2004), 4–9.

[135] Pragathi Praveena, Bengisu Cagiltay, Michael Gleicher, and Bilge Mutlu. 2023. Exploring the use of collaborative robots in cinematography. In *Extended Abstracts of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–6.

[136] Werner Rammert. 2008. *Where the action is. distributed agency between humans, machines, and programs*. transcript.

[137] Samantha Reig, Erica Principe Cruz, Melissa M Powers, Jennifer He, Timothy Chong, Yu Jiang Tham, Sven Kratz, Ava Robinson, Brian A Smith, Rajan Vaish, et al. 2023. Supporting piggybacked co-located leisure activities via augmented reality. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–15.

[138] Anna Marie Rezk, Auste Simkute, Ewa Luger, John Vines, Chris Elsden, Michael Evans, and Rhiianne Jones. 2024. Agency Aspirations: Understanding Users' Preferences And Perceptions Of Their Role In Personalised News Curation. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–16.

[139] Jeba Rezwana and Mary Lou Maher. 2022. Understanding user perceptions, collaborative experience and user engagement in different human-AI interaction designs for co-creative systems. In *Proceedings of the 14th Conference on Creativity and Cognition*. 38–48.

[140] Jeba Rezwana and Mary Lou Maher. 2023. Designing creative AI partners with COFI: A framework for modeling interaction in human-AI co-creative systems. *ACM Transactions on Computer-Human Interaction* 30, 5 (2023), 1–28.

[141] Stuart J Russell and Peter Norvig. 2016. *Artificial intelligence: a modern approach*. pearson.

[142] Hervé Saint-Louis. 2021. Machine-human interaction: a paradigm shift?. In *Human-Computer Interaction. Theory, Methods and Tools: Thematic Area, HCI 2021, Held as Part of the 23rd HCI International Conference, HCII 2021, Virtual Event, July 24–29, 2021, Proceedings, Part I* 23. Springer, 123–136.

[143] Adriana Salatino, Arthur Prével, Emilie Caspar, and Salvatore Lo Bue. 2025. Influence of AI behavior on human moral decisions, agency, and responsibility. *Scientific Reports* 15, 1 (2025), 12329.

[144] Markus Schlosser. 2015. Agency. (2015).

[145] John R Searle. 1980. Minds, brains, and programs. *Behavioral and brain sciences* 3, 3 (1980), 417–424.

[146] Orit Shaer, Angelora Cooper, Osnat Mokryn, Andrew L Kun, and Hagit Ben Shoshan. 2024. AI-Augmented Brainwriting: Investigating the use of LLMs in group ideation. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–17.

[147] Ashish Sharma, Sudha Rao, Chris Brockett, Akanksha Malhotra, Nebojsa Jojic, and William B Dolan. 2024. Investigating Agency of LLMs in Human-AI Collaboration Tasks. In *Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics (Volume 1: Long Papers)*. 1968–1987.

[148] Nikhil Sharma, Q Vera Liao, and Ziang Xiao. 2024. Generative echo chamber? effect of llm-powered search systems on diverse information seeking. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–17.

[149] Vishal Sharma, Kirsten Bray, Neha Kumar, and Rebecca E Grinter. 2023. It takes (at least) two: The work to make romance work. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–17.

[150] Renee Shelby, Shalaleh Rismani, and Negar Rostamzadeh. 2024. Generative AI in Creative Practice: ML-Artist Folk Theories of T2I Use, Harm, and Harm-Reduction. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–17.

[151] Junxiao Shen, Boyin Yang, John J Dudley, and Per Ola Kristensson. 2022. Kwickchat: A multi-turn dialogue system for aac using context-aware sentence generation by bag-of-keywords. In *Proceedings of the 27th International Conference on Intelligent User Interfaces*. 853–867.

[152] Jingyu Shi, Rahul Jain, Hyungjun Doh, Ryo Suzuki, and Karthik Ramani. 2023. An HCI-centric survey and taxonomy of human-generative-AI interactions. *arXiv preprint arXiv:2310.07127* (2023).

[153] Yang Shi, Nan Cao, Xiaojuan Ma, Siji Chen, and Pei Liu. 2020. EmoG: supporting the sketching of emotional expressions for storyboarding. In *Proceedings of the 2020 CHI conference on human factors in computing systems*. 1–12.

[154] Antonette Shibani, Simon Knight, Kirsty Kitto, Ajanie Karunanayake, and Simon Buckingham Shum. 2024. Untangling critical interaction with AI in students’ written assessment. In *Extended abstracts of the CHI conference on Human Factors in Computing Systems*. 1–6.

[155] Ben Shneiderman. 2022. *Human-centered AI*. Oxford University Press.

[156] Ben Shneiderman and Pattie Maes. 1997. Direct manipulation vs. interface agents. *interactions* 4, 6 (1997), 42–61.

[157] Ben Shneiderman and Catherine Plaisant. 2010. *Designing the user interface: strategies for effective human-computer interaction*. Pearson Education India.

[158] Ellen Simpson and Bryan Semaan. 2023. Rethinking creative labor: A sociotechnical examination of creativity & creative work on TikTok. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–16.

[159] Jose Luis Soler-Dominguez, Samuel Navas-Medrano, and Patricia Pons. 2024. Arcadia: A gamified mixed reality system for emotional regulation and self-compassion. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–17.

[160] Francesca Spektor, Sarah E Fox, Ezra Awumey, Ben Begleiter, Chinmay Kulkarni, Betsy Stringam, Christine A Riordan, Hye Jin Rho, Hunter Akridge, and Jodi Forlizzi. 2023. Charting the automation of hospitality: an interdisciplinary literature review examining the evolution of frontline service work in the face of algorithmic management. *Proceedings of the ACM on Human-Computer Interaction* 7, CSCW1 (2023), 1–20.

[161] Lucille Alice Suchman. 1987. *Plans and situated actions: The problem of human-machine communication*. Cambridge university press.

[162] Minhyang Suh, Emily Youngblom, Michael Terry, and Carrie J Cai. 2021. AI as social glue: uncovering the roles of deep generative AI during social music composition. In *Proceedings of the 2021 CHI conference on human factors in computing systems*. 1–11.

[163] Sangho Suh, Meng Chen, Bryan Min, Toby Jia-Jun Li, and Haijun Xia. 2024. Luminate: Structured Generation and Exploration of Design Space with Large Language Models for Human-AI Co-Creation. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–26.

[164] Jingjing Sun, Jingyi Yang, Guyue Zhou, Yucheng Jin, and Jiangtao Gong. 2024. Understanding Human-AI Collaboration in Music Therapy Through Co-Design with Therapists. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–21.

[165] Lu Sun, Stone Tao, Junjie Hu, and Steven P Dow. 2024. MetaWriter: Exploring the Potential and Perils of AI Writing Support in Scientific Peer Review. *Proceedings of the ACM on Human-Computer Interaction* 8, CSCW1 (2024), 1–32.

[166] Yuan Sun, Eunhae Jang, Fenglong Ma, and Ting Wang. 2024. Generative AI in the Wild: Prospects, Challenges, and Strategies. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–16.

[167] S Shyam Sundar. 2020. Rise of Machine Agency: A Framework for Studying the Psychology of Human–AI Interaction (HAI). *Journal of Computer-Mediated Communication* 25, 1 (01 2020), 74–88. https://doi.org/10.1093/jcmc/zmz026

[168] Matthis Synofzik, Gottfried Vosgerau, and Albert Newen. 2008. Beyond the comparator model: a multifactorial two-step account of agency. *Consciousness and cognition* 17, 1 (2008), 219–239.

[169] Leila Takayama. 2015. Telepresence and apparent agency in human-robot interaction. *The handbook of the psychology of communication technology* (2015), 160–175.

[170] Min Tang, Sebastian Hofreiter, Christian H. Werner, Aleksandra Zielińska, and Maciej Karwowski. [n. d.]. “Who” Is the Best Creative Thinking Partner? An Experimental Investigation of Human–Human, Human–Internet, and Human–AI Co-Creation. *The Journal of Creative Behavior* n/a, n/a ([n. d.]). https://doi.org/10.1002/jocb.1519 arXiv:https://onlinelibrary.wiley.com/doi/pdf/10.1002/jocb.1519

[171] Jakob Tholander and Martin Jonsson. 2023. Design ideation with AI-sketching, thinking and talking with generative machine learning models. In *Proceedings of the 2023 ACM designing interactive systems conference*. 1930–1940.

[172] Milka Trajkova, Duri Long, Manoj Deshpande, Andrea Knowlton, and Brian Magerko. 2024. Exploring Collaborative Movement Improvisation Towards the Design of LuminAI—a Co-Creative AI Dance Partner. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–22.

[173] Andrea C Tricco, Erin Lillie, Wasifa Zarin, Kelly K O’Brien, Heather Colquhoun, Danielle Levac, David Moher, Micah DJ Peters, Tanya Horsley, Laura Weeks, et al. 2018. PRISMA extension for scoping reviews (PRISMA-ScR): checklist and explanation. *Annals of internal medicine* 169, 7 (2018), 467–473.

[174] Mark Turner. 2006. *The artful mind: Cognitive science and the riddle of human creativity*. Oxford University Press.

[175] Rama Adithya Varanasi, Nicola Dell, and Aditya Vashistha. 2024. Saharaline: A Collective Social Support Intervention for Teachers in Low-Income Indian Schools. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–20.

[176] Rama Adithya Varanasi and Nitesh Goyal. 2023. “It is currently hodgepodge”: Examining AI/ML Practitioners’ Challenges during Co-production of Responsible AI Values. In *Proceedings of the 2023 CHI conference on human factors in computing systems*. 1–17.

[177] Craig Vear, Adrian Hazzard, Solomiya Moroz, and Johann Benerradi. 2024. Jess+: AI and robotics with inclusive music-making. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–17.

[178] Mathias Peter Verheijden and Mathias Funk. 2023. Collaborative diffusion: Boosting designerly co-creation with generative AI. In *Extended abstracts of the 2023 CHI conference on human factors in computing systems*. 1–8.

[179] Shikha Verma. 2019. Weapons of math destruction: how big data increases inequality and threatens democracy. *Vikalpa* 44, 2 (2019), 97–98.

[180] Thomas Serban Von Davier. 2023. Designing for Appreciation: How Digital Spaces Can Support Art and Culture. In *Extended Abstracts of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–5.

[181] Shaun Wallace. 2022. Asynchronous Collaboration Systems for Evolving Information. In *CHI Conference on Human Factors in Computing Systems Extended Abstracts*. 1–5.

[182] Qian Wan, Xin Feng, Yining Bei, Zhiqi Gao, and Zhicong Lu. 2024. Metamorpheus: Interactive, Affective, and Creative Dream Narration Through Metaphorical Visual Storytelling. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–16.

[183] Bryan Wang, Yuliang Li, Zhaoyang Lv, Hajun Xia, Yan Xu, and Raj Sodhi. 2024. LAVE: LLM-powered agent assistance and language augmentation for video editing. In *Proceedings of the 29th International Conference on Intelligent User Interfaces*. 699–714.

[184] Ge Wang, Jun Zhao, Max Van Kleek, and Nigel Shadbolt. 2023. ‘Treat me as your friend, not a number in your database’: Co-designing with Children to Cope with Datafication Online. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–21.

[185] Huanchen Wang, Minzhu Zhao, Wanyang Hu, Yuxin Ma, and Zhicong Lu. 2024. Critical heritage studies as a lens to understand short video sharing of intangible cultural heritage on douyin. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–21.

[186] Zhijie Wang, Yuheng Huang, Da Song, Lei Ma, and Tianyi Zhang. 2024. PromptCharm: Text-to-Image Generation through Multi-modal Prompting and Refinement. In *Proceedings of the CHI Conference on Human Factors in Computing Systems* (Honolulu, HI, USA) (CHI ’24). Association for Computing Machinery, New York, NY, USA, Article 185, 21 pages. <https://doi.org/10.1145/3613904.3642803>

[187] Zijie J Wang, Chinmay Kulkarni, Lauren Wilcox, Michael Terry, and Michael Madaio. 2024. Farsight: Fostering Responsible AI Awareness During AI Application Prototyping. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–40.

[188] Daniel M Wegner. 2003. The mind’s best trick: How we experience conscious will. *Trends in cognitive sciences* 7, 2 (2003), 65–69.

[189] Justin D Weisz, Jessica He, Michael Muller, Gabriela Hoefer, Rachel Miles, and Werner Geyer. 2024. Design principles for generative AI applications. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–22.

[190] Justin D Weisz, Michael Muller, Jessica He, and Stephanie Houde. 2023. Toward general design principles for generative AI applications. *arXiv preprint arXiv:2301.05578* (2023).

[191] Justin D Weisz, Michael Muller, Steven I Ross, Fernando Martinez, Stephanie Houde, Mayank Agarwal, Kartik Talamadupula, and John T Richards. 2022. Better together? an evaluation of ai-supported code translation. In *Proceedings of the 27th International Conference on Intelligent User Interfaces*. 369–391.

[192] Norbert Wiener. 2019. *Cybernetics or Control and Communication in the Animal and the Machine*. MIT press.

[193] Tongshuang Wu, Michael Terry, and Carrie Jun Cai. 2022. Ai chains: Transparent and controllable human-ai interaction by chaining large language model prompts. In *Proceedings of the 2022 CHI conference on human factors in computing systems*. 1–22.

[194] Zhuohao Wu, Danwen Ji, Kaiwen Yu, Xianxu Zeng, Dingming Wu, and Mohammad Shidujaman. 2021. AI creativity and the human-AI co-creation model. In *Human-Computer Interaction. Theory, Methods and Tools: Thematic Area, HCI 2021, Held as Part of the 23rd HCI International Conference, HCII 2021, Virtual Event, July 24–29, 2021, Proceedings, Part I* 23. Springer, 171–190.

[195] Daijin Yang, Yanpeng Zhou, Zhiyuan Zhang, Toby Jia-Jun Li, and Ray LC. 2022. AI as an Active Writer: Interaction strategies with generated text in human-AI collaborative fiction writing. In *Joint Proceedings of the ACM IUI Workshops*, Vol. 10. CEUR-WS Team, 1–11.

[196] Kexin Bella Yang, Vanessa Echeverria, Zijing Lu, Hongyu Mao, Kenneth Holstein, Nikol Rummel, and Vincent Aleven. 2023. Pair-up: prototyping human-AI co-orchestration of dynamic transitions between individual and collaborative learning in the classroom. In *Proceedings of the 2023 CHI conference on human factors in computing systems*. 1–17.

[197] Ann Yuan, Andy Coenen, Emily Reif, and Daphne Ippolito. 2022. Wordcraft: story writing with large language models. In *Proceedings of the 27th International Conference on Intelligent User Interfaces*. 841–852.

[198] Marielba Zacarias and José Valente Oliveira. 2012. *Human-computer interaction: the agency perspective*. Springer.

[199] Chao Zhang, Xuechen Liu, Katherine Ziska, Soobin Jeon, Chi-Lin Yu, and Ying Xu. 2024. Mathemyths: leveraging large language models to teach mathematical language through Child-AI co-creative storytelling. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–23.

[200] Mingyuan Zhang, Zhaolin Cheng, Sheung Ting Ramona Shiu, Jiacheng Liang, Cong Fang, Zhengtao Ma, Le Fang, and Stephen Jia Wang. 2023. Towards Human-Centred AI-Co-Creation: A Three-Level Framework for Effective Collaboration between Human and AI. In *Companion Publication of the 2023 Conference on Computer Supported Cooperative Work and Social Computing*. 312–316.

[201] Minfan Zhang, Daniel Ehrmann, Mjaye Mazwi, Danny Eytan, Marzyeh Ghassemi, and Fanny Chevalier. 2022. Get to the point! Problem-based curated data views to augment care for critically ill patients. In *Proceedings of the 2022 CHI Conference on Human Factors in Computing Systems*. 1–13.

[202] Qiaoning Zhang, Matthew L Lee, and Scott Carter. 2022. You complete me: Human-ai teams and complementary expertise. In *Proceedings of the 2022 CHI conference on human factors in computing systems*. 1–28.

[203] Shuning Zhang, Xin Yi, Shixuan Li, Chuye Hong, Gujun Chen, Jiarui Liu, Xueyang Wang, Yongquan Hu, Yuntao Wang, and Hewu Li. 2025. Actual Achieved Gain and Optimal Perceived Gain: Modeling Human Take-over Decisions Towards Automated Vehicles’ Suggestions. *arXiv preprint arXiv:2502.06179* (2025).

[204] Zheng Zhang, Jie Gao, Ranjodh Singh Dhaliwal, and Toby Jia-Jun Li. 2023. Visar: A human-ai argumentative writing assistant with visual programming and rapid draft prototyping. In *Proceedings of the 36th Annual ACM Symposium on User Interface Software and Technology*. 1–30.

[205] Zheng Zhang, Ying Xu, Yanhao Wang, Bingsheng Yao, Daniel Ritchie, Tongshuang Wu, Mo Yu, Dakuo Wang, and Toby Jia-Jun Li. 2022. Storybuddy: A human-ai collaborative chatbot for parent-child interactive storytelling with flexible parental involvement. In *Proceedings of the 2022 CHI Conference on Human Factors in Computing Systems*. 1–21.

[206] Chengbo Zheng, Kangyu Yuan, Bingcan Guo, Reza Hadi Mogavi, Zhenhui Peng, Shuai Ma, and Xiaojuan Ma. 2024. Charting the Future of AI in Project-Based Learning: A Co-Design Exploration with Students. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–19.

[207] Feng Zhou, Steven D Benford, Sarah Whatley, Kate Marsh, Ian Ashcroft, Tanja Erhart, Welly O’Brien, and Paul Tennent. 2023. Beyond skin deep: Generative co-design for aesthetic prosthetics. In *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems*. 1–19.

[208] Jiayi Zhou, Renzhong Li, Junxiu Tang, Tan Tang, Haotian Li, Weiwei Cui, and Yingcai Wu. 2024. Understanding nonlinear collaboration between human and AI agents: A co-design framework for creative design. In *Proceedings of the CHI Conference on Human Factors in Computing Systems*. 1–16.

[209] Jichen Zhu, Antonios Liapis, Sebastian Risi, Rafael Bidarra, and G Michael Youngblood. 2018. Explainable AI for designers: A human-centered perspective on mixed-initiative co-creation. In *2018 IEEE conference on computational intelligence and games (CIG)*. IEEE, 1–8.

[210] Jonathan Zong, Isabella Pedraza Pineros, Mengzhu Chen, Daniel Hajas, and Arvind Satyanarayan. 2024. Umwelt: Accessible Structured Editing of Multi-Modal Data Representations. In *Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems*. 1–20.

## A PRISMA-SCR GUIDED LITERATURE REVIEW PROCESS AND JUSTIFICATION

Our literature review followed PRISMA-ScR guideline, and the whole process is outlined in Figure 9.

**Literature Search Details** Our query string contained the uppercase and lowercase version of (“co-creation” OR “co-writing” OR “co-drawing” OR “co-design”) AND (“agency”), applied to the title and content. The terms “co-creation”, “co-writing”, “co-drawing”, “co-design” were iteratively optimized and selected to represent the most common and explicit descriptors for human-AI collaborative activities studied HCI. They cover a range of creative and design-oriented tasks. We have attempted to add “co-dancing”, “co-making” and others, which resulted in no additional papers. For “agency”, this is the core theoretical construct under investigation, and we want to make sure the paper explicitly mentioned agency. We also attempted to add similar words like “autonomy”, but resulted in no increase of eligible papers. **We selected conferences including CHI, UIST, CSCW, Ubicomp, IUI, DIS manually when conducting the searching to scope the search in top-tier HCI conferences.**

**Exclusion Criteria Definitions** The following provides clarification on the exclusion criteria applied during the full-text coding.

*Screening Criteria (Applied to Titles & Abstracts)*

**SC1-Irrelevant Topic:** Papers whose titles or abstracts clearly indicated a primary focus outside the scope of human-AI co-creation and agency were excluded. This initial thematic filter was crucial for efficiency, removing papers clearly unrelated to the review’s core concentration on co-creation and agency before committing to the full-text analysis. Examples of excluded records included papers solely on AI algorithms, non-AI HCI studies, general collaboration theories.

**SC2-Not Full Paper:** Records identified as not being peer-reviewed full papers appropriate for this review were excluded. This criterion ensured the review focused on substantial works typical of the targeted top-tier venues. Excluding short and non-peer-reviewed formats helps maintain a consistent depth and quality of evidence across the analyzed corpus, aligning with the goal of synthesizing established research findings. Examples of excluded records include workshop summaries, demo descriptions, dissertations.

*Eligibility Criteria (Applied to Full Texts)*

**EC1-Relevance to Co-creation:** Papers not focused on collaborative or co-creative processes involving both humans and AI systems within an HCI context were excluded. This criterion confirmed that the core subject of the paper involved human-AI co-creation rather than just any human-AI interaction. Examples of excluded papers include AI algorithm optimization studies, autonomous navigation without co-creation tools, non-collaborative AI tools.

**EC2-Focus on Concrete HCI Contributions:** Papers discussing agency or co-creation primarily at a conceptual, philosophical, or ethical level without detailing or evaluating specific HCI techniques, interaction designs, or implemented systems were excluded. This criterion was vital for ensuring that our review could meet its objective of cataloging and analyzing the operational aspects of agency, specifically, the concrete control mechanisms and interaction designs used in practice. By focusing on papers with HCI contributions, our review could synthesize actionable design knowledge and identify patterns in implemented systems, directly addressing the identified gap regarding practical operationalization of agency. Examples of excluded papers involve high-level framework proposals.

**EC3-Focus on Human-AI Interaction:** Papers where the interaction studied or designed involved only humans interacting with other humans or only AI agents interacting with other AI agents were excluded. It ensured that the analysis focused on the unique interaction phenomena, agency distributions, and control challenges arising specifically at the interface between human users and AI systems, which is the central locus of investigation for this review. Studies of purely human or purely AI systems, while potentially relevant to collaboration broadly, fall outside this specific scope. Examples of excluded papers include studies on human-human collaboration tools or AI-AI multi-agent systems.

## B CODING CRITERIA AND THEORETICAL FOUNDATIONS

We adopted the following theories and criteria when coding the papers.

- *Research Methods:* Categorized into quantitative, qualitative, theoretical/evaluation framework, mixed methods, and user-centered research, following Bi et al. [19].
- *Research Types/Contributions:* Classified as comparison study, concept generation, design, system implementation, or interview<sup>6</sup>.
- *Interaction Stage (one dimension of Context):* Coded based on the six stages (perceive, think, express, collaborate, build, test) derived from Wu et al. [194] and utilized by Zhang et al. [200].
- *Interaction modality (one dimension of Context):* Classified into Textual, Visual, Auditory, and Multi-modal/Hybrid, informed by prior work [80, 152] and observations in the literature.
- *Levels of Agency:* Categorized based on Rammert et al.'s framework [118], into passive, semi-active, reactive, proactive, cooperative.
- *Agency Distribution:* Analyzed using the three dimensions extending Holter et al. [68]: locus of control, control dynamics (static/dynamic allocation), and granularity of control. Here the agency distribution included the ones the studies in the literature explicitly covered and the ones in their design / implementation.
- *Control Mechanisms:* we organized the control mechanisms according to IPOF model stages (Input, Action, Output, Feedback) [192], and then devised the detailed control mechanisms through manually synthesizing from the literature.
- *Applications:* we organized the applications through identifying and aggregating potential applications from the literature. Here the applications encompassed all targeted applications the authors claimed. We did not directly adopt Wu et al.'s work [194] because their classification was at an abstract level and faces limitation in guiding actionable designs.

<sup>6</sup><https://ueberproduct.de/en/4-types-of-research/>

![](bbd13d4e8ab0a1c21902ad3700a68371_img.jpg)

Flowchart illustrating the PRISMA-ScR guided process of paper selection for the review, categorized into four phases:

- **Identification:** Records identified from database (n = 2799). Records removed before screening: Temporal and Venue relevance (n=2071).
- **Screening:** Records for title and abstract screening (n=728). Records excluded (n=192): SC1. Irrelevant topics (n=146); SC2. Not full paper (n=46).
- **Eligibility:** Full-text records access for eligibility (n=536). Records excluded (n=402): EC1. Relevance to co-creation (n=185); EC2. Focus on HCI contributions (n=95); EC3. Focus on human-AI Interaction (n=122).
- **Included:** Papers included for synthesis (n=134).

Fig. 9. The PRISMA-ScR guided process of our paper selections for the review.

- *Challenges:* We manually coded and organized the challenges from the literature. Here the challenges denoted all stated challenges or directions in the literature.

## C THE TAXONOMY OF PAPERS

Table 1. The interaction stages the papers in our surveys are based on.

| Interaction Stage | Papers                                                                                                                                                                                                                                                                                                                                                                                   |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Perceive          | [5, 6, 8–16, 18, 20, 21, 23, 31, 33, 35–37, 40, 42, 44, 45, 48, 49, 51, 55, 59, 60, 62, 64, 66, 67, 69, 70, 74, 75, 77, 78, 82, 84–86, 88–90, 92, 94, 96, 97, 101, 102, 105, 106, 108–115, 117, 121, 122, 124, 128–130, 132, 135, 137, 138, 146, 148–150, 153, 154, 158, 159, 162, 163, 165, 166, 171, 172, 175, 177, 178, 180–185, 187, 189, 191, 193, 196, 197, 199–201, 205–207, 210] |
| Think             | [5, 6, 8–16, 18, 20, 23, 30, 31, 33, 35–37, 40, 42, 44, 45, 49, 51, 55, 59, 60, 62, 64, 66, 67, 69, 70, 73–75, 77, 78, 82, 84–86, 88–90, 92, 94, 96–98, 101, 102, 105, 106, 108–114, 116, 117, 121, 122, 124, 128, 130, 135, 138, 146, 149, 150, 153, 154, 158, 159, 162–166, 171, 172, 175–178, 180, 182–185, 187, 189, 191, 193, 196, 197, 199–201, 204–207, 210]                      |
| Express           | [5, 6, 8–16, 18, 20, 21, 23, 29–31, 33, 35–37, 42, 44, 45, 48, 49, 51, 55, 59, 60, 62, 64, 66, 67, 69, 70, 73, 75, 77, 78, 82, 84–86, 88–90, 92, 94, 96–98, 101, 102, 105, 106, 108–117, 121, 122, 124, 128–130, 132, 135, 137, 138, 146, 148–150, 153, 154, 158, 159, 162–166, 171, 172, 175–178, 180–185, 187, 189, 191, 193, 196, 197, 199–201, 204–207, 210?]                        |
| Collaborate       | [5, 8, 10–14, 18, 20, 21, 23, 27, 31, 35–37, 40, 42, 45, 48, 49, 51, 55, 59, 60, 62, 66, 67, 69, 70, 73, 84–86, 88, 89, 96, 98, 101, 102, 105, 108–110, 112, 115–117, 122, 124, 128–130, 132, 135, 137, 138, 146, 148–150, 153, 154, 162–166, 171, 172, 175–178, 181–185, 187, 189, 193, 196, 197, 199–201, 204–207]                                                                     |
| Build             | [9, 11, 12, 14, 21, 23, 29, 35–37, 42, 45, 48, 49, 51, 60, 64, 66, 70, 73, 77, 86, 88–90, 97, 105, 106, 109–111, 113, 128–130, 137, 149, 150, 153, 158, 162, 166, 176, 178, 180–182, 189, 191, 200, 205, 207, 210]                                                                                                                                                                       |
| Test              | [6, 8, 11, 12, 14, 18, 20, 23, 29, 35–37, 40, 48, 49, 51, 55, 60, 64, 66, 70, 75, 77, 78, 84, 86, 94, 101, 106, 108–112, 114, 115, 117, 122, 128, 129, 135, 138, 146, 148–150, 158, 162, 166, 171, 172, 175, 176, 178, 180, 181, 185, 189, 191, 193, 196, 199, 205–207]                                                                                                                  |

Table 2. The modalities the papers in our surveys are based on.

| Modality                          | Papers                                                                                                                                                                                                                                           |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| textual interaction               | [6, 9, 10, 15, 29, 40, 42, 45, 55, 59, 62, 70, 74, 77, 78, 82, 85, 92, 94, 108, 114, 122, 128, 130, 132, 146, 148, 149, 154, 163, 165, 187, 191, 193, 197]                                                                                       |
| visual interaction                | [12, 16, 35, 44, 48, 66, 67, 88, 89, 96, 102, 112, 115, 121, 135, 150, 153, 158, 178, 180, 182, 185, 201]                                                                                                                                        |
| auditory interaction              | [75, 84, 84, 109, 110, 162, 164, 199]                                                                                                                                                                                                            |
| multimodal and hybrid interaction | [5, 8, 11, 13, 14, 18, 20, 21, 23, 27, 30, 31, 33, 36, 37, 49, 51, 60, 64, 69, 73, 77, 86, 90, 97, 98, 101, 105, 106, 111, 113, 116, 117, 124, 125, 129, 137, 138, 159, 166, 171, 172, 175–177, 177, 181, 183, 184, 189, 196, 200, 204–207, 210] |

Table 3. The agency patterns the papers in our surveys included.

| Agency Pattern | Papers                                                                                                                                                                                                                                                                                                                                                                       |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Passive        | [40, 73, 112, 124, 138, 171, 191, 206]                                                                                                                                                                                                                                                                                                                                       |
| Reactive       | [5, 5, 8-10, 12, 14-16, 18, 20, 21, 23, 29, 30, 33, 35, 36, 40, 42, 44, 45, 48, 51, 55, 59, 60, 62, 64, 66, 67, 69, 70, 73, 75, 77, 82, 84-86, 88-90, 94, 96, 98, 102, 105, 106, 108-110, 112-117, 121, 122, 124, 129, 130, 135, 137, 138, 148, 150, 153, 154, 158, 159, 162-166, 171, 172, 175-178, 180-185, 187, 189, 191, 196, 197, 199-201, 204-207]                     |
| Semi-proactive | [5, 5, 6, 8-16, 18, 20, 21, 23, 27, 29-31, 33, 35-37, 40, 42, 44, 45, 48, 51, 55, 59, 59, 60, 62, 64, 66, 69, 70, 73-75, 77, 78, 82, 84-86, 88-90, 92, 94, 96, 98, 101, 102, 105, 106, 108-117, 121, 122, 124, 125, 128-130, 132, 135, 137, 138, 148, 148-150, 153, 154, 158, 159, 162-166, 171, 172, 175-178, 180-185, 187, 189, 191, 193, 196, 197, 199-201, 204-207, 210] |
| Proactive      | [11-13, 16, 18, 20, 21, 23, 27, 30, 31, 35, 37, 40, 45, 48, 51, 55, 59, 60, 64, 67, 73, 78, 82, 84-86, 89, 90, 92, 96, 98, 101, 109-116, 124, 125, 128-130, 132, 135, 137, 138, 148-150, 154, 158, 159, 163, 164, 166, 172, 176, 177, 182, 184, 185, 187, 191, 193, 200, 205-207, 210]                                                                                       |
| Automatic      | [9, 12, 15, 27, 30, 33, 36, 40, 44, 55, 67, 73, 79, 86, 88, 90, 92, 106, 113, 117, 121, 122, 124, 132, 148, 153, 162, 177, 178, 181, 183, 187, 189, 193, 197, 201, 205, 206]                                                                                                                                                                                                 |

Table 4. The agency distribution the papers in our surveys included.

| Agency Distribution | Papers                                                                                                                                                                                                                                                                                                                                                           |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Locus               | [5, 6, 10-13, 15, 16, 18, 20, 21, 23, 27, 30, 31, 33, 36, 40, 42, 48, 49, 51, 55, 59, 60, 64, 66, 67, 69, 70, 73-75, 77, 78, 82, 84-86, 88-90, 92, 94, 96, 98, 101, 102, 105, 106, 108-113, 117, 121, 122, 124, 128-130, 135, 137, 138, 148-150, 153, 154, 159, 162, 164-166, 171, 172, 175, 177, 178, 180-184, 189, 191, 193, 196, 197, 199-201, 204-207, 210?] |
| Dynamics            | [9, 10, 14, 18, 20, 21, 23, 29-31, 35-37, 40, 44, 48, 51, 59, 60, 62, 66, 67, 69, 85, 86, 90, 96, 98, 105, 106, 108-110, 112, 114, 116, 121, 122, 124, 125, 128, 135, 138, 146, 158, 159, 164, 172, 176-178, 183-185, 187, 193, 196, 197, 200, 205, 207, 210]                                                                                                    |
| Granularity         | [6, 8, 11, 12, 18, 21, 23, 30, 35, 36, 42, 45, 48, 51, 55, 59, 60, 64, 66, 69, 73-75, 84, 86, 88, 90, 96, 98, 106, 109-112, 115, 117, 121, 122, 128-130, 132, 135, 150, 153, 162-164, 166, 172, 177, 181, 183, 184, 189, 193, 197, 200, 201, 204, 205, 207, 210]                                                                                                 |

Table 5. The control mechanisms the papers in our surveys included.

| Control Mechanisms                                 | Papers                                                                                                                                                                                                                                                                             |
|----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Guided Input Interaction                           | [5, 6, 8, 9, 11, 14, 16, 23, 27, 30, 31, 37, 40, 45, 49, 51, 55, 59, 60, 64, 70, 84, 85, 89, 90, 98, 101, 102, 105, 108, 109, 111–113, 115, 122, 122, 124, 129, 130, 135, 138, 148, 153, 162–164, 166, 171, 172, 177, 178, 181, 182, 187, 189, 191, 199, 201, 207]                 |
| Context Awareness and Memory Retention             | [8, 9, 11, 14, 16, 21, 31, 37, 44, 49, 51, 55, 59, 60, 64, 73, 82, 85, 90, 98, 101, 108, 109, 129, 130, 135, 138, 148, 162–164, 171, 172, 178, 184, 187, 189, 199, 201, 206, 207]                                                                                                  |
| Transparency and Explainability in Human-AI Agency | [5, 6, 8, 9, 11, 16, 18, 23, 27, 30, 31, 37, 40, 44, 49, 55, 59, 60, 62, 64, 70, 73, 74, 82, 85, 90, 98, 101, 105, 108, 109, 111–113, 122, 124, 125, 129, 130, 135, 138, 148, 153, 162–164, 166, 171, 172, 175, 177, 178, 181, 181, 182, 184, 187, 189, 199, 201, 206, 207]        |
| Multimodal Action Space Exploration                | [6, 8, 11, 14, 16, 18, 21, 23, 27, 37, 44, 51, 55, 60, 73, 85, 90, 108, 111, 113, 129, 130, 135, 153, 163, 164, 171, 177, 178, 181, 182, 187, 189, 199, 206, 207]                                                                                                                  |
| Action Coordination                                | [5, 8, 11, 14, 21, 23, 27, 31, 40, 44, 45, 51, 55, 59, 60, 62, 64, 70, 73, 74, 89, 90, 98, 101, 105, 108, 109, 115, 122, 125, 130, 135, 138, 153, 162, 163, 172, 175, 177, 178, 184, 187, 189, 199, 201, 206, 207]                                                                 |
| Attention-focused Processing                       | [70, 84, 115, 189]                                                                                                                                                                                                                                                                 |
| Confidence Level                                   | [8, 59, 82, 112, 148, 189, 206]                                                                                                                                                                                                                                                    |
| Explanatory Feedback Emphasis                      | [11, 16, 23, 44, 49, 59, 62, 70, 73, 102, 108, 109, 115, 129, 165, 172, 189]                                                                                                                                                                                                       |
| Iterative Feedback Loop                            | [5, 6, 8, 9, 11, 14, 16, 18, 21, 23, 27, 30, 31, 37, 40, 44, 49, 51, 59, 60, 62, 64, 70, 73, 74, 82, 84, 85, 90, 98, 101, 102, 105, 108, 109, 111–113, 115, 122, 124, 125, 129, 130, 135, 138, 148, 153, 162–164, 171, 172, 175, 177, 178, 181, 182, 187, 189, 199, 201, 206, 207] |
| Modification and Intervention                      | [6, 9, 16, 18, 27, 30, 37, 40, 44, 45, 59, 64, 70, 74, 82, 90, 109, 111–113, 124, 135, 138, 148, 153, 162, 164, 175, 177, 184, 187, 189, 191, 199, 207]                                                                                                                            |
| Adaptive Scaffolding                               | [8, 9, 11, 14, 18, 23, 30, 31, 45, 55, 60, 64, 74, 98, 101, 105, 108, 109, 112, 125, 129, 130, 135, 138, 162, 163, 172, 175, 177, 178, 181, 182, 189, 199, 201]                                                                                                                    |
| Chain of Thought                                   | [51, 108, 122, 189, 201, 206]                                                                                                                                                                                                                                                      |

Table 6. Applications in the papers in our surveys included.

| Application          | Papers                                                                                                                                                                                                                                        |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| News Media           | [27, 42, 92, 106, 138, 148, 176, 187]                                                                                                                                                                                                         |
| Healthcare           | [14, 18, 21, 27, 31, 33, 37, 89, 90, 92, 105, 121, 122, 125, 159, 164, 171, 176, 182, 187, 201]                                                                                                                                               |
| Artistic Creation    | [5, 6, 9, 14, 16, 20, 23, 27, 29–31, 36, 40, 44, 45, 51, 60, 62, 64, 66, 67, 70, 73, 74, 77, 77, 84–86, 88, 92, 97, 102, 109–111, 113, 115, 117, 128–130, 135, 146, 149, 150, 153, 162, 163, 171, 172, 177, 180–183, 185, 197, 200, 204, 206] |
| Education & Research | [5, 8, 9, 11–13, 15, 16, 27, 29, 30, 33, 42, 45, 49, 59, 60, 62, 64, 69, 70, 74, 86, 90, 92, 94, 96–98, 101, 102, 108, 111, 113, 125, 129, 132, 146, 154, 165, 175, 181, 184, 185, 187, 191, 193, 196, 199, 204, 205, 207]                    |
| Entertainment        | [10, 16, 27, 35, 48, 51, 67, 74, 75, 86, 97, 109, 110, 112, 113, 116, 124, 135, 137, 149, 158, 163, 166, 172, 178, 184, 185, 200, 206]                                                                                                        |
| Software Development | [12, 27, 66, 74, 97, 111, 113, 176, 187, 191, 193]                                                                                                                                                                                            |
| Accessibility        | [13, 14, 27, 31, 55, 75, 78, 82, 89, 90, 92, 96, 111, 114, 128, 159, 177, 181, 193, 210]                                                                                                                                                      |

Table 7. Challenges &amp; Directions in the papers in our surveys included.

| Challenges & Directions   | Papers                                                                                                                                                                                                                                                                                                                                                        |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Creativity and Ownership  | [5, 6, 10, 12–16, 20, 21, 23, 29–31, 33, 35, 36, 40, 42, 44, 45, 48, 51, 55, 60, 62, 64, 66, 67, 70, 73, 74, 78, 82, 84–86, 88–90, 92, 96, 98, 102, 105, 106, 108, 109, 111, 113, 115–117, 122, 124, 128–130, 132, 135, 137, 146, 150, 153, 154, 158, 162–166, 171, 172, 177, 178, 181, 182, 185, 189, 193, 197, 199, 200, 204–207]                           |
| Trust and Transparency    | [5, 6, 8–16, 18, 20, 21, 23, 27, 29–31, 33, 35–37, 42–45, 48, 49, 51, 55, 59, 60, 62, 64, 67, 70, 73–75, 78, 82, 84–86, 88–90, 92, 94, 96, 98, 101, 102, 105, 106, 108–117, 121, 122, 124, 125, 129, 130, 132, 135, 137, 138, 146, 148–150, 154, 158, 159, 162–166, 171, 172, 175–178, 181–183, 183–185, 187, 189, 191, 193, 196, 197, 199–201, 204–207, 210] |
| Data Privacy and Security | [8, 9, 11, 16, 18, 20, 23, 27, 30, 31, 37, 42, 43, 48, 49, 51, 55, 59, 70, 73, 75, 82, 84, 85, 90, 92, 94, 109, 110, 112, 114, 121, 124, 132, 138, 159, 164, 166, 175, 176, 181, 182, 184, 187, 189, 191, 196, 197, 199, 201, 204, 206]                                                                                                                       |
| Interoperability          | [9–11, 18, 27, 36, 42, 48, 49, 59, 62, 66, 73, 75, 78, 92, 105, 106, 111, 124, 135, 148, 149, 163, 166, 171, 172, 177, 178, 182, 183, 187, 189, 191, 193, 197, 201, 204, 205, 207, 210]                                                                                                                                                                       |
| Social Impact and Equity  | [8, 13, 14, 16, 18, 21, 23, 27, 30, 31, 33, 35, 37, 40, 43–45, 51, 55, 59, 70, 73, 82, 84, 89, 98, 101, 108, 109, 112, 113, 121, 122, 124, 125, 128, 129, 135, 138, 148–150, 162, 165, 166, 171, 175, 176, 184, 187, 189, 206, 207]                                                                                                                           |
| Ethical and Bias Concerns | [6, 9–13, 15, 18, 20, 23, 27, 29–31, 33, 35, 36, 42–45, 48, 49, 55, 59, 60, 62, 64, 66, 67, 70, 73–75, 82, 84–86, 88–90, 92, 94, 96, 98, 101, 102, 105, 106, 108, 110–117, 121, 122, 124, 125, 128–130, 132, 137, 138, 146, 148–150, 154, 158, 159, 162–166, 171, 172, 175–178, 181–185, 187, 189, 191, 193, 196, 197, 199, 201, 204–207, 210]                |
| Long-Term Paradigm Shift  | [30, 40, 49, 55, 62, 86, 92, 108, 146, 165, 187, 197]                                                                                                                                                                                                                                                                                                         |