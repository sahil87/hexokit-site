/**
 * landing-links.test.mjs — link and asset integrity for the HexoKit landing
 * page (change 260910-jwhx-hexokit-landing). Run with the site's toolchain:
 *
 *   cd sites/astro-starlight-terminal1
 *   node --test scripts/landing-links.test.mjs
 *
 * Reads src/pages/index.astro as TEXT (it is never imported — Astro components
 * do not run under node --test) and asserts two things:
 *
 *  (a) every internal root-relative link target is either an existing route —
 *      a page under src/content/docs/** (honoring `slug:` frontmatter
 *      overrides), a static file under src/pages/**, a `/<mount>/` root page
 *      for a record in the shared roster (src/lib/tool-roster.mjs — the
 *      four-name rule: HexoKit's slug is `hexokit` but it mounts at `/docs/`),
 *      or a pulled docs-site page (repo-root content/<slug>/site/**\/*.md,
 *      served at `/<mount>/<path>/` by the [mount]/[...path] route) — or is in
 *      the FORWARD_LINKS allow-list below. So a typo'd internal link fails CI
 *      while any deliberately-forward link is documented in code.
 *  (b) every `src="/screenshots/…"` names a file that exists in
 *      public/screenshots/.
 *
 * Internal targets are collected from literal `href="/…"` attributes AND from
 * the root-relative string literals inside the page's `LINKS` const (the page
 * deliberately links via `{LINKS.x}` expressions, so the literals live in
 * that const).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOOL_ROSTER } from '../src/lib/tool-roster.mjs';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(siteRoot, '..', '..');
const pagePath = join(siteRoot, 'src', 'pages', 'index.astro');
const pageSource = readFileSync(pagePath, 'utf8');

// Paths the page may link BEFORE they exist as routes, each owned by a named
// sibling change. Empty today: the /docs/ and /toolkit/ mounts and the pulled
// /docs/install/ page all exist (hexokit-site-structure), and S5's
// `hexokit.com/install` appears on the page only inside a shell command, not
// as a link. Add an entry here — with its owner — if the landing must link a
// not-yet-built path again; anything NOT listed must resolve to a real route.
const FORWARD_LINKS = [];

/** Every internal root-relative link target the page can emit. */
function internalLinkTargets(source) {
  const targets = new Set();
  for (const m of source.matchAll(/href="(\/[^"]*)"/g)) targets.add(m[1]);
  const linksBlock = source.match(/const LINKS = \{([\s\S]*?)\} as const;/);
  assert.ok(linksBlock, 'index.astro must declare a LINKS const block');
  for (const m of linksBlock[1].matchAll(/'(\/[^']*)'/g)) targets.add(m[1]);
  // Fragment-only and fragment-bearing targets collapse to their path.
  return [...targets]
    .map((t) => t.split('#')[0])
    .filter((t) => t.length > 0);
}

/** Recursively list files under `dir` (empty when the directory is absent). */
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

/** All routes the site currently emits, as `/path/` (or file-like) strings. */
function existingRoutes() {
  const routes = new Set(['/']);
  const docsDir = join(siteRoot, 'src', 'content', 'docs');
  for (const file of walk(docsDir).filter((f) => /\.mdx?$/.test(f))) {
    const source = readFileSync(file, 'utf8');
    const slugOverride = source.match(/^slug:\s*(\S+)\s*$/m)?.[1];
    const rel = file
      .slice(docsDir.length + 1)
      .replace(/\.mdx?$/, '')
      .replace(/(^|\/)index$/, '');
    const slug = slugOverride ?? rel;
    routes.add(slug ? `/${slug}/` : '/');
  }
  const pagesDir = join(siteRoot, 'src', 'pages');
  for (const file of walk(pagesDir)) {
    if (file.includes('[')) continue; // dynamic routes are enumerated from the roster below
    const rel = file.slice(pagesDir.length + 1).replace(/\.(astro|ts)$/, '');
    routes.add(rel === 'index' ? '/' : `/${rel}`);
  }
  for (const { slug, mount } of TOOL_ROSTER) {
    routes.add(`/${mount}/`);
    // The pulled docs-site tree renders at /<mount>/<path>/ (docs-site-tree).
    const siteDir = join(repoRoot, 'content', slug, 'site');
    for (const file of walk(siteDir).filter((f) => /\.md$/.test(f))) {
      const rel = file.slice(siteDir.length + 1).replace(/\.md$/, '');
      routes.add(`/${mount}/${rel}/`);
    }
  }
  return routes;
}

test('every internal link target is an existing route or an allow-listed forward link', () => {
  const routes = existingRoutes();
  const targets = internalLinkTargets(pageSource);
  assert.ok(targets.length > 0, 'no internal link targets found — extraction broke?');
  for (const target of targets) {
    assert.ok(
      routes.has(target) || FORWARD_LINKS.includes(target),
      `index.astro links to "${target}", which is neither an existing route nor in FORWARD_LINKS`,
    );
  }
});

test('a typo\'d internal link is rejected', () => {
  const routes = existingRoutes();
  assert.ok(!routes.has('/toolkt/'), 'sanity: the misspelt route must not exist');
  assert.ok(routes.has('/docs/') && routes.has('/toolkit/'), 'sanity: the real mounts must exist');
});

test('every /screenshots/ image referenced by the page exists in public/screenshots/', () => {
  const srcs = [...pageSource.matchAll(/src="(\/screenshots\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.length > 0, 'no screenshot references found — extraction broke?');
  for (const src of srcs) {
    assert.ok(
      existsSync(join(siteRoot, 'public', src)),
      `index.astro references ${src}, missing from public/screenshots/`,
    );
  }
});
