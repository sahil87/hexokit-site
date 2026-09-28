# Intake: HexoKit R1(d) — site install surfaces flip run-kit → hexokit

**Change**: 260928-u7sp-hexokit-r1d-install-surfaces
**Created**: 2026-09-28

## Origin

> Phase 3 of the HexoKit rebrand, plan row R1 step (d) (run-kit repo, `fab/plans/sahil/26-09-12-hexokit-rebrand-remaining.md`). R1(a)/(b)/(c) are merged and released: homebrew-tap has `Formula/hexokit.rb` (installs `hexokit` + `rk`/`xk`/`run-kit` symlinks; `formula_renames.json` maps `run-kit → hexokit`), run-kit release v3.20.22 publishes it, and shll v0.1.34's roster tracks the tool as `hexokit` with `rk`/`run-kit` as legacy aliases. R1(d): landing shows `brew install sahil87/tap/hexokit`; install-script default → `hexokit`; sweep other primary-name `run-kit` references to `hexokit`, keeping alias/legacy documentation correct. Do NOT touch R2 (GitHub repo slug `sahil87/run-kit` — not renamed yet).

One-shot, operator-dispatched. Pre-intake investigation in the conversation established the facts below.

## Why

The formula, command, and shll roster already say `hexokit`; the site is the last R1 surface still naming `run-kit` as the installed tool. Leaving it means the site's installer, puller, docs copy, and landing terminal disagree with what `brew`/`shll` now print, and the refresh-help puller keeps installing through the formula rename map and invoking the hidden `run-kit` alias (kept one release only — it will stop working when run-kit drops it).

## What Changes

Findings already verified (do not re-derive):

- **Landing brew line is already done**: `src/lib/landing-data.ts:130` reads `brew install sahil87/tap/hexokit` (since commit `293e76b`). No change there.
- **The install default lives in `sites/astro-starlight-terminal1/scripts/install-epilogue.sh`** (`set -- run-kit` when no args), composed onto the fetched shll `scripts/install.sh` by `scripts/compose-install.mjs` at deploy. The upstream passes args verbatim to `shll install "$@"` and does NOT upgrade an already-installed shll first.
- **Stale-shll hazard (reproduced on this box, shll v0.1.33)**: `shll install --dry-run hexokit` → `shll install: unknown target "hexokit" (valid targets: run-kit, rk-desktop, …)`, exit 1; `shll install --dry-run run-kit` → exit 0 (~0.4s). shll ≤ v0.1.33's alias map is only `rk → run-kit`. shll v0.1.34 accepts `hexokit` and maps `rk`/`run-kit` → `hexokit`. So a plain `set -- hexokit` would abort `curl … | sh` re-runs for every existing user whose shll predates v0.1.34.
- **versions.json consumers key on `run-kit`**: run-kit's `internal/updatecheck` (`runKitTool = "run-kit"`) and shll ≤ v0.1.33 look up the `run-kit` key; the manifest `formula` field is informational to both (shll uses its own roster formula).

### 1. Install script default (`scripts/install-epilogue.sh`)

Default to `hexokit`, with a compatibility guard:

```sh
hexokit_default=0
if [ "$#" -eq 0 ]; then
    hexokit_default=1
    # shll <= v0.1.33 predates the roster rename and rejects `hexokit` as an unknown
    # target; the bootstrap does not upgrade an installed shll before `shll install`,
    # so hand an old shll the legacy name it knows. A fresh box gets the current shll.
    if command -v shll >/dev/null 2>&1 && ! shll install --dry-run hexokit >/dev/null 2>&1; then
        set -- run-kit
    else
        set -- hexokit
    fi
fi
```

