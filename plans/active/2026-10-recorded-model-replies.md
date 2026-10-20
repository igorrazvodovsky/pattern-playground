---
title: "Recorded model replies on the published site"
status: active
kind: exec-spec
created: 2026-10-20
last_reviewed: 2026-10-20
area: server, components, patterns-site
---
# Recorded model replies on the published site

Outline, iterated once. The research gate ran on 2026-10-20; its findings and
the author's decisions are below. Two questions remain for the author before
implementation (see §Open questions).

The pattern site is documentation. Its AI demos show how an interface behaves
around a model's reply, not what a particular model says on a particular day.
This plan keeps live model calls in development and has the published site
replay replies recorded from those calls. The technique is record and replay,
common in testing (VCR's cassettes, Polly.js, nock's record mode) and in
component documentation that serves fixed responses through a request-mocking
layer. The difference here is that the replies are recorded from the real
model rather than written by hand.

What the published site gains:

- No model calls from public visits, so no cost or abuse exposure from them.
- No dependency on a running server, so the site stays a static build.
- The same reply on every visit, which suits screenshots and visual tests.
- Failure, refusal and slow replies can be written on purpose. Live calls
  rarely produce them, so the demos can show those states reliably.

What it costs: a demo that accepts free input can only replay inputs that were
recorded, and recordings go stale when a prompt or the model changes.

## Current state (2026-10-20)

- `apps/server` has five endpoints, all calling `gpt-5.6-luna` through the
  Responses API. Timeline grouping and model deduction carry a
  `PROMPT_VERSION` in their handlers, used in the server's in-memory cache
  key. The other three do not.
- The client repeats the version in its session-cache prefixes
  (`timeline-grouping:6:`, `model-deduction:1:`). These are separate numbers
  and have already drifted: the timeline handler is at 7, its client prefix
  at 6.
- Every AI call from the site goes through two functions in
  `packages/components/src/services/api-client.ts`: `postJSON` for JSON
  replies and `streamSSE` for streamed text. No other code in the components
  package or the site calls `/api`. This is the seam replay attaches to.
- `apiEndpoint` sends every request to `localhost:3000` when the page's
  hostname is `localhost`, including a production build previewed locally.
  Replay cannot be chosen by hostname for that reason.
- The server writes each streamed piece of text as an SSE event as soon as the
  model yields it (`services/streaming.ts`), so offsets measured at the server
  reflect the model's pace.
- `apps/server` has no workspace dependencies. `shared/` is the fixture-data
  workspace (world and derived views), and nothing in it is code shared
  between the server and the client.
- The published site's own origin answers `/api/explain` with a plain-text 404.
  The published demos therefore reach a server only if `VITE_API_URL` points at
  one deployed separately. Which is true is not visible from the repo.
- The build copies Storybook into the site (`npm run build`), so one replay
  mode covers both.

The demos that call the server, by the kind of input they send:

| Demo | Endpoint | Input | Recordable as is |
|---|---|---|---|
| Fisheye timeline (`demos/focus-and-context/fisheye.tsx`) on focus-and-context | timeline grouping | Fixed records | Yes, one recording |
| Contextual navigation (`demos/specs/contextual-navigation.ts`) | model deduction | A node of the fixed process model, or a proposal from an earlier reply | Yes, but the inputs include the model's own proposals, so the set is found by following replies |
| Bubble menu (`demos/bubble-menu.tsx`) on text-lense, selection, dynamic-hyperlinks | text lens, explanation | Any selection of fixed document text | No, the selection is free |
| Filtering (`demos/specs/filtering.ts`) | suggestions | Typed prompt | No, the prompt is free |
| Command menu story (`stories/CommandMenu.tsx`), Storybook only | suggestions | Typed prompt | No, the prompt is free |

## Research gate (2026-10-20)

