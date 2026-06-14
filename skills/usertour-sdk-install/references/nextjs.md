# Next.js

The SDK is a **client** concern — it must run in the browser, never during SSR.
Confirm the loader/package from the docs overview (WebFetch). Key Next.js points:

- Load the SDK client-side only (a `"use client"` component, or `next/script`
  with `strategy="afterInteractive"`).
- The environment token goes in a **public** env var
  (`NEXT_PUBLIC_USERTOUR_TOKEN`). The API token must never be exposed — keep it
  out of any `NEXT_PUBLIC_*` var and out of client components.

## App Router (`app/`)

A client bootstrap component rendered in the root layout:

```tsx
"use client";
import { useEffect } from "react";

const ENV_TOKEN = process.env.NEXT_PUBLIC_USERTOUR_TOKEN!;

export function UsertourBootstrap({ user }: { user?: { id: string; name?: string; email?: string } }) {
  useEffect(() => { usertour.init(ENV_TOKEN); }, []);
  useEffect(() => {
    if (user) usertour.identify(user.id, { name: user.name, email: user.email });
    else usertour.reset();
  }, [user]);
  return null;
}
```

Render `<UsertourBootstrap user={...} />` in `app/layout.tsx` (inside the client
boundary). Pass the user from your auth/session provider.

## Pages Router (`pages/`)

Initialize in `pages/_app.tsx` (client side) and identify from your session:

```tsx
import { useEffect } from "react";
export default function App({ Component, pageProps }) {
  const user = /* from your session hook */ undefined;
  useEffect(() => { usertour.init(process.env.NEXT_PUBLIC_USERTOUR_TOKEN!); }, []);
  useEffect(() => { if (user) usertour.identify(user.id, { /* attrs */ }); else usertour.reset(); }, [user]);
  return <Component {...pageProps} />;
}
```

Notes:
- `user.id` must equal the `externalId` the content targets — see identify.md.
- App-Router soft navigations: if path-tied content doesn't re-evaluate on route
  change, see the docs for the route hook or trigger with `usertour.start()`.
