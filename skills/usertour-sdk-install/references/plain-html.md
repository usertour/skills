# Plain HTML / server-rendered site

Get the exact loader snippet from the docs overview (WebFetch); it is served from
the Usertour CDN. Place it once, then init + identify. Shape:

```html
<!-- In <head> or before </body>: paste the loader snippet from the docs. -->
<!-- After the loader, with YOUR environment token (list_environments → token): -->
<script>
  usertour.init("ENV_TOKEN");

  // Once you know the user (e.g. server-injected into the page):
  usertour.identify("USER_EXTERNAL_ID", {
    name: "Ada Lovelace",
    email: "ada@example.com",
    plan: "pro"
  });
</script>
```

Notes:
- `ENV_TOKEN` is the **environment** token (public). Never the API token.
- `USER_EXTERNAL_ID` must match the `externalId` the content targets — see
  identify.md.
- On a multi-page site each page reload re-runs init/identify, which is fine.
- For an anonymous marketing page you can `init` without `identify`; content that
  targets identified users won't show until you identify.
