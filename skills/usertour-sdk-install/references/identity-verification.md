# Identity verification (signed identify)

An environment can **require identity verification**: every `identify()` /
`group()` call must carry a JWT minted by the app's backend, or the server
rejects the claimed identity at connect time. The rejection is NEARLY silent —
the user never appears in Usertour and nothing renders — and the one signal it
does emit is **misleading**: the `identify()` promise REJECTS with a generic
"request unsuccessful … check your network connection" message (never mentioning
identity verification), and a fire-and-forget `identify()` surfaces only as an
`Uncaught (in promise)` with an empty reason. The message is IDENTICAL for a
missing token, a bad signature, and a no-active-secret environment — you cannot
tell them apart client-side. If the target environment has enforcement ON, the
install is NOT done until this is wired.

Live guide (prefer it over this summary):
https://docs.usertour.io/developers/identity-verification

## How to tell whether you need this

- Ask the workspace admin, or check **Settings → Identity Verification** for the
  target environment: it shows the enforcement toggle, the signing secrets, and
  a "signed traffic" coverage stat.
- Rule of thumb: wire it BEFORE enforcement is enabled — the intended rollout is
  "sign all traffic first, watch coverage hit 100%, then enforce".
- **The secret lifecycle is console-only**: the API/MCP has no signing-secret
  surface (deliberate — a secret grants identity forgery), so you cannot create,
  list, or check secrets from here. Before testing against enforcement, have the
  admin confirm a secret is registered **in the environment you're targeting**
  and hand it to your backend config.

## Backend: mint the token

The backend signs a JWT per user with the environment's **signing secret**
(`utv_…`, from Settings → Identity Verification). The contract:

- Algorithm: **HS256 only** (anything else is rejected as `wrong_algorithm`).
- Claims: `{ "sub": "<userId>", "companyId": "<companyId>"?, "exp": <unix>? }` —
  `sub` is REQUIRED and must equal the `identify()` userId; include `companyId`
  when the app calls `group()`.

**Per-language minting snippets live in the guide** — WebFetch
https://docs.usertour.io/developers/identity-verification for ready-to-paste
**Node.js / Python / Ruby / PHP / Go** examples (plus rotation and rollout
guidance). Match the host backend's language from there; don't reconstruct from
memory. Shape illustration only:

```js
// Node — the guide has the other languages
import jwt from "jsonwebtoken";
const usertourToken = jwt.sign(
  { sub: user.id, companyId: user.companyId },
  process.env.USERTOUR_SIGNING_SECRET, // utv_… — server env var, never shipped to the client
  { algorithm: "HS256", expiresIn: "7d" }
);
```

⛔ **The signing secret is a server credential** — same class as the API token.
It never appears in client code, only the signed JWT does. Before finishing,
grep the frontend for `utv_` like you already do for `utp_`.

## Frontend: pass the token

```js
usertour.identify(user.id, { name: user.name /* … */ }, { token: usertourToken });
// group(): needs a token whose companyId claim matches; it supersedes identify()'s
usertour.group(company.id, companyAttributes, { token: usertourToken });
```

- Anonymous users: `identifyAnonymous()` works without a token even under
  enforcement — but `group()` is unavailable for them.
- Rotation: two secrets can be active at once; tokens signed by the old one stay
  valid until it is revoked, so roll the backend to the new secret before the
  old one is revoked.

## Verifying / debugging

- **Settings → Identity Verification has a token validator**: paste a
  backend-minted JWT to check it against the environment's secrets. Verdicts:
  valid / expired / not-yet-valid (`nbf` in the future) / invalid signature /
  wrong algorithm (must be HS256) / malformed / missing `sub` / no active secret.
- The **coverage stat** (last 7 days: valid / invalid / unsigned) tells you
  whether real traffic is signed before you flip enforcement.
- **Even CORRECTLY signed tokens fail?** First check the environment has an
  ACTIVE secret at all: with none registered, the server rejects every
  non-anonymous identity (`no_active_secret`) and it looks exactly like a bad
  signature. The classic cause is a secret copied from ANOTHER environment's
  settings page — secrets are per-environment; a Production secret proves
  nothing in Development. (Verified the hard way in a real install run.)
- Symptom map: user identifies fine in an environment WITHOUT enforcement but
  vanishes in the enforced one → the token is missing/invalid there, or that
  environment has no active secret (different environment = different signing
  secret; check which secret the backend uses per environment).
- Client-side, the only tell of ANY rejection is the `identify()` promise
  rejecting with the generic network-ish message above — `await`/`.catch()` it
  during rollout so rejections are at least visible.
