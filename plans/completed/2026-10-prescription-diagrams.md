---
title: Prescription diagrams
status: completed
kind: exec-spec
created: 2026-10-18
last_reviewed: 2026-10-19
area: language / pattern pages
promoted_to: "docs/specs/pattern-site.md §Figures; .claude/rules/pattern-content.md; scripts/clean-figure.ts; apps/patterns/src/components/Figure.astro"
superseded_by:
---

# Prescription diagrams

## Intent

Give pattern pages a second kind of illustration beside the demo: a drawn diagram of the relations the pattern imposes on the situation, placed with the instruction.

*A Pattern Language* illustrates each pattern twice. A photograph of an unnamed instance opens the entry, for recognition before reading. A hand-drawn diagram closes the prescription, carrying the solution's essential relations and the one or two parameters that matter ("five to seven cars", "six feet deep"), with every accidental detail removed. The site has the first: the optional opening demo. It has nothing in the second role. The demo after `Therefore,` is another instance, and the six existing `<Diagram>` uses are decision trees.

A diagram is not a cheaper demo. A demo shows one realisation in one library's look; a diagram is the only illustration that can be implementation-neutral, which the naming rule asks of the pattern itself ("must apply to any valid implementation"). It also reaches patterns a sandbox cannot: activity-level, coordination and networking patterns, and any pattern whose point is temporal rather than spatial. Thirty-five of the 144 pages carry a demo; a diagram costs no code, so coverage can grow faster.

The open question is the drawn vocabulary. Alexander's diagrams are geometry because his solutions are. Interaction patterns impose relations that are spatial sometimes, but more often temporal (before and after, a sequence), structural (what is visible, what state holds) or about who acts (actor, system, AI). The vocabulary is found by drawing, not specified first: this plan trials five patterns across kinds, then fixes the vocabulary, the component and the rule text from what the drawings show.

## Trial

Five patterns, chosen for the kind of relation each imposes and because none has a demo today:

| Pattern | Level | What the diagram has to carry |
| --- | --- | --- |
| [undo](../../apps/patterns/src/content/patterns/undo.mdx) | operation | time: a committed action and a way back to before it from later points |
| [wizard](../../apps/patterns/src/content/patterns/wizard.mdx) | action | sequence: frames in order, one decision per frame, the whole visible as steps |
| [progressive-disclosure](../../apps/patterns/src/content/patterns/progressive-disclosure.mdx) | action | structure: what is shown first, what is reachable, what stays hidden until asked |
| [reconciliation](../../apps/patterns/src/content/patterns/reconciliation.mdx) | action, coordination | two versions of one thing and the act of merging them |
| [handoff](../../apps/patterns/src/content/patterns/handoff.mdx) | action | who acts: work passing between actor and system, what each holds at the moment of transfer |

Wizard was not drawn (see Record): a widely used pattern may need no figure. [Workflow](../../apps/patterns/src/content/patterns/workflow.mdx) was drawn as a sixth, to test the activity level.

For each drawing, record below: what it had to show, what the vocabulary needed, where it failed. A pattern that will not diagram is a finding, not a failure of the trial; record why.

No interface in the drawing: no screens, surfaces, panels, buttons or toasts. A drawn interface is at best a wireframe, and a demo shows a realisation better than any drawing can. The figure shows what an implementation cannot: relations across time, state that is held but not visible, who holds what, and what stays the same across every realisation.

Drawing register: as few marks as the relation needs, no words in the drawing, one parameter at most, uniform stroke weight, and as little height as the relation allows: a figure sits between paragraphs and should not push the text far down the page. The test for a drawing is whether a designer would draw it on a napkin to explain the pattern. Figures and objects (a person, a sheet, a note) and abstract marks (a time line, circles for states) both pass it; they are not opposites. Use whichever carries the relation: objects where the pattern is about who holds what or what the work contains, a line where it is about time. Abstract marks should not need a private legend, so their meanings are kept stable across figures. A mark earns its place only if removing it loses part of the relation. Draw only what holds for every realisation of the pattern: a constraint some realisations have and others lack (a time limit, a fixed number of steps) narrows the pattern and does not belong in its figure. A change of line style (weight, dash, colour) is made only to carry a meaning: rows, outlines and inner shapes share one weight, and a dashed or coloured line says something a solid black one does not. Spacing is drawn as deliberately as the marks: equal margins inside a sheet, equal gaps between rows and between objects. Mermaid is the wrong register for this and stays for decision trees.

