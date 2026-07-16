# Usertour SDK — Troubleshooting (symptom → fix)

Most "it published but doesn't work" cases are **host integration hooks that
weren't wired** — they fail **silently** at runtime. This file maps the symptom
to the hook. It does NOT re-document the APIs — for exact signatures, read the
package's TypeScript types (`node_modules/usertour.js/dist/types/usertour.d.ts`).

## Content doesn't show at all

**Cause:** SDK not initialized; or `identify()`'s id ≠ the `externalId` the
content's segments/start-rules target; or published to a different environment
than `init()`'s token.
**Solution:** The #1 cause — see [identify.md](identify.md) and the SKILL's
Non-negotiables. Check the linkage before anything else.

## `identify()` looks ignored — the user never appears in Usertour at all

**Cause:** The environment **enforces identity verification** and the
`identify()` / `group()` call carried no (or an invalid) backend-signed JWT — or
the environment has NO active signing secret at all, which rejects even
correctly-signed tokens. The server rejects the identity at connect time; the
user is never created, nothing renders. The only client-side signal is the
`identify()` promise rejecting with a MISLEADING generic message ("…check your
network connection…" — identical for missing token / bad signature / no active
secret); fire-and-forget calls show it only as an `Uncaught (in promise)` with
an empty reason. A tell: the same code works in an environment without
enforcement but "does nothing" in the enforced one.
**Solution:** Wire the signed token
([identity-verification.md](identity-verification.md)); validate a
backend-minted JWT in Settings → Identity Verification (it names the exact
problem: expired / wrong algorithm — HS256 only / missing `sub` / signed with a
revoked secret / no active secret / …). Remember each environment has its OWN
signing secret — a secret copied from another environment fails exactly like a
wrong one, and the secret lifecycle is console-only (the API/MCP can't create
or list secrets).

## A flow does a full page reload mid-tour (SPA)

**Cause:** A same-window `navigate` action. The SDK's default is a hard
same-window navigation, and the host hasn't wired SPA soft-nav — so the page
reloads and the in-progress flow is dropped (the Resource Center survives a
reload; flows do not).
**Solution:** Wire `usertour.setCustomNavigate()` to the framework router —
Next `router.push`, Nuxt `navigateTo`, React Router `navigate`, Vue Router
`router.push`. The callback receives a **URL string** — adapt it to your router's
signature: routers that take a string work directly
(`setCustomNavigate(url => navigate(url))`), but some take an object — e.g.
**TanStack Router**: `setCustomNavigate(url => router.navigate({ to: url }))`.
OR author cross-page guidance as separate content triggered by a `current_url`
start rule (portable, reload-proof).

## A `text_input` / `text_filled` condition (or "continue when filled") never matches

**Cause:** The field is a custom input component (combobox, custom dropdown,
contenteditable). By default the SDK reads values only from native `<input>`.
**Solution:** `usertour.registerCustomInput()` — point it at the element's
selector + a getter for its value.

## A tooltip target lands under a fixed header, or a custom scroll container won't scroll

**Cause:** The default smooth-scroll (center) doesn't account for sticky headers
or custom scroll containers.
**Solution:** `usertour.setCustomScrollIntoView()`.

## Usertour UI appears behind your app's modals / overlays

**Cause:** z-index conflict — the app's overlay sits above the SDK's default base
(≈ 1,000,000).
**Solution:** `usertour.setBaseZIndex()` (or adjust a specific component's z-index).

## `current_url` conditions need sanitizing (URLs carry tokens / ids)

**Cause:** The SDK sends and matches the **full** URL, including sensitive path /
query data.
**Solution:** `usertour.setUrlFilter()` to sanitize; then write `current_url`
patterns against the sanitized form.

## External links in a flow need auth / tracking params

**Cause:** The SDK renders link URLs exactly as authored.
**Solution:** `usertour.setLinkUrlDecorator()` to add params per click.

---
Don't reconstruct these APIs from memory — confirm each in the usertour.js
advanced docs above.
