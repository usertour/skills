# Identify: linking app users to targeted content

This is the #1 reason "I published it but nothing shows up." Get it right.

## The rule

`usertour.identify(userId, attributes)` tells the SDK **who the current user is**.
The `userId` you pass **must be the same value** the content's targeting uses as
its `externalId`:

- Segment membership and segment conditions match on `externalId`.
- Flow / checklist start-rules and attribute conditions evaluate against this
  user's attributes.

If the app identifies the user as `"user_42"` but the content targets a segment
built on `"42"` (or an email, or an internal DB id), the user is simply never in
the audience — the content validates, publishes, and never appears. There is no
error; it just doesn't show.

**Pick one stable external id** (your app's canonical user id) and use it
everywhere: in `identify()`, and when you upsert users / build segments via the
Usertour API/MCP.

## When to call

- After login / once the current user is known.
- Again whenever the identified user changes (account switch) — call
  `usertour.reset()` **before** re-identifying as the new user. Skipping it
  silently keeps the previous identity's cached attributes and seen-state (your
  `{{ name }}` still shows the old user; content behaves as already-seen), with no
  error — which looks like a targeting/attribute bug but isn't.
- On **logout**: call `usertour.reset()` so the next (anonymous or different)
  user doesn't inherit the previous identity.

Call `usertour.init(token)` once at startup; `identify()` can come later, as soon
as you have the user.

## Attributes

Pass the attributes your targeting uses (plan, role, signup date, feature flags,
etc.) as the second argument:

```js
usertour.identify(currentUser.id, {
  name: currentUser.name,
  email: currentUser.email,
  plan: currentUser.plan,
  signed_up_at: currentUser.createdAt,
});
```

Attribute **codes** must match those defined in Usertour
(`list_attribute_definitions` via the MCP). Send only what you target on.

## Companies (optional)

If you target by company/account, also call
`usertour.group(companyId, { name, plan, … })`. The `companyId` likewise must
match the company `externalId` used in targeting.
