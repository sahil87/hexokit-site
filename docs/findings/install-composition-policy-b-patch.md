# Patch note: install-composition Policy B → hexokit.com (C1 hand-off)

**Prepared by**: hexokit-site change `260911-d11j-hexokit-install-script` (S5 — hexokit.com/install, the product-first default)
**Applied by**: shll change `260911-ttoa-hexokit-banner-and-policy` (C1) — **not** by this repo. Nothing below is applied here; this file is the exact-text hand-off C1 applies to `docs/site/standards/install-composition.md` in sahil87/shll (and its embedded copy, if any). Verified 2026-09-11: every "before" string below occurs verbatim in the current standard (as pulled to `content/shll/site/standards/install-composition.md` in this repo).

## Part 1 — Policy B install-docs location → hexokit.com (mandatory for C1)

| Location | Before | After |
|----------|--------|-------|
| Intro paragraph, Policy B clause | `**Policy B** — install documentation is centralized on shll.ai.` | `**Policy B** — install documentation is centralized on hexokit.com.` |
| Scope paragraph | `because it, together with shll.ai, *is* the centralized install documentation the policy points at` | `because it, together with hexokit.com, *is* the centralized install documentation the policy points at` |
| § Install documentation is centralized (Policy B), bullet 1 | ``They link to [https://shll.ai](https://shll.ai) for install steps — the curl bootstrap or `shll install`.`` | ``They link to the toolkit install guide at [https://hexokit.com/toolkit/install/](https://hexokit.com/toolkit/install/) for install steps — the curl bootstrap or `shll install`.`` |
| § Verifying conformance, last bullet | ``links to https://shll.ai instead of carrying per-formula `brew install` lines.`` | ``links to https://hexokit.com/toolkit/install/ instead of carrying per-formula `brew install` lines.`` |

**Leave untouched** (X4's pass, per D14 — standards are not renamed, only content changes): the intro's `[shll toolkit](https://shll.ai)` phrase and every other `shll.ai` mention that names the consuming site.

## Part 2 — proposed addition to Policy B (C1 may accept, or defer to C7 with the README sweep)

S5 changes what the one-liner does, so propose a new bullet after Policy B bullet 1:

> - **What the bootstrap installs.** `curl -fsSL https://hexokit.com/install | sh` is product-first: with no arguments it installs `shll` and HexoKit, then prints how to add the rest. A README that quotes the one-liner MUST describe it that way — never as "installs the whole toolkit". A tool that relies on siblings quotes either the subset form (`curl -fsSL https://hexokit.com/install | sh -s -- <tool> <sibling>…`) or the two-step (`… | sh`, then `shll install`); `shll install` remains the single composition point for the full roster.

**Rationale**: the fab-kit, run-kit, wt and tu READMEs currently say the one-liner "installs the entire shll toolkit" — true on shll.ai until X2, false on hexokit.com from S5 and on both domains after X2's byte copy.

## Part 3 — one-line courtesy note for the shll repo (optional)

Add a comment above `main "$@"` in `scripts/install.sh` saying hexokit-site composes its product-first default onto that last line, so the line stays last. No behaviour change.
