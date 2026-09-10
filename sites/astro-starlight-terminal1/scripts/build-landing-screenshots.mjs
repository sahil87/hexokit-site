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
 *
 * ZOOM RULE (design review, 2026-09-10): the feature cards render each image in
 * a 16:10 `object-fit: cover` window a few hundred pixels wide, so a full-window
 * capture reads as an unreadable thumbnail. Card crops are therefore TIGHT —
 * roughly 16:10 boxes around the one UI region the card's claim is about, at a
 * scale where the UI text is still legible in the card. Hero and desktop-card
 * frames stay wide; they are rendered large.
 *
 * A source may also be an already-committed asset: `file: '<path relative to
 * the site root>'` instead of `prefix:` (used to re-crop `run-kit-agent-session
 * .webp`, whose original capture is not in the Desktop pool).
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
    // Same source as the hero, a tight 16:10 box on its lower-left: the lower
    // SESSIONS list (riff windows with status dots and PR glyphs), the left edge
    // of the agent pane, and the bottom status strip reading `agt idle 43s` —
    // the "waiting, working, idle" claim in one frame. Earlier boxes (a 0.32
    // sidebar ribbon, then the whole left 60%) were either unreadable or too
    // zoomed out at card size.
    crop: { left: 0, top: 1339, width: 1000, height: 625 },
    maxWidth: 1000,
  },
  {
    out: 'hexokit-board.webp',
    prefix: 'Screenshot 2026-07-08 at 8.25.23',
    // 4832x2292, but the app window occupies only the top ~950 rows; the rest
    // is empty desktop. A 16:10 box on the first two pinned panes (the board's
    // left edge at x≈560) — three panes across made the pane text illegible at
    // card size; two panes side by side still say "board" and stay readable.
    // top: 40 skips the app's light title strip, which read as a white band on
    // the dark card.
    crop: { left: 560, top: 40, width: 1480, height: 925 },
    maxWidth: 1400,
  },
  {
    out: 'hexokit-operator.webp',
    prefix: 'Screenshot 2026-09-07 at 2.06.36',
    // 1618x676 — the operator popover with the tab's Ask box above it. A 16:10
    // box on its left two thirds keeps the OPERATOR header, the question and
    // the answer at a legible size; the right third was empty popover.
    crop: { left: 60, top: 0, width: 1080, height: 675 },
    maxWidth: 1080,
  },
  {
    out: 'hexokit-web-tile.webp',
    prefix: 'Screenshot 2026-08-19 at 9.02.22',
    // 3024x1898 window capture (no menu bar in this one): terminal on the left,
    // the web tile rendering an HTML change plan on the right. A 16:10 box on
    // the tile plus the terminal's right edge — the split is the point, the
    // sidebar is not.
    crop: { left: 1300, top: 100, width: 1700, height: 1062 },
    maxWidth: 1400,
  },
  {
    out: 'hexokit-fleet.webp',
    file: 'public/screenshots/run-kit-agent-session.webp',
    // Re-crop of the already-committed curated capture (1800x1395): the SERVER
    // grid and the SESSIONS list of riff windows with their status dots — the
    // "one command per parallel agent" fleet view. The whole window was too
    // zoomed out at card size.
    crop: { left: 0, top: 260, width: 760, height: 475 },
    maxWidth: 760,
  },
  {
    out: 'hexokit-operator-console.webp',
    prefix: 'Screenshot 2026-09-07 at 7.28.15',
    // 2446x1298: the operator console — a Quake-style drawer — slid down over a
    // dashboard tab, with the tab's Ask box above it. Wide (2.2:1) box for the
    // full-width feature card: top bar, the whole drawer, the tab behind it.
    crop: { left: 0, top: 0, width: 2446, height: 1110 },
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
  const src = entry.file ? path.join(SITE_ROOT, entry.file) : resolveSource(sourceDir, entry.prefix);
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