A practice survey ran on 2026-10-20. It covered request matching in
record-and-replay tools (Polly.js, VCR, vcrpy, nock, standin), recording
model calls in testing (the AI SDK's mock models, promptfoo, Inspect, cassette
guides), stream replay, and how AI UI kits ship demos without a backend (Carbon
AI Chat, AI Elements, Gradio's cached examples). It did not reach
assistant-ui, CopilotKit, the model vendors' cookbooks, or the HAX and PAIR
guidance.

What changed the shape:

1. *Failure and slow replies need their own keys.* With the key as endpoint
   plus body, a success and a failure for the same input collide. Carbon's demo
   gives each failure and delay its own entry. Recording tools skip failures by
   default. The key gains a scenario, and these replies are written by hand.
2. *Canonicalise the parsed body at every level.* Sort object keys at every
   depth, keep arrays in order, and compute the key from the parsed body on
   both sides. Keying on `JSON.stringify` of the request, as the AI SDK's
   example does, depends on key order.
3. *Key on the demo's input, not the model prompt.* Hashing the full prompt
   breaks every recording on each prompt edit. The body the client sends is
   the demo's input. A prompt change is then caught by the version check, which
   says what to re-record.
4. *Replays repeat.* Testing tools play a recording once by default and some
   put request order in the key. A demo plays the same reply each time a
   preset is chosen.
5. *Keep the recorded offsets, with a speed factor and a fast mode.* Every kit
   surveyed makes up its delays (Carbon 40 ms a word, AI Elements a random
   50 to 150 ms). None replays the real gaps. The recorded offsets are what
   the plan adds; tests still need a way to skip them, as Carbon's
   `__DEMO_FAST_TIMERS__` does.
6. *A miss lists what was recorded.* Carbon answers unmatched text with every
   available input as a button. AI Elements answers anything with a random
   canned reply, which presents a recording as an answer to a question it was
   not asked. The plan follows Carbon and rules out the second.
7. *No precedent for replaying free selections.* Nearest-match replay exists
   only in test tools. Snapping would play a reply to text the actor did not
   select.
8. *Version-based staleness suits a static site.* Time-based expiry, the
   testing default, would fail builds for no reason. Model names can be
   aliases that move, so the recording keeps the model the API reports, not
   only the configured name.
9. *Only the record script writes.* A server that writes every reply fills
   the folder from ordinary development use. Orphaned recordings are a lint
   failure.
10. *A miss in development names the closest recording.* standin shows the
    nearest recording with a field-level diff, which is what a developer needs
    when a demo's request drifts.

Recording real replies has no direct counterpart among the UI kits surveyed;
they ship hand-written lookup tables. Gradio's cached examples, preset inputs
with stored outputs, are the closest, and its docs note the cache does not
update itself.

## Decisions

- *Bubble menu: preset passages.* A few passages in the demo text are marked
  as recorded. A selection inside one replays its reply. Any other selection
  gets the "not recorded" state, which points to the recorded passages.
- *Free typing stays open.* The filtering input and the command menu accept
  any prompt. An unmatched prompt gets the "not recorded" state with the
  preset prompts as buttons.
- *The server stays deployed.* No published page calls it once replay ships,
  but it keeps running on Render. Because replay is chosen by a build
  variable, a build with replay off calls the server as today.
- *Recording happens in a script acting as the client.* The script calls the
  running server, measures chunk offsets as it receives them, and writes the
  files. The server only reports, with each reply, the model the API used and
  the endpoint's prompt version. This keeps `apps/server` free of workspace
  dependencies and keeps the files out of ordinary development use.
- *The client's session cache goes.* Replay reads local files, and in
  development the server's own cache answers repeats (§1).

## Shape

### 1. Prompt versions in one place

Every endpoint gets a prompt version, kept in one map in `apps/server` that
the handlers read. The handlers' own constants go. The map and the default
model names sit in a module with no side effects, because `config.ts` throws
when `OPENAI_API_KEY` is missing and the lint check has to import them without
a key. Each reply carries the endpoint's version and the model the API
reported, in `ApiResponse.metadata` for JSON replies and on the `complete`
event for streams.

The client's hand-numbered session-cache prefixes are a third copy of the
version and have drifted. Once the published site replays, the session cache
serves only development, where the server's in-memory cache already answers
repeats. The client cache is removed rather than versioned.

### 2. Recording format and key

One file per recording, under `packages/components/src/recordings/<endpoint>/`.
Each holds the request body, the scenario, the reply, the configured model,
the model the API reported, the prompt version, and the date recorded. A JSON
reply is stored as the `data` the server sent. A streamed reply is stored as
its chunks, each with its offset in milliseconds from the start, followed by
how it ended (`complete` or `error`). A hand-written recording says so and
carries no model or prompt version, since a failure or a delay does not depend
on the prompt.

The key is the endpoint path, the scenario (`ok` unless named), and the
parsed request body with object keys sorted at every depth and arrays kept in
order. One function, in `packages/components/src/services/`, computes it for
the record script and for replay.

### 3. Presets

Each demo that calls the server has a presets module beside it: the inputs it
offers, and the failure and slow scenarios its page discusses. The demo, the
record script and the staleness check all import that one module. It imports
nothing from the browser (no React, Tiptap, or `import.meta.env`), because the
script and the check run under Node. The deduction crawl also needs
`process-model.ts` and the request builder under Node; both import only data
today, through the `@shared` alias, which the script runner has to resolve.

No preset input found so far holds a value that changes between calls. The
timeline records have fixed dates. The filtering demo resolves relative dates
on the client after the reply, not in the request.

The deduction demo's presets are found by following replies. The script asks
about the default focus and each node, then about each proposal the replies
return, to a fixed depth. The count after the first run decides the depth.

### 4. Recording

`npm run record` (in `scripts/`) sends every preset to the running server and
writes the recordings. It re-records everything, or one endpoint when named.
Failure and slow scenarios are not sent; they are written by hand next to the
recorded reply for the same input. The script warns when the model the API
reports differs from the one in the existing recording.

### 5. Replay in the client

`api-client.ts` gains a mode set at build time: live in development, replay in
the published build. The mode is a build variable, not the hostname, so a
production build previewed on `localhost` replays. A development flag switches
to replay locally, to preview what the published site will show.

In replay:

- Both functions take an optional `scenario` in their options. Live calls
  ignore it.
- `postJSON` returns the recording's `data`, every time it is asked.
- `streamSSE` passes each chunk to `onChunk` at its recorded offset and
  respects the abort signal. A recorded error ends the stream as a live error
  would. A speed factor scales the offsets, and tests set it to zero.
- An input with no recording raises a distinct error. It carries the recorded
  inputs for that endpoint so the demo can offer them. In development it also
  names the closest recording and the fields that differ.

Recordings load lazily per endpoint (`import.meta.glob`), so a page loads only
the replies its demos can ask for.

### 6. Demos

- *Fisheye timeline and contextual navigation.* Replay with no change to the
  demos.
- *Bubble menu.* Mark the recorded passages in the demo text. A selection
  inside a passage sends that passage. Any other selection gets "not
  recorded", pointing at the passages.
- *Filtering and command menu.* Show the preset prompts as suggestions beside
  the input. A typed prompt that matches no recording gets "not recorded" with
  the presets as buttons.

A demo whose page discusses a failure or a slow reply offers that scenario
through the demo frame's existing controls, so the actor can choose it.

A demo never answers an unmatched input with some other recorded reply.

### 7. Telling the actor

A demo that is replaying says so on the demo frame, in a short plain line such
as "Recorded reply". The site is about how people and AI systems work together,
so it should not present a recording as a live answer. The kits surveyed
mention it only inside the conversation, if at all; the frame line goes
further on purpose. Use the demo frame's existing parts and library
components, not a new style.

### 8. Staleness check

A check script in `npm run lint` fails when:

- a recorded reply's prompt version or configured model differs from the
  server's current one (hand-written recordings are exempt);
- a preset has no recording;
- a recording matches no preset.

### 9. Workspace layout

At close, the workspace layout spec records that the published build replays
and that `apps/server` serves development, recording, and any build with
replay off.

## Validation

- With no server running, a production build serves every AI demo from its
  presets, including when previewed on `localhost`. The browser's network log
  shows no request to `/api`.
- Streamed replies arrive at their recorded pace, not as one block, and a test
  run with the speed factor at zero does not wait.
- Choosing the same preset twice plays the same reply twice.
- A failure scenario shows the demo's failure state on the published build.
- Changing a prompt version without re-recording fails lint. So does deleting
  a preset without deleting its recording.
- Re-recording after a model change rebuilds every recording in one run.
- Development still calls the live server, and the replay flag shows the
  published behaviour locally.

## Open questions

- *Deduction depth.* How many levels of proposals to follow, decided by the
  count after the first recording run.
- *Recorded passages in the bubble menu.* Which passages, how many, and how
  the demo text shows that they are the recorded ones without becoming a
  different demo.
- *Live calls for the author on the published site.* A build with replay off
  already calls the server. Should the published build also let the author
  switch one page to live calls without a separate build?
- *Relation to generated demos.* The generated-demos plan asks whether
  generation works only in development. Replay could carry a few recorded
  generations to the published site in the same way.
