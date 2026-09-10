#!/usr/bin/env node
/**
 * convert-screenshots.mjs — ONE-OFF converter for the HexoKit landing page's
 * screenshot assets (change 260910-jwhx-hexokit-landing).
 *
 * NOT part of the site build (deliberately absent from package.json — same
 * unwired-generator model as generate-og-image.mjs). The outputs are COMMITTED
 * static assets under public/screenshots/ (the constitution's third permitted
 * content class: site-owned curated screenshots, alt text mandatory). Re-run
 * manually only when re-capturing:
 *
 *   node scripts/convert-screenshots.mjs
 *
 * The hexokit-operator.webp source is a local capture whose default path is
 * machine-specific; set HEXOKIT_OPERATOR_SRC to override it elsewhere.
 *
 * Sources: the run-kit README's curated GitHub user-attachment PNGs are fetched
 * ONCE and committed as site-owned assets (never hot-linked), plus one local
 * run-kit capture and one crop of the existing console screenshot. Every
 * output is resized to the manifest's maxWidth, encoded as WebP quality 82,
 * and must land under 250 KB.
 */
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(siteRoot, 'public', 'screenshots');

const QUALITY = 82;
const MAX_BYTES = 250 * 1024;

// { out, src, maxWidth, extract? } — src is an https URL or an absolute/local path;
// extract is a sharp().extract() box applied BEFORE resizing.
const SOURCES = [
  {
    out: 'hexokit-phone-terminal.webp',
    src: 'https://github.com/user-attachments/assets/f07a0166-7674-41fe-8376-ef34fd2a1afb',
    maxWidth: 900,
  },
  {
    out: 'hexokit-phone-dashboard.webp',
    src: 'https://github.com/user-attachments/assets/35645b54-d6d4-463f-8dc3-9d44e4c76dd5',
    maxWidth: 900,
  },
  {
    out: 'hexokit-phone-menu.webp',
    src: 'https://github.com/user-attachments/assets/1326355e-6031-4620-9ce9-355b82bf8313',
    maxWidth: 900,
  },
  {
    out: 'hexokit-operator.webp',
    // Local capture — override with HEXOKIT_OPERATOR_SRC on another machine.
    src: process.env.HEXOKIT_OPERATOR_SRC ?? '/home/sahil/code/sahil87/run-kit/.uploads/260907140652-image.png',
    maxWidth: 1600,
  },
  {
    // Left sidebar of the existing console capture (servers/sessions/status dots).
    out: 'hexokit-fleet-sidebar.webp',
    src: join(outDir, 'run-kit-console.webp'),
    maxWidth: 900,
    extract: { left: 0, top: 90, width: 370, height: 910 },
  },
];

async function loadSource(src) {
  if (src.startsWith('https://') || src.startsWith('http://')) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`fetch failed for ${src}: HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  if (!existsSync(src)) throw new Error(`missing local source: ${src}`);
  return readFileSync(src);
}

async function convert({ out, src, maxWidth, extract }) {
  const input = await loadSource(src);
  let pipeline = sharp(input);
  if (extract) pipeline = pipeline.extract(extract);
  pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  const outPath = join(outDir, out);
  await pipeline.webp({ quality: QUALITY }).toFile(outPath);
  const bytes = statSync(outPath).size;
  const meta = await sharp(outPath).metadata();
  console.log(`wrote ${out}  ${meta.width}x${meta.height}  ${(bytes / 1024).toFixed(1)} KB`);
  if (bytes >= MAX_BYTES) {
    throw new Error(`${out} is ${(bytes / 1024).toFixed(1)} KB — over the 250 KB budget`);
  }
}

mkdirSync(outDir, { recursive: true });
for (const entry of SOURCES) {
  try {
    await convert(entry);
  } catch (err) {
    console.error(`FAILED ${entry.out}: ${err.message}`);
    process.exitCode = 1;
  }
}
if (process.exitCode) process.exit(process.exitCode);
