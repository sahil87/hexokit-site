# Intake: HexoKit domain and deploy (rebrand plan row S2)

**Change**: 260910-1ha7-hexokit-domain-and-deploy
**Created**: 2026-09-10

## Origin

One-shot `/fab-new` invocation by the operator, executing row **S2** of the HexoKit rebrand plan
(`run-kit` repo, `fab/plans/sahil/26-09-10-hexokit-rebrand.md`, Phase 0). Raw input (registrar name redacted):

> Execute row S2 ("hexokit-domain-and-deploy") of fab/plans/sahil/26-09-10-hexokit-rebrand.md Phase 0. Read the whole plan doc first (Decision log, Site shape, Pickup protocol) — this repo (sahil87/hexokit-site) was just created by the operator as a --mirror clone of sahil87/shll.ai (S1, done); the two daily Refresh cron workflows are already disabled. Scope for this change: set CNAME -> hexokit.com; configure DNS (A/AAAA records + www CNAME) pointing at GitHub Pages; verify the custom domain on the sahil87 GitHub account (gh api / repo settings — you may need `gh auth switch --user sahil87` for repo-settings changes, then `gh auth switch --user sahil-noon` when done, matching this project convention); set `site:` in astro.config to hexokit.com; get the deploy workflow green on this repo. Site should be live at hexokit.com but unannounced/unlinked from anywhere when done. Depends on S1 only (already complete). If DNS configuration requires interactive portal access you cannot perform headlessly, do as much as is CLI/API-automatable (repo settings, astro.config, CNAME file, gh Pages custom-domain verification) and clearly report back exactly what manual DNS step remains for the user, rather than stalling.

Plan-doc decisions that bind this change (Pickup protocol step 1: D1–D4 and D13 are Certain; D5–D12 are proposals, not re-opened here):

- **D13 (Confirmed)** — the site repo is a `--mirror` copy of `sahil87/shll.ai` named `sahil87/hexokit-site`; hexokit.com is built and published *there* while shll.ai stays live and untouched. Nothing irreversible happens until the site has been tested end to end on the real domain.
- **D5 (Proposed)** — one website, hexokit.com; shll.ai later becomes a 301 host. S2 only stands the new domain up; it does not touch shll.ai.
- **Plan risk "Cron double-scaffold"** — the copied `Refresh: Help` / `Refresh: README` workflows MUST stay disabled until S3. S2 does not re-enable them.

Facts established during intake (probed with `gh`, `dig`, and the local tree on 2026-09-10):

| Fact | Value |
|------|-------|
| `sahil87/hexokit-site` visibility | **private** (the default `sahil-noon` account gets HTTP 404 on it; all repo API calls need `gh auth switch --user sahil87`) |
| Pages on the new repo | **not enabled** (`has_pages: false`; `GET /repos/sahil87/hexokit-site/pages` → 404) |
| Workflow states | `ci.yml` active, `deploy.yml` active, `refresh-help.yml` disabled_manually, `refresh-readme.yml` disabled_manually; zero workflow runs so far |
| `sahil87` plan tier | unknown (token lacks `user` scope, `plan: null`); no private repo under `sahil87` has Pages enabled, so a free-tier account (Pages on private repos requires Pro) is the working assumption |
| hexokit.com DNS today | registrar parking page; apex `A` to a parking IP, `www CNAME` to the registrar's parking host, no AAAA |
| shll.ai DNS (the working reference) | apex `A 185.199.108/109/110/111.153`, `AAAA 2606:50c0:8000/8001/8002/8003::153`, `www CNAME sahil87.github.io` |
| shll.ai Pages config (the target shape) | `build_type: workflow`, `cname: shll.ai`, `https_enforced: true`; `github-pages` environment with a custom deployment-branch policy |
| DNS management | Handled **out of band by the operator** from a private infrastructure repo (infrastructure-as-code). No DNS provider names, account identifiers, zone IDs, file paths, or credentials may appear anywhere in this repo — not in this intake, the plan, the PR, commit messages, or the memory hydrate. |
| User-account Pages domain verification API | **none** (`GET /user/pages/domains` → 404); verification is a Settings UI step |
| Live site | `sites/astro-starlight-terminal1` (deploy.yml `SITE_DIR`); `public/CNAME` = `shll.ai`; `astro.config.mjs` `site: 'https://shll.ai'`; `public/robots.txt` hard-codes `Sitemap: https://shll.ai/sitemap-index.xml` |

