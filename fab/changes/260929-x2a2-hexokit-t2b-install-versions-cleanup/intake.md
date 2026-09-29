# Intake: HexoKit T2(b) — install stale-shll guard removal + `hexokit` versions.json row

**Change**: 260929-x2a2-hexokit-t2b-install-versions-cleanup
**Created**: 2026-09-29

## Origin

> Phase 4 of the HexoKit rebrand, plan row T2 step (b) (run-kit repo `fab/plans/sahil/26-09-12-hexokit-rebrand-remaining.md`). T2(a) just merged and released: shll v0.1.36 now runs `brew upgrade sahil87/tap/shll` before `shll install` when shll is already installed, so a stale shll can no longer drive an install and reject the `hexokit` argument. (1) Find the stale-shll guard in the install epilogue and REMOVE it. (2) In the same change, add a `hexokit` key to `versions.json` while KEEPING the `run-kit` key (do not remove or rename it) — read how the manifest is built (`help/<slug>.json` + `versions-policy.json`) before editing.

One-shot delegated task from the orchestrating session. Plan row T2 text: "**(b) hexokit-site, after (a) is released:** drop the stale-shll guard from the install epilogue, and in the same change add a `hexokit` key to `versions.json` while **keeping the `run-kit` key**".

Verified before intake:
- shll **v0.1.36** is released (2026-09-29T04:59Z). The upgrade step landed in `sahil87/shll` `scripts/install.sh` at commit **`a8f11e2`** ("fix: install.sh upgrades an already-installed shll before handing off (#105)").
- `deploy.yml` fetches `https://raw.githubusercontent.com/sahil87/shll/main/scripts/install.sh` — so the served `/install` already contains the upgrade step; the site guard is now dead weight.
- Current upstream `install.sh` still ends in `main "$@"` (compose anchor intact).
- The upgrade is gated upstream on `brew list --versions sahil87/tap/shll` — a non-brew shll on PATH (a `just install` dev build) is left alone. Accepted: dev builds are the maintainer's own and current.

## Why

