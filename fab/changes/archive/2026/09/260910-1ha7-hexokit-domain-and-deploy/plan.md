# Plan: HexoKit domain and deploy (rebrand plan row S2)

**Change**: 260910-1ha7-hexokit-domain-and-deploy
**Intake**: `intake.md`

## Requirements

### Site: origin flips to hexokit.com

#### R1: Domain-bearing site files name hexokit.com
The live site (`sites/astro-starlight-terminal1/`, the `SITE_DIR` in `.github/workflows/deploy.yml`) MUST carry `hexokit.com` in every file that names the origin statically: `public/CNAME` MUST contain exactly `hexokit.com` followed by a single newline; `astro.config.mjs` MUST set `site: 'https://hexokit.com'`; `public/robots.txt` MUST advertise `Sitemap: https://hexokit.com/sitemap-index.xml`. No other site file SHALL be edited for the domain — every remaining absolute URL derives from `Astro.site` at build time. Brand copy that mentions shll.ai (install one-liner, share footer, footer license link, comments, test fixtures with a literal origin) MUST NOT be changed by this change.

- **GIVEN** the site is built with `pnpm build`
- **WHEN** `dist/` is inspected
- **THEN** `dist/CNAME` is `hexokit.com`, `dist/robots.txt` names `https://hexokit.com/sitemap-index.xml`, and `dist/index.html`'s canonical link, `dist/sitemap-index.xml`, `dist/llms.txt`, and `dist/.well-known/security.txt` all use the `https://hexokit.com` origin
- **AND** `grep -rl 'https://shll.ai' dist/` returns only brand-copy occurrences (install line, share footer, footer link), never a canonical/og/sitemap/llms/security URL

#### R2: Existing unit tests stay green
`node --test scripts/*.test.mjs` in the site directory MUST pass unchanged — no test reads `astro.config.mjs`, so none needs editing.

- **GIVEN** the three R1 edits are applied
- **WHEN** `node --test scripts/*.test.mjs` runs
- **THEN** every test passes

### Repo: GitHub Pages bootstrap on sahil87/hexokit-site

#### R3: Pages is enabled with the Actions build type and the custom domain
`sahil87/hexokit-site` MUST have GitHub Pages enabled with `build_type: workflow` and `cname: hexokit.com`. All calls MUST run as the `sahil87` `gh` account (the default `sahil-noon` account has no access to the private repo) inside a single shell block that switches back to `sahil-noon` on every exit path. Enabling MUST be idempotent (skip `POST` when `GET /repos/sahil87/hexokit-site/pages` already returns 200). If — and only if — the `POST` fails with an error naming the plan or private repositories, the repo MUST be flipped to public (`gh repo edit sahil87/hexokit-site --visibility public --accept-visibility-change-consequences`) and the `POST` retried once; any other failure MUST stop the task with the error surfaced.

- **GIVEN** Pages is not enabled on the repo
- **WHEN** the bootstrap runs
- **THEN** `GET /repos/sahil87/hexokit-site/pages` returns `build_type: workflow`, `cname: hexokit.com`
- **AND** `gh auth status` shows `sahil-noon` active afterwards

- **GIVEN** the `POST` fails because the plan does not allow Pages on private repos
- **WHEN** the fallback runs
- **THEN** the repo is public, the retry succeeds, and the visibility flip is reported in the task output

#### R4: The deploy workflow runs green and the Pages site is built
`.github/workflows/deploy.yml` MUST NOT be edited. One bootstrap run MUST be dispatched from the change branch (`gh workflow run deploy.yml -R sahil87/hexokit-site --ref 260910-1ha7-hexokit-domain-and-deploy`) after the R1 commit is pushed, and both its `build` and `deploy` jobs MUST succeed. If the auto-created `github-pages` environment restricts deployment branches (`deployment_branch_policy.custom_branch_policies: true`), a branch policy for the change branch MUST be added before the dispatch and removed after the run succeeds, leaving the environment `main`-only. After the run, `GET .../pages` MUST report `status: built`.

