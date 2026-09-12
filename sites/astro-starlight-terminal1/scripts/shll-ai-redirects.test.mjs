/**
 * Unit test for `src/lib/shll-ai-redirects.ts` (change
 * 260912-1u4q-hexokit-site-cutover-prep) — the pure logic behind the
 * `/shll-ai-redirects.json` cross-site redirect map. Run with the site's
 * pnpm-installed Node toolchain (>=22, native `.ts` type-stripping):
 *
 *   cd sites/astro-starlight-terminal1
 *   node --test scripts/shll-ai-redirects.test.mjs
 *
 * The lib has no Astro or disk imports, so — unlike versions-manifest.test.mjs
 * — no `astro-content-alias.mjs` resolve hook is needed.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const {
  MAP_SCHEMA,
  SHLL_AI_ORIGIN,
  KEEP_ON_SHLL_AI,
  AGENT_ENDPOINTS,
  canonicalPath,
  resolveFinal,
  buildRules,
  applyRules,
  buildShllAiRedirectMap,
} = await import('../src/lib/shll-ai-redirects.ts');
const { siteRedirects } = await import('../src/lib/site-redirects.mjs');

const ORIGIN = 'https://hexokit.com';

// ── canonicalPath (R3) ───────────────────────────────────────────────────────

test('canonicalPath: `/` stays `/`', () => {
  assert.equal(canonicalPath('/'), '/');
});

test('canonicalPath: bare and slashed page paths collapse to one trailing slash', () => {
  assert.equal(canonicalPath('/tools/wt/readme'), '/tools/wt/readme/');
  assert.equal(canonicalPath('/tools/wt/readme/'), '/tools/wt/readme/');
  assert.equal(canonicalPath('/tools/wt/readme//'), '/tools/wt/readme/');
});

test('canonicalPath: duplicate slashes collapse', () => {
  assert.equal(canonicalPath('//tools///wt//'), '/tools/wt/');
});

test('canonicalPath: file-like paths (last segment contains a dot) stay bare', () => {
  assert.equal(canonicalPath('/llms.txt'), '/llms.txt');
  assert.equal(canonicalPath('/llms.txt/'), '/llms.txt');
  assert.equal(canonicalPath('/versions.json'), '/versions.json');
});

// ── R3: enumeration, canonical sorted keys, absolute values ──────────────────

test('R3 GIVEN/WHEN/THEN: sources, canonical keys, chain-free values', () => {
  const map = buildShllAiRedirectMap({
    pages: ['/', '/docs/', '/wt/readme/'],
    redirects: { '/tools/wt/readme': '/wt/readme/', '/run-kit': '/docs/' },
    origin: ORIGIN,
  });
  assert.deepEqual(Object.keys(map.redirects), [
    '/',
    '/docs/',
    '/llms-full.txt',
    '/llms.txt',
    '/run-kit/',
    '/tools/wt/readme/',
    '/wt/readme/',
  ]);
  assert.equal(map.redirects['/tools/wt/readme/'], 'https://hexokit.com/wt/readme/');
  assert.equal(map.redirects['/run-kit/'], 'https://hexokit.com/docs/');
  assert.equal(map.redirects['/llms.txt'], 'https://hexokit.com/llms.txt');
  assert.equal(map.redirects['/'], 'https://hexokit.com/');
  const keys = Object.keys(map.redirects);
  assert.deepEqual(keys, [...keys].sort());
});

test('R3: map envelope fields', () => {
  const map = buildShllAiRedirectMap(
    { pages: ['/'], redirects: {}, origin: ORIGIN },
    new Date('2026-09-12T18:00:00.000Z'),
  );
  assert.equal(map.schema, MAP_SCHEMA);
  assert.equal(map.schema, 1);
  assert.equal(map.generated_at, '2026-09-12T18:00:00.000Z');
  assert.equal(map.from, SHLL_AI_ORIGIN);
  assert.equal(map.from, 'https://shll.ai');
  assert.equal(map.to, ORIGIN);
});

test('R3: origin trailing slash is normalized, never doubled into values', () => {
  const map = buildShllAiRedirectMap({
    pages: ['/wt/'],
    redirects: {},
    origin: 'https://hexokit.com/',
  });
  assert.equal(map.to, ORIGIN);
  assert.equal(map.redirects['/wt/'], 'https://hexokit.com/wt/');
});

// ── R4: chain collapse, dangling throw ───────────────────────────────────────

test('R4: chains collapse to the final live page (both keys)', () => {
  const map = buildShllAiRedirectMap({
    pages: ['/c/'],
    redirects: { '/a': '/b/', '/b': '/c/' },
    origin: ORIGIN,
  });
  assert.equal(map.redirects['/a/'], 'https://hexokit.com/c/');
  assert.equal(map.redirects['/b/'], 'https://hexokit.com/c/');
  // No value's path is itself a redirect key with a different value.
  const valuePaths = new Set(
    Object.values(map.redirects).map((v) => v.slice(ORIGIN.length)),
  );
  for (const p of valuePaths) {
    const bare = p.endsWith('/') ? p.slice(0, -1) : p;
    assert.ok(!('/a' === bare || '/b' === bare), `${p} is a redirect key`);
  }
});

test('R4: a chain ending at a non-page throws, naming source and target', () => {
  assert.throws(
    () =>
      buildShllAiRedirectMap({
        pages: [],
        redirects: { '/a': '/nowhere/' },
        origin: ORIGIN,
      }),
    (err) => err.message.includes('/a') && err.message.includes('/nowhere/'),
  );
});

test('R4: chains deeper than the hop bound throw', () => {
  const redirects = { '/a': '/b/', '/b': '/c/', '/c': '/d/', '/d': '/e/' };
  assert.throws(
    () => resolveFinal('/a', new Set(['/e/']), redirects),
    /redirect hops/,
  );
  // Exactly at the bound (3 hops) resolves.
  assert.equal(
    resolveFinal('/a', new Set(['/e/']), { '/a': '/b/', '/b': '/c/', '/c': '/e/' }),
    '/e/',
  );
});

test('R4: the agent endpoints are treated as live', () => {
  const live = new Set(['/']);
  assert.equal(resolveFinal('/llms.txt', live, {}), '/llms.txt');
  assert.equal(resolveFinal('/llms-full.txt', live, {}), '/llms-full.txt');
});

// ── R5: keep ─────────────────────────────────────────────────────────────────

test('R5: keep is exactly /install and /versions.json, excluded from redirects', () => {
  const map = buildShllAiRedirectMap({
    pages: ['/', '/install', '/versions.json'],
    redirects: {},
    origin: ORIGIN,
  });
  assert.deepEqual(map.keep, ['/install', '/versions.json']);
  const keys = Object.keys(map.redirects);
  for (const kept of [...KEEP_ON_SHLL_AI, '/install/', '/versions.json/']) {
    assert.ok(!keys.includes(kept), `${kept} must not be a redirects key`);
  }
});

// ── R6: rules ≡ enumeration ──────────────────────────────────────────────────

/** A synthetic roster-shaped input: a /tools/<name>/* set (slug == mount and
 *  slug != mount tools), a legacy-mount set, family entries, and live pages. */
