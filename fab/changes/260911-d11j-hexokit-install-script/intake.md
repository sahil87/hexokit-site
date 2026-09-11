# Intake: hexokit.com/install — product-first default composed onto the shll install script (D10)

**Change**: 260911-d11j-hexokit-install-script
**Created**: 2026-09-11

## Origin

One-shot `/fab-new` invocation (autonomous, no prior conversation in this session). The user's raw input:

> Per fab/plans/sahil/26-09-10-hexokit-rebrand.md row S5 (hexokit-install-script, hexokit-site repo): implement D10 -- the /install endpoint stays served by the existing shll.ai install script (same script, it already takes tool args), but its DEFAULT selection becomes product-first: install shll + the run-kit formula (do NOT rename the formula default yet -- the row note says the script default must still say "shll install run-kit" until Phase 3 R1 flips the formula; only the surrounding PROSE should say HexoKit) and print a toolkit hint. Also prepare (in this change, as a doc/patch note -- do not apply cross-repo) the exact install-composition standard Policy B wording that C1 will need to move to hexokit.com. Context: S2/S3/S4 are merged, hexokit.com is live with the D7 URL scheme and the accepted landing page; this unblocks S5. Read the full plan doc first.

The plan doc lives in the run-kit repo (`/home/sahil/code/sahil87/run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md`); its row S5 reads: *"D10: `/install` served from the same script with the product-first default; the `install-composition` Policy B text prepared for C1"*, and the Phase 1 note adds: *"S5 (Phase 0) is unaffected but its default must be `shll install run-kit` (roster name) until R1 flips the roster; the script's prose says HexoKit."* R1(d) later flips the S5 default to `hexokit`.

Decisions taken from the plan doc (Certain — D1–D4, D13, D14 confirmed; D5–D12 proposed but the pickup protocol says do not re-open):