## Mechanism

As drafted before the trial. What landed, with the drawn vocabulary, is in `docs/specs/pattern-site.md` §Figures; the shipped figures sit after the lead on pages not yet shaped.

*Source and export.* Draw in tldraw (already a dependency of `packages/components` for the Workflow composition; the hosted editor serves as well). Commit two files per diagram under `apps/patterns/src/figures/<slug>/`: the editable `.tldr` JSON and the exported `.svg`. The SVG is what the page serves; the JSON is what the next edit opens. The site runs no tldraw at render time, so the SDK's licensing terms, which the paused tldraw plan flags, do not arise.

*Export cleanup.* A script `scripts/clean-figure.ts` run on export: strip embedded fonts and fixed colours, set strokes and fills to `currentColor` or theme tokens, remove the background rect, keep the viewBox. The figure then follows light and dark mode with the page.

*Component.* `<Figure>` in `apps/patterns/src/components/`, mapped through `PatternArticle.astro` like `<Demo>` and `<Diagram>` so MDX needs no import:

```mdx
<Figure name="undo" />
<Figure name="handoff" caption="…" />
```

Renders `<figure>` with the inlined SVG (so `currentColor` applies) and an optional `<figcaption>`. The drawing is hidden from screen readers and unreadable to agents, so the relations it shows must also be stated in words. When the pattern's prose already says them, the figure needs no caption. When it does not, the caption says them in plain design language, the way the page itself would, not in the drawing's own terms ("window", "reverse path"). `name` resolves to `figures/<name>/<name>.svg`; a missing file fails the build.

*Placement.* With the instruction, where Alexander puts it. In the shape (`.claude/rules/pattern-content.md` §Shape of a `role: pattern` page), item 5 changes from "a demo" to:

> 5. *After Therefore* — the prescription diagram, where the pattern has one: a `<Figure>` drawing the relations the instruction imposes with as few marks as they need, captioned with the same relations in words. A demo may follow it. Either or both; the instruction then runs straight on into the connections passage.

and the sentence "Nothing after `Therefore,` needs a heading, since only the caution and one demo sit there" becomes "…since only the caution, the figure and one demo sit there". The opening demo keeps the photograph's role and is not a figure.

On a page not yet shaped, the figure goes directly after the solution instruction in whatever form the page has; the shaping sitting moves nothing.

## Validation

- The five (or six) drawings exist as `.tldr` and `.svg` pairs and render on their pages in both colour modes.
- Each figure's relations are stated in words, by its caption or by the prose around it: read the page without the drawing and check that nothing is lost.
- A fresh reader shown the figure before the page can say what the pattern does. Try this on at least two.
- `npm run test` passes; the graph extractor is unaffected (figures are not edges).

## Record

Per drawing: what it had to show, what the vocabulary needed, where it failed.

### Undo

Files: `apps/patterns/src/figures/undo/undo.{tldr,svg}`. The mechanism landed with it: `scripts/clean-figure.ts` and `<Figure>` (registered in `PatternArticle.astro`).

*Had to show.* Time running left to right; the state now; the state before, kept as history; undo itself, taking the actor from now back to before.

*Vocabulary used.* No words in the drawing, and no caption: the page's opening sentence already says what the figure shows.

- Thin line with an arrowhead: time. It breaks with a small gap around each state that sits on it.
- Filled circle: the current state.
- Dashed circle: an earlier state, kept as history.
- Solid curved arrow from the filled circle to the dashed one: undo. It is the one solid arrow because it is the action the figure is about.

*What changed while drawing.* The drawing went through five versions.

