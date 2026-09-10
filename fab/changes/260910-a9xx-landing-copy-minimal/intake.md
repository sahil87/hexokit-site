# Intake: Minimal, natural landing copy (study 2)

**Change**: 260910-a9xx-landing-copy-minimal
**Created**: 2026-09-10

## Origin

> Do another study on the copy of the website. I think a lot can be improved and made minimal compared with the competitors. See if the language can be made more natural.

> This new study is great. Also save this study in docs somewhere. It would be great if you could note down in fab/project/context.md that this kind of philosophy should be followed in the copy that is being added to this website.

**Interaction mode**: conversational, same day as the landing change `lvnp` (PR #4, merged 2026-09-10). A research agent produced `docs/findings/landing-copy-study-2-minimal.md` (on disk, uncommitted — this change commits it) measuring the landing's copy against eight minimal dev-tool landings and proposing a string-by-string rewrite (712 → 517 words). Sahil approved applying **all of it** with two deviations the orchestrator proposed, chose to **decouple** the hexagon blurbs from `/toolkit/` (shorter on the landing, on purpose), and chose to leave the finished `lvnp` change un-archived for now.

Decisions from the conversation:
1. **Apply every string in the study's § 5**, except: card 7 keeps the word **"Quake-style"** once (Sahil asked for the Quake terminal as a feature; to the audience the word is the hook), and card 6 keeps **the GUI display as a third short item** ("or the machine's own screen") rather than dropping a real capability for a two-item list.
2. **Blurbs decoupled**: the six `TOOLKIT_EDGES[].blurb` strings become the study's 6–7-word versions; the "verbatim hand-copy of `/toolkit/`" rule in `landing-data.ts` and memory becomes "intentionally shorter on the landing; `/toolkit/` keeps the long form".
3. **Fixed strings** stay exactly as approved today: H1, sub-line, the five H2s ("One line, then you are in", "Everything is a live terminal", "Use any agent, untouched", "The HexoKit toolkit", "The desktop app"), the desktop card's lead sentence, the two install command lines, the footer's six labels, all seven card titles except card 1.
4. **Copy philosophy recorded in `fab/project/context.md`** so future copy on the site follows it (Sahil's request).

## Why

**Problem.** The landing (after `lvnp`) says true things at twice the length the genre uses: card bodies average 32 words against a competitor median of 14, the hero lead is 38 words against a median of 19, 43 % of sentences carry an em-dash and 29 % a colon or semicolon, and several sentences fail the spoken-aloud test (the desktop card's second sentence has four dashes and two parentheticals in 33 words). It also teaches mechanism a first-time visitor cannot use ("a hook stamps a tmux pane option", the status-dot legend "hue = journey, shape = liveness, overlays = flags", "digest-verified", "quarantine-free") and says four things twice (hero ↔ card 1 ↔ *It is*; card 5 ↔ card 7 both introduce the operator; install note ↔ toolkit lead; "no database" ↔ "state derived from tmux + the filesystem").

**Consequence of not doing it.** A landing that reads written rather than said, and that a visitor skims past because every card is a paragraph. The competitive doc's defensible claims (agent-agnostic, no database, tmux as the substrate, phone-first, parallel agents in worktrees) are all present but buried under words that do not carry them.

**Why this approach.** The study measured the target (eight pages, same script), audited every insider term with a keep/replace/cut verdict, and rewrote each string with a stated reason — so the apply is a transcription of decided copy, not a fresh writing task. The two deviations are the only places Sahil's stated intent (the Quake terminal as a feature; a real capability not dropped) outranks the word count. Decoupling the blurbs is a decision, not drift: a landing blurb and a doc blurb do different jobs, and the coupling was worth less than 30 words of the page's densest section.

## What Changes

All in `sites/astro-starlight-terminal1/` unless stated. Copy only — no layout, asset, route, or dependency changes. Every `rk <verb>` below exists in `help/hexokit.json` (`riff`, `cron`, `operator`, `code`, `present`, `doctor`, `desktop`); the contract test `scripts/landing-data.test.mjs` re-checks that.

### 1. `src/lib/landing-data.ts` — the copy strings

**`HERO.lead`** →
"A remote console for the machine you actually work on. Every tmux session and pane is a live terminal, at your desk or on the couch. Nothing to configure, no database."

**`FEATURES`** (titles unchanged unless shown; bodies replaced):

| # | Title | Body |
|---|-------|------|
| 1 | **Every pane, on every device** (was "Every pane, a live terminal — from any device") | Tap a session on your phone and you are in the shell you left at your desk. Over Tailscale from anywhere. |
| 2 | Waiting, working, idle — at a glance | Every window running an agent says which. Claude Code, Codex, Gemini CLI and Copilot CLI report in after a one-time setup. |
| 3 | One command per parallel agent | `rk riff` gives an agent its own git worktree and tmux window. `rk riff -N 3` starts three. |
| 4 | Watch three agents and the dev server at once | Pin panes from any machine into a board and they sit side by side. One dot per window tells you where it stands. |
| 5 | Work that starts without you | `rk cron` wakes an agent on a schedule. `rk operator` keeps watch and pings your phone. |
| 6 | A window is not only a terminal | Open an editor with `rk code`, a web page your agent writes with `rk present`, or the machine's own screen. *(deviation: third item kept)* |
| 7 | The operator drops in from any tab | One shortcut and the operator's console slides down over whatever you are looking at, Quake-style. Ask, get an answer, send it back up. Your pane never moves. *(deviation: "Quake-style" kept)* |

Image entries and `href`s unchanged.

**`TOOLKIT_EDGES[].blurb`** (decoupled from `/toolkit/`):

| slug | blurb |
|------|-------|
| fab-kit | a plan before any agent writes code. |
| wt | throwaway git worktrees, one per change. |
| idea | catch an idea without breaking flow. |
| tu | what your AI coding sessions cost. |
| hop | jump to any of your repos. |
| desktop | the Mac app around the dashboard. |

**Comments**: the file header's "HAND-COPY DRIFT SURFACE" paragraph and the `ToolkitEdge.blurb` doc comment change from "verbatim copy of `toolkit/index.mdx` (five verbatim, desktop trimmed)" to: *the landing carries its own, deliberately shorter blurbs (copy study 2, change a9xx); `/toolkit/` keeps the long form; the two are NOT a copy of each other and are not expected to match — when a tool's job changes, edit both on purpose.* The Copilot-review comment from PR #4 that fixed the "verbatim" claim is superseded by this.

### 2. `src/pages/index.astro` — section prose

- Install note 1 → "Installs `shll` and HexoKit. Nothing else. The [six companions](/toolkit/) are one more command away." (three sentences; the parenthetical gloss and the dash go)
- Install note 2 → "Needs tmux 3.4 or newer. Run `rk doctor` if anything looks wrong."
- Differentiator paragraph → "Mostly what runs in those panes is **coding agents, several at once**. But HexoKit never wraps them. A pane is just as happily a build, a REPL, an ssh session, `htop`. **The agent is one of the things you run, not the thing HexoKit is.**"
- *It is* → "A console for your tmux, built for the phone. Any agent, no database, nothing to keep in sync."
- *It isn't* → "An agent wrapper. It reads no agent's output and speaks no agent's protocol. When the agent tools change again, this layer stays put."
- Desktop body: sentence 1 (fixed) unchanged; sentence 2 → "It connects to this Mac, to another over SSH, or to any URL, and it starts and stops nothing on its own."; sentence 3 → "Your tmux sessions outlive it."; the note under the code block → "Install from the CLI. A downloaded DMG trips Gatekeeper; this one does not."
- Everything else on the page (eyebrows, H2s, CTAs, footer, markup) unchanged.

### 3. `src/components/ToolkitHexagon.astro` — the toolkit lead

→ "HexoKit is the cockpit. Six small tools sit on its six edges, and [`shll`](/shll/) installs them all." (the 14-word dash-bracketed definition of "companion" goes; the `shll` link stays).

### 4. `docs/findings/landing-copy-study-2-minimal.md` — committed

The study file already on disk is committed as-is (it is the design record for this change; the first study `landing-copy-study.md` is already committed).

### 5. `fab/project/context.md` — the copy philosophy (Sahil's request)

Append a section **"## Copy on this site"** stating the standing rule for any copy added to the site, derived from the two studies:

- Say it the way you would say it aloud. Short sentences (aim under 15 words), one claim each; if a section needs 40 words, use four sentences, not two.
- Outcome over mechanism. Name what the reader sees or gets; leave how it works to the docs.
- Plain punctuation: no em-dash chains, no colon-led lists inside sentences, no parenthetical asides, no rhetorical questions.
- Use the reader's own words bare (tmux, pane, session, window, worktree, board, agent) and never introduce an insider term on a landing page ("pane option", "harness", "liveness", "tier", "substrate" stay in the docs).
- Headings make one claim and never depend on the number of items beneath them; no counts as scope, no hedges ("is good at", "helps you"), no adjectives as proof.
- Hand-written prose may name only `rk` verbs present in `help/hexokit.json` (the vn39 rule), with the product as **HexoKit** and the binary as `rk`.
- Pointers: `docs/findings/landing-copy-study.md` (structure and claims, incl. the § 5 style sheet) and `docs/findings/landing-copy-study-2-minimal.md` (volume and register, incl. the measured competitor norms: card blurbs median 14 words, heroes 19).

### 6. Tests

`scripts/landing-data.test.mjs` is unchanged in shape (it asserts structure and the `rk <verb>` rule, not copy text) and must stay green. `just verify` (validate + tests + build) must pass.

### 7. Verification

`just build && just preview`, then `just shot` at 1440 dark/light and 400 dark (and an anchored `#features` capture so lazy card images load) to confirm no layout regressions from shorter copy (cards keep their grid alignment; the wide operator-console card's body still fills its column). Captures to the session scratchpad only.

## Affected Memory

- `site/landing-page`: (modify) — `sites/astro-starlight-terminal1/docs/memory/site/landing-page.md`: the copy source notes (section copy now per study 2; the two deviations recorded), the hexagon blurbs no longer a verbatim hand-copy of `/toolkit/` (intentionally shorter), the Design Decision "landing blurbs are their own, shorter set" (Decision / Why / Rejected / Introduced by), the copy-philosophy pointer to `fab/project/context.md`.
- `conventions/tool-page-rubric`: (modify) — the "toolkit-hexagon blurb list" paragraph (currently: a hand-copy drift surface of `/toolkit/` § The six companions) becomes: two independent sets by design — the landing's short blurbs and `/toolkit/`'s long ones; the only remaining cross-file copy discipline is that both describe the same job for each tool.

## Impact

- Files: `src/lib/landing-data.ts`, `src/pages/index.astro`, `src/components/ToolkitHexagon.astro` (strings and comments only); `docs/findings/landing-copy-study-2-minimal.md` (new, already on disk); `fab/project/context.md` (new section); memory files above. No assets, no CSS, no routes, no dependencies, no workflow changes.
- Word count on `/`: 712 → ~525 (the study's 517 plus the two kept phrases).
- Risk: none structural. The one judgment risk is tone — the study's register is deliberately plainer than the README's; the fixed strings (H1, sub-line, H2s) keep the brand voice anchored.

## Open Questions

- None. Every string is decided; the two deviations and the blurb decoupling are user decisions recorded above.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Apply every § 5 string of copy study 2 | Asked — user chose "all of it, with my two deviations" | S:95 R:95 A:95 D:95 |
| 2 | Certain | Card 7 keeps "Quake-style" once; card 6 keeps the GUI display as a third short item | The two deviations were stated in the question the user approved | S:95 R:95 A:90 D:95 |
| 3 | Certain | Hexagon blurbs decoupled from `/toolkit/` — shorter on the landing on purpose; comments and memory say so | Asked — user chose "decouple" | S:95 R:90 A:90 D:95 |
| 4 | Certain | Fixed strings (H1, sub-line, five H2s, desktop lead sentence, install commands, footer, card titles 2–7) unchanged | All approved by the user earlier today; the study treats them as given | S:95 R:95 A:95 D:95 |
| 5 | Certain | The study file is committed under `docs/findings/` and the copy philosophy is appended to `fab/project/context.md` | User's explicit request | S:95 R:95 A:95 D:95 |
| 6 | Confident | `lvnp` stays un-archived; this change branches from the current `main` tip | Asked — user chose "leave it for now"; fab switches the active change | S:90 R:90 A:90 D:90 |
| 7 | Confident | Change type `fix` (a copy pass on a shipped page) | Copy polish is closest to a fix; the alternative `feat` overstates it | S:50 R:95 A:75 D:60 |
| 8 | Confident | "or the machine's own screen" is the wording for the GUI-display item | Plain replacement for "the host's GUI display"; the study's jargon rule | S:55 R:95 A:80 D:70 |
| 9 | Confident | The `/toolkit/` page itself is not edited | Its long blurbs are correct for a directory page; the decoupling decision is about the landing | S:80 R:95 A:90 D:85 |

9 assumptions (5 certain, 4 confident, 0 tentative, 0 unresolved).