## Why

**Problem.** `sahil87/hexokit-site` exists (S1) but is a byte-for-byte mirror of shll.ai: its CNAME still
claims `shll.ai`, Astro's `site` still emits `https://shll.ai/...` for every canonical/og/sitemap/llms
URL, GitHub Pages is not enabled on the repo, and hexokit.com points at a registrar parking page. The
rebrand plan's whole Phase 0 premise (D13: "nothing irreversible happens until the site has been tested
end to end on the real domain") needs a second live domain to test against. S3 (site structure), S4
(landing page) and S5 (install script) all depend on S2 — none of them can be verified on the real
domain until this lands.

**Consequence of not doing it.** Phase 0 stalls: S3/S4 would be built against `localhost` only, the
cert/HTTPS/DNS/redirect behaviour of the real domain would be discovered at cutover (Phase 2, the
irreversible phase), and a mistake there would take shll.ai down with it.

**Why this approach.** Everything the shll.ai deployment already does is reused unchanged — the same
Astro site, the same `deploy.yml`, the same GitHub Pages "GitHub Actions" build type, the same
apex-A/AAAA + `www` CNAME DNS shape. The only deltas are the two domain-bearing files in the site
(`public/CNAME`, `astro.config.mjs` `site:`), the domain-bearing `robots.txt` sitemap line, and the
one-time repo/Pages bootstrap (DNS is applied out of band). The alternative — a Cloudflare/Vercel front — is rejected by the
existing deployment design decision ("GitHub Pages, not Cloudflare/Vercel/Netlify") and by D13's
"one repo carries one Pages deployment + one custom domain".

## What Changes

### 1. Site files: domain-bearing values flip to hexokit.com

All under `sites/astro-starlight-terminal1/` (the live `SITE_DIR`). Nothing else in the site is
touched — every other absolute URL (og:image, canonical, JSON-LD, llms.txt, security.txt, versions.json,
sitemap) derives from `Astro.site` and follows automatically.

- **`public/CNAME`** — content becomes exactly `hexokit.com` (no protocol, no path, trailing newline).
  Astro copies it verbatim into `dist/`; GitHub Pages reads it on every deploy.
- **`astro.config.mjs`** — `site: 'https://shll.ai'` becomes `site: 'https://hexokit.com'`. This is the
  single origin source (see `Head.astro`, `security.txt.ts`, `llms.ts`, `versions.json.ts` comments —
  "never hardcoded").
- **`public/robots.txt`** — `Sitemap: https://shll.ai/sitemap-index.xml` becomes
  `Sitemap: https://hexokit.com/sitemap-index.xml`. It is a static file, so it does not follow `site:`
  and must be edited by hand; leaving it would advertise the wrong host's sitemap from day one.

Deliberately **not** changed in S2 (they are content, owned by later rows):

- The install one-liner text (`InstallOneLiner.astro`, homepage) — `curl -fsSL https://shll.ai/install | sh`
  stays; D10/S5 own it. shll.ai/install remains live throughout Phase 0.
- `terminal-share.ts` `SHARE_FOOTER` (`# replayed from https://shll.ai`) and the `#play=` link in its
  test — brand copy, S3/S4.
- `Footer.astro`'s LICENSE link to `github.com/sahil87/shll.ai` — S3.
- `deploy.yml` / `.gitignore` / `README.md` comments that say "shll.ai" — prose only; S3.
- Test fixtures that pass `'https://shll.ai'` as an explicit `origin` argument (`llms.test.mjs`) — they
  test URL-absolutizing logic with a literal origin and do not read `astro.config.mjs`; they stay green
  and are not domain assertions.
- `sites/astro-tailwind-terminal1/public/CNAME` — that variant is not deployed (Constitution III).