1. Boxes for the states above a time line, with a tinted band for the window in which undo is offered. A third box for the change after the window read as a third state.
2. Each box spanning the time its state holds. This fixed the third-box reading, but the drawing still needed boxes, a band, a tick and a tint to say one thing.
3. The time line alone. The state before the action is the line before the dot, so the boxes went. The window became a thicker stretch of the line that ended, and the reverse path became arcs back along the line.
4. The window removed. Version 3 showed undo expiring, which the pattern does not claim: some undo is limited by time, some by history depth or the session, and some never runs out. What limits it is a variation, not part of the pattern.
5. States instead of the action. Version 4 marked the original action with a dot and drew undo as several dashed arcs, so the figure was about the action and undo was secondary. Now a filled circle is the current state, a dashed circle is the earlier state, and one solid arrow between them is undo. Solid marks what is current and what is the subject; dashed marks history.

Findings to carry forward: draw the relation on as few lines as possible, letting position on the line do the work of boxes and labels; draw only what every realisation shares; fill marks the current state and a dashed outline marks a past one; the pattern's own action is the one solid arrow.

*Where it falls short.* No parameter is drawn, and undo may have none that holds across realisations. How far back the actor can go is the obvious candidate, and it is one of the variations the page lists.

*Tool.* Drawn in tldraw, placed by coordinates in a scripted editor and exported headless. Without labels the export carries no fonts. The clean step reduces it to `currentColor` strokes and fills with slug-prefixed ids, and both colour modes read. It also replaces tldraw's rounded joins and line ends with pointed joins and flat ends, so arrowheads come to a sharp tip. Arrowheads stay open lines: filled arrowheads were tried and rejected. Labels and embedded fonts are still untested, and the clean script refuses pattern fill. The `.tldr` opens in the tldraw editor for hand edits, and a hand re-export goes through the same clean step. The figure was later scaled from about 830 units wide to about 700, to match the others' line weight. The time line stays thinner than the states and the undo arrow: it is the axis the marks sit on, a meaning the weight carries.

### Handoff

Files: `apps/patterns/src/figures/handoff/handoff.{tldr,svg}`, placed after the page's opening line (the page is a seed with no `Therefore,` yet). No caption: the opening line states what the figure shows.

*Had to show.* Two holders, either of which may be the actor or the system; work in progress passing from one to the other; what travels with it, meaning what was done, what remains and why.

*Vocabulary used.* No words in the drawing.

- A geometric pictogram of a figure, the common standing person: a round head for a person, a square head for the system. Head, half-circle shoulders, straight sides with square hands, legs split up the middle; every part a circle or a straight line. Shared with reconciliation.
- A sheet: the work. Solid lines on it are what was done, dashed lines what remains.
- A small note tied to the sheet: the reason for the transfer and anything else the receiver needs, travelling with the work.
- One solid arrow from one holder to the other: the handoff.

*What changed while drawing.* The first two versions kept to the undo vocabulary. One drew two parallel time lines, one per holder, with the work as a thick line that jumped from one to the other without a break. The other moved a filled circle across from one line to the other. Both said who held the work but neither could show what travels with it, and both needed the reader to learn a private meaning for thickness or position. The third version is drawn the way a designer would sketch a handoff on a napkin: figures and objects anyone recognises, so the drawing needs no legend. It shows the context half that the abstract versions could not.

The first napkin version drew the person and the system as head and shoulders. They were redrawn as pictograms during reconciliation (see there), so the two figures share one person.

The rows on the sheet and the note, and the line tying them, were later brought to the outline's weight, as in progressive disclosure, and the rows set at equal gaps; the dashed rows had sat a little further apart, which the dash already says. tldraw fits a whole number of dashes to each line, so two dashed lines of different length get different dash patterns. The two dashed rows are cut to lengths that give the same dash with nearly the same gap.

Findings to carry forward: abstract marks run out quickly when every pattern is forced onto them, since each asks circles and lines to mean something else (wizard had already strained the meaning of dashed). Recognisable figures, a person, a sheet, a note, carry their meaning without a legend and are not an interface. They do not replace abstract marks; see the undo retest below. Strokes are uniform: tldraw's default `draw` style varies the line weight, so shapes are drawn with `solid` or `dashed`.

