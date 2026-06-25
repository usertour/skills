# Design judgment (the craft)

The judgment the schema can't carry. Mechanics — step types, navigation by `key`,
`completeWhen`/`clickActions`, frequency, the markdown subset, `run_javascript`
being rejected, what each type needs to publish — live in `get_authoring_guide`;
don't transcribe them here. For exact fields use `get_content_schema`.

## Pick the right content type

| Want | Type |
|------|------|
| A guided multi-step walkthrough (steps must happen now, in order) | **flow** |
| A "get started" list of independent, self-paced tasks | **checklist** |
| A persistent help button / spotlight that opens a tooltip or runs an action | **launcher** |
| A top/bottom announcement bar | **banner** |
| A help hub with tabs of content | **resource-center** |
| Fire an analytics event when conditions match, no UI | **tracker** |

Two opposite mistakes to avoid:
- Reaching for a linear **flow** by default — it forces a sequence and a "now",
  only right when steps truly are sequential. Several independent setup tasks
  belong in a **checklist** (resumable, user-paced).
- Padding a **checklist** with invented tasks when there's really one activation
  action — that belongs in a tight flow (2–3 steps) or a single launcher/tooltip.

Ongoing help belongs in a **launcher** / **resource-center**, not a tour.

## Make the flow follow the user

A step that can only advance via its own button gets stranded the moment the user
acts on the page instead — the classic case is a tooltip on a nav link: the user
clicks the real link, the app navigates, and the flow is left behind on the old
step. Don't fix it by deleting the step — make it react: advance on the step's
target click, and/or when a condition becomes true (reached a page, an element
appeared) no matter how the user got there, and keep a button as the fallback.
Layer all three so a contextual step feels smooth instead of "click-our-button"
linear. (The field shapes — `onClick`, `triggers` — are in `get_authoring_guide`.)

## Sequence what auto-shows

If more than one piece can appear on its own (a welcome flow + a checklist + a
launcher), they pile onto the first screen at once. Show one, then reveal the next
when the first is done — gate the later surface's start rules on the first's state
(e.g. "the welcome flow has been seen and is now closed"). One focused thing at a
time. (How to gate on another content's state — `get_authoring_guide`.)

## Segments are the targeting primitive

Attribute targeting goes through **segments**, not ad-hoc list filters: create a
condition `segment` (`create_segment`) and reference it with a
`{ "type": "segment", "segment": "<id>", "in": true }` condition. Segments are the
reusable, named unit — also how you stop re-showing content to users who already
converted (segment on the completion).

## Stable selectors

A target is only as durable as its selector. Prefer a stable, specific selector —
`{ "selector": "[data-tour='create']" }` or a stable `id`. To disambiguate when
the selector matches several elements, add the `text` field (visible text the
element must contain) or `nth` — don't reach for brittle structural CSS. Avoid
`nth-child` / deep descendant CSS that breaks on markup changes, and avoid keying
on visible text alone (fragile to copy changes and i18n). If you don't know the
app's DOM, ask for the selector rather than guessing — a valid flow that points at
a missing element renders nothing. (Exact `target` fields: `get_content_schema`.)

## Always verify — every interactive path, not just "does it appear"

`validate_content_version` proves it *can* publish, not that it *works* — and "it
rendered" isn't "it works" either. What slips past both are interaction bugs. Load
the app as the identified end-user and actually walk it:
- **Every checklist item** — click each: does it do what its row implies? (An item
  with no action, or only navigating while siblings launch a flow, feels like
  "nothing happened" even though it's valid.)
- **Every flow step** — the button path, the target/`onClick` path, AND the
  skip/dismiss path, on the page/state where the step's target actually exists.
- **Targets resolve** — a valid flow pointing at a missing selector renders nothing.
- **Gating** — the surface appears when (and only when) it should.

Don't claim "done" off the happy path alone.