(Exact shape is the implementer's call; the behavior above is the contract.) Update the header comment (drop "roster/formula name `run-kit` until the formula rename"), `compose-install.mjs`'s doc comment, and extend `compose-install.test.mjs` so the composed epilogue is asserted to default to `hexokit` and carry the stale-shll fallback. The post-install hint ("HexoKit is installed (run it: rk)") stays.

### 2. Tool roster + help puller

- `src/lib/tool-roster.mjs`: hexokit row `formula: 'run-kit', binary: 'run-kit'` → `'hexokit'`; **`repo: 'run-kit'` stays** (R2). Fix the header comment ("Source-side names (repo/formula/binary) stay `run-kit`" → only the repo does, until R2).
- `.github/workflows/refresh-help.yml`: triple `"hexokit:run-kit:run-kit"` → `"hexokit:hexokit:hexokit"`; update the mapping comment block.
- `.github/workflows/refresh-readme.yml`: the `"hexokit:run-kit"` pairs are slug:**repo** — keep; only fix comments that claim the formula/binary are `run-kit`.
- Any test asserting the roster row (e.g. a tool-roster test) updated accordingly.

### 3. versions manifest

- `versions-policy.json`: KEEP the `run-kit` key and its `envelope: "hexokit"`; add `"formula": "hexokit"`. Served `versions.json` then reads `"run-kit": {latest, notify, formula: "hexokit"}`. Flipping the key needs run-kit's updatecheck to dual-read first — out of scope, recorded as a follow-up.
- `src/lib/versions-manifest.ts` comments: note the key stays `run-kit` for consumer compatibility; formula override is now in use. Update any manifest test that snapshots the row.

### 4. Docs copy (hand-authored pages under `src/content/docs/`)

Per D2, examples use `rk`; the product is "HexoKit"; the roster/install name is `hexokit`.

- `toolkit/install.md`: `shll install run-kit  # install HexoKit (roster/formula name: run-kit)` → `shll install hexokit  # install HexoKit`; `shll update run-kit` → `shll update hexokit`; "run-kit dashboard state" / "## Optional: run-kit agent state" → HexoKit.
- `desktop.md`: `run-kit desktop install|update|status` → `rk desktop …`.
- `toolkit/daily-flow.md`, `toolkit/new-change.md`: `run-kit riff` → `rk riff`; prose "`run-kit`'s browser dashboard", "Without `run-kit`", "`run-kit` is convenience" → HexoKit.
- Leave any passage that specifically documents `rk`/`xk`/`run-kit` as aliases/legacy names intact.

### 5. Landing interactive terminal (`src/components/TerminalPrompt.astro`)

The product's card is keyed `run-kit` with `rk` and `hexokit` as aliases, and copy asserts "hexokit is the site identity; run-kit is the binary". Relabel so **`hexokit` is the primary name**:

- Card/tool key `hexokit` (the TOOLS list, taglines, cheat-sheet `display: 'hexokit · rk'`, demo lines like `[5/7] hexokit ✓ linked`, the roster line `idea · hop · fab-kit · wt · hexokit · tu · shll`, `run-kit dashboard …` demo copy → HexoKit/hexokit).
- `rk`, `xk`, and `run-kit` resolve as aliases to the same card; alias help strings say e.g. "rk — hexokit's card, by its short alias (alias of hexokit)"; `cd hexokit`/`cd run-kit`/`cd rk` keep navigating to `/docs/`.
- The `toolHelp['run-kit'] = toolHelp.hexokit` shim is no longer needed if nothing keys on `run-kit`; keep alias resolution working.
- Update `sites/astro-starlight-terminal1/docs/memory/site/homepage-terminal.md` if it documents these keys.

### 6. Stale comments

Fix only comments whose claim is now false — ones saying the **binary/formula** "stays `run-kit` until the source-side rename" (TerminalPrompt, CommandReference, ReadmeSlice, llms.ts, terminal-toolcard.ts, schemas.ts examples, extract-readme-cli.mjs example). Comments saying the **repo** stays `run-kit` (GithubButton, Head, github-stars, landing-data) remain true — leave them.

### Out of scope

Repo slug / `github.com/sahil87/run-kit` URLs (R2); screenshot asset filenames (`run-kit-*.webp`); legacy `/run-kit/` redirect tables and `legacyMounts`; `sites/_playground/`; puller-managed `content/` and `help/` (never hand-edit); test fixtures that snapshot historical upstream output (`scripts/fixtures/*`, `run-kit-riff.txt`); `fab/` archives and dated history (D11); code comments that cite `run-kit riff --layout` as a historical example of a cobra layout are fine either way — prefer `rk riff` only where touched anyway.

## Affected Memory

- `build-deploy/install-endpoint`: (modify) no-arg default is `hexokit`, with the stale-shll `run-kit` fallback and why
- `conventions/tool-roster`: (modify) hexokit row formula/binary are `hexokit`; only repo stays `run-kit` until R2
- `conventions/help-collection`: (modify) refresh-help triple `hexokit:hexokit:hexokit`
- `conventions/versions-manifest`: (modify) `run-kit` key kept for consumer compatibility; `formula: hexokit` override
- `site/homepage-terminal` (site-level memory under `sites/astro-starlight-terminal1/docs/memory/`): (modify) product card keyed `hexokit`, `rk`/`xk`/`run-kit` aliases

## Impact

`sites/astro-starlight-terminal1/{scripts,src}`, `.github/workflows/refresh-{help,readme}.yml`, `versions-policy.json`, memory files. Live effect on merge (GitHub Pages deploy on push to main): `hexokit.com/install` no-arg default, `versions.json` formula field, docs copy, landing terminal. Next scheduled refresh-help run installs `sahil87/tap/hexokit` and invokes `hexokit help-dump`. Verify with `just verify` (validate, test, build) and a local compose of the install script (fetch upstream install.sh, run compose-install, `sh -n` it).

## Open Questions

- None blocking. Follow-ups (not this change): upstream shll `scripts/install.sh` should `brew upgrade sahil87/tap/shll` when shll is already present (root cause of the stale-roster hazard; would let the fallback be dropped); run-kit updatecheck dual-read before the versions.json key can flip to `hexokit`.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Landing brew line needs no change | Verified: landing-data.ts:130 already `brew install sahil87/tap/hexokit` | S:95 R:95 A:95 D:95 |
| 2 | Confident | Install default → `hexokit` with a stale-shll fallback to `run-kit` | Reproduced shll v0.1.33 rejecting `hexokit`; a plain flip would abort re-runs for existing users. Guard is transitional, drop once the upstream bootstrap refreshes shll | S:80 R:85 A:85 D:75 |
| 3 | Certain | Repo fields/URLs stay `run-kit` | Task + plan: R2 is separate; repo not renamed | S:95 R:90 A:95 D:95 |
| 4 | Confident | versions-policy key stays `run-kit`, add `formula: hexokit` | run-kit updatecheck + old shll key on `run-kit`; formula is informational to both (verified in source) | S:80 R:90 A:85 D:80 |
| 5 | Confident | refresh-help/roster formula+binary → `hexokit` | Formula renamed in R1(a); `run-kit` binary is a hidden alias kept one release; help/hexokit.json already emits `tool: hexokit` | S:85 R:90 A:85 D:85 |
| 6 | Confident | Docs examples use `rk`, product prose "HexoKit", install token `hexokit` | Plan rule D2 | S:85 R:90 A:85 D:80 |
| 7 | Confident | TerminalPrompt product card re-keyed to `hexokit` with `rk`/`xk`/`run-kit` aliases | Primary-name relabel is in task scope; alias resolution preserved | S:75 R:85 A:80 D:75 |
| 8 | Certain | `content/`, `help/`, fixtures, `_playground`, fab archives untouched | Puller-managed / history (D11) | S:95 R:95 A:95 D:95 |

8 assumptions (3 certain, 5 confident, 0 tentative, 0 unresolved).
