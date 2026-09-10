/**
 * Contract test for `src/lib/landing-data.ts` — the landing page's copy and
 * links (change lvnp). Run with the site's Node toolchain (>=22, native `.ts`
 * type-stripping), like the other `scripts/*.test.mjs`:
 *
 *   cd sites/astro-starlight-terminal1
 *   node --test scripts/landing-data.test.mjs
 *
 * WHAT IT PINS, AND WHY EACH ASSERTION EARNS ITS PLACE:
 *
 *   1. The `vn39` HARD RULE, mechanized. Hand-written site prose MUST NOT name
 *      a command absent from the tool's help envelope. The landing's copy names
 *      several (`rk riff`, `rk cron`, `rk operator`, `rk doctor`, …), so every
 *      backticked `rk <verb>` across ALL copy strings is checked against
 *      `help/hexokit.json` `root.commands[].name`. This is the one assertion
 *      that catches a drift a human reviewer reliably misses: a command renamed
 *      upstream leaves the site advertising a verb that no longer exists.
 *      "boards" is deliberately prose, never a backticked command — a copy edit
 *      introducing `rk boards` fails here.
 *
 *   2. Roster-derived links. Every hexagon edge that names a tool must be a
 *      real roster slug and must link that tool's MOUNT, not its slug. HexoKit
 *      already has mount ≠ slug (`docs` vs `hexokit`), so a hardcoded
 *      `/<slug>/` is a live bug class, not a hypothetical one.
 *
 *   3. The exact footer set and install lines, in order. Both are specified
 *      copy, and both are the kind of list that silently grows an extra entry.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DESKTOP_COMMANDS,
  FEATURES,
  FOOTER_LINKS,
  GITHUB_URL,
  HERO,
  INSTALL_LINES,
  TOOLKIT_EDGES,
} from '../src/lib/landing-data.ts';
import { isToolSlug, mountFor } from '../src/lib/tool-slugs.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');

/** The product's command roster, from the pulled help envelope. */
function helpCommandNames() {
  const helpPath = path.join(REPO_ROOT, 'help', 'hexokit.json');
  const doc = JSON.parse(fs.readFileSync(helpPath, 'utf8'));
  return new Set((doc.root?.commands ?? []).map((c) => c.name));
}

/**
 * Every backticked `rk <verb>` token in a string. Sub-verbs like
 * `rk desktop install` validate on their FIRST word — `desktop` is the entry in
 * `root.commands`; its own subcommands live a level deeper in the envelope.
 */
function rkVerbsIn(text) {
  return [...text.matchAll(/`rk ([a-z][\w-]*)/g)].map((m) => m[1]);
}

/** Every copy string on the page that a `vn39` violation could hide in. */
function allCopyStrings() {
  return [
    HERO.tagline,
    HERO.subline,
    HERO.lead,
    ...FEATURES.flatMap((f) => [f.title, f.copy, f.image.alt]),
    ...TOOLKIT_EDGES.map((e) => e.blurb),
    // The desktop commands are not backticked in the data file (they are
    // rendered as a code block), so they are checked separately below.
  ];
}

test('every backticked `rk <verb>` in landing copy is a real command (vn39)', () => {
  const commands = helpCommandNames();
  assert.ok(commands.size > 0, 'help/hexokit.json listed no commands');

  const offenders = [];
  for (const text of allCopyStrings()) {
    for (const verb of rkVerbsIn(text)) {
      if (!commands.has(verb)) offenders.push({ verb, text });
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `landing copy names rk verb(s) absent from help/hexokit.json: ${offenders
      .map((o) => o.verb)
      .join(', ')}`,
  );
});

test('the copy actually exercises the vn39 check (it is not vacuously true)', () => {
  // A guard on the guard: if a refactor ever stops the regex from matching,
  // the assertion above would pass on an empty set and stop protecting anything.
  const found = allCopyStrings().flatMap(rkVerbsIn);
  assert.ok(found.length >= 3, `expected several rk verbs in copy, found ${found.length}`);
});

test('a copy string naming a non-command rk verb is rejected', () => {
  // The negative case, stated directly: `boards` is a UI concept, not a command.
  const commands = helpCommandNames();
  assert.equal(commands.has('boards'), false, '`boards` should not be a command');
  assert.deepEqual(rkVerbsIn('Pin panes into a `rk boards` view'), ['boards']);
});

test('desktop card commands name a real command', () => {
  const commands = helpCommandNames();
  for (const line of DESKTOP_COMMANDS) {
    const verb = line.split(/\s+/)[1];
    assert.ok(commands.has(verb), `\`${line}\` names unknown command \`${verb}\``);
  }
});

test('toolkit edges: tool slugs resolve through the roster to their mount', () => {
  const toolEdges = TOOLKIT_EDGES.filter((e) => e.slug !== 'desktop');
  assert.equal(toolEdges.length, 5, 'expected five tool edges plus the desktop edge');

  for (const edge of toolEdges) {
    assert.ok(isToolSlug(edge.slug), `\`${edge.slug}\` is not a roster tool slug`);
    assert.equal(
      edge.href,
      `/${mountFor(edge.slug)}/`,
      `edge \`${edge.slug}\` must link its roster mount, not a hardcoded slug path`,
    );
  }
});