*Where it falls short.*

- The arrow runs one way, person to system. The page says control passes either way; the prose carries the reverse.
- The square head for the system is a convention of these drawings, not something a reader already knows.
- A sheet leans toward work that is a document. A neutral object would lose the done and remaining lines.

### Reconciliation

Files: `apps/patterns/src/figures/reconciliation/reconciliation.{tldr,svg}`, placed after the page's opening paragraph (the page is a seed with no `Therefore,` yet). No caption: the opening paragraph states what the figure shows.

*Had to show.* Two versions of one thing that both changed the same part; a person who sees both and picks; one result, with the choice recorded.

*Vocabulary used.* The handoff marks, plus three. No words in the drawing.

- Two sheets with the same three rows, apart from each other: two copies of one thing. One row on each carries a grey highlight and differs between them (one long, one short): the same part, changed two ways.
- An arrow from each copy ending on the person's side: both versions come to someone who decides. The person is the pictogram shared with handoff.
- A green tick on one copy: the pick.
- One sheet out, carrying the picked row in a yellow highlight: the result.

*What changed while drawing.* The first draft opened with the original sheet and two arrows parting it into the copies. Two copies with the same other rows already say they share an origin, so the original went, which saved three marks. A hand edit then replaced the boxes round the changed rows with highlights, coloured the tick and the result, and removed the note that recorded the choice. Colour is the first used in a figure: it separates the clash (grey) from the outcome (yellow) without another shape.

The figure was then made lower, to take less vertical space on the page. The sheets went from five rows to three, with the middle row the one that differs, and the person, the arrow out and the result sit in one row. Overlapping the two copies saved more height but was dropped: overlapping pages read as two parts of one thing, not as two versions competing. The person was redrawn several times so the arrows have a body to end on. A closed bust and an oval torso were tried; the oval did not read as a person. A line-illustration figure with arms read as a person and could take a pose (a hand at the chin, for deciding), but bent arms drawn by coordinates came out uneven. The geometric pictogram, after a reference the drawing followed, reads as a person, gives the arrows straight sides to end on, and fits the uniform stroke.

*Where it falls short.*

- The record of the choice is no longer drawn; the opening paragraph states it.
- The page's main placement claim is not drawn: the surface belongs only where divergence was deliberate, since live co-editing merges silently. It is a claim about where the pattern applies, not what it does, and stays in the prose.
- A pick is drawn, not a combined answer. This matches the page, which says a person picks.

*Tool.* The redrawn figure replaced the hand edit, so the `.tldraw` was removed and the `.tldr` is again the source. Hand edits saved from the tldraw desktop app are `.tldraw` files, a zip around a SQLite store, which the export path cannot read directly. When a `<slug>.tldraw` sits in a figure's folder, the clean step regenerates `<slug>.tldr` from it, so the `.tldraw` becomes the source and the `.tldr` follows. The clean step now maps tldraw colours to theme values: grey highlight to a tint of the ink, yellow highlight to `--c-background-warning-strong`, green to `--c-body-success`. An unmapped highlight colour fails the step. Highlights take flat ends: a band is many times wider than a row, so any end cap would stretch it far past the row it marks. Each band is drawn to start and end with its row's ends; tldraw smooths a highlight's ends inward by a few units, so its drawn length is set by trial until the exported band matches the row. The rows are at the outline's weight, as in progressive disclosure. The figure was later scaled from about 520 units wide to about 690, so its lines show at the same weight as the other figures (see progressive disclosure). A highlight's width does not scale with the drawing, so the bands went up one tldraw size to keep their depth against the rows. tldraw draws each highlight twice, beneath all shapes and above them; a filled shape in front hides the lower copy, so the clean step keeps only the upper one, and the grey tint is 20% of the ink to keep its strength. A shape filled with pure white (tldraw's `fill` style in white, not `solid`) occludes what lies behind it, since the clean step turns that fill into the page background.

### Wizard