### 2. GitHub repo + Pages bootstrap (via `gh`, as `sahil87`)

Every call below needs `gh auth switch --user sahil87` first and `gh auth switch --user sahil-noon`
afterwards (project convention in the user's CLAUDE.md; the default account has no access to the
private repo). Wrap them in one shell block so the switch-back always runs.

1. **Enable Pages with the Actions build type** (idempotent — skip if `GET .../pages` already 200s):

   ```sh
   gh api -X POST repos/sahil87/hexokit-site/pages -f build_type=workflow
   ```

   If this fails **because the repo is private on a plan without private Pages** (HTTP 403/422 whose
   message names the plan or private repositories), flip visibility and retry:

   ```sh
   gh repo edit sahil87/hexokit-site --visibility public --accept-visibility-change-consequences
   ```

   <!-- assumed: repo goes public only if Pages cannot be enabled on the private repo — content is already public as shll.ai; no plan-tier signal available -->
   Rationale for the fallback: the repo is a mirror of the public `sahil87/shll.ai` (`private: false`),
   so nothing confidential is exposed; the plan's "unannounced" requirement is about links and
   announcements, not repo visibility, and the flip is reversible. If the enable call fails for any
   *other* reason, stop and surface the error — do not flip visibility speculatively.

2. **Set the custom domain** on the Pages site (idempotent):

   ```sh
   gh api -X PUT repos/sahil87/hexokit-site/pages -f cname=hexokit.com -F https_enforced=false
   ```

   `https_enforced` cannot be `true` until GitHub has issued the certificate, which requires DNS to
   already point at Pages. See §4 for the follow-up.

3. **Allow the change branch to deploy** to the auto-created `github-pages` environment so the first
   (bootstrap) deploy can run from this branch before merge (see §3):

   ```sh
   gh api -X POST repos/sahil87/hexokit-site/environments/github-pages/deployment-branch-policies \
     -f name=260910-1ha7-hexokit-domain-and-deploy
   ```

   Only needed if `GET .../environments/github-pages` shows `deployment_branch_policy.custom_branch_policies: true`
   (GitHub creates it that way, restricted to `main`). Remove the policy again after the bootstrap
   deploy succeeds so the environment ends in the same `main`-only shape shll.ai has.

### 3. Deploy workflow green on the new repo

`.github/workflows/deploy.yml` is unchanged (`SITE_DIR: sites/astro-starlight-terminal1`, push-to-main
+ `workflow_dispatch`). Two verification tiers:

1. **Local**: `pnpm install --frozen-lockfile && pnpm build` in the site dir; assert `dist/CNAME` is
   `hexokit.com`, `dist/robots.txt` names `https://hexokit.com/sitemap-index.xml`, `dist/sitemap-index.xml`
   / `dist/llms.txt` / `dist/index.html` `<link rel="canonical">` all use `https://hexokit.com`, and
   `node --test scripts/*.test.mjs` passes. `curl -fsSL https://raw.githubusercontent.com/sahil87/shll/main/scripts/install.sh -o public/install`
   is what CI does before build; run it locally too (the file is gitignored) or accept that `/install`
   is absent from the local dist.
2. **On the repo**: dispatch the deploy once from the change branch as the bootstrap deploy —
   `gh workflow run deploy.yml -R sahil87/hexokit-site --ref 260910-1ha7-hexokit-domain-and-deploy`, then
   `gh run watch` until the `deploy` job succeeds and `GET .../pages` reports `status: built`. This is the
   one deliberate deviation from "deploy on push to main" (Constitution IV / deployment memory): the new
   repo has zero deployments, the Pages site must exist before the domain can bind and the cert can
   issue, and the merge to `main` re-deploys identical content minutes later. Push-to-main remains the
   steady-state path; no workflow file changes.
   <!-- assumed: a single workflow_dispatch bootstrap deploy from the change branch is acceptable — the repo has never deployed; merge re-deploys identical content -->

