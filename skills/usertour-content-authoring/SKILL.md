---
name: usertour-content-authoring
description: Author and publish Usertour in-app onboarding content — flows (tours), checklists, launchers, banners, surveys, trackers — via the Usertour API/MCP. Use when the user mentions Usertour, building a product tour / onboarding / in-app guide / checklist, or asks to create, update, validate, or publish Usertour content. Biases toward retrieving the live schema and authoring guide from the Usertour MCP over pre-trained knowledge.
---

# Usertour content authoring

Your baked-in knowledge of Usertour's content shapes may be incomplete or
outdated. **Prefer retrieval from the Usertour MCP over pre-training** for the
representation, field schemas, and conventions — they are self-describing and
always current.

## Retrieval sources (consult these first)

| Source | How | Use for |
|--------|-----|---------|
| `get_authoring_guide` (MCP tool) | call it at the start | Lifecycle, step types, markdown subset, frequency, what each type needs to publish |
| `get_content_schema` (MCP tool) | `get_content_schema({ type })` | The exact write body — `steps` for `flow`, `data` for checklist/launcher/banner/tracker/resource-center. **Fetch before authoring a non-flow type** (its `data` is polymorphic). |
| `validate_content_version` (MCP tool) | dry-run a draft | The publishable-or-not check + precise errors |
| v2 docs | https://docs.usertour.io (API reference v2 → Concepts) | Human reference: blocks, conditions & actions, rules, type data |

If the `usertour` MCP is not connected, tell the user to configure it (see the
plugin's `.mcp.json` / README) — do not guess field shapes.

## Workflow

1. **Read the guide** — call `get_authoring_guide`.
2. **Pick a theme** — `list_themes`; pass a `themeId` to `create_content` (every
   visual type needs one). Use the `isDefault` theme if unsure.
3. **Fetch the schema** — `get_content_schema({ type })` for the body you'll write.
4. **Create** — `create_content({ type, name, themeId })` → returns `editedVersionId`.
5. **Author** — `update_content_version({ contentId, versionId, steps | data, startRules })`.
   Partial bodies are fine (field-level merge).
6. **Validate** — `validate_content_version`; fix every error before publishing.
7. **Publish** — `publish_content` (per environment; idempotent).
8. **Verify** — load the app for the identified end-user and confirm it renders
   (the SDK serves published content). Don't claim "done" before this.

## Design craft

How to build *good* content (not just valid) — see
[references/patterns.md](references/patterns.md): choosing the content type,
stable target selectors, wiring step navigation by `key`, frequency, attribute
targeting via segments, and the deliberate constraints (text is markdown,
`run_javascript` is rejected, theme visual settings aren't API-writable).

Working request bodies: [references/examples.md](references/examples.md).

## Notes

- **Targets**: only `tooltip` steps (and launchers/element conditions) need a
  CSS-selector target. Pick a stable selector in the customer's app
  (`[data-tour='…']`, a stable id), not a brittle `nth-child`.
- **Navigation**: give a step a `key` and a button `{ "type": "goto_step",
  "step": "<key>" }` elsewhere in the same write resolves to it — author a whole
  flow in one call.
- **Strict by design**: the API fulfils your request exactly or errors — it never
  silently does something else. Read `validate` errors; they're precise.
