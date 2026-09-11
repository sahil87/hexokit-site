---
type: memory
description: "The `/install` endpoint: hexokit.com serves a deploy-time copy of `sahil87/shll`'s `scripts/install.sh` (fetched with `curl -fsSL`; a missing script fails the deploy) with a site-owned epilogue composed onto its last-line `main \"$@\"` anchor by `scripts/compose-install.mjs` — product-first default `run-kit`, subshell + hint on the default path only, tool args passed through; fail-loud on a changed anchor or an HTML body; a frozen fixture pins the upstream so CI never fetches it."
---
# Install Endpoint

**Domain**: build-deploy

## Overview

`https://hexokit.com/install` serves the shell installer the site's one-liners pipe into `sh`. The canonical script lives upstream in `sahil87/shll` (`scripts/install.sh` on `main`, versioned next to the CLI it bootstraps); this repo fetches it at deploy time and serves a copy with a site-owned product-first default composed onto its last line. The upstream is not edited from this repo, and nothing generated is committed — `sites/*/public/install` is gitignored (d11j).

## Requirements

### Requirement: The canonical script is fetched at deploy, never committed
The deploy workflow's build job fetches `https://raw.githubusercontent.com/sahil87/shll/main/scripts/install.sh` with `curl -fsSL` into `public/install` inside the live site. The `-f` flag is deliberate: a missing script upstream fails the deploy rather than shipping a site whose documented one-liner 404s.

#### Scenario: The upstream script is missing
- **GIVEN** the fetch URL returns a non-2xx response
- **WHEN** the deploy build job runs the fetch step
- **THEN** `curl -f` exits non-zero and the deploy fails before any build

### Requirement: The product-first default is composed onto the last line
Immediately after the fetch, the build job runs `node scripts/compose-install.mjs public/install` (step order: fetch → compose → build), rewriting the file in place. `composeInstall(source, epilogue)` — a pure exported function in `sites/astro-starlight-terminal1/scripts/compose-install.mjs`, dependency-free (Constitution VI) — returns `source` with its last non-empty line replaced by the epilogue and leaves every other byte untouched. The anchor is the upstream's last line, exactly `main "$@"` after trimming trailing whitespace — upstream's truncated-download safety design (the body is all functions; the single `main` call is last so a truncated download defines nothing callable). The anchor match is deliberately strict: a changed anchor means the composition assumptions need a human re-check, and a failed deploy beats a served installer with two `main` calls or none. The CLI prints `compose-install:`-prefixed errors to stderr (exit 1), prints usage on a missing argument (exit 2), reads the epilogue relative to its own location, and runs nothing when imported (the module-is-main guard, so the test suite can import `composeInstall`).

### Requirement: The epilogue (`scripts/install-epilogue.sh`)
The site-owned fragment that replaces `main "$@"`:

- With no arguments it `set -- run-kit` (the roster/formula name) and records that the default fired.
- It runs `( main "$@" )` in a subshell — `main` ends in `exec shll update`, which would replace the process before the hint could print; `set -e` still propagates a failure out of the subshell (non-zero exit, no hint).
- After a successful `main` it prints the toolkit hint only when the default fired.
- Tool arguments pass through to `main` unchanged.

The hint names only `shll install`, `rk`, and `https://hexokit.com/toolkit/` — every command exists in `help/shll.json` / `help/hexokit.json` (the `vn39` rule holds). `rk-desktop` is not part of the default; the desktop app is its own opt-in (`rk desktop install`). The `run-kit` token appears only where the command needs the roster/formula name; the prose (comments, hint) says HexoKit. The fragment opens with a comment block stating that everything above it is `sahil87/shll scripts/install.sh` fetched verbatim and that the default is composed at deploy by `sahil87/hexokit-site`.

#### Scenario: Served behaviour

