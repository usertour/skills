# Verify the SDK install

Don't claim "done" until you've confirmed content actually renders.

## 1. The SDK loaded and initialized

In the running app's browser (DevTools console, or a headless browser if you have
one wired):

- `window.usertour` exists and has `init` / `identify` / `start` functions.
- No Usertour-related errors in the console.
- The network tab shows the SDK loader request succeeding.

## 2. A user is identified

- Confirm `usertour.identify(...)` runs after login with your canonical user id
  (see identify.md). Log the id you pass and confirm it matches an `externalId`
  that exists in Usertour (look the user up via the MCP `get_user` /
  `list_users`, or upsert a test user with that exact id).

## 3. Published content appears

- Make sure there is **published** content whose targeting includes your test
  user (a flow with start-rules that match, or call `usertour.start(contentId)`
  to force one for a deterministic check).
- Load the page where it should appear and confirm the flow / checklist / launcher
  renders. `usertour.start("<contentId>")` is the most reliable smoke test — it
  bypasses start-rule conditions and proves the SDK + theme + content pipeline
  works end to end.
- **Asserting via DOM/automation (not eyeballing)?** The SDK renders surfaces into
  a same-origin `<iframe class="usertour-widget-surface-viewport">` under a
  `#usertour-widget` host — so a top-level `querySelector` / text-wait finds
  nothing even when content IS showing. Read the iframe's `contentDocument` (or
  just assert the host + iframe exist) instead of concluding "nothing rendered."
  The SDK swaps the iframe surface per step, so re-query it each step — a
  `contentDocument` reference held from a previous step goes stale (reads null),
  and a stale null can look like a trigger that didn't fire.
- **Driving (not just reading) the widget programmatically** has two extra
  gotchas: accessibility snapshots show the iframe as an opaque "Content Frame"
  (no clickable uids inside — dispatch events via `contentDocument` instead),
  and some controls (e.g. the resource-center launcher) ignore a bare
  `.click()` — dispatch the full pointer sequence
  (`pointerdown → mousedown → pointerup → mouseup → click`) when a programmatic
  click seems to do nothing.

## 4. Security check

- Grep the app source for `utp_` — the API token must **not** be present in any
  client-side code. Only the environment token belongs in `init()`.

## If nothing shows

Work down this list:
1. `window.usertour` missing → loader snippet didn't run / wrong place.
2. SDK present but no content → user not identified, or `identify()` id ≠ the
   `externalId` the content targets (most common — see identify.md).
3. Right user, still nothing → content not published, or its start-rules don't
   match this user/page. Test with `usertour.start(contentId)` to isolate.
4. Renders unstyled / broken → the content's version has no theme (an authoring
   issue, not an install issue).
