---
description: Install and wire the Usertour Web SDK into the current app so published content renders
argument-hint: [app path / framework, optional]
allowed-tools: [Read, Bash, WebFetch]
---

# Install the Usertour SDK

Target app / notes (optional): $ARGUMENTS

Follow the `usertour-sdk-install` skill. Steps:

1. Read `skills/usertour-sdk-install/SKILL.md`.
2. Detect the host app (plain HTML / React / Next.js — app vs pages router) by
   reading `package.json` and the file layout. Load only the matching
   `skills/usertour-sdk-install/references/<framework>.md`, plus `identify.md`.
3. WebFetch the usertour.js reference
   (https://docs.usertour.io/developers/usertourjs-reference/overview) for the
   exact loader snippet and SDK API — don't reconstruct it from memory.
4. Get the **environment token** via the `list_environments` MCP tool (the `token`
   field). This is the public SDK token. NEVER put the API token (`utp_…`) in
   client code.
5. Install the loader, call `usertour.init("<environment token>")` once, and wire
   `usertour.identify(userId, attrs)` — `userId` MUST equal the `externalId` the
   content's segments / start-rules target (see references/identify.md). Add
   `usertour.reset()` on logout.
6. Verify per `references/verify.md`: SDK ready, a test user identified, a
   published flow appears (`usertour.start(contentId)` is the most reliable smoke
   test). Grep the app for `utp_` to confirm no API token leaked into the client.

If the `usertour` MCP isn't connected, install from the docs and ask the user for
the environment token (Settings → Environments). Confirm the framework and the
user-id source with the user if unclear before editing files.
