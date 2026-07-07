#!/usr/bin/env node
/**
 * Release gate for this repo. Two invariants, both learned the hard way:
 *
 * 1. Every client manifest must carry the SAME version — clients decide
 *    "is there an update?" from their own manifest, so one missed bump means
 *    users on that client silently never receive the release.
 * 2. Everything a manifest or skill points at must exist — a plugin that
 *    installs with a dangling path fails only on the user's machine.
 *
 * Zero dependencies. Run: node scripts/validate.js  (exit 0 = shippable)
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`x ${msg}`);
};
const ok = (msg) => console.log(`+ ${msg}`);

const readJson = (rel) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  } catch (e) {
    fail(`${rel}: unreadable JSON (${e.message})`);
    return null;
  }
};
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// ── 1. Version lockstep across every manifest ────────────────────────────────
const VERSION_SITES = [
  ['.claude-plugin/plugin.json', (j) => j.version],
  ['.claude-plugin/marketplace.json', (j) => j.plugins?.[0]?.version],
  ['.cursor-plugin/plugin.json', (j) => j.version],
  ['.cursor-plugin/marketplace.json', (j) => j.plugins?.[0]?.version],
  ['.codex-plugin/plugin.json', (j) => j.version],
  ['.agents/plugins/marketplace.json', (j) => j.plugins?.[0]?.version],
];
const versions = VERSION_SITES.map(([rel, get]) => {
  const j = readJson(rel);
  const v = j ? get(j) : undefined;
  if (!v) fail(`${rel}: missing version`);
  else if (!/^\d+\.\d+\.\d+$/.test(v)) fail(`${rel}: version "${v}" is not SemVer`);
  return v;
});
const uniq = [...new Set(versions.filter(Boolean))];
if (uniq.length === 1) ok(`all ${VERSION_SITES.length} manifests at version ${uniq[0]}`);
else if (uniq.length > 1) {
  fail(`manifest versions diverge: ${uniq.join(' vs ')} — a release bump must touch every manifest`);
  for (let i = 0; i < VERSION_SITES.length; i++) {
    console.error(`    ${VERSION_SITES[i][0]}: ${versions[i] ?? '(none)'}`);
  }
}

// ── 2. Required files ─────────────────────────────────────────────────────────
for (const rel of ['.mcp.json', '.codex-plugin/mcp.json', 'README.md', 'LICENSE']) {
  if (exists(rel)) ok(`${rel} present`);
  else fail(`${rel} missing`);
}

// Codex plugin manifest paths must resolve inside the repo.
{
  const j = readJson('.codex-plugin/plugin.json');
  for (const key of ['skills', 'mcpServers']) {
    const p = j?.[key];
    if (typeof p !== 'string' || !p.startsWith('./')) fail(`.codex-plugin/plugin.json ${key}: must be a ./-relative path (got ${JSON.stringify(p)})`);
    else if (!exists(p)) fail(`.codex-plugin/plugin.json ${key}: ${p} does not exist`);
    else ok(`.codex-plugin/plugin.json ${key} -> ${p}`);
  }
}

// ── 3. Skills: frontmatter + no dangling reference links ─────────────────────
const skillDirs = fs
  .readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
if (skillDirs.length === 0) fail('skills/: no skill directories found');
for (const dir of skillDirs) {
  const rel = `skills/${dir}/SKILL.md`;
  if (!exists(rel)) {
    fail(`${rel} missing`);
    continue;
  }
  const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  const name = fm?.[1].match(/^name:\s*(\S+)\s*$/m)?.[1];
  const hasDescription = /^description:\s*\S/m.test(fm?.[1] ?? '');
  if (name !== dir) fail(`${rel}: frontmatter name "${name}" != directory "${dir}"`);
  if (!hasDescription) fail(`${rel}: frontmatter has no description`);
  if (name === dir && hasDescription) ok(`${rel} frontmatter`);

  // Every relative markdown link in the skill must resolve (broken links fail
  // only on the user's machine).
  for (const md of [rel, ...listMd(`skills/${dir}/references`)]) {
    const body = fs.readFileSync(path.join(ROOT, md), 'utf8');
    for (const m of body.matchAll(/\]\(((?!https?:|mailto:|#)[^)]+?)(?:#[^)]*)?\)/g)) {
      const target = path.join(path.dirname(md), m[1]);
      if (!exists(target)) fail(`${md}: dangling link -> ${m[1]}`);
    }
  }
}
function listMd(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith('.md'))
    .map((f) => `${rel}/${f}`);
}

// ── Result ────────────────────────────────────────────────────────────────────
if (failures) {
  console.error(`\n${failures} check(s) failed — NOT shippable.`);
  process.exit(1);
}
console.log('\nAll checks passed — shippable.');
