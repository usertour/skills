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

## Segments are the targeting primitive

Attribute targeting goes through **segments**, not ad-hoc list filters: create a
condition `segment` (`create_segment`) and reference it with a
`{ "type": "segment", "segment": "<id>", "in": true }` condition. Segments are the
reusable, named unit — also how you stop re-showing content to users who already
converted (segment on the completion).

## Stable selectors

A target is only as durable as its selector. Prefer
`{ "by": "selector", "selector": "[data-tour='create']" }` or a stable `id`.
Avoid `nth-child` / deep CSS that breaks on markup changes, and `{ "by": "text" }`
(fragile to copy changes and i18n). If you don't know the app's DOM, ask for the
selector rather than guessing — a valid flow that points at a missing element
renders nothing.

## Always verify

`validate_content_version` proves it *can* publish, not that it *works*. A flow
can be valid yet point at a selector that doesn't exist. Load the app as the
identified end-user and confirm it renders and the targets resolve.
