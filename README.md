# Usertour Skills

[Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
for authoring [Usertour](https://www.usertour.io) in-app onboarding — flows
(product tours), checklists, launchers, banners, surveys, and trackers — through
the Usertour API/MCP.

The skill is intentionally thin: it encodes the **workflow and design craft**,
and defers the field schemas and conventions to the Usertour MCP's self-describing
tools (`get_authoring_guide`, `get_content_schema`), so it never drifts.

## Prerequisite: connect the Usertour MCP

The skill drives the **Usertour MCP server**. Connecting is **OAuth one-click** —
no token to copy. On first use your agent opens the browser, you sign in and pick
the one project the connection may act in, and you're done. It acts as you, never
beyond your role in that project.

**Cloud** (default): nothing to set — `.mcp.json` points at
`https://api.usertour.io/mcp` and the agent runs the login for you.

**Self-hosted**: point the MCP at your own server with `USERTOUR_MCP_URL`:

```bash
export USERTOUR_MCP_URL="https://usertour.your-company.com/mcp"
```

The `url` in `.mcp.json` is `${USERTOUR_MCP_URL:-https://api.usertour.io/mcp}` —
cloud users get the default, self-hosters override it via the env var. (If your
agent doesn't expand `${…:-default}` env syntax, edit the `url` in `.mcp.json`
directly.) OAuth 2.1 requires the endpoint to be reachable over HTTPS (loopback
is exempt for local testing).

> Prefer a **scoped, single-project personal token** instead of OAuth (e.g. for
> CI or to grant an agent *less* than your full role)? Add a `headers` block to
> `.mcp.json` — `"Authorization": "Bearer utp_…"` — and the client skips the
> login. See the [MCP docs](https://docs.usertour.io/api-reference-v2/mcp) for both
> paths.

## Installing

These skills follow the Agent Skills standard and work with any agent that
supports it. For the full walkthrough (with the OAuth login and self-hosting),
see the [MCP docs](https://docs.usertour.io/api-reference-v2/mcp).

### Claude Code

```
/plugin marketplace add usertour/skills
/plugin install usertour@usertour
```

### Cursor

Settings → Rules → Add Rule → Remote Rule (GitHub) with `usertour/skills`, or
install from the Cursor marketplace.

### npx skills

```
npx skills add https://github.com/usertour/skills
```

### Clone / copy

Copy the skill folder into your agent's skills directory:

| Agent | Skill directory |
|-------|-----------------|
| Claude Code | `~/.claude/skills/` |
| Cursor | `~/.cursor/skills/` |
| OpenCode | `~/.config/opencode/skills/` |
| OpenAI Codex | `~/.codex/skills/` |

## Commands

| Command | Description |
|---------|-------------|
| `/usertour:build-onboarding` | Build and publish an onboarding experience from a description |
| `/usertour:install-sdk` | Install & wire the Usertour Web SDK into the current app so published content renders |

## Skills

| Skill | Useful for |
|-------|------------|
| usertour-content-authoring | Authoring & publishing flows, checklists, launchers, banners, surveys, trackers — lifecycle, schema retrieval, targeting, and design patterns |
| usertour-sdk-install | Installing & wiring the Usertour Web SDK into a host app (loader, `init()` with the environment token, `identify()`, SPA routing, verification) so published content renders |

## How it fits together

- **MCP server** (open standard) = the capability + self-describing guidance
  (`get_authoring_guide`, `get_content_schema`, create/update/validate/publish).
  Works in any MCP client.
- **usertour-content-authoring** = the orchestration layer for *building* content:
  when to do what, the publish discipline, and design craft. Points at the MCP
  rather than duplicating it.
- **usertour-sdk-install** = the *other half of the loop*: wiring the SDK into the
  app so published content actually renders. Defers the SDK API to the usertour.js
  docs and pulls the environment token from the MCP. The two skills connect
  through the `externalId` you target in segments and pass to `identify()`.
