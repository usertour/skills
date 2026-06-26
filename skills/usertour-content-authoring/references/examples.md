# Examples

Real `update_content_version` bodies. Fetch the live schema with
`get_content_schema` for the full field set — these show shape and idiom.

## Flow — a 5-step welcome tour

`update_content_version({ contentId, versionId, steps, startRules })`:

```json
{
  "steps": [
    {
      "key": "welcome",
      "name": "Welcome",
      "type": "modal",
      "content": [
        { "type": "text", "markdown": "# Welcome 👋\n\nA 30-second tour." },
        { "type": "columns", "columns": [
          { "width": { "unit": "fill" }, "blocks": [{ "type": "button", "text": "Skip", "variant": "secondary", "actions": [{ "type": "dismiss" }] }] },
          { "width": { "unit": "fill" }, "blocks": [{ "type": "button", "text": "Start", "variant": "primary", "actions": [{ "type": "goto_step", "step": "tasks" }] }] }
        ]}
      ]
    },
    {
      "key": "tasks",
      "name": "Tasks",
      "type": "tooltip",
      "target": { "selector": "a[href=\"/tasks\"]" },
      "placement": { "side": "right", "align": "center" },
      "content": [
        { "type": "text", "markdown": "**Tasks** — track your work here." },
        { "type": "columns", "columns": [
          { "width": { "unit": "fill" }, "blocks": [{ "type": "button", "text": "Back", "variant": "secondary", "actions": [{ "type": "goto_step", "step": "welcome" }] }] },
          { "width": { "unit": "fill" }, "blocks": [{ "type": "button", "text": "Finish", "variant": "primary", "actions": [{ "type": "dismiss" }] }] }
        ]}
      ]
    }
  ],
  "startRules": {
    "when": [{ "type": "current_url", "includes": ["*/"] }],
    "frequency": { "mode": "once" }
  }
}
```

> **Button layout.** Top-level blocks stack vertically (each is its own row). To
> place buttons side by side — a modal/tooltip footer — wrap them in one `columns`
> block, as above: two `fill` columns, secondary in the first, primary in a column
> with `justify: "end"` to right-align it. A lone button is left-aligned by default;
> wrap it in a `columns` block and set the column's `justify` (`end`/`center`) to
> move it.

## Checklist — a "get started" list

`update_content_version({ contentId, versionId, data })`:

```json
{
  "data": {
    "buttonText": "Get started",
    "initialDisplay": "expanded",
    "items": [
      {
        "name": "Create your first task",
        "clickActions": [{ "type": "navigate", "url": "/tasks" }],
        "completeWhen": [{ "type": "task_clicked" }]
      },
      {
        "name": "Invite a teammate",
        "completeWhen": [{ "type": "event", "event": "member_invited" }]
      }
    ]
  }
}
```

## Targeting a segment in start rules

```json
{
  "startRules": {
    "when": [
      { "type": "segment", "segment": "seg_new_users", "in": true },
      { "type": "current_url", "includes": ["*/dashboard"] }
    ],
    "frequency": { "mode": "once" }
  }
}
```