1. **Problem**: R1(d) (change `260928-u7sp`) added a transitional compatibility guard to `sites/astro-starlight-terminal1/scripts/install-epilogue.sh`: on the no-arg path, if `shll` is on PATH and `shll install --dry-run hexokit` fails (shll ≤ v0.1.33), it passes `run-kit` instead of `hexokit`. Its own design decision says it "is droppable once the upstream shll bootstrap upgrades an installed shll before running `shll install`". That happened in T2(a). The guard now costs an extra `shll` invocation on every re-run and keeps the legacy `run-kit` name in the served installer.
2. **Versions manifest**: `/versions.json` keys the product row `run-kit` only (policy `"run-kit": { "notify": "minor", "envelope": "hexokit", "formula": "hexokit" }`). shll ≥ v0.1.34's roster names the product `hexokit` and tries `hexokit` first, then legacy names `rk`, `run-kit`; run-kit's `updatecheck.go` matches `shll check-updates --json` rows by self-name `hexokit` with legacy fallback `rk`, `run-kit` (hexokit PR #1061, v3.20.23). The present-truth key should be available as `hexokit`. But shll ≤ v0.1.33 (and older run-kit binaries that pair with it) only look up the exact key `run-kit`, so the `run-kit` row MUST stay — both keys coexist.
3. **If not done**: the plan row T2 stays open; the site keeps a dead probe and the manifest keeps advertising the product only under its legacy name.
4. **Approach**: pure data/script edits — the manifest builder already supports this without code changes (policy keys are the roster; `envelope`/`formula` default to the key).

## What Changes

### 1. Drop the stale-shll guard — `sites/astro-starlight-terminal1/scripts/install-epilogue.sh`

Current no-arg block:

```sh
hexokit_default=0
if [ "$#" -eq 0 ]; then
    hexokit_default=1
    # shll <= v0.1.33 predates the roster rename ... (5-line comment)
    if command -v shll >/dev/null 2>&1 && ! shll install --dry-run hexokit >/dev/null 2>&1; then
        set -- run-kit
    else
        set -- hexokit
    fi
fi
```

Becomes:

```sh
hexokit_default=0
if [ "$#" -eq 0 ]; then
    hexokit_default=1
    set -- hexokit
fi
```

Optionally a one-line comment noting that the upstream bootstrap upgrades an installed (brew) shll before `shll install`, so `hexokit` is always accepted. Rest of the epilogue (subshell `( main "$@" )`, hint) unchanged.

### 2. Tests — `sites/astro-starlight-terminal1/scripts/compose-install.test.mjs`

- Replace the test `default path: a stale shll that rejects hexokit falls back to run-kit` with one pinning the new behaviour: with a stub shll on PATH that would reject `hexokit` (the existing `'reject'` stub), the epilogue still passes `hexokit` (`main:hexokit` in stdout), prints the hint, and **never invokes shll** (make the stub record invocations — e.g. write a marker file or exit non-zero and assert no side effect — so the test proves no probe runs). Adjust the `shllStubDir` / `envWithShll` helper comments accordingly (they describe the probe). Remove the now-redundant `'accept'` case if it no longer distinguishes anything, or keep it — implementer's call; simplest is: `absent` → hexokit + hint; `installed (any)` → hexokit, shll not invoked.
- Refresh the frozen fixture `scripts/fixtures/install-upstream.sh` to a byte-for-byte copy of `sahil87/shll` `scripts/install.sh` at commit `a8f11e2` (the T2(a) upgrade step), so the fixture documents the upstream behaviour the guard removal relies on. Fetch via `gh api repos/sahil87/shll/contents/scripts/install.sh?ref=a8f11e2 --jq .content | base64 -d`. Confirm its last non-empty line is `main "$@"` and the "composes the frozen upstream" + `sh -n` tests still pass. Update any comment in the test file naming the old fixture commit (`8f5b250`).

### 3. `compose-install.mjs` header comment

Lines ~9–11 describe "no args defaults to `hexokit` (shll + HexoKit — with a fallback to the legacy `run-kit` target when an already-installed shll predates the roster rename and rejects `hexokit`)". Drop the fallback clause.

### 4. `hexokit` row in `versions-policy.json` (repo root)

Add, keeping `run-kit` unchanged:

```json
{
  "run-kit": { "notify": "minor", "envelope": "hexokit", "formula": "hexokit" },
  "hexokit": { "notify": "minor" },
  "fab-kit": { "notify": "minor" },
  ...
}
```

`envelope` and `formula` default to the key → reads `help/hexokit.json`, formula `hexokit`. Built output gains `"hexokit": { "latest": "<same as run-kit>", "notify": "minor", "formula": "hexokit" }` alongside the identical `run-kit` row. No change to `versions-manifest.ts` logic (`buildManifest` iterates policy keys; two keys reading one envelope already works).

### 5. `versions-manifest.ts` comment + test

- Update the `PolicyEntrySchema` doc comment (lines ~44–57): the product is published under both keys — `hexokit` (present-truth, matched first by shll ≥ v0.1.34) and `run-kit` (kept for shll ≤ v0.1.33's exact-key lookup). Keep the note that run-kit's own update checker reads `shll check-updates --json`, not this manifest.
- Add a test to `scripts/versions-manifest.test.mjs`: policy `{ 'run-kit': { notify: 'minor', envelope: 'hexokit', formula: 'hexokit' }, hexokit: { notify: 'minor' } }` with one `help/hexokit.json` envelope (e.g. `v3.20.23`) → both `tools['run-kit']` and `tools.hexokit` equal `{ latest: '3.20.23', notify: 'minor', formula: 'hexokit' }`. Optionally a test that reads the real repo-root `versions-policy.json` and asserts both keys exist with `run-kit` unchanged (guards against a future accidental removal) — include it if the test file's existing structure makes the repo root easy to reach.
- The existing envelope-override test (asserts no `hexokit` row when only `run-kit` with `envelope: 'hexokit'` is in the policy) stays valid — it tests the override mechanics with a policy lacking a `hexokit` key.

### 6. Verify

`just validate`, `just test`, `just build`; inspect `sites/astro-starlight-terminal1/dist/versions.json` for both rows and `dist`-side nothing else. Composed installer check: `sh -n` passes on fixture composition.

## Affected Memory

- `build-deploy/install-endpoint`: (modify) epilogue requirement — no-arg path always `set -- hexokit`, no probe; served-behaviour table row drops the `run-kit` fallback; prose "`run-kit` appears only on the stale-shll fallback path" removed; the "Probe an installed shll…" design decision replaced/rewritten as present truth (the upstream bootstrap upgrades a brew-installed shll before `shll install`, T2(a) shll `a8f11e2`/v0.1.36, so the default needs no probe; rejected: keeping the probe); fixture requirement names the new fixture commit `a8f11e2`; description frontmatter + `build-deploy/index.md` row if they mention the guard.
- `conventions/versions-manifest`: (modify) the product is advertised under two keys (`hexokit` and `run-kit`, identical rows from `help/hexokit.json`); policy current-values paragraph; envelope-override scenario context; Consumer section and the "Manifest key stays…" design decision updated (add `hexokit` alongside rather than rename; `run-kit` stays while shll ≤ v0.1.33 installs remain); description frontmatter + `conventions/index.md` row if affected.

Specs (human-curated, but this is a contract change): `docs/specs/versions-manifest-contract.md` — §1 example gains a `hexokit` row, §2 keying paragraph + envelope-override scenario note that the live policy also carries a `hexokit` key, §Policy file example + bullets, Changelog entry `2026-09-29 (change 260929-x2a2)`.

## Impact

- `sites/astro-starlight-terminal1/scripts/install-epilogue.sh`, `compose-install.mjs` (comment), `compose-install.test.mjs`, `fixtures/install-upstream.sh`
- `versions-policy.json`, `src/lib/versions-manifest.ts` (comment), `scripts/versions-manifest.test.mjs`
- docs above
- Deploy: merging to main triggers `deploy.yml` (`on: push`), which rebuilds `/install` and `/versions.json`; the shll.ai byte-copies follow from the same deploy. No workflow edits.
- Consumers: shll ≥ v0.1.34 now matches the `hexokit` row; shll ≤ v0.1.33 keeps matching `run-kit`. Rows are identical, so no behaviour difference.

## Open Questions

(none)

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Remove the probe entirely; no-arg path always passes `hexokit` | Plan row T2(b) + user instruction; upstream install.sh at `a8f11e2` upgrades a brew shll first; deploy fetches shll `main` | S:95 R:85 A:95 D:95 |
| 2 | Certain | Keep the `run-kit` policy row byte-identical; add `hexokit` alongside | User explicit: do not remove or rename; shll ≤ v0.1.33 exact-key lookup | S:98 R:90 A:95 D:98 |
| 3 | Confident | `hexokit` entry is `{ "notify": "minor" }` relying on key defaults for envelope/formula | Defaults yield `help/hexokit.json` + formula `hexokit`, identical to the run-kit row; minimal data | S:80 R:95 A:90 D:80 |
| 4 | Confident | Non-brew stale shll on PATH is not covered after guard removal — accepted | Upstream gate is brew-only by design (dev builds); maintainer-only case | S:75 R:80 A:80 D:75 |
| 5 | Confident | Refresh the frozen upstream fixture to shll `a8f11e2` in the same change | Documents the upstream behaviour the removal depends on; tests stay offline | S:70 R:95 A:80 D:70 |
| 6 | Confident | Docs describe run-kit updatecheck as matching `shll check-updates --json` rows (self-name `hexokit`, legacy `rk`/`run-kit`), not reading the manifest directly | Verified in hexokit main `app/backend/internal/updatecheck/updatecheck.go` (`selfToolName = "hexokit"`, `selfToolLegacyNames`) | S:85 R:90 A:85 D:85 |

6 assumptions (2 certain, 4 confident, 0 tentative, 0 unresolved).