After the bootstrap deploy, `https://sahil87.github.io/hexokit-site/` will NOT serve the site (a
custom-domain Pages site redirects the `github.io` URL to the CNAME). Verification of "live" is therefore
`curl -sI https://hexokit.com` → `200` with `server: GitHub.com`, which needs the DNS step below.

### 4. DNS (out of band — operator-managed, not part of this repo)

DNS for hexokit.com is managed by the operator from a **private infrastructure-as-code repo** and is
applied outside this change. The apply agent MUST NOT attempt DNS changes, MUST NOT probe for or use
DNS-provider credentials, and MUST NOT write any DNS-provider name, account/zone identifier, file path,
or credential into this repo (intake, plan, code comments, PR body, commit messages, memory). The only
DNS facts this repo may state are the public, GitHub-documented target records:

| Type | Host | Value |
|------|------|-------|
| A | apex | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA | apex | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `sahil87.github.io` |

These are GitHub's published Pages addresses and exactly what shll.ai resolves to today (`dig`-verified).

**Account-level domain verification** (plan row: "verify the domain on the `sahil87` account") — no
REST endpoint exists for user accounts, so it is a GitHub UI step for the user: github.com → Settings →
Pages → *Add a domain* → `hexokit.com` → add the TXT record GitHub shows (`_github-pages-challenge-sahil87`)
via the operator's DNS repo → *Verify*. Independent of the repo-level `cname` and of serving; report it
as a remaining manual step.

**Follow-up once DNS resolves** (the apply agent does this only if `dig +short hexokit.com A` already
returns the `185.199.*` set at apply time; otherwise it is reported as a follow-up):

```sh
gh auth switch --user sahil87
gh api -X PUT repos/sahil87/hexokit-site/pages -f cname=hexokit.com -F https_enforced=true
gh api repos/sahil87/hexokit-site/pages --jq '{status,cname,https_enforced,protected_domain_state}'
gh auth switch --user sahil-noon
```

`https_enforced=true` fails with 422 until the certificate is issued (typically 5–30 min after DNS
propagates); retry until it sticks. Done state: `curl -sI https://hexokit.com` → `HTTP/2 200`,
`curl -sI http://hexokit.com` → `301` to https, `curl -sI https://www.hexokit.com` → `301` to the apex.

### 5. Plan-doc bookkeeping (Pickup protocol step 4)

Update the S2 row in `/home/sahil/code/sahil87/run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md`
(the plan lives in the **run-kit** repo, not here): fill the PR column with this change's PR URL and
Status `in progress` → `done (DNS manual step pending)` as appropriate, and bump the Status line
("Next pickup is S3/S4"). That is a separate repo — a plain commit there, not a fab change.

## Affected Memory

