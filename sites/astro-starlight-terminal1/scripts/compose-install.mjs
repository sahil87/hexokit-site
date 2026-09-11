/**
 * compose-install — composes the product-first default onto the fetched shll
 * install script for hexokit.com/install (change d11j, D10).
 *
 * The canonical installer lives in sahil87/shll (`scripts/install.sh`) and is
 * fetched verbatim at deploy time into `public/install` (see deploy.yml). This
 * script then rewrites that copy's last line — the upstream's
 * truncated-download anchor, `main "$@"` — with the site-owned epilogue
 * (`scripts/install-epilogue.sh`): no args defaults to `run-kit` (shll +
 * HexoKit), `main` runs in a subshell so the toolkit hint can print after
 * `main`'s `exec shll update`, and tool arguments pass through unchanged.
 *
 * The anchor check is deliberately strict: if the upstream's last non-empty
 * line is not exactly `main "$@"`, or the fetched file looks like an HTML body
 * (a Pages 404 saved by a mis-fetch), composition THROWS — a failed deploy is
 * better than a served installer with two `main` calls or none.
 *
 * Usage (deploy.yml):
 *   node scripts/compose-install.mjs <path>   # rewrites <path> in place
 *
 * Exported for tests: `composeInstall(source, epilogue)` is pure — importing
 * this module runs nothing (the CLI body is behind the module-is-main guard).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));

const LOG_PREFIX = 'compose-install:';
const ANCHOR = 'main "$@"';
const EPILOGUE_PATH = join(scriptDir, 'install-epilogue.sh');

/**
 * Return `source` with its last non-empty line replaced by `epilogue`; every
 * other byte is untouched. Throws on empty/HTML input or a changed anchor.
 */
export function composeInstall(source, epilogue) {
  const trimmedStart = source.trimStart();
  if (trimmedStart === '' || trimmedStart.startsWith('<')) {
    throw new Error(`${LOG_PREFIX} public/install does not look like the shll install script`);
  }

  const lines = source.split('\n');
  let anchorIndex = -1;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (lines[i].trim() !== '') {
      anchorIndex = i;
      break;
    }
  }
  const lastLine = lines[anchorIndex].trimEnd();
  if (lastLine !== ANCHOR) {
    throw new Error(
      `${LOG_PREFIX} expected the upstream script to end with 'main "$@"' (its truncated-download anchor) — got: ${JSON.stringify(lines[anchorIndex])}`,
    );
  }

  lines[anchorIndex] = epilogue.endsWith('\n') ? epilogue.slice(0, -1) : epilogue;
  return lines.join('\n');
}

function usage() {
  console.error('usage: node scripts/compose-install.mjs <path>');
  process.exit(2);
}

async function main() {
  const target = process.argv[2];
  if (!target) usage();

  try {
    const [source, epilogue] = await Promise.all([
      readFile(target, 'utf8'),
      readFile(EPILOGUE_PATH, 'utf8'),
    ]);
    await writeFile(target, composeInstall(source, epilogue), 'utf8');
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(detail.startsWith(LOG_PREFIX) ? detail : `${LOG_PREFIX} ${detail}`);
    process.exit(1);
  }
}

// Module-is-main guard: importing this module (from the test suite) must not
// run the CLI.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