- **GIVEN** the R1 commit is on the remote change branch and Pages is enabled
- **WHEN** `deploy.yml` is dispatched on that branch
- **THEN** `gh run watch` ends with `build` and `deploy` succeeded and Pages `status` is `built`
- **AND** no temporary branch policy for the change branch remains on the `github-pages` environment

### Domain: DNS and HTTPS follow-through

#### R5: DNS is out of band and never documented in this repo; HTTPS enforcement follows the certificate
This change MUST NOT attempt any DNS change, probe for DNS-provider credentials, or write any DNS-provider name, account or zone identifier, file path, or credential into any file, commit message, or PR body in this repo. The only DNS facts permitted are GitHub's public Pages addresses. If, at apply time, `dig +short hexokit.com A` already returns the `185.199.108–111.153` set, the task SHALL set `https_enforced=true` via `PUT .../pages` (retrying on 422 for up to ~10 minutes, since the certificate issues after DNS) and verify `curl -sI https://hexokit.com` returns 200. Otherwise the task SHALL record the exact follow-up commands (as listed in `intake.md` §4) in its completion output and the PR body, without failing.

- **GIVEN** DNS does not yet point at GitHub
- **WHEN** the apply task reaches the HTTPS step
- **THEN** it leaves `https_enforced: false`, reports the follow-up, and the task still completes

- **GIVEN** DNS already points at GitHub
- **WHEN** the apply task reaches the HTTPS step
- **THEN** `https_enforced` becomes `true` and `https://hexokit.com` serves the site with `server: GitHub.com`

### Plan bookkeeping

#### R6: The rebrand plan's S2 row is updated
The S2 row of the plan document in the **run-kit** repo (`fab/plans/sahil/26-09-10-hexokit-rebrand.md`) SHALL be updated as a plain commit there (not a fab change): PR column ← this change's PR URL once shipped (or the branch name before ship), Status ← `in progress` with a one-line note of what remains manual, and the top Status line's "Next pickup" bumped to S3/S4.

- **GIVEN** the plan doc's S2 row reads `not started`
- **WHEN** this task runs
- **THEN** the row and Status line reflect S2's real state and the edit is committed in run-kit

### Non-Goals

- `sahil87/shll.ai` repo, shll.ai DNS, shll.ai content — untouched (D13).
- `refresh-help.yml` / `refresh-readme.yml` stay disabled (plan risk "Cron double-scaffold"; S3 owns re-enabling).
- Brand copy naming shll.ai (install one-liner, `SHARE_FOOTER`, footer license link, comments, README) — S3/S4/S5.
- `sites/astro-tailwind-terminal1/public/CNAME` — not the deployed variant.
- Account-level domain verification on github.com — no API; reported as a user UI step, not performed here.

### Design Decisions

#### Bootstrap deploy from the change branch
**Decision**: Dispatch `deploy.yml` once via `workflow_dispatch` on the change branch, with a temporary `github-pages` deployment-branch policy, to prove the deploy green and create the Pages site before merge.
**Why**: The repo has zero deployments; the Pages site must exist for the custom domain to bind and the certificate to issue, and waiting for merge would push "deploy green" outside the change. Merge to `main` re-deploys identical content minutes later.
**Rejected**: Verifying only after merge — leaves the change unverifiable and defers domain/cert discovery to Phase 2's irreversible window. Editing `deploy.yml` to add a branch trigger — permanent change for a one-time need.
*Introduced by*: 260910-1ha7-hexokit-domain-and-deploy

#### Conditional visibility flip
**Decision**: Make the repo public only if enabling Pages fails for a plan/private-repo reason.
**Why**: Pages on private repos requires a paid plan, the account's tier is unknowable from the CLI, and the content is already public as `sahil87/shll.ai`. The flip is reversible.
**Rejected**: Flipping unconditionally — unnecessary if the plan allows private Pages. Stopping to ask — the operator authorized autonomous completion and the content has no confidentiality.
*Introduced by*: 260910-1ha7-hexokit-domain-and-deploy

