# Authoring patterns (the craft)

Durable design guidance that the schema can't carry. For exact fields, always use
`get_content_schema` / the v2 docs — don't transcribe field lists here.

## Pick the right content type

| Want | Type |
|------|------|
| A guided multi-step walkthrough | **flow** (tooltip / modal / bubble / hidden steps) |
| A "get started" task list | **checklist** |
| A persistent help button / spotlight that opens a tooltip or runs an action | **launcher** |
| A top/bottom announcement bar | **banner** |
| A help hub with tabs of content | **resource-center** |
| Fire an analytics event when conditions match, no UI | **tracker** |

## Flows

- **Only `tooltip` needs a `target`.** `modal` / `bubble` / `hidden` are page-level.
- **Wire navigation by `key`.** Steps don't auto-advance and the SDK doesn't add
  Next/Back for you — add `button` blocks with `goto_step` actions. Give each step
  a `key`; a button's `goto_step.step` referencing that key links them (forward and
  cyclic links work in one write). The last step's button uses `dismiss`.
- A non-`hidden` step needs content; a `button` needs text **and** an action.
- **Modals** are centered by default; set `placement.position` (9-cell grid) to
  pin to a corner. **Tooltips** position by `side`/`align`; `alignType: auto`
  flips to avoid the viewport edge.

## Checklists

- Each item needs a `name` **and** either `clickActions` or `completeWhen`.
- Click-to-complete: `completeWhen: [{ "type": "task_clicked" }]` (valid inside an
  OR group too — e.g. "clicked **or** visited /pricing").
- Send users somewhere on click: `clickActions: [{ "type": "navigate", "url": "…" }]`.

## Targeting & frequency (start rules)

- **Auto-start** with `startRules.when` (conditions). `frequency.mode`: `once`
  (one-time welcome), `multiple`/`unlimited` with an `every` window (recurring).
- **Attribute targeting goes through segments**, not ad-hoc list filters: create a
  condition `segment` (`create_segment`) and reference it with a
  `{ "type": "segment", "segment": "<id>", "in": true }` condition. Segments are
  the reusable, named primitive.
- Combine conditions with a `group` (`match: all` = AND, `any` = OR).

## Stable selectors

- Prefer `{ "by": "selector", "selector": "[data-tour='create']" }` or a stable
  `id`. Avoid `nth-child`/deep CSS that breaks on markup changes.
- `{ "by": "text", "text": "Save" }` works but is fragile to copy changes / i18n.

## Deliberate constraints (don't fight these)

- **Text is markdown** (a small subset: h1/h2 only, lists, code, `**bold**`,
  `[link](url)`, `{{ attribute | default: "x" }}`). Rich formatting like color is
  not authorable via the API.
- **`run_javascript` actions are rejected on write** (security). They appear on
  reads but you can't author them.
- **Theme visual settings/variations aren't API-writable** — you can only assign a
  `themeId`. Tune colors/fonts in the theme builder.
- The API is **strict**: it fulfils the request exactly or errors. Trust
  `validate_content_version` errors over guessing.

## Always verify

Validate isn't enough — a flow can be valid yet point at a selector that doesn't
exist. Load the app as the identified end-user and confirm it renders and the
targets resolve.
