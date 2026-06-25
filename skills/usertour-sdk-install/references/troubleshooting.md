# Usertour SDK — Troubleshooting (symptom → fix)

Most "it published but doesn't work" cases are **host integration hooks that
weren't wired** — they fail **silently** at runtime. This file maps the symptom
to the hook. It does NOT re-document the APIs — for exact signatures, read the
usertour.js **advanced** reference (WebFetch
https://docs.usertour.io/developers/usertourjs-reference/overview).

## Content doesn't show at all

**Cause:** SDK not initialized; or `identify()`'s id ≠ the `externalId` the
content's segments/start-rules target; or published to a different environment
than `init()`'s token.
**Solution:** The #1 cause — see [identify.md](identify.md) and the SKILL's
Non-negotiables. Check the linkage before anything else.

## A flow does a full page reload mid-tour (SPA)

**Cause:** A same-window `navigate` action. The SDK's default is a hard
same-window navigation, and the host hasn't wired SPA soft-nav — so the page
reloads and the in-progress flow is dropped (the Resource Center survives a
reload; flows do not).
**Solution:** Wire `usertour.setCustomNavigate()` to the framework router —
Next `router.push`, Nuxt `navigateTo`, React Router `navigate`, Vue Router
`router.push`. OR author cross-page guidance as separate content triggered by a
`current_url` start rule (portable, reload-proof).

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
