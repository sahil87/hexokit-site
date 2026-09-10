/**
 * Unit test for `src/lib/tool-roster.mjs` (change it5d) — the single
 * site-authored roster carrying each tool's four names (slug / mount / repo /
 * formula+binary). Run with the site's pnpm-installed Node toolchain:
 *
 *   cd sites/astro-starlight-terminal1
 *   node --test scripts/tool-roster.test.mjs
 *
 * The module is plain dependency-free ESM, so no astro-content alias is needed.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const {
  TOOL_ROSTER,
  TOOL_SLUGS,
  mountFor,
  slugForMount,
  repoFor,
  labelFor,
  isToolSlug,
  isToolMount,
} = await import('../src/lib/tool-roster.mjs');

test('TOOL_ROSTER carries the seven tools in display order (product first)', () => {
  assert.deepEqual(
    TOOL_ROSTER.map((t) => t.slug),
    ['hexokit', 'fab-kit', 'wt', 'idea', 'tu', 'hop', 'shll'],
  );
});

test('TOOL_SLUGS is derived from the roster (same order, no second list)', () => {
  assert.deepEqual(TOOL_SLUGS, TOOL_ROSTER.map((t) => t.slug));
});

test('every record carries the four-name rule fields', () => {
  for (const t of TOOL_ROSTER) {
    for (const field of ['slug', 'label', 'mount', 'repo', 'formula', 'binary']) {
      assert.equal(typeof t[field], 'string', `${t.slug}.${field} must be a string`);
    }
  }
});

test('hexokit is the slug≠mount≠repo tool (source stays run-kit)', () => {
  const hexokit = TOOL_ROSTER.find((t) => t.slug === 'hexokit');
  assert.equal(hexokit.mount, 'docs');
  assert.equal(hexokit.repo, 'run-kit');
  assert.equal(hexokit.formula, 'run-kit');
  assert.equal(hexokit.binary, 'run-kit');
  assert.deepEqual(hexokit.legacyMounts, ['run-kit']);
});

test('mountFor / slugForMount resolve both directions', () => {
  assert.equal(mountFor('hexokit'), 'docs');
  assert.equal(mountFor('wt'), 'wt');
  assert.equal(slugForMount('docs'), 'hexokit');
  assert.equal(slugForMount('shll'), 'shll');
});

test('unknown names resolve to null (never a wrong-but-plausible answer)', () => {
  assert.equal(mountFor('nope'), null);
  assert.equal(slugForMount('toolkit'), null);
  assert.equal(slugForMount('reference'), null);
  assert.equal(repoFor('nope'), null);
  assert.equal(labelFor('nope'), null);
});

test('repoFor / labelFor', () => {
  assert.equal(repoFor('hexokit'), 'run-kit');
  assert.equal(repoFor('fab-kit'), 'fab-kit');
  assert.equal(labelFor('hexokit'), 'HexoKit');
  assert.equal(labelFor('wt'), 'wt');
});

test('isToolSlug / isToolMount membership gates', () => {
  assert.ok(isToolSlug('hexokit'));
  assert.ok(!isToolSlug('docs'));
  assert.ok(!isToolSlug('run-kit')); // legacy mount, not a slug
  assert.ok(isToolMount('docs'));
  assert.ok(isToolMount('wt'));
  assert.ok(!isToolMount('run-kit')); // legacy mounts are redirects, not mounts
  assert.ok(!isToolMount('toolkit'));
});

test('mounts are unique (no two tools share a URL segment)', () => {
  const mounts = TOOL_ROSTER.map((t) => t.mount);
  assert.equal(new Set(mounts).size, mounts.length);
});

// ── Legacy-mount redirect enumeration (docs-site-sidebar.mjs) ───────────────
// The redirect collector walks the committed content/<slug>/site/** trees, so
// these assertions key on pages known to be committed today (hexokit's
// install + skill/mux; wt's install).
const { docsSiteRedirectEntries } = await import('../src/lib/docs-site-sidebar.mjs');

test('docsSiteRedirectEntries emits /tools/<slug> and legacy-mount redirects to the mount', () => {
  const entries = docsSiteRedirectEntries();
  // The change-3ke3 set, now mount-aware and keyed by the OLD names too:
  // /tools/<slug>/<path> and /tools/<legacy>/<path> → /<mount>/<path>/.
  assert.equal(entries['/tools/hexokit/install'], '/docs/install/');
  assert.equal(entries['/tools/run-kit/install'], '/docs/install/');
  assert.equal(entries['/tools/wt/install'], '/wt/install/');
  // The change-it5d legacy set: /run-kit/<path> → /docs/<path>/.
  assert.equal(entries['/run-kit/install'], '/docs/install/');
  assert.equal(entries['/run-kit/skill/mux'], '/docs/skill/mux/');
  // No stale mount survives: nothing targets /run-kit/… anymore.
  for (const dest of Object.values(entries)) {
    assert.ok(!dest.startsWith('/run-kit/'), `stale run-kit destination: ${dest}`);
  }
});
