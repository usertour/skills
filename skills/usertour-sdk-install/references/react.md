# React (Vite / CRA / any client-rendered SPA)

Confirm the install method (loader script vs npm package) from the docs overview
(WebFetch) — don't assume a package name. The wiring is the same either way:
**init once at app mount; identify when the user is known; reset on logout.**

```tsx
// A small effect near the app root. If Usertour is loaded via the CDN snippet,
// `usertour` is on window; if via an npm package, import it per the docs.
import { useEffect } from "react";

const ENV_TOKEN = import.meta.env.VITE_USERTOUR_TOKEN; // environment (public) token

export function UsertourBootstrap({ user }: { user?: { id: string; name?: string; email?: string; plan?: string } }) {
  // init once
  useEffect(() => {
    usertour.init(ENV_TOKEN);
  }, []);

  // identify whenever the user changes; reset on logout
  useEffect(() => {
    if (user) {
      usertour.identify(user.id, { name: user.name, email: user.email, plan: user.plan });
    } else {
      usertour.reset();
    }
  }, [user]);

  return null;
}
```

Notes:
- Put the **environment token** in a client env var (`VITE_…` / `REACT_APP_…`).
  It's public, so that's fine. The API token must never reach the client.
- `user.id` must equal the `externalId` the content targets — see identify.md.
- **SPA routing:** the SDK watches for URL changes; if your router does soft
  navigations and content tied to a path doesn't re-evaluate, check the docs for
  the route-change hook / `usertour.start()` on the relevant screen.
- Mount `<UsertourBootstrap user={currentUser} />` once high in the tree.