function syntheticInput() {
  const pages = [
    '/',
    '/docs/',
    '/docs/readme/',
    '/docs/commands/',
    '/docs/skill/cron/',
    '/wt/',
    '/wt/readme/',
    '/wt/install/',
    '/toolkit/',
    '/toolkit/install/',
    '/toolkit/philosophy/',
    '/toolkit/daily-flow/',
    '/toolkit/new-change/',
  ];
  const redirects = {
    '/tools/wt': '/wt/',
    '/tools/wt/overview': '/wt/',
    '/tools/wt/readme': '/wt/readme/',
    '/tools/wt/install': '/wt/install/',
    '/tools/hexokit': '/docs/',
    '/tools/hexokit/overview': '/docs/',
    '/tools/hexokit/readme': '/docs/readme/',
    '/tools/hexokit/skill/cron': '/docs/skill/cron/',
    '/tools/run-kit': '/docs/',
    '/tools/run-kit/readme': '/docs/readme/',
    '/run-kit': '/docs/',
    '/run-kit/readme': '/docs/readme/',
    '/run-kit/skill/cron': '/docs/skill/cron/',
  };
  return { pages, redirects, origin: ORIGIN };
}

test('R6: applyRules reproduces every enumerated value (synthetic input)', () => {
  const map = buildShllAiRedirectMap(syntheticInput());
  for (const [key, value] of Object.entries(map.redirects)) {
    const viaRules = map.to + applyRules(map.rules, key);
    assert.equal(viaRules, value, `rules disagree with enumeration for ${key}`);
  }
});

test('R6: applyRules reproduces every enumerated value (real siteRedirects table)', () => {
  // Live pages = every value of the real table plus the toolkit family targets
  // and `/` — a stand-in for the full collection walk the endpoint performs.
  const table = siteRedirects();
  const pages = ['/', ...new Set(Object.values(table))];
  const map = buildShllAiRedirectMap({ pages, redirects: table, origin: ORIGIN });
  for (const [key, value] of Object.entries(map.redirects)) {
    const viaRules = map.to + applyRules(map.rules, key);
    assert.equal(viaRules, value, `rules disagree with enumeration for ${key}`);
  }
});

test('R6: the legacy-mount rules are roster-built (run-kit → docs)', () => {
  const rules = buildRules();
  assert.ok(
    rules.some(([source]) => source === '^/(?:tools/)?run-kit(/.*)?$'),
    'a roster-built legacy-mount rule exists',
  );
  assert.equal(applyRules(rules, '/run-kit/skill/cron/'), '/docs/skill/cron/');
  assert.equal(applyRules(rules, '/tools/run-kit/readme/'), '/docs/readme/');
  assert.equal(applyRules(rules, '/tools/run-kit/overview/'), '/docs/');
  assert.equal(applyRules(rules, '/run-kit/'), '/docs/');
});

test('R6: rules handle the fixed point — live pages map to themselves', () => {
  const rules = buildRules();
  assert.equal(applyRules(rules, '/'), '/');
  assert.equal(applyRules(rules, '/docs/gui/'), '/docs/gui/');
  assert.equal(applyRules(rules, '/wt/readme/'), '/wt/readme/');
  assert.equal(applyRules(rules, '/llms.txt'), '/llms.txt');
  assert.equal(applyRules(rules, '/toolkit/overview/'), '/toolkit/');
});
