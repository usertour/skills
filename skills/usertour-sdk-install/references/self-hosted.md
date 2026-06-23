# Self-hosted / local instances

By default the SDK talks to **Usertour Cloud** — `init(token)` is all you need.
If the deployment is **self-hosted** (or a **local** instance you're testing
against), the SDK must be pointed at that instance, or it keeps talking to Cloud
and your published content never loads (it'll look like "valid + published but
nothing shows").

**Canonical keys live in the docs — fetch, don't hardcode:**
WebFetch `https://docs.usertour.io/open-source/usertourjs`. The values below are
illustrative; the doc is the source of truth.

## Decide: same-origin or cross-origin?

**Same-origin** — the host app is served from the *same* deployment as Usertour
(same scheme/host/port). Nothing to configure: the SDK's built-in defaults are
relative (websocket on the same origin, assets under `/sdk`), so they resolve to
the deployment automatically. Just `init(token)`.

**Cross-origin** — the host app runs on a *different* origin than the Usertour
deployment (e.g. your app on `app.example.com`, Usertour on
`usertour.example.com`; or a local app on `:5173` vs Usertour on `:8011`). Set
`window.USERTOURJS_ENV_VARS` **before** the loader/`init()`:

```html
<script>
  window.USERTOURJS_ENV_VARS = {
    WS_URI: "https://usertour.example.com/",                 // realtime + content
    ASSETS_URI: "https://usertour.example.com/sdk",          // CSS / assets
    USERTOURJS_ES2020_URL: "https://usertour.example.com/sdk/es2020/usertour.js",
    USERTOURJS_LEGACY_URL: "https://usertour.example.com/sdk/legacy/usertour.iife.js"
  };
</script>
<!-- then the loader + usertour.init("<environment token>") -->
```

Confirm the exact key names + which are required against the docs above.

## Local-dev caveat

The all-in-one deployment serves the SDK bundle + assets at `/sdk` (via nginx)
and proxies the websocket to the server. A bare `dev` server may serve the API /
socket but **not** `/sdk`. So when testing locally, either run the full
deployment (everything on one host, `/sdk` served), or point `WS_URI` at the dev
server while loading the SDK bundle/assets from where they're actually served
(the SDK dev server, or a version-matched CDN build). When in doubt, run the
all-in-one deployment — then the cross-origin block above works as-is.

## Verify it took

In the browser console, confirm the SDK's network calls (websocket + `/sdk/…`)
go to **your instance**, not `*.usertour.io`. If they still hit Cloud,
`USERTOURJS_ENV_VARS` wasn't set before `init()`.
