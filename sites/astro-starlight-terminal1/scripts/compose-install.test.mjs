/**
 * Unit test for the install-script composer (change d11j, D10). Run with the
 * site's pnpm-installed Node toolchain:
 *
 *   cd sites/astro-starlight-terminal1
 *   node --test scripts/compose-install.test.mjs
 *
 * Pins `composeInstall` against a FROZEN byte-for-byte copy of the canonical
 * upstream script — `scripts/fixtures/install-upstream.sh` (sahil87/shll
 * `scripts/install.sh` @ 8f5b250, 2026-09-11; the frozen-behaviour-specimen
 * convention this suite already uses). No test fetches the network; the
 * deploy step (deploy.yml's curl + this composer failing loudly) is the live
 * gate for upstream drift.
 *
 * Behavioural cases compose minimal stub scripts with the real epilogue and
 * run them through `sh` from the PATH; when `sh` is unavailable they
 * `t.skip()` instead of failing.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { composeInstall } from './compose-install.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(scriptDir, 'fixtures', 'install-upstream.sh'), 'utf8');
const epilogue = readFileSync(join(scriptDir, 'install-epilogue.sh'), 'utf8');
const composerPath = join(scriptDir, 'compose-install.mjs');

const SH_AVAILABLE = spawnSync('sh', ['-c', 'true']).status === 0;

function writeTmp(name, content) {
  const dir = mkdtempSync(join(tmpdir(), 'compose-install-'));
  const path = join(dir, name);
  writeFileSync(path, content, 'utf8');
  return path;
}

function composeStub(body) {
  return composeInstall(`#!/bin/sh\nset -eu\n${body}\nmain "$@"\n`, epilogue);
}

test('composes the frozen upstream: verbatim prefix, epilogue tail, one subshell anchor', () => {
  const composed = composeInstall(fixture, epilogue);

  const anchorOffset = fixture.lastIndexOf('main "$@"');
  assert.ok(composed.startsWith(fixture.slice(0, anchorOffset)), 'upstream prefix mutated');
  assert.ok(composed.endsWith(epilogue), 'does not end with the epilogue');

  const subshellCount = composed.split('( main "$@" )').length - 1;
  assert.equal(subshellCount, 1, 'expected exactly one `( main "$@" )`');

  const bareAnchor = composed.split('\n').filter((line) => line.trimEnd() === 'main "$@"');
  assert.equal(bareAnchor.length, 0, `bare anchor line survived: ${bareAnchor}`);
});

test('sh -n parses the composed real fixture (valid POSIX sh)', (t) => {
  if (!SH_AVAILABLE) {
    t.skip('sh is not on PATH');
    return;
  }
  const composed = writeTmp('install', composeInstall(fixture, epilogue));
  const result = spawnSync('sh', ['-n', composed], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('default path: no args installs run-kit and prints the toolkit hint', (t) => {
  if (!SH_AVAILABLE) {
    t.skip('sh is not on PATH');
    return;
  }
  const composed = writeTmp('install', composeStub("main() { printf 'main:%s\\n' \"$*\"; }"));
  const result = spawnSync('sh', [composed], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('main:run-kit'), `no default in stdout: ${result.stdout}`);
  assert.ok(result.stdout.includes('shll install'), `no hint in stdout: ${result.stdout}`);
  assert.ok(result.stdout.includes('https://hexokit.com/toolkit/'), `no hint URL: ${result.stdout}`);
});

test('explicit args pass through verbatim and print no hint', (t) => {
  if (!SH_AVAILABLE) {
    t.skip('sh is not on PATH');
    return;
  }
  const composed = writeTmp('install', composeStub("main() { printf 'main:%s\\n' \"$*\"; }"));
  const result = spawnSync('sh', [composed, 'fab-kit', 'wt'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('main:fab-kit wt'), `args not passed through: ${result.stdout}`);
  assert.ok(!result.stdout.includes('one command away'), `hint leaked: ${result.stdout}`);
});

test('a failing main aborts with its own exit status and prints no hint', (t) => {
  if (!SH_AVAILABLE) {
    t.skip('sh is not on PATH');
    return;
  }
  const composed = writeTmp('install', composeStub('main() { exit 7; }'));
  const result = spawnSync('sh', [composed], { encoding: 'utf8' });
  assert.equal(result.status, 7, `expected exit 7: ${result.stderr}`);
  assert.ok(!result.stdout.includes('one command away'), `hint leaked: ${result.stdout}`);
});

test('missing anchor (upstream last line changed) throws, quoting the line', () => {
  for (const source of [
    '#!/bin/sh\nmain\n',
    '#!/bin/sh\nrun_main "$@"\n',
  ]) {
    assert.throws(
      () => composeInstall(source, epilogue),
      (err) => {
        assert.ok(err.message.includes('main "$@"'), err.message);
        assert.ok(err.message.includes('compose-install:'), err.message);
        return true;
      },
    );
  }
  assert.throws(
    () => composeInstall('#!/bin/sh\nrun_main "$@"\n', epilogue),
    /run_main/,
  );
});

test('HTML body or empty input throws the not-a-script error', () => {
  for (const source of [
    '<!DOCTYPE html>\n<html><body>404</body></html>\n',
    '   <html></html>',
    '',
    '   \n  \n',
  ]) {
    assert.throws(
      () => composeInstall(source, epilogue),
      /does not look like the shll install script/,
    );
  }
});

test('CLI rewrites <path> in place and exits 0', () => {
  const target = writeTmp('install', fixture);
  const result = spawnSync('node', [composerPath, target], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const composed = readFileSync(target, 'utf8');
  assert.ok(composed.endsWith(epilogue), 'composed file missing the epilogue');
});

test('CLI on an HTML body exits 1 with a compose-install: stderr line, file unchanged', () => {
  const html = '<!DOCTYPE html>\n<html><body>404</body></html>\n';
  const target = writeTmp('install', html);
  const result = spawnSync('node', [composerPath, target], { encoding: 'utf8' });
  assert.equal(result.status, 1, `expected exit 1: ${result.stderr}`);
  assert.ok(result.stderr.includes('compose-install:'), result.stderr);
  assert.equal(readFileSync(target, 'utf8'), html, 'HTML file was rewritten');
});

test('CLI with no argument prints usage and exits 2', () => {
  const result = spawnSync('node', [composerPath], { encoding: 'utf8' });
  assert.equal(result.status, 2, `expected exit 2: ${result.stderr}`);
  assert.ok(result.stderr.includes('usage:'), result.stderr);
});
