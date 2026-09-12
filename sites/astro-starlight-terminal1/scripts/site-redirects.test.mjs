/**
 * Unit test for `src/lib/site-redirects.mjs` (change
 * 260912-1u4q-hexokit-site-cutover-prep) — the single in-site redirect table
 * extracted from astro.config.mjs so the cross-site shll.ai redirect map
 * composes the same object. Run with the site's pnpm-installed Node toolchain:
 *
 *   cd sites/astro-starlight-terminal1
 *   node --test scripts/site-redirects.test.mjs
 *
 * Plain dependency-free ESM on both sides, so no astro-content alias is needed.
 * The reconstruction test rebuilds the four contributing sets INDEPENDENTLY
 * (from the roster + the docs/site collector + a literal family table) and
 * asserts the composed object matches — the pin that keeps the extraction a
 * pure refactor (same keys, same targets).
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { TOOL_ROSTER } = await import('../src/lib/tool-roster.mjs');
const { docsSiteRedirectEntries } = await import('../src/lib/docs-site-sidebar.mjs');
const { FAMILY_REDIRECTS, siteRedirects } = await import('../src/lib/site-redirects.mjs');

test('FAMILY_REDIRECTS is exactly the seven retired family pages', () => {
  assert.deepEqual(FAMILY_REDIRECTS, {
    '/tools': '/toolkit/',
    '/getting-started/overview': '/toolkit/',
    '/toolkit/overview': '/toolkit/',
    '/getting-started/install': '/toolkit/install/',
    '/getting-started/philosophy': '/toolkit/philosophy/',
    '/workflows/daily-flow': '/toolkit/daily-flow/',
    '/workflows/new-change': '/toolkit/new-change/',
  });
});

test('siteRedirects() reconstructs the four contributing sets (pure-refactor pin)', () => {
  // Independent reconstruction of what astro.config.mjs built inline before
  // the extraction — the change-3ke3 /tools/<name>/* set, the it5d
  // legacy-mount set, the docs/site reverse map, and the family pages.
  const expected = {
    ...Object.fromEntries(
      TOOL_ROSTER.flatMap((t) =>
        [t.slug, ...(t.legacyMounts ?? [])].flatMap((name) => [
          [`/tools/${name}`, `/${t.mount}/`],
          [`/tools/${name}/overview`, `/${t.mount}/`],
          [`/tools/${name}/readme`, `/${t.mount}/readme/`],
          [`/tools/${name}/commands`, `/${t.mount}/commands/`],
        ]),
      ),
    ),
    ...Object.fromEntries(
      TOOL_ROSTER.flatMap((t) =>
        (t.legacyMounts ?? []).flatMap((legacy) => [
          [`/${legacy}`, `/${t.mount}/`],
          [`/${legacy}/readme`, `/${t.mount}/readme/`],
          [`/${legacy}/commands`, `/${t.mount}/commands/`],
        ]),
      ),
    ),
    ...docsSiteRedirectEntries(),
    ...FAMILY_REDIRECTS,
  };
  const sorted = (o) => Object.entries(o).sort(([a], [b]) => a.localeCompare(b));
  assert.deepEqual(sorted(siteRedirects()), sorted(expected));
});

test('siteRedirects() spot-pins one entry from each contributing set', () => {
  const r = siteRedirects();
  assert.equal(r['/tools/hexokit/readme'], '/docs/readme/'); // 3ke3 set, current slug
  assert.equal(r['/tools/run-kit/readme'], '/docs/readme/'); // 3ke3 set, legacy name
  assert.equal(r['/run-kit/commands'], '/docs/commands/'); // it5d legacy-mount set
  assert.equal(r['/run-kit/install'], '/docs/install/'); // docs/site reverse map (legacy)
  assert.equal(r['/tools/wt/overview'], '/wt/'); // 3ke3 set, companion
  assert.equal(r['/tools'], '/toolkit/'); // family set
});

test('siteRedirects() contains every docsSiteRedirectEntries() entry', () => {
  const r = siteRedirects();
  for (const [key, target] of Object.entries(docsSiteRedirectEntries())) {
    assert.equal(r[key], target, `missing or divergent entry for ${key}`);
  }
});

test('no redirect target lacks a trailing slash (trailing-slash serving)', () => {
  for (const [key, target] of Object.entries(siteRedirects())) {
    assert.ok(target.endsWith('/'), `${key} → ${target} lacks a trailing slash`);
  }
});