Not drawn. Two candidates reached a draft and both were dropped. They put held answers, a gate and a single commitment on a time line.

*Why not.* Actors already know how a wizard works, because almost everyone has used one. A figure would show them a structure they already have. The candidates also stayed close to a progress indicator, a row of steps with the current one filled, so they leaned toward an interface. A figure earns its place where the relation is not familiar from use: hidden state, time, or who holds what.

*Carry forward.* Before drawing, ask whether actors already know the relation from use. A widely used pattern may need no figure, even when one could be drawn.

### Workflow

Files: `apps/patterns/src/figures/workflow/workflow.{tldr,svg}`, placed after the page's opening paragraph. No caption: the second paragraph says the procedure becomes an artifact of steps, conditions and transitions that both sides read and act on.

*Had to show.* The activity level: a recurring procedure made into an artifact, with steps, conditions and transitions, that the system runs and the actor reads and repairs.

*Vocabulary used.* No words in the drawing.

- Boxes joined by arrows: steps and transitions. A diamond: a condition, with two branches that join again.
- Filled circle on an edge: one case in progress, where it is now. The meaning carries over from undo.

*What changed while drawing.* The first version followed handoff: a person and the system on either side of a sheet with a small flow drawn on it, and a row of cases coming out of the system. It read as a pipeline, close to a chain of handoffs, and hid repair. Workflows are usually shown as diagrams, so the figure became one. A second diagram version added a person pointing at a step to show who writes and repairs it, but the person's arrow read as one more edge in the flow, as if the person were a step. It was dropped.

Findings to carry forward: where a pattern already has a common drawn form, the figure can use it. Actors recognise it without a legend, the same reason the napkin objects work.

*Where it falls short.*

- Who acts on the procedure is not drawn: neither the actor who writes and repairs it nor the system that runs it. The opening paragraphs state both.
- Drift, the procedure read against an account of what actually ran, is not drawn.
- The diagram is one notation among several the page names (a rule list, a pipeline definition). It stands for the procedure as an artifact, not for node graphs as the right form.

### Progressive disclosure

Files: `apps/patterns/src/figures/progressive-disclosure/progressive-disclosure.{tldraw,tldr,svg}`, the `.tldraw` hand edit being the source, placed after the page's two opening paragraphs. No caption: the second paragraph says the actor moves quickly first and inspects more when they need understanding, control or proof.

*Had to show.* Several disclosures stacked, each level opened from a part of the one before; each deeper level holding more, and a different kind of thing, than the one it opens from.

*Vocabulary used.* No words in the drawing.

- Three sheets on one centre line, each larger than the last: the levels, from the first view to the full detail.
- Rows the same distance apart on every level, so a level's height says how much it holds. The first level has two rows; the second has text and an image (a box with a mountain line); the third has text and a table. Rows, image and table are drawn at the outline's weight.
- A wedge from the end of one row to the next sheet: that part opened into the next level. The wedge is a triangle filled with the page background, so it hides the edge of the sheet it leaves and the row reads as opening out of it. Its sides are grey, at the outline's weight, so they read apart from the sheets.

*What changed while drawing.* Wizard's reason for not drawing (actors know it from use) applies to a single disclosure; several stacked inside each other are less familiar and were drawn. Nested frames, the levels inside one another, read as panels inside panels, close to an interface, and the inner levels grew cramped. A chain of sheets, each opened from one row of the last, kept the stacking and showed where each level opens from. Levels that shrank like nesting dolls said deeper means less, the reverse of the page's disclosure ladder, so the levels grow instead. A version left the last level unopened, as a dashed outline. Dashed rows inside it would have read as work not yet done, as on the handoff sheet, so its rows were solid inside a dashed outline. The version with all levels open was kept: it shows the ladder more plainly, and the page's prose carries that depth stays closed until asked for. A hand edit then set every stroke to one weight, since the thinner rows and inner shapes changed weight without a meaning, and evened the spacing: margins inside each sheet, the gaps between rows, and the image's width against the text.