#### `robots.txt` in scope, brand copy out
**Decision**: Edit the `robots.txt` sitemap line alongside `CNAME` and `site:`; leave every other shll.ai mention.
**Why**: `robots.txt` is a static file that does not follow `Astro.site` and would advertise the wrong host's sitemap from day one; the rest is brand copy owned by S3/S4/S5.
**Rejected**: A repo-wide `shll.ai` → `hexokit.com` sweep — collides with later rows and would break the still-live `shll.ai/install` one-liner.
*Introduced by*: 260910-1ha7-hexokit-domain-and-deploy

## Tasks

### Phase 1: Setup

- [x] T001 Flip the three domain-bearing site files in `sites/astro-starlight-terminal1/`: `public/CNAME` → `hexokit.com`; `astro.config.mjs` `site:` → `'https://hexokit.com'`; `public/robots.txt` Sitemap → `https://hexokit.com/sitemap-index.xml`. Touch nothing else. <!-- R1 -->

### Phase 2: Core Implementation

- [x] T002 Verify locally in `sites/astro-starlight-terminal1/`: `pnpm install --frozen-lockfile`, `node --test scripts/*.test.mjs`, `pnpm build`; assert `dist/CNAME`, `dist/robots.txt`, `dist/index.html` canonical, `dist/sitemap-index.xml`, `dist/llms.txt`, `dist/.well-known/security.txt` use `https://hexokit.com`; confirm remaining `https://shll.ai` hits in `dist/` are brand copy only. <!-- R1, R2 -->
- [x] T003 Pages bootstrap as `sahil87` (single shell block, switch back to `sahil-noon` on exit): idempotent `POST repos/sahil87/hexokit-site/pages -f build_type=workflow` with the conditional public-visibility fallback; `PUT .../pages -f cname=hexokit.com -F https_enforced=false`; if `github-pages` environment has custom branch policies, `POST .../environments/github-pages/deployment-branch-policies -f name=260910-1ha7-hexokit-domain-and-deploy`. Report the resulting `GET .../pages` JSON. <!-- R3 -->

### Phase 3: Integration & Edge Cases

- [x] T004 Commit T001 (`chore(site): point the live site at hexokit.com`), push the change branch to `origin`, dispatch `deploy.yml` on the branch as `sahil87`, `gh run watch` to green (`build` + `deploy`), confirm Pages `status: built`, delete the temporary branch policy from T003. Then the DNS/HTTPS gate: if `dig +short hexokit.com A` returns the `185.199.*` set, `PUT` `https_enforced=true` (retry on 422 up to ~10 min) and `curl -sI https://hexokit.com` → 200; otherwise record the follow-up commands from `intake.md` §4 in the task output. No DNS-provider details anywhere. <!-- R4, R5 --> <!-- rework: .history.jsonl leaked the registrar name via the raw fab-new args (A-005/R5) — redact before ship -->

### Phase 4: Polish

- [x] T005 Update the S2 row + Status line in `/home/sahil/code/sahil87/run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md` (PR/branch, Status `in progress`, what remains manual) and commit it in the run-kit repo as a plain commit on its current branch. <!-- R6 -->

## Acceptance

### Functional Completeness

- [x] A-001 R1: `sites/astro-starlight-terminal1/public/CNAME` is exactly `hexokit.com\n`; `astro.config.mjs` has `site: 'https://hexokit.com'`; `public/robots.txt` names `https://hexokit.com/sitemap-index.xml`; no other site file changed in the diff
- [x] A-002 R2: `node --test scripts/*.test.mjs` passes in the site directory
- [x] A-003 R3: `GET /repos/sahil87/hexokit-site/pages` (as `sahil87`) returns `build_type: workflow` and `cname: hexokit.com`
- [x] A-004 R4: A `deploy.yml` run on the change branch shows `build` and `deploy` succeeded; Pages `status` is `built`; `.github/workflows/deploy.yml` is not in the diff
- [x] A-005 R5: MET on re-review (cycle 1) — `.history.jsonl`'s raw `fab-new` args now read "the registrar" (the DNS-provider token that failed the first review has been redacted), and the re-run sweep over the change folder (`intake.md`, `plan.md`, `.status.yaml`, `.history.jsonl`), `docs/memory/build-deploy/`, the branch diff, and branch commit messages finds no DNS-provider name, account/zone identifier, infra file path, or credential. Remaining grep hits are pre-existing/exempt: the "GitHub Pages, not Cloudflare/Vercel/Netlify" rejected-alternative design-decision line in memory and its intake citation, and the pre-existing Cloudflare Web Analytics memory entries (analytics vendor, unrelated to DNS). (This item's own text was also rewritten to not restate the token.)
- [x] A-006 R6: run-kit commit `eb2a2129` (`docs(plan): hexokit rebrand — S1 done, S2 in progress`) updates the S2 row to **in progress** with the fab change name, the manual remainder (HTTPS enforce, account-level domain verification), and bumps the Status line's next pickup to S3 ∥ S4 — verified read-only via `git -C /home/sahil/code/sahil87/run-kit show eb2a2129`