test('the desktop edge links the desktop page, not the landing anchor', () => {
  const desktop = TOOLKIT_EDGES.find((e) => e.slug === 'desktop');
  assert.ok(desktop, 'no desktop edge');
  assert.equal(desktop.href, '/desktop/');
  assert.equal(isToolSlug('desktop'), false, '`desktop` is an app page, not a roster tool');
});

test('toolkit edges are the six expected tools, in clockwise order', () => {
  assert.deepEqual(
    TOOLKIT_EDGES.map((e) => e.slug),
    ['fab-kit', 'wt', 'idea', 'tu', 'hop', 'desktop'],
  );
  for (const edge of TOOLKIT_EDGES) {
    assert.ok(edge.blurb.length > 0, `edge \`${edge.slug}\` has no blurb`);
    assert.ok(edge.label.length > 0, `edge \`${edge.slug}\` has no label`);
  }
});

test('install lines are exactly the two specified commands, in order', () => {
  assert.deepEqual(
    [...INSTALL_LINES],
    ['curl -fsSL hexokit.com/install | sh', 'brew install sahil87/tap/hexokit'],
  );
});

test('footer links are exactly the six specified, in order', () => {
  assert.deepEqual(
    FOOTER_LINKS.map((l) => [l.label, l.href]),
    [
      ['Docs', '/docs/'],
      ['Toolkit', '/toolkit/'],
      ['GitHub', GITHUB_URL],
      ['Discord', 'https://discord.gg/32XHh5mJYn'],
      ['versions.json', '/versions.json'],
      ['llms.txt', '/llms.txt'],
    ],
  );
});

test('the GitHub URL comes from the roster, not a hardcoded repo name', () => {
  // The repo is still `run-kit`; the point is that the value is DERIVED, so a
  // source-side rename flows through the roster rather than through this page.
  assert.match(GITHUB_URL, /^https:\/\/github\.com\/sahil87\/[\w.-]+$/);
});

test('every feature card is complete and links into the product docs', () => {
  assert.equal(FEATURES.length, 6, 'expected six feature cards');
  for (const feature of FEATURES) {
    assert.ok(feature.title.length > 0, 'card without a title');
    assert.ok(feature.copy.length > 0, `card \`${feature.title}\` has no copy`);
    assert.ok(
      feature.href.startsWith('/docs/'),
      `card \`${feature.title}\` links ${feature.href}, expected a /docs/ path`,
    );
  }
});

test('every image carries alt text and real intrinsic dimensions', () => {
  const images = [HERO.desktopImage, HERO.phoneImage, ...FEATURES.map((f) => f.image)];
  for (const image of images) {
    assert.ok(image.alt.length > 10, `${image.src} has no meaningful alt text`);
    assert.ok(image.src.startsWith('/screenshots/'), `${image.src} is not a committed screenshot`);
    assert.ok(Number.isInteger(image.width) && image.width > 0, `${image.src} has no width`);
    assert.ok(Number.isInteger(image.height) && image.height > 0, `${image.src} has no height`);
  }
});

test('declared image dimensions match the committed webp files', () => {
  // Wrong dimensions would defeat the whole point of declaring them (the
  // browser would reserve the wrong box and the page would still shift).
  const images = [HERO.desktopImage, HERO.phoneImage, ...FEATURES.map((f) => f.image)];
  for (const image of images) {
    const file = path.join(HERE, '..', 'public', image.src.replace(/^\//, ''));
    assert.ok(fs.existsSync(file), `missing committed asset ${image.src}`);
    const { width, height } = readWebpSize(fs.readFileSync(file));
    assert.equal(width, image.width, `${image.src} width`);
    assert.equal(height, image.height, `${image.src} height`);
  }
});

/**
 * Minimal WebP dimension reader — enough for the VP8/VP8L/VP8X chunks sharp
 * writes. Avoids pulling an image library into the test harness (the other
 * `scripts/*.test.mjs` are dependency-free too).
 */
function readWebpSize(buf) {
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF', 'not a RIFF container');
  assert.equal(buf.toString('ascii', 8, 12), 'WEBP', 'not a WebP file');
  const fourcc = buf.toString('ascii', 12, 16);
  if (fourcc === 'VP8X') {
    // 24-bit little-endian canvas size minus one, at offset 24.
    return {
      width: (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1,
      height: (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1,
    };
  }
  if (fourcc === 'VP8 ') {
    // Lossy: 14-bit dimensions after the 3-byte start code at offset 26.
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (fourcc === 'VP8L') {
    // Lossless: 14-bit width-1 and height-1 packed after the 0x2f signature.
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  throw new Error(`unsupported WebP chunk ${fourcc}`);
}