- **D10**: `curl -fsSL hexokit.com/install | sh` installs `shll` + HexoKit by default and prints the toolkit hint; the toolkit page offers the full install. Same script as `shll.ai/install`, changed default.
- **D4**: `shll` stays the manager name; `shll.ai/install` stays live (untouched until X2, when it becomes a **byte copy** of hexokit.com's `/install`).
- **D11**: historical text is not renamed; **D14**: standards are not renamed, only content changes (C1 edits Policy B's install-docs location).

Facts established during intake research that shape the design (none of these were in the user's input):

1. **This repo does not own the script.** `.github/workflows/deploy.yml` fetches `https://raw.githubusercontent.com/sahil87/shll/main/scripts/install.sh` at deploy time into `public/install` (gitignored: `sites/*/public/install`). The canonical script is in the `shll` repo (last touched by shll PR #87). Both `shll.ai/install` and `hexokit.com/install` currently serve the identical 10,234-byte file.
2. **The script's default is "everything".** Its `main()` ends with `shll install "$@"` then `exec shll update <tool-names>`; with no args `shll install` processes the whole roster (`run-kit`, `rk-desktop`, `fab-kit`, `wt`, `idea`, `tu`, `hop`). Tool args pass verbatim. The whole body is functions; the **last line is exactly `main "$@"`** by design (truncated-download safety), which makes it a stable composition anchor.
3. **The landing page already promises the D10 behavior** (change `lvnp` + `a9xx`): `INSTALL_LINES` renders `curl -fsSL hexokit.com/install | sh` with the note *"Installs `shll` and HexoKit. Nothing else. The six companions are one more command away."* Today that line installs everything — the copy is ahead of the endpoint. S5 closes that gap.
4. **Two hand-authored site surfaces still describe the old default on the old domain**: `src/components/InstallOneLiner.astro` (`WHOLE_TOOLKIT_ONE_LINER = 'curl -fsSL https://shll.ai/install | sh'`, rendered on every tool overview including `/docs/`, `/fab-kit/`, `/shll/`) and `src/content/docs/toolkit/install.md` (title "Install everything"; describes `shll.ai/install | sh` as installing every roster tool; still advertises the retired `sahil87/tap/all` meta-formula, which no longer exists in the tap — `Formula/` has no `all.rb`, and the `install-composition` standard records it as retired).
5. **C1 is already in flight** in the shll repo (fab change `ttoa`, `260911-ttoa-hexokit-banner-and-policy`, intake ready 2026-09-11 — visible as an uncommitted row edit in the run-kit plan doc). The Policy B patch note this change produces is C1's input.
6. **`shll install` with a subset already prints nothing toolkit-shaped afterwards**, and `main` ends in `exec`, so a post-install hint cannot be appended after `main` unless `main` runs in a subshell.

## Why

**The pain point.** hexokit.com is a single-product site (D6) whose install line must read as *a product install*, not a seven-binary bundle (D10's rationale). The landing page already says "Installs `shll` and HexoKit. Nothing else." — but `hexokit.com/install | sh` today runs `shll install` with no args and pulls the whole roster. The site is making a promise the endpoint breaks, on the one line a visitor is most likely to copy. Separately, the hand-authored install docs on hexokit.com still point at `shll.ai/install`, describe the everything-default, and advertise a formula that no longer exists.

**If we don't fix it.** Every visitor who copies the landing one-liner gets six extra binaries plus `shll setup agent` wiring for tools they did not ask for, contradicting the copy right above the command. When shll.ai is folded (X2) its `/install` becomes a byte copy of hexokit.com's — so whatever hexokit.com serves becomes *the* installer for both domains; shipping the everything-default there would lock the bundle behaviour in. And C1 cannot move Policy B's install-docs location to hexokit.com without knowing what hexokit.com's install story *is*; S5 defines it.

**Why this approach — compose at deploy time, in this repo, on the script's last line.** Three options were weighed:

| Option | Verdict |
|--------|---------|
| **A. Change the default upstream in `sahil87/shll/scripts/install.sh`** | Rejected for S5. Cross-repo (the user said not to apply cross-repo work here; the row is a hexokit-site row), and — because *both* domains fetch the same `main` file — it would flip `shll.ai/install`'s documented "converge everything" behaviour for every existing user before the cutover, and before the READMEs that quote it (fab-kit, run-kit, wt, tu) are updated (C7). The plan keeps shll.ai untouched until X2. |
| **B. Commit a site-owned copy of the script (or a thin wrapper that curls the upstream at run time)** | Rejected. A committed copy abandons the recorded design (canonical script versioned next to the CLI it bootstraps; deploy-time fetch with `-f` so a missing script fails the deploy). A run-time wrapper adds a second network hop and a `raw.githubusercontent.com` dependency at the user's shell, and loses the upstream's truncated-download safety. |
| **C. Deploy-time composition (chosen).** Keep the fetch exactly as is; then a small site script rewrites the fetched file's last line `main "$@"` into a site-owned epilogue that (1) defaults `$@` to `run-kit` when empty, (2) runs `main` in a subshell so the hint can print after `shll update` finishes, (3) prints the toolkit hint on the default path. Fails the deploy loudly if the anchor is missing. | The upstream stays canonical and untouched; only hexokit.com's served copy differs, by an epilogue this repo owns and tests. "Same script, changed default" — literally. The R1 flip is a one-token edit in this repo (`run-kit` → `hexokit`). X2's byte copy carries the composed file to shll.ai for free. |

**Blast radius honesty.** Between S5 and X2 the two domains diverge: `shll.ai/install | sh` = everything (upstream, unchanged); `hexokit.com/install | sh` = `shll` + HexoKit. That is the intended state (shll.ai is untouched until X2; hexokit.com is unannounced). The hand-authored docs *on hexokit.com* must therefore describe hexokit.com's behaviour and cite hexokit.com's URL — so this change flips those surfaces too. Synced content (`content/**` READMEs and docs/site trees, which still say `shll.ai/install … installs the entire toolkit`) is upstream-owned and is C7's job; it is not touched here.

## What Changes

### 1. `scripts/compose-install.mjs` — the composer (new)

`sites/astro-starlight-terminal1/scripts/compose-install.mjs`, plain ESM, dependency-free (Constitution VI), following the `scripts/*-cli.mjs` shape (pure function exported for tests + a CLI wrapper).

**Pure function** `composeInstall(source: string, epilogue: string): string`:

1. Reject non-script input early: if `source` is empty, or its first non-whitespace character is `<` (a Pages 404/HTML body that a mis-fetch would have saved), throw `compose-install: public/install does not look like the shll install script`.
2. Find the **last non-empty line**; it MUST be exactly `main "$@"` (after trimming trailing whitespace). Otherwise throw `compose-install: expected the upstream script to end with 'main "$@"' (its truncated-download anchor) — got: <line>`. This is the one coupling to upstream and is deliberately strict: a changed anchor means the composition assumptions need re-checking by a human, and a deploy that fails is better than a served installer with two `main` calls or none.
3. Return `source` with that last line replaced by `epilogue` (a trailing newline preserved). Nothing else in the upstream text is touched — no header rewrite, no `sed` on prose. The HexoKit prose lives in the epilogue.

**CLI** `node scripts/compose-install.mjs <path>` rewrites `<path>` in place (reads it, reads `scripts/install-epilogue.sh`, writes the result). Any thrown error prints the message to stderr and exits 1. Guard the CLI body behind the module-is-main idiom the other `*-cli.mjs` scripts use so importing the module in tests runs nothing.

### 2. `scripts/install-epilogue.sh` — the site-owned tail (new)

The fragment that replaces `main "$@"`. Exact content (the command stays `run-kit` — roster/formula name — until R1; only prose says HexoKit):

```sh

# ---- hexokit.com composition (appended at deploy by sahil87/hexokit-site) ----
# Everything above is sahil87/shll scripts/install.sh, fetched verbatim at
# deploy time. hexokit.com/install is product-first: with no tool arguments it
# installs shll and HexoKit (roster/formula name `run-kit` until the formula
# rename), then points at the rest of the toolkit. Tool arguments pass through
# unchanged:   curl -fsSL https://hexokit.com/install | sh -s -- fab-kit wt
hexokit_default=0
if [ "$#" -eq 0 ]; then
    set -- run-kit
    hexokit_default=1
fi
# Subshell on purpose: main ends in `exec shll update`, which would replace
# this process before the hint below could print. `set -e` still aborts the
# script (non-zero exit, no hint) when anything inside main fails.
( main "$@" )
if [ "$hexokit_default" -eq 1 ]; then
    echo
    echo "HexoKit is installed (run it: rk). The rest of the toolkit is one command away:"
    echo "  shll install              # fab-kit, wt, idea, tu, hop"
    echo "  https://hexokit.com/toolkit/"
fi
```

Behavioural contract of the composed `hexokit.com/install`:

| Invocation | `shll install` receives | `shll update` receives | Hint |
|------------|-------------------------|------------------------|------|
| `curl … \| sh` | `run-kit` | `run-kit` | printed after the update pass |
| `curl … \| sh -s -- fab-kit wt` | `fab-kit wt` | `fab-kit wt` | not printed (user chose explicitly) |
| `curl … \| sh -s -- run-kit --no-agent-setup` | `run-kit --no-agent-setup` | `run-kit` (upstream strips `-*`) | not printed |
| any failure inside `main` | — | — | not printed; script exits non-zero (`set -e` propagates from the subshell) |

Notes: `rk-desktop` is **not** in the default — the desktop app is its own opt-in (`rk desktop install`, the landing's desktop card). Every command the hint names exists in `help/shll.json` / `help/hexokit.json` (`shll install`, `rk`) — the `vn39` hand-written-prose rule holds. The hint deliberately does not mention `brew install sahil87/tap/hexokit` (no such formula until R1).

### 3. `scripts/compose-install.test.mjs` + fixture (new)

Native `node --test`, picked up by CI's existing `node --test scripts/*.test.mjs` glob. Fixture `scripts/fixtures/install-upstream.sh` = a frozen copy of `sahil87/shll/scripts/install.sh` as of 2026-09-11 (shll commit `8f5b250`), the frozen-behaviour-specimen convention this suite already uses. Cases:

1. **Composes the real upstream**: output starts with the untouched upstream text, ends with the epilogue, contains exactly one `( main "$@" )` and no bare `main "$@"` line.
2. **Composed output is valid sh**: `sh -n` on a temp file exits 0 (spawn `sh`, skip with a note if `sh` is unavailable — it is on every CI runner).
3. **Default path** (behaviour, via a stub): compose a minimal stub script `main() { printf 'main:%s\n' "$*"; }` + `main "$@"`; run `sh <composed>` → stdout has `main:run-kit` and the hint line `shll install`.
4. **Explicit args**: `sh <composed> fab-kit wt` → `main:fab-kit wt`, no hint.
5. **Failure propagates**: stub `main() { exit 7; }` → `sh` exits 7, no hint on stdout.
6. **Missing anchor** (upstream last line changed) → throws the anchor error.
7. **HTML body** (`<!DOCTYPE html>…`) → throws the not-a-script error.

No test fetches the network; the deploy step is the live gate for upstream drift (same posture as `-f` on the curl).

### 4. `.github/workflows/deploy.yml` — one new step, comments updated

After the existing fetch step (unchanged command), add:

```yaml
      # hexokit.com serves a deploy-time COPY of the canonical script with a
      # product-first default composed onto its last line (no args → shll +
      # HexoKit; tool args pass through). The composer fails the deploy if the
      # upstream no longer ends in `main "$@"` — a served installer must never
      # be half-composed. See docs/memory/build-deploy/install-endpoint.md.
      - name: Compose the product-first default onto the install script
        working-directory: ${{ env.SITE_DIR }}
        run: node scripts/compose-install.mjs public/install
```

Rewrite the fetch step's comment so it no longer says the site serves the script unchanged. `ci.yml` is untouched (it does not fetch `public/install`; the composer is covered by the unit suite). `.gitignore`'s comment on `sites/*/public/install` is updated to say the file is fetched *and composed* at deploy time, served at `hexokit.com/install`.

### 5. `src/components/InstallOneLiner.astro` — hexokit.com URL, product-first forms

The bare one-liner no longer means "whole toolkit", so the component's three branches are re-cut. Single-sourced base string renamed to say what it is:

```ts
const BOOTSTRAP_ONE_LINER = 'curl -fsSL https://hexokit.com/install | sh'; // installs shll + HexoKit
```

| `tool` | Rendered command block | Note under it |
|--------|------------------------|---------------|
| `hexokit` (the product) | `curl -fsSL https://hexokit.com/install \| sh` | "Installs `shll` and HexoKit via Homebrew — the six companions are one `shll install` away. See the [full install guide](/toolkit/install/)." **Remove `hexokit` from `FULL_TOOLKIT`** — the product's form is D10's, matching the landing; riff's `wt` dependency is probed at run time (install-composition Policy A), not pre-installed. |
| `shll` | Bootstrap line, then the follow-on block: `shll install              # the six companions`, `shll setup shell           # wire your shell integration`, `shll setup agent           # optional, once per machine`, `exec $SHELL                # reload your shell` | "Installs `shll` and HexoKit; `shll install` adds the rest of the toolkit — see the [full install guide](/toolkit/install/)." (This also fixes the stale `shll shell-setup` / `shll agent-setup` spellings — `help/shll.json` has `setup`; the hidden aliases are not documented surface.) |
| `fab-kit` (stays in `FULL_TOOLKIT`; its canonical README documents the whole-toolkit install as the supported path) | Two-line block: `curl -fsSL https://hexokit.com/install \| sh` newline `shll install` | Existing reason sentence kept: "fab-kit relies on its sibling tools (wt for worktreees…), so the full-toolkit install is the supported path…" pointing at `/toolkit/install/`. |
| `idea`, `wt`, `tu`, `hop` | `curl -fsSL https://hexokit.com/install \| sh -s -- <tool>` (form unchanged, domain flipped) | Unchanged: "Installs `shll` + `<tool>` via Homebrew — or [install the whole toolkit](/toolkit/install/)." |

Update the doc-comment (it still narrates `shll.ai/install`, PR #84, and the whole-toolkit meaning). Every link target is `/toolkit/install/` (the `it5d` mount; the component currently links `/getting-started/install/`, which now only survives as a redirect — verify at apply and fix if so). No structural change: still Expressive Code `<Code>`, still roster-gated via `isToolSlug`.

### 6. `src/content/docs/toolkit/install.md` — describe hexokit.com's actual behaviour

Rewrite the hand-authored page (title may stay "Install everything"; the page is D10's "toolkit page offers the full install"):

- Lead block becomes the two-step full install:
  ```bash
  curl -fsSL https://hexokit.com/install | sh     # shll + HexoKit
  shll install                                     # the six companions: fab-kit, wt, idea, tu, hop
  ```
  with prose: the one-liner bootstraps `shll` (trusts + brew-installs its formula), installs HexoKit, and prints how to add the rest; `shll install` with no arguments installs every roster tool you are missing. Requires Homebrew (the script bootstraps it headlessly when absent — the current page says "exits with a pointer", which is stale since shll PR #81; verify against the fixture and fix).
- "What the one-liner runs" equivalent-lines block becomes `brew trust --formula sahil87/tap/shll`, `brew install sahil87/tap/shll`, `shll install run-kit`, `shll update run-kit` (the `run-kit` token is the roster name until R1). Link both the canonical source (`github.com/sahil87/shll/blob/main/scripts/install.sh`) and the served, composed file (`https://hexokit.com/install`), stating that hexokit.com appends the product-first default.
- **Delete** the `sahil87/tap/all` meta-formula paragraph (retired; no such formula).
- Per-tool section: `curl -fsSL https://hexokit.com/install | sh -s -- hop wt`; the per-formula `brew trust && brew install` fallback stays.
- Follow-on `shll setup shell` / `shll setup agent` / `exec $SHELL`, Verify, Update sections stay.

The landing page (`index.astro`, `landing-data.ts`) is **not** edited — its copy already states the S5 behaviour. `toolkit/index.mdx` needs no edit ("shll — the bootstrap that installs and updates the whole set" stays true).

### 7. `docs/findings/install-composition-policy-b-patch.md` — the C1 hand-off (new, not applied)

A patch note the C1 agent (shll change `ttoa`) applies to `docs/site/standards/install-composition.md` (and its embedded copy). Written as exact before → after pairs. Content:

**Part 1 — mandatory for C1 (the plan's "Policy B install-docs location → hexokit.com")**

| Location | Before | After |
|----------|--------|-------|
| Intro paragraph, Policy B clause | `**Policy B** — install documentation is centralized on shll.ai.` | `**Policy B** — install documentation is centralized on hexokit.com.` |
| Scope paragraph | `because it, together with shll.ai, *is* the centralized install documentation the policy points at` | `because it, together with hexokit.com, *is* the centralized install documentation the policy points at` |
| § Install documentation is centralized (Policy B), bullet 1 | `They link to [https://shll.ai](https://shll.ai) for install steps — the curl bootstrap or `shll install`.` | `They link to the toolkit install guide at [https://hexokit.com/toolkit/install/](https://hexokit.com/toolkit/install/) for install steps — the curl bootstrap or `shll install`.` |
| § Verifying conformance, last bullet | `links to https://shll.ai instead of carrying per-formula `brew install` lines.` | `links to https://hexokit.com/toolkit/install/ instead of carrying per-formula `brew install` lines.` |

Leave untouched (X4's pass, per D14): the intro's `[shll toolkit](https://shll.ai)` phrase and every other `shll.ai` mention that names the consuming site.

**Part 2 — proposed addition to Policy B (S5 changes what the one-liner does; C1 may accept, or defer to C7 with the README sweep)**

New bullet after bullet 1:

> - **What the bootstrap installs.** `curl -fsSL https://hexokit.com/install | sh` is product-first: with no arguments it installs `shll` and HexoKit, then prints how to add the rest. A README that quotes the one-liner MUST describe it that way — never as "installs the whole toolkit". A tool that relies on siblings quotes either the subset form (`curl -fsSL https://hexokit.com/install | sh -s -- <tool> <sibling>…`) or the two-step (`… | sh`, then `shll install`); `shll install` remains the single composition point for the full roster.

Rationale in the note: the fab-kit, run-kit, wt and tu READMEs currently say the one-liner "installs the entire shll toolkit" — true on shll.ai until X2, false on hexokit.com from S5 and on both domains after X2's byte copy.

**Part 3 — one-line courtesy note for the shll repo (optional)**: add a comment above `main "$@"` in `scripts/install.sh` saying hexokit-site composes its product-first default onto that last line, so the line stays last. No behaviour change.

The plan doc's S5 row gets a pointer to this file when the change ships (pickup protocol step 4).

### 8. Memory + plan-doc bookkeeping

- New memory file `docs/memory/build-deploy/install-endpoint.md` (see Affected Memory).
- The run-kit plan doc's S5 row Status is set to *in progress — hexokit-site fab change `d11j`* at intake time (uncommitted edit in the run-kit working tree, alongside the C1 agent's uncommitted `ttoa` row edit; committing it is the user's call). At ship, the row gets the PR URL.

## Affected Memory

- `build-deploy/install-endpoint`: (new) The `/install` endpoint contract — canonical source (`sahil87/shll` `scripts/install.sh` @ `main`, fetched at deploy with `-f`), the deploy-time composition (`compose-install.mjs`, the `main "$@"` last-line anchor, the `install-epilogue.sh` fragment, default `run-kit`, subshell + hint), fail-loud postures (missing script, missing anchor, HTML body), the frozen-fixture test, the design decision (compose here vs. change upstream vs. commit a copy), the two-domain divergence window until X2, X2's byte-copy consumer, and the R1 flip point (`run-kit` → `hexokit` in the epilogue only).
- `build-deploy/deployment`: (modify) The build job gains the compose step after the fetch; the fetch step is documented at all for the first time (today `deployment.md` never mentions `public/install`); pointer to `install-endpoint`.
- `conventions/tool-page-rubric`: (modify) `InstallOneLiner.astro` — base string is `hexokit.com/install`, the bare one-liner means `shll` + HexoKit, the three forms per tool class (product / shll with `shll install` follow-on / `FULL_TOOLKIT` two-step / subset), `hexokit` removed from `FULL_TOOLKIT`, links target `/toolkit/install/`.
- `site/landing-page`: (modify) Lives in the live site's own memory tree, `sites/astro-starlight-terminal1/docs/memory/site/landing-page.md` — the `#install` row's rationale "InstallOneLiner.astro is deliberately not used: it carries the `shll.ai/install` whole-toolkit form" is stale after S5; the landing still does not use the component (it carries two lines, including the brew line), but the reason changes.

No spec exists for the `/install` endpoint. It is a cross-repo contract (shll produces the script; hexokit-site composes and serves; X2's stub consumes the bytes), so hydrate SHOULD propose `docs/specs/install-endpoint-contract.md` in the `versions-manifest-contract` shape; creating it is the human-curated spec owner's call.

## Impact

**Files touched (this repo, live site `sites/astro-starlight-terminal1/` unless noted):**

- `scripts/compose-install.mjs` (new), `scripts/install-epilogue.sh` (new), `scripts/compose-install.test.mjs` (new), `scripts/fixtures/install-upstream.sh` (new, frozen upstream copy)
- `.github/workflows/deploy.yml` (repo root — one new step + comments)
- `.gitignore` (repo root — comment only)
- `src/components/InstallOneLiner.astro`
- `src/content/docs/toolkit/install.md`
- `docs/findings/install-composition-policy-b-patch.md` (repo root, new)
- memory files per Affected Memory (at hydrate)

**Behaviour that changes for visitors:** `hexokit.com/install | sh` installs `shll` + `run-kit` (HexoKit) instead of the whole roster, and prints the toolkit hint. `hexokit.com/install | sh -s -- <tools>` is unchanged. `shll.ai/install` is unchanged (until X2).

**Not touched, deliberately:** `sahil87/shll/scripts/install.sh` (upstream stays canonical); `content/**` synced READMEs/docs-site trees that still say `shll.ai/install … entire toolkit` (C7 / upstream READMEs); the landing page (already correct); the `versions.json` endpoint; `ci.yml`; the `brew install sahil87/tap/hexokit` landing line (404s until R1 — a known, accepted gap recorded in the plan's Risks; R1(d) owns it).

**Cross-repo consequences recorded, not acted on:** C1 applies the Policy B patch note; C7 updates the READMEs that quote the one-liner; X2's stub copies the composed bytes; R1(d) flips the epilogue's `run-kit` to `hexokit` and un-hides the brew line.

**Constitution check:** I Static-first — the composed file is a static asset produced at build. IV Deploy via CI — composition happens only in `deploy.yml`; nothing generated is committed (`public/install` stays gitignored). VI Minimal deps — composer is dependency-free Node. Tool-Page Depth — only hand-authored surfaces change; synced content untouched. Test Integrity — the frozen fixture pins upstream behaviour; the anchor test encodes the spec.

## Open Questions

None blocking. Two soft defaults a reviewer may want to veto (both graded Confident below, both one-line reversals):

- fab-kit's overview renders the two-step whole-toolkit block (mirrors its canonical README) rather than an explicit sibling subset `sh -s -- fab-kit wt idea`.
- The hint prints only on the default (argument-less) path, not when the user named tools explicitly.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Compose the default in hexokit-site at deploy time; the upstream `sahil87/shll/scripts/install.sh` is not modified by this change | User: "do not apply cross-repo"; plan row lives in hexokit-site; changing upstream would flip `shll.ai/install` before X2/C7 | S:90 R:70 A:90 D:90 |
| 2 | Confident | Mechanism: replace the fetched script's last line `main "$@"` with a site-owned epilogue; a missing anchor or an HTML body fails the deploy | The last-line `main "$@"` is upstream's documented truncated-download design, hence a stable anchor; fail-loud mirrors the existing `-f` posture | S:60 R:80 A:85 D:70 |
| 3 | Certain | Default is `run-kit` only (`set -- run-kit` when `$# -eq 0`); `rk-desktop` is not part of the default | User: "install shll + the run-kit formula"; plan note fixes the token until R1; desktop is a separate opt-in card on the landing | S:80 R:90 A:80 D:75 |
| 4 | Confident | Hint prints after the install by running `( main "$@" )` in a subshell; printed only on the default path; wording as in § 2 | `main` ends in `exec shll update`, so a post-install hint needs the subshell; users who named tools made a choice; wording is a one-line edit | S:60 R:90 A:75 D:60 |
| 5 | Confident | Composer as `scripts/compose-install.mjs` + `scripts/install-epilogue.sh` + `scripts/compose-install.test.mjs` with a frozen upstream fixture; CI stays offline (no live fetch) | Matches the `scripts/*.mjs` + `node --test` + `scripts/fixtures/` convention; deploy remains the live drift gate | S:50 R:90 A:85 D:70 |
| 6 | Confident | Hand-authored install surfaces in this repo (`InstallOneLiner.astro`, `toolkit/install.md`, deploy/gitignore comments) flip to `hexokit.com/install` and product-first semantics; synced `content/**` and the landing are untouched | Docs on hexokit.com must describe hexokit.com's behaviour; synced content is upstream/C7; landing copy already matches S5 | S:55 R:85 A:80 D:70 |
| 7 | Confident | `InstallOneLiner` forms: `hexokit` → bootstrap line only (removed from `FULL_TOOLKIT`); `shll` → bootstrap + follow-on incl. `shll install`, `shll setup shell/agent`; `fab-kit` → two-step block; subset tools unchanged form | Product form follows D10 + landing; fab-kit mirrors its canonical README; `setup` spellings follow `help/shll.json` (vn39) | S:45 R:85 A:70 D:55 |
| 8 | Confident | Delete the `sahil87/tap/all` meta-formula paragraph from `toolkit/install.md` | No `all.rb` in `homebrew-tap/Formula/`; the install-composition standard records `all` as retired; C7 fixes the same claim in the profile README | S:40 R:90 A:90 D:85 |
| 9 | Confident | Policy B hand-off as `docs/findings/install-composition-policy-b-patch.md`: exact before→after pairs for the location move (C1's scope), a proposed "what the bootstrap installs" bullet, an optional last-line comment for shll; X4's mentions left alone | `docs/findings/` is the repo's precedent for hand-written notes; C1 (`ttoa`) is in flight and needs exact text; D14 scopes C1 vs X4 | S:70 R:95 A:75 D:65 |
| 10 | Certain | No cross-repo edits are applied by this change; the only out-of-repo touch is the plan doc's S5 row bookkeeping (uncommitted, in the run-kit working tree), which the plan's pickup protocol mandates | User instruction + plan protocol step 4; the C1 agent's row edit sits in the same file uncommitted | S:80 R:95 A:85 D:80 |
| 11 | Certain | The landing's `brew install sahil87/tap/hexokit` line (404 until R1) is out of scope | Plan Risks record the gap as accepted; R1(d) owns the flip | S:85 R:95 A:90 D:90 |
| 12 | Confident | New memory file `build-deploy/install-endpoint` rather than folding into `deployment.md`; an `install-endpoint-contract` spec is suggested to hydrate, not created here | The endpoint is a cross-repo contract like `versions.json` (which has its own memory + spec); specs are human-curated | S:40 R:95 A:80 D:70 |
| 13 | Certain | Change type `feat` | New capability (composed default + hint + composer); `fix`/`docs` keywords absent from the slug | S:60 R:100 A:95 D:95 |
| 14 | Confident | The S5→X2 divergence window (shll.ai = everything, hexokit.com = product-first) is accepted, not mitigated | Plan: shll.ai untouched until X2; hexokit.com unannounced; X2's byte copy converges them | S:65 R:80 A:80 D:75 |
| 15 | Certain | Hint and site prose name only commands present in `help/shll.json` / `help/hexokit.json` (`shll install`, `shll setup …`, `rk`) | vn39 hard rule for hand-written prose; verified against `help/shll.json` command names | S:70 R:95 A:95 D:95 |

15 assumptions (6 certain, 9 confident, 0 tentative, 0 unresolved).