- `build-deploy/deployment`: (modify) the custom-domain requirement (`public/CNAME` MUST contain `shll.ai`) becomes `hexokit.com`; add the S2 bootstrap facts — repo is `sahil87/hexokit-site` (private mirror, `sahil87` account required for `gh`), Pages enabled via API with `build_type: workflow`, `cname` set via API, DNS shape (A/AAAA + `www` CNAME, identical to shll.ai's; applied out of band by the operator — no provider details recorded), `https_enforced` gated on cert issuance, account-level domain verification is UI-only, and the one-time bootstrap `workflow_dispatch` from the change branch with its `github-pages` branch-policy adjustment. Record that `robots.txt` is the one domain-bearing static file that does not follow `site:`.

No spec changes: `docs/specs/versions-manifest-contract.md` names `https://shll.ai/versions.json` as the
consumer URL — that contract changes at C1/X2 (the `shll` binary's constant flips there), not at S2,
because shll.ai keeps serving it throughout Phase 0.

## Impact

- **Files**: `sites/astro-starlight-terminal1/public/CNAME`, `sites/astro-starlight-terminal1/astro.config.mjs` (one line), `sites/astro-starlight-terminal1/public/robots.txt` (one line), `docs/memory/build-deploy/deployment.md` (hydrate).
- **External state**: `sahil87/hexokit-site` Pages settings (enabled, `cname`, possibly `https_enforced`), the `github-pages` environment branch policy (temporary), possibly repo visibility (conditional, see §2.1), one `workflow_dispatch` deploy run. DNS for hexokit.com is applied out of band by the operator (not by this change).
- **Not touched**: `sahil87/shll.ai` repo, shll.ai DNS, the two disabled refresh workflows, `deploy.yml`/`ci.yml` contents, any tool README/help content, the `run-kit` repo except the plan-doc row.
- **Blast radius**: hexokit.com only — it currently serves a parking page, so there is no audience to break. shll.ai is unaffected by every step.
- **Tests**: `node --test scripts/*.test.mjs` (unchanged expectations; no test reads `site:`). Build assertions above are the acceptance checks.
- **Dependencies**: none added (Constitution VI).

## Open Questions

- If enabling Pages on the private repo fails for a plan-tier reason, is flipping the repo to public
  acceptable, or would you rather upgrade the `sahil87` account to Pro? (Intake proceeds on "flip to
  public, conditionally" — see Assumptions #4.)

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | DNS is applied out of band by the operator from a private infra repo; this change never touches DNS and never records provider/account/path details in this public repo | User instruction: "Ensure these details don't make it into this public repo … just make them and continue"; only GitHub's public Pages addresses may be stated | S:95 R:90 A:95 D:95 |
| 2 | Certain | DNS shape = GitHub Pages apex A ×4 + AAAA ×4 + `www CNAME sahil87.github.io` | GitHub's documented Pages addresses; byte-identical to shll.ai's working records (`dig`-verified) | S:90 R:90 A:100 D:100 |
| 3 | Certain | Account-level domain verification is a GitHub Settings UI step (TXT `_github-pages-challenge-sahil87`), reported to the user alongside the DNS records | `GET /user/pages/domains` → 404; no REST surface exists for user-account verified domains | S:80 R:90 A:90 D:95 |
| 4 | Tentative | If `POST .../pages` fails for a plan/private-repo reason, flip `sahil87/hexokit-site` to public and retry; any other failure stops the apply | Plan tier unknowable from here (`plan: null`, no private repo with Pages on the account); content is already public as shll.ai; visibility flip is reversible; user did not address visibility | S:40 R:60 A:45 D:50 |
| 5 | Confident | One bootstrap `workflow_dispatch` of `deploy.yml` from the change branch (with a temporary `github-pages` branch policy) is how "deploy green" is verified inside the change; steady state stays push-to-main | Repo has zero deployments and the Pages site must exist to bind the domain; merge re-deploys identical content; no workflow file changes | S:60 R:85 A:65 D:60 |
| 6 | Certain | `public/robots.txt`'s sitemap line is in scope (a domain-bearing static file), while install-line/share-footer/footer-license/comment mentions of shll.ai are NOT (content, owned by S3/S4/S5) | Plan rows S3/S4/S5 own brand copy and llms/OG/JSON-LD; S2 is "domain + deploy" only; robots.txt is the only static file that would advertise the wrong host | S:80 R:95 A:85 D:85 |
| 7 | Certain | `https_enforced=true` is set only after the cert issues (needs DNS); until then `cname` is set with `https_enforced=false` and the enforce step is documented as a follow-up | GitHub rejects enforcement before certificate issuance; DNS is manual so cert timing is outside the change's control | S:85 R:95 A:95 D:95 |
| 8 | Certain | The two `Refresh:` workflows stay disabled; `deploy.yml`/`ci.yml` are not edited | Plan risk "Cron double-scaffold" and the invocation both say so explicitly; the existing workflow already deploys correctly on shll.ai | S:100 R:95 A:100 D:100 |
| 9 | Certain | `sahil87/shll.ai` and shll.ai DNS are not touched in any way | D13 Confirmed: shll.ai stays live and untouched until Phase 2 | S:95 R:70 A:95 D:95 |
| 10 | Confident | Plan-doc S2 row/Status updated in the run-kit repo as a plain commit, not a fab change | Pickup protocol step 4 requires it; the plan lives in run-kit; a one-line table edit | S:70 R:95 A:85 D:85 |

10 assumptions (8 certain, 1 confident, 1 tentative, 0 unresolved).