### Behavioral Correctness

- [x] A-007 R1: Built `dist/index.html` canonical, `dist/sitemap-index.xml`, `dist/llms.txt`, and `dist/.well-known/security.txt` use the `https://hexokit.com` origin; `https://shll.ai` survives in `dist/` only as brand copy (install line, share footer, footer license link)
- [x] A-008 R5: `https_enforced` is `true` if DNS already resolved to GitHub at apply time, otherwise `false` with the follow-up commands recorded in the task output / PR body — either outcome is correct; the task did not fail on the DNS state

### Scenario Coverage

- [x] A-009 R3: `gh auth status` reports `sahil-noon` as the active account after every bootstrap block (no leaked account switch)
- [x] A-010 R4: No deployment-branch policy for `260910-1ha7-hexokit-domain-and-deploy` remains on the `github-pages` environment after the bootstrap run

### Edge Cases & Error Handling

- [x] A-011 R3: If the repo was flipped to public, the task output says so explicitly and gives the reason (the exact API error); if it was not needed, visibility is still private
- [x] A-012 R3: **N/A**: the only `POST .../pages` failure was the plan/private-repo 422, so the stop-on-other-failure path was never exercised; the conditional fallback behaved as specified (A-011)

### Code Quality

- [x] A-013 Pattern consistency: the three edits keep the surrounding file formats (single-line CNAME, existing `astro.config.mjs` quoting/comment style, robots.txt line shape)
- [x] A-014 No unnecessary duplication: no new scripts, helpers, or workflow files were added for a one-time bootstrap
- [x] A-015 Minimal dependencies (Constitution VI): `package.json` / `pnpm-lock.yaml` unchanged

## Notes

- Check items as you review: `- [x]`
- All acceptance items must pass before `/fab-continue` (hydrate)
- If an item is not applicable, mark checked and prefix with **N/A**: `- [x] A-NNN **N/A**: {reason}`

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Confident | One bootstrap `workflow_dispatch` from the change branch (temporary branch policy, removed after) verifies the deploy inside the change | Repo has never deployed; Pages site must exist to bind the domain; merge re-deploys identical content; `deploy.yml` unchanged | S:60 R:85 A:65 D:60 |
| 2 | Tentative | Visibility flips to public only on a plan/private-repo Pages error | Plan tier unknowable from CLI; content already public as shll.ai; reversible; user did not address visibility | S:40 R:60 A:45 D:50 |
| 3 | Certain | `robots.txt` sitemap line is in scope; all other shll.ai mentions are out | Static file that does not follow `Astro.site`; brand copy belongs to S3/S4/S5 | S:80 R:95 A:85 D:85 |
| 4 | Certain | DNS is applied out of band by the operator; the HTTPS enforce step is conditional on DNS state at apply time and otherwise a recorded follow-up | User instruction; certificate issuance depends on DNS the change does not control | S:95 R:90 A:95 D:95 |
| 5 | Certain | Plan-doc row edit in run-kit is a plain commit on run-kit's current branch | Pickup protocol step 4; one-line table edit outside this repo | S:70 R:95 A:85 D:85 |

5 assumptions (3 certain, 1 confident, 1 tentative).
