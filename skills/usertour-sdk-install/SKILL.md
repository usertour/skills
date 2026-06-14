---
name: usertour-sdk-install
description: Install and wire the Usertour Web SDK into a host web app so published content actually renders — the loader snippet, init() with the environment token, identify(), SPA routing, and verification. Use when the user asks to install / set up / embed / integrate Usertour in their app, add the loader snippet, wire identify, or asks "why isn't my flow / checklist showing up" in the running app. NOT for authoring content (use usertour-content-authoring) or server/API-token work. Prefers the live usertour.js docs and the environment token from the Usertour MCP over pre-trained snippets.
---

# Install the Usertour SDK

Goal: **published Usertour content renders for the right users in the host app.**
Authoring + publishing only stores content; it appears only once the app loads
the SDK and identifies the user. This skill wires that up.

Your baked-in knowledge of the exact loader snippet may be stale. **Prefer
retrieval**: read the live docs for the snippet, and get the token from the MCP.

## Retrieval sources (consult first)

| Source | How | Use for |
|--------|-----|---------|
| usertour.js reference | WebFetch https://docs.usertour.io/developers/usertourjs-reference/overview | The exact loader snippet, install method, and full SDK API |
| `get_authoring_guide` (MCP tool) | call it | The "Making it appear (the SDK)" section — the cross-surface gotchas |
| `list_environments` (MCP tool) | call it | The **environment token** for `init()` (the `token` field) |

If the `usertour` MCP isn't connected, you can still install from the docs, but
ask the user for the environment token (Settings → Environments) — it is the
**public SDK token**, not the API token.

## Workflow

1. **Detect the app** — read `package.json` / file layout to classify it: plain
   HTML, React (Vite/CRA), or Next.js (app vs pages router). Load only the
   matching `references/<framework>.md`.
2. **Get the snippet + API** — WebFetch the usertour.js reference above; also call
   `get_authoring_guide`. Don't reconstruct the loader from memory — read it.
3. **Get the environment token** — call `list_environments` and use the primary
   environment's `token`. This is the public SDK token for `init()`.
   ⛔ **Never** put the API token (`utp_…`, used for this MCP) in client code — it
   grants full project write access. Before finishing, grep the app for `utp_` to
   be sure none leaked in.
4. **Install the loader** — add the snippet for the detected framework and call
   `usertour.init("<environment token>")` once, early in app startup.
5. **Wire `identify()`** — see [references/identify.md](references/identify.md).
   Call `usertour.identify(userId, attributes)` when the app knows the user.
   **`userId` must equal the `externalId`** the content's segments / start-rules
   target, or published content silently never shows. Call `usertour.reset()` on
   logout.
6. **SPA routing** — for single-page apps, confirm content re-evaluates on route
   change (see the framework reference).
7. **Verify** — [references/verify.md](references/verify.md). Load the app,
   confirm the SDK is ready and a published flow appears for an identified test
   user. Don't claim "done" before this.

## Non-negotiables

- **Token type (security):** environment token for `init()`; the API token never
  touches client code.
- **Identify linkage:** `identify()` id == the `externalId` used in
  segments / start-rules, or nothing renders (the #1 "it's not showing" cause).
- **Defer the API to the docs:** this skill is the wiring + gotchas, not a copy of
  the snippet. Read the reference; it's the source of truth.

## SDK methods (from the reference)

`usertour.init(token)`, `usertour.identify(userId, attributes?)`,
`usertour.group(groupId, attributes?)`, `usertour.track(name, props?)`,
`usertour.start(contentId, opts?)` (launch content programmatically),
`usertour.reset()`. Confirm exact signatures in the docs.

## Related

Authoring the content these render is a different job — see the
`usertour-content-authoring` skill. The two halves connect through the
`externalId` you target in segments and pass to `identify()`.