*Tool.* tldraw dashes each side of a rectangle separately, starting and ending on a part dash, so with flat ends a dashed rectangle's corners have a notch and look rounded. The clean step lays a short solid stub over each part dash, carried half a stroke past the corner, so dashed corners are square like solid ones. It touches only dashed straight sides; the dashed circle in undo is unchanged. The filled wedge is a tldraw `draw` shape in white with the `fill` style, which the clean step turns into the page background along with its outline; the grey of its sides is mapped to 40% of the ink mixed into the background. With flat ends and pointed joins, two separate strokes that meet at a point leave a notch, which tldraw's rounded ends had hidden; strokes that meet are drawn as one line shape, so the meeting is a join. The wedge's two sides are one line through the tip. Line ends follow what was drawn: tldraw shows round ends, which reach half a stroke past each endpoint, so flat ends shortened every row and broke its alignment with the image. Horizontal and vertical lines now take square ends, which reach as far as round ones; diagonals and curves, which usually end on another shape's outline, keep flat ends so they do not poke past it. Every figure is scaled to the column width, so the stroke shows at the same weight only when drawings share a width. The first version was drawn about 360 units wide, half the width of handoff and workflow, and its lines showed twice as thick. It was scaled up to about 690 units with the stroke unchanged. Figures are drawn about 700 units wide.

*Where it falls short.*

- That deeper levels stay closed until the actor asks is not drawn; every level is shown open.
- The mountain-in-a-box image is the usual wireframe placeholder and leans toward an interface.

### Undo, as a sketch of sheets

Drawn, then not used. A retest of undo in the style of handoff and reconciliation: the earlier sheet dashed, a dashed arrow for the change, the current sheet with the changed row highlighted, and a solid curved arrow back for undo.

*Verdict.* The time line works better. The sheets add what changed, which undo does not need, and leave time to left-to-right order alone. The time line is not a different kind of figure from the sketches: a designer would draw it on a napkin just as readily. The choice between objects and abstract marks follows the relation the pattern imposes, not a house style.

### Undo, as a scene

Drawn, then removed. A test of a different kind of figure: a plan of the place where the relation happens, the way Alexander draws, instead of a chart of it.

*Had to show.* The same relations as the chart, carried by place instead of an axis: a surface with other content on it; an item changed, with a trace of how it was; the offer to reverse it beside the change; the reverse path back to the trace; the offer's hold weakening as the moment passes.

*Vocabulary used.* No words in the drawing.

- Large rough rectangle with lines and blocks: the surface being worked on, and its other content.
- Dotted outline: the trace of the prior state.
- Hatched block: the changed item.
- Solid arrow from trace to change: the committed action.
- Small rounded shape with a curved back arrow: the offer.
- Dashed curved arrow from offer to trace: the reverse path.
- Dashed rings around the change, fainter as they widen: the offer's reach, thinning.

*Where it fell short.*

- Time is only implied. The rings are a spatial mark standing in for a temporal relation. They can be read as "the offer works only inside this area", and nothing in the drawing shows the window closing.
- The action drawn is a move, which is one kind of action. A deletion or an edit in place has no second position, so its trace would sit under the change rather than beside it.
- The offer is drawn as a small rounded shape with an icon, which leans toward one realisation: a toast or a button. The chart had no such pull.

*Verdict.* Less clear than the chart, and the wrong kind of figure. It draws an interface, so it competes with the demo and loses: a sketched surface with a button on it is a poor wireframe. Its marks also had no anchor. The dotted trace, the hatching and the rings were private conventions, and the two arrows read as a move there and back rather than a reversal. Undo's relation is temporal, and a picture of a screen has nothing to hold it. This set the rule under Trial: no interface in the drawing.

*Tool.* This drawing was made in Excalidraw for its rougher line. Excalidraw is no longer an option: tldraw has more capabilities, and the minimal time line made the sketch line unnecessary.

## Closing

Closed 2026-10-19. Placement and the `<Figure>` embed are in `.claude/rules/pattern-content.md`; files, the clean step, the drawing register and the marks are in `docs/specs/pattern-site.md` §Figures. The plan is kept for the Record: the versions tried and dropped, and why.