| Invocation | `shll install` receives | `shll update` receives | Hint |
|------------|-------------------------|------------------------|------|
| `curl -fsSL https://hexokit.com/install \| sh` | `run-kit` | `run-kit` | printed after the update pass |
| `curl … \| sh -s -- fab-kit wt` | `fab-kit wt` | `fab-kit wt` | not printed (user chose explicitly) |
| `curl … \| sh -s -- run-kit --no-agent-setup` | `run-kit --no-agent-setup` | `run-kit` (upstream strips `-*` flags) | not printed |
| any failure inside `main` | — | — | not printed; script exits non-zero |

### Requirement: Fail-loud composition
`composeInstall` throws — failing the deploy — when the fetched file is empty/whitespace-only or its first non-whitespace character is `<` (a Pages 404 HTML body saved by a mis-fetch), or when the last non-empty line is not exactly `main "$@"` (the error names the expected anchor and quotes the line found). The CLI leaves the target file unchanged on any failure.

### Requirement: A frozen fixture pins the upstream; CI stays offline
`scripts/compose-install.test.mjs` (native `node --test`, no network, discovered by CI's existing `node --test scripts/*.test.mjs` glob) covers every behaviour above using `scripts/fixtures/install-upstream.sh` — a byte-for-byte copy of `sahil87/shll/scripts/install.sh` at shll commit `8f5b250` (2026-09-11) — plus stub scripts written to `os.tmpdir()`. Behavioural cases spawn `sh` and `t.skip()` when `sh` is not on PATH. No test fetches the live upstream: the deploy step is the drift gate (the same posture as `-f` on the curl) (d11j).

## The two-domain window and downstream consumers

Until X2 the two domains diverge by design: `shll.ai/install` serves the upstream with its everything-default (no args installs the whole roster); `hexokit.com/install` serves the composed product-first copy (`shll` + HexoKit). X2's shll.ai stub byte-copies the composed `hexokit.com/install`, converging both domains onto the file this repo produces. The R1 flip (the formula rename) is a one-token edit in this repo — `run-kit` → `hexokit` inside the epilogue only — plus un-hiding the landing's `brew install sahil87/tap/hexokit` line (R1(d)'s scope).

The site's hand-authored install surfaces describe the composed behaviour: `InstallOneLiner.astro` (see [tool-page-rubric](/conventions/tool-page-rubric.md)) and `src/content/docs/toolkit/install.md` both quote `https://hexokit.com/install`. The Policy B patch note for the shll repo's `install-composition` standard (applied by shll change `ttoa`, C1) lives at [`docs/findings/install-composition-policy-b-patch.md`](../../findings/install-composition-policy-b-patch.md).

## Design Decisions

### Compose the default at deploy time in hexokit-site, not upstream
**Decision**: Fetch the canonical script unchanged and replace its last line `main "$@"` with a site-owned epilogue in the deploy job.
**Why**: Both domains fetch the same upstream `main`; an upstream default change would flip `shll.ai/install` before X2 and before the READMEs that quote it are updated. The last-line `main "$@"` is upstream's documented truncated-download design, so it is a stable, intentional anchor.
**Rejected**: Editing upstream (cross-repo, flips shll.ai early); committing a site copy or a run-time curl wrapper (abandons the canonical-source design, adds a second hop and a raw.githubusercontent dependency at the user's shell).
*Introduced by*: 260911-d11j-hexokit-install-script

### Run `main` in a subshell so the hint prints after the install
**Decision**: `( main "$@" )` followed by the hint, instead of patching `main`'s `exec shll update` line.
**Why**: `main` ends in `exec`, which replaces the process; a subshell contains the exec, and `set -e` still propagates a failure (no hint, non-zero exit). One anchor instead of two keeps the composition coupling minimal.
**Rejected**: A pre-install banner (the hint is most useful after the install finishes); a second `sed` anchor on the `exec` line (fragile coupling to upstream internals).
*Introduced by*: 260911-d11j-hexokit-install-script

### Hint only on the default path
**Decision**: Print the toolkit hint only when the epilogue supplied the default `run-kit`.
**Why**: A user who named tools made a choice; the hint exists to tell the product-only installer that more exists.
**Rejected**: Always printing (noise for subset installs).
*Introduced by*: 260911-d11j-hexokit-install-script
