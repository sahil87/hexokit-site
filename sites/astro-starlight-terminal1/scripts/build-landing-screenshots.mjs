/**
 * build-landing-screenshots — one-off, UNWIRED generator for the landing page's
 * curated screenshot set (change lvnp). Reads the hand-picked source captures
 * from a macOS screenshot folder, crops each to the region the landing actually
 * shows, and writes `public/screenshots/hexokit-*.webp`.
 *
 * WHY IT IS COMMITTED, AND WHY IT IS NOT WIRED INTO THE BUILD:
 *   The constitution's third content class (Tool-Page Depth, v2.1.3) blesses
 *   site-owned curated screenshots as committed static assets. The OUTPUTS are
 *   what ships; the multi-megabyte source PNGs are deliberately NOT committed.
 *   This script is the reproducibility record — it carries the source map and
 *   the crop boxes so a future editor can re-derive or re-crop any asset without
 *   re-doing the visual triage. It is not referenced from package.json and adds
 *   no build dependency (`sharp` is already a site dependency; Constitution VI),
 *   exactly like `scripts/generate-og-image.mjs`.
 *
 * USAGE (sources must be present on the machine):
 *   cd sites/astro-starlight-terminal1
 *   node scripts/build-landing-screenshots.mjs
 *   node scripts/build-landing-screenshots.mjs --source-dir "/path/to/captures"
 *
 * THE FILENAME GOTCHA — U+202F, NOT A SPACE:
 *   macOS names screenshots `Screenshot <date> at <h.mm.ss> AM.png`, where the
 *   separator before AM/PM is a NARROW NO-BREAK SPACE (U+202F), not U+0020. A
 *   typed-space literal never matches. Sources are therefore resolved by
 *   `readdirSync` + `startsWith` on the unambiguous date/time prefix, which
 *   sidesteps the character entirely. Do not "fix" these prefixes by appending
 *   ` AM`/` PM`.
 *
 * CROP BOXES were chosen by viewing each source and probing row/column
 * brightness profiles for the real window edges (e.g. the macOS menu bar ends
 * at y=65 on a 3024x1964 14" capture, so the window starts at y=66). Each entry
 * documents what its box keeps and why.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(HERE, '..');
const OUT_DIR = path.join(SITE_ROOT, 'public', 'screenshots');

/** Default capture folder (the curly apostrophe U+2019 is part of the real name). */
const DEFAULT_SOURCE_DIR = '/Users/sahil/Desktop/Desktop - Sahil’s MacBook Pro';

/** webp encoder settings — quality 80 is the budget the plan (R11) sizes against. */
const WEBP = { quality: 80, effort: 6 };

/**
 * The curated set. `prefix` resolves one source file; `crop` is a sharp extract
 * box in SOURCE pixels (null = use the whole frame); `maxWidth` is the final
 * downscale ceiling; `out` is the committed filename.
 */
