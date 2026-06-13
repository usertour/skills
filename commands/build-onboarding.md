---
description: Build and publish a Usertour onboarding experience (flow / checklist / launcher / banner) from a description
argument-hint: [what to build]
allowed-tools: [Read, WebFetch]
---

# Build a Usertour onboarding experience

The user wants to build: $ARGUMENTS

Follow the `usertour-content-authoring` skill. Steps:

1. Read `skills/usertour-content-authoring/SKILL.md` and
   `skills/usertour-content-authoring/references/patterns.md`.
2. Call the `get_authoring_guide` MCP tool for the current conventions.
3. Decide the content type(s) from the request (flow / checklist / launcher /
   banner / tracker / resource-center) — see patterns.md.
4. `list_themes` and pick a `themeId`.
5. For each piece: `get_content_schema({ type })` → `create_content` →
   `update_content_version` → `validate_content_version` (fix errors) →
   `publish_content`.
6. Use real, stable selectors from the target app. If you don't know the app's
   DOM, ask the user for the page/URL and the elements to anchor to.
7. After publishing, offer to verify by loading the app as the end-user.

Confirm the plan with the user before creating content if the request is
ambiguous. Never invent field shapes — fetch them from `get_content_schema`.
