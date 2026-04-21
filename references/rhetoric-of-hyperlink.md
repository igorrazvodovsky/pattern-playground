# The rhetoric of the hyperlink

Venkatesh Rao, *Ribbonfarm*, 2009. [Original post](https://www.ribbonfarm.com/2009/07/01/the-rhetoric-of-the-hyperlink/).

## Core claim

The hyperlink is a rhetorical technology, not a glorified footnote. Treating it as citation — a convenient pointer to a source — underuses what it is. Once authored links sit inside prose, they become a way of positioning the reader relative to the text: what the anchor is, where the target sits, and whether the reader is trusted to unpack the compression all carry meaning independent of the target content.

## Three modes of link use

Rao distinguishes three modes, roughly ordered by rhetorical ambition.

1. *Citation mode* — the default. The link functions as a footnote: the anchor names its target, the reader is expected to follow it if they want verification, and the author's relationship to the material is largely backward-looking (inherited from academic writing).

2. *Form-content blending* — links placed on surface-unrelated anchors. Rao's demonstration: linking the words "many", "kinds", "of" in a sentence rather than the obvious content words. The effect is an "open the secret package" game that disrupts the reader's surface reading and rewards the click with something surprising. This is link-as-misdirection, link-as-play.

3. *Figure-ground-voice integration* — links that compress cultural or contextual density into minimal surface text, trusting the reader to expand the compression by following. Rao's example is referring to Amitabh Bachchan without explaining who he is, linking for readers who need the context and staying invisible to those who don't. This transforms the author-reader relationship from parent-child (here is everything you need to know) to adult-adult (I'm writing for a competent reader who can pull the threads they need).

## Design implications

- *Opening in a new tab collapses the rhetoric.* Rao's view: a link that opens in a new window returns to pure citation — the reader hasn't been sent anywhere, they've just been pointed at something. The rhetorical effect of mode 2 and mode 3 depends on actual departure and return.
- *Yielding the stage increases engagement.* An author who generously sends readers elsewhere — who does not try to hold them — paradoxically earns deeper loyalty. The rhetorical move is *under-scaffolding*: trusting the reader to construct their own meaning rather than producing exhaustive explanation.
- *Reader click-trails produce reader-unique texts.* Each reader's traversal through a hypertextual page is different; the "text" each reader experiences is the path they took, not the underlying page.

## Phenomenological reframe

Rao describes web browsing as "fractured-ludic reading" — legitimately dissonant, comparable to experimental music or visual art, not a degradation of linear reading. The argument positions clickable hyperlinking as the web's native language, with any reading mode that treats the web as unbroken prose as a misfit.

## Project takeaway

Links in authored prose are design moves, not references. The three modes give the pattern library a rhetorical vocabulary for what "hard" (author-placed) linking does — vocabulary that was missing. The library currently has `actions/seeking/DynamicHyperlinks` for *soft* (algorithmic) links and `operations/Reference` for inline entity surfacing, but both define themselves against "hyperlinks" without a node that says what a hyperlink *is* as a prose move. Rao's piece anchors the `Content` foundation's § Link rhetoric (three modes) and § Stance and voice (yielding the stage), giving those existing patterns the positive counterpart they were missing.

The phenomenological claims (fractured-ludic reading, click-trails as reader-unique texts) are theory — they support the repertoire framing rather than being directly placeable.
