# hexokit-site task runner
# Usage: just <recipe>    List all: just --list
#
# The repo hosts several site variants under sites/; `site` is the LIVE one
# (keep in step with SITE_DIR in .github/workflows/deploy.yml).

site := "sites/astro-starlight-terminal1"

# ─── Setup & Development ──────────────────────────────────────────────

# Install the live site's dependencies (a fresh worktree has no node_modules)
setup:
    cd {{site}} && pnpm install --frozen-lockfile

# Copied from run-kit's `just setup`. Cross-platform: Playwright's installer
# handles macOS and Linux (`--with-deps` pulls OS libraries on Linux; a no-op on
# macOS). The browser build lands in Playwright's shared per-user cache
# (~/Library/Caches/ms-playwright on macOS, ~/.cache/ms-playwright on Linux), so
# a build another worktree already fetched is not downloaded again.

# Install Playwright's Chromium for this worktree, on demand (screenshots, one-off checks)
playwright: setup
    cd {{site}} && pnpm exec playwright install --with-deps chromium

# Astro dev server (http://127.0.0.1:4321, bound to 0.0.0.0 for run-kit/Tailscale proxying)
dev *args:
    cd {{site}} && pnpm dev {{args}}

# Static build → sites/<site>/dist/ (never committed; CI is the source of truth)
build:
    cd {{site}} && pnpm build

# Preview the static build locally
preview *args:
    cd {{site}} && pnpm preview {{args}}

# ─── Quality (mirrors .github/workflows/ci.yml) ───────────────────────

# Validate help/<tool>.json contracts
validate:
    cd {{site}} && node scripts/validate-help.mjs

# Unit tests (node --test over scripts/*.test.mjs)
test:
    cd {{site}} && node --test scripts/*.test.mjs

# Full verification: validate, test, build
verify: validate test build

# ─── Screenshots ─────────────────────────────────────────────────────

# Examples (a dev/preview page or file:///abs/path.html):
#   just shot http://127.0.0.1:4321/ /tmp/home.png                  # 1440 wide, dark
#   just shot http://127.0.0.1:4321/ /tmp/home-phone.png 400 900    # phone width
#   just shot http://127.0.0.1:4321/ /tmp/home-light.png 1440 900 light
# Full-page capture, cross-platform (Playwright CLI). `scheme` drives
# prefers-color-scheme — Starlight's default `auto` theme follows it, so a fresh
# headless context renders the requested theme with no localStorage poking.
# Requires `just playwright` once per worktree.

# Headless full-page screenshot of a URL: just shot <url> <out.png> [width] [height] [dark|light]
shot url out width="1440" height="900" scheme="dark":
    cd {{site}} && pnpm exec playwright screenshot --full-page --wait-for-timeout=2000 --color-scheme={{scheme}} --viewport-size={{width}},{{height}} "{{url}}" "{{out}}"
