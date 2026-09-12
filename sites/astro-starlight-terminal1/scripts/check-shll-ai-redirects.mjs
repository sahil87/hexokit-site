/**
 * check-shll-ai-redirects — post-build completeness check for the cross-site
 * shll.ai → hexokit.com redirect map (change
 * 260912-1u4q-hexokit-site-cutover-prep). Run from the live site directory
 * AFTER `pnpm build`:
 *
 *   cd sites/astro-starlight-terminal1
 *   node scripts/check-shll-ai-redirects.mjs   # [map-json] [fixture-txt]
 *
 * Reads `dist/shll-ai-redirects.json` (default; arg 1 overrides) and the
 * committed URL floor `scripts/fixtures/shll-ai-paths.txt` (arg 2 overrides)
 * and exits non-zero listing every violation of:
 *
 *   (a) every fixture path, canonicalized, is a `redirects` key or a `keep`
 *       entry — no old shll.ai URL is unmapped;
 *   (b) every `redirects` value, stripped of the `to` origin, exists in `dist/`
 *       (`<path>/index.html` for page-like, the bare file for file-like) and
 *       that HTML is NOT a `<meta http-equiv="refresh">` stub — every value is
 *       a real final page, not a double hop;
 *   (c) no value's path is itself a `redirects` key with a different value —
 *       no chains survived the collapse;
 *   (d) every `keep` path exists in `dist/` (a missing `/install` is a
 *       WARNING, not a failure, when `public/install` is absent — deploy.yml
 *       fetches the installer before building, a plain `pnpm build` and CI
 *       never have it);
 *   (e) `applyRules(rules, key)` reproduces `redirects[key]` for every key —
 *       the rules generalization and the enumeration cannot disagree.
 *
 * No npm deps (Constitution VI); the lib's `.ts` is imported directly (Node
 * native type-stripping) — it has no Astro imports, so no resolve hook.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { canonicalPath, applyRules } = await import('../src/lib/shll-ai-redirects.ts');

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, '..');
const distDir = path.join(siteDir, 'dist');

const [mapArg, fixtureArg] = process.argv.slice(2);
const mapPath = path.resolve(siteDir, mapArg ?? 'dist/shll-ai-redirects.json');
const fixturePath = path.resolve(
  siteDir,
  fixtureArg ?? 'scripts/fixtures/shll-ai-paths.txt',
);

if (!fs.existsSync(mapPath)) {
  console.error(
    `ERROR: ${path.relative(siteDir, mapPath)} not found — run \`pnpm build\` first.`,
  );
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const fixturePaths = fs
  .readFileSync(fixturePath, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.startsWith('#'));

const violations = [];
const warnings = [];
const fail = (clause, p, detail) => violations.push(`(${clause}) ${p}: ${detail}`);
const warn = (clause, p, detail) => warnings.push(`(${clause}) ${p}: ${detail}`);

const redirectKeys = new Set(Object.keys(map.redirects));
const keepSet = new Set(
  (map.keep ?? []).flatMap((k) => [k, canonicalPath(k)]),
);

/** The dist/ file a canonical map path must materialize as. */
function distFileFor(canonical) {
  const isFileLike = (path.basename(canonical) ?? '').includes('.');
  return isFileLike
    ? path.join(distDir, canonical)
    : path.join(distDir, canonical, 'index.html');
}

// (a) the fixture floor is covered.
for (const line of fixturePaths) {
  const key = canonicalPath(line);
  if (!redirectKeys.has(key) && !keepSet.has(key) && !keepSet.has(line)) {
    fail('a', line, 'fixture path is neither a redirects key nor a keep entry');
  }
}

// (b) every value is a real final page in dist/, (c) no chains, (e) rules ≡
// enumeration — one pass over the map.
for (const [key, value] of Object.entries(map.redirects)) {
  if (!value.startsWith(map.to)) {
    fail('b', key, `value '${value}' does not start with the origin '${map.to}'`);
    continue;
  }
  const valuePath = value.slice(map.to.length);
  const file = distFileFor(valuePath);
  if (!fs.existsSync(file)) {
    fail('b', key, `value ${valuePath} missing in dist/ (${path.relative(siteDir, file)})`);
  } else if (
    file.endsWith('.html') &&
    fs.readFileSync(file, 'utf8').includes('http-equiv="refresh"')
  ) {
    fail('b', key, `value ${valuePath} is a <meta refresh> stub, not a final page`);
  }

  const canonicalValue = canonicalPath(valuePath);
  if (redirectKeys.has(canonicalValue) && map.redirects[canonicalValue] !== value) {
    fail('c', key, `value ${canonicalValue} is itself a redirects key (chain)`);
  }

  const viaRules = map.to + applyRules(map.rules, key);
  if (viaRules !== value) {
    fail('e', key, `rules produce '${viaRules}' but the enumerated value is '${value}'`);
  }
}

// (d) keep files exist (the deploy-time-fetched /install is warn-only).
let keepPresent = 0;
for (const keepPath of map.keep ?? []) {
  const file = path.join(distDir, keepPath);
  if (fs.existsSync(file)) {
    keepPresent += 1;
  } else if (
    keepPath === '/install' &&
    !fs.existsSync(path.join(siteDir, 'public', 'install'))
  ) {
    warn('d', keepPath, 'missing in dist/ (deploy.yml fetches it before building)');
  } else {
    fail('d', keepPath, 'keep file missing in dist/');
  }
}

for (const w of warnings) console.warn(`WARN ${w}`);
if (violations.length > 0) {
  for (const v of violations) console.error(`FAIL ${v}`);
  console.error(`\n${violations.length} violation(s) — the shll.ai redirect map is incomplete.`);
  process.exit(1);
}

console.log(
  `${fixturePaths.length} fixture paths covered, ${redirectKeys.size} map entries verified, ${keepPresent} keep files present`,
);