const SOURCES = [
  {
    out: 'hexokit-hero-desktop.webp',
    prefix: 'Screenshot 2026-09-03 at 11.05.54',
    // 3024x1964 native-app capture, two agent panes. Drop the macOS menu bar
    // (rows 0-65) so the hero frame is the app itself, not the desktop.
    crop: { left: 0, top: 66, width: 3024, height: 1898 },
    maxWidth: 2400,
  },
  {
    out: 'hexokit-hero-phone.webp',
    prefix: 'Screenshot 2026-07-15 at 22.43.47',
    // 1206x2622 iPhone capture of the sidebar (BOARDS/SERVER/SESSIONS/PANE).
    // Kept whole — the iOS status bar is the point: this is a real phone.
    crop: null,
    maxWidth: 800,
  },
  {
    out: 'hexokit-phone-terminal.webp',
    prefix: 'Screenshot 2026-07-15 at 22.41.22',
    // 1206x2622 iPhone capture of a live pane plus the on-screen key bar —
    // the "tap one on your phone, type" card. Kept whole for the same reason.
    crop: null,
    maxWidth: 800,
  },
  {
    out: 'hexokit-agent-state.webp',
    prefix: 'Screenshot 2026-09-03 at 11.05.54',
    // Same source as the hero, cropped to the left ~60%: the SESSIONS list of
    // riff windows with their status dots, ONE agent pane beside it, and the
    // bottom status strip reading `agt idle 43s`. This is the "agents are just
    // panes" card, so it must show both halves of that claim — a sidebar-only
    // crop (tried first) was an unreadable 0.32-aspect ribbon that showed the
    // list but not the pane.
    crop: { left: 0, top: 66, width: 1800, height: 1898 },
    maxWidth: 1400,
  },
  {
    out: 'hexokit-board.webp',
    prefix: 'Screenshot 2026-07-08 at 8.25.23',
    // 4832x2292, but the app window occupies only the top ~940 rows; the rest
    // is empty desktop, and a foreign window's bright edge intrudes from
    // x>=4810. Crop to the board itself — the `Board: bb` header plus the three
    // pinned panes — dropping the (empty) left sidebar at x<540, which only
    // stretched the frame wider and shrank the pane text below legibility.
    crop: { left: 540, top: 0, width: 2960, height: 940 },
    maxWidth: 1400,
  },
  {
    out: 'hexokit-operator.webp',
    prefix: 'Screenshot 2026-09-07 at 2.06.36',
    // 1618x676 — already a clean crop of the operator popover. Kept whole.
    crop: null,
    maxWidth: 1600,
  },
  {
    out: 'hexokit-web-tile.webp',
    prefix: 'Screenshot 2026-08-19 at 9.02.22',
    // 3024x1898 window capture (no menu bar in this one): terminal on the left,
    // the web tile rendering an HTML change plan on the right. Kept whole.
    crop: null,
    maxWidth: 1600,
  },
  {
    out: 'hexokit-desktop-app.webp',
    prefix: 'Screenshot 2026-08-15 at 12.03.09',
    // 3024x1964 native app. The macOS menu bar is DELIBERATELY KEPT here — it
    // is the evidence that the desktop card is describing a real native shell.
    crop: null,
    maxWidth: 1600,
  },
];

/**
 * Resolve one source by date/time prefix. Never build the filename by hand:
 * the U+202F before AM/PM makes a typed literal unmatchable (see header).
 */
function resolveSource(sourceDir, prefix) {
  const matches = fs
    .readdirSync(sourceDir)
    .filter((name) => name.startsWith(prefix) && name.toLowerCase().endsWith('.png'))
    .sort();
  if (matches.length === 0) {
    throw new Error(`No source found in ${sourceDir} for prefix "${prefix}"`);
  }
  return path.join(sourceDir, matches[0]);
}

async function buildOne(sourceDir, entry) {
  const src = resolveSource(sourceDir, entry.prefix);
  let pipeline = sharp(src);
  const meta = await pipeline.metadata();

  if (entry.crop) {
    const { left, top, width, height } = entry.crop;
    if (left + width > meta.width || top + height > meta.height) {
      throw new Error(
        `Crop box for ${entry.out} exceeds source ${meta.width}x${meta.height}: ` +
          `${left},${top} ${width}x${height}`,
      );
    }
    pipeline = pipeline.extract({ left, top, width, height });
  }

  // `withoutEnlargement` keeps a source narrower than the ceiling at its own
  // size; `.rotate()` applies (and strips) any EXIF orientation. Metadata is
  // dropped by default — sharp only copies it when asked.
  const outPath = path.join(OUT_DIR, entry.out);
  const info = await pipeline
    .rotate()
    .resize({ width: entry.maxWidth, withoutEnlargement: true })
    .webp(WEBP)
    .toFile(outPath);

  return {
    out: entry.out,
    source: path.basename(src),
    dimensions: `${info.width}x${info.height}`,
    kb: Math.round(info.size / 1024),
  };
}

async function main() {
  const flagIndex = process.argv.indexOf('--source-dir');
  const sourceDir = flagIndex !== -1 ? process.argv[flagIndex + 1] : DEFAULT_SOURCE_DIR;

  if (!fs.existsSync(sourceDir)) {
    throw new Error(
      `Source directory not found: ${sourceDir}\n` +
        'Pass --source-dir "/path/to/captures" if the originals live elsewhere.',
    );
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const results = [];
  for (const entry of SOURCES) {
    results.push(await buildOne(sourceDir, entry));
  }

  for (const r of results) {
    console.log(`${r.out.padEnd(30)} ${r.dimensions.padEnd(12)} ${String(r.kb).padStart(5)} KB   ← ${r.source}`);
  }
}

await main();
