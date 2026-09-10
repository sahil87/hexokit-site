# hexokit.com — landing copy study

> What the words on the HexoKit landing page should say, judged against the copy
> actually running on the nearest competitors and on six best-in-class dev-tool
> landings. Research done 2026-09-10 by live fetch; short quotes attributed with URLs.
> Repo read-only — no site file was touched.

**Product under study.** HexoKit (hexokit.com), binary `rk`/`hexokit`, tagline
"Your tmux, in the browser and on your phone." / "Cockpit for the agent era."
Current landing lives in `sites/astro-starlight-terminal1/src/lib/landing-data.ts`
and `src/pages/index.astro`.

**Hard constraint carried through every proposal below.** Hand-written prose may
only name `rk` commands that exist in `help/hexokit.json`. The verified roster is:
`agent code code-server cron daemon desktop doctor mux notify operator present
remote riff role serve skill status tab tutorial update url`. Every backticked
command in this document is from that list. `rk boards`, `rk board`, `rk pin`,
`rk fleet`, `rk watch` **do not exist** — I have used none of them.

---

## 1. The comparison table

Fetched live unless marked. Quotes are short and verbatim.

| Tool | Hero headline | Subhead | Section-heading style | Card-title style | Install / CTA wording | Tone |
|---|---|---|---|---|---|---|
| **herdr.dev** | "Run them *anywhere.* Leave them running." | "Herdr is where your coding agents live. However many you run, across however many projects, each in its own terminal. Walk away and they keep working." | Lowercase eyebrow + **sentence-as-heading**: eyebrow "the agent runtime", then headings that are full claims — "Always running.", "You never hunt for the stuck one.", "All your machines. One Herdr." Numbered 01–05. No "Features" anywhere. | Sentences with terminal periods; benefit-first, mechanism second | Bare copyable command in the hero, `curl -fsSL https://herdr.dev/install.sh \| sh`, repeated in a closing CTA "Give them somewhere to live." | Confident, plain, second-person; short declaratives; zero adjectives |
| **guppi.sh** | "All your tmux sessions, all your agents, one interface" | "never lose an agent again" | Generic: "Everything you need", "Get started in seconds" | **Noun labels** — "Live Terminal in Your Browser", "Session Dashboard", "AI Agent Awareness", "Multi-Host Support", "Single Binary, Zero Config", "Polished Developer UX" | "Three commands to tmux everywhere", steps labelled Install / Start / Connect | Friendly, generic; the copy is the weakest layer of an otherwise good page |
| **cmux.com** (Manaflow) | "The terminal built for multitasking" | "…for multitasking, organization, and programmability." | Literally **"Features"** and "FAQ" | **Bare nouns** — "Vertical tabs", "Notification rings", "In-app browser", "Split panes", "Programmable", "GPU-accelerated" | "Download for Mac" / "View on GitHub" | Terse, factual, spec-sheet |
| **Webmux** (Windmill Labs, README) | — (README H1) | "A web dashboard for managing parallel AI coding agents." | README `##` sections | **Verb/noun mix** — "Create & Manage Worktrees", "Embedded Terminals", "Mobile-Friendly Agents Chat", "PR, CI & Comments", "Docker Sandbox Mode" | Ordered steps: "Install prerequisites" → "Install webmux" → "Start the dashboard" | Documentation voice, no marketing layer |
| **Agent of Empires** (Mozilla.ai) | *unreachable* — the `main` README raw URL 404s; not quoted | | | | | |
| **amux** (amux.io) | *unreachable* — 403 to the fetcher; not quoted | | | | | |
| **Codeman** | no marketing site found in this pass; README-only, not quoted | | | | | |
| **agentdock** (GitHub, via search) | — | "Web dashboard for managing parallel AI coding agents (Claude Code, Cursor) across repos with tmux sessions and git worktrees" | README `##` | Noun features: worktrees, multi-repo sessions, live terminal, session pinning, mobile-friendly UI | `bun install -g` | Pure README |
| **Claude Squad** (README) | — | "a terminal app that manages multiple Claude Code, Codex, Gemini (and other local agents including Aider) in separate workspaces, allowing you to work on multiple tasks simultaneously" | README `##` | Outcome bullets — "Complete tasks in the background", "Review changes before applying them", "Each task gets its own isolated git workspace, so no conflicts" | Homebrew or a bash script | Plain, outcome-led bullets; the best-written README in the roster |
| **Conductor** (Melty Labs) | "Run parallel coding agents on your Mac." | "Create parallel Claude Code, Codex, and Cursor agents in isolated workspaces. See at a glance what they're working on, then review and merge their changes." | Almost none — the page is a hero plus links | — | "Download Conductor" | Extremely spare; one sentence does all the work |
| **Warp** | "Open infrastructure for cloud software factories" | "build on Warp: factories as code, any model or harness, with evals, benchmarks, and self-improvement built in." | Lowercase eyebrow + claim: "SDLC coverage — Beyond CI/CD…", "no lock-in — Open at every layer", "governance — Control your coding agent chaos" | Numbered, lowercase, phrase titles + one-line body — "01 opinionated, but flexible / set up your first factory in 5 minutes" | "request early access" / "download warp terminal" (lowercase) | Lowercase-everything, enterprise-technical |
| **Ghostty** | "Ghostty is a fast, feature-rich, and cross-platform terminal emulator that uses platform-native UI and GPU acceleration." | — | — | — | platform download buttons | One long definitional sentence; no marketing voice at all |
| **Zellij** | "Zellij" | "Terminal Workspace with Batteries Included" | "Try Zellij Without Installing" | — | `bash <(curl -L https://zellij.dev/launch)`; CTA "Explore Zellij's powerful features →" | Modest, project-site |
| **Tailscale** | "The best secure connectivity platform for the AI era" | long compound Zero-Trust sentence | Product nouns ("Business VPN", "Privileged Access") plus benefit heads — "Easy, secure, identity-based access to anything" | "Installation takes minutes", "Switching is easy", "Bridge hybrid environments" | "Start connecting devices" / "Contact sales" | Enterprise; the hero is the weakest line on the page |
| **Coder** | "Your developers have guardrails. Your AI doesn't." | "Safely run your favorite AI, agents, and enterprise development on your own infrastructure." | "Your AI. Your infrastructure. Your rules." | Product nouns: "Coder Workspaces", "Coder Agents", "Coder AI Governance" | "Install Coder" / "Start a trial" | Enterprise with one genuinely sharp hero |
| **Linear** | "The product development system for teams and agents" | "Purpose-built for planning and building products. Designed for the AI era." | Workflow-stage nouns: "Intake and integrations", "Planning and monitoring", "Build, review, and ship" | Two-word label + one sentence — "Purpose-built", "Powered by agents", "Designed for speed" | "Get started" | Calm, declarative, no exclamation |
| **Raycast** | "Your shortcut to everything." | "A collection of powerful productivity tools all within an extendable launcher. Fast, ergonomic and reliable." | **All sentences, none a category** — "It's not about saving time.", "There's an extension for that.", "Don't repeat yourself.", "Take the short way." | Adjective + claim — "Fast. Think in milliseconds.", "Ergonomic. Keyboard First." | "Download and use Raycast for free." | Playful, human, high craft |

Sources: [herdr.dev](https://herdr.dev/) · [guppi.sh](https://guppi.sh) ·
[cmux.com](https://cmux.com) · [webmux README](https://github.com/windmill-labs/webmux) ·
[agentdock](https://github.com/vishalnarkhede/agentdock) ·
[claude-squad README](https://github.com/smtg-ai/claude-squad) ·
[conductor.build](https://conductor.build/) · [warp.dev](https://www.warp.dev/) ·
[ghostty.org](https://ghostty.org/) · [zellij.dev](https://zellij.dev/) ·
[tailscale.com](https://tailscale.com/) · [coder.com](https://coder.com/) ·
[linear.app](https://linear.app/) · [raycast.com](https://www.raycast.com/).

Unreachable in this pass, stated rather than invented: Agent of Empires
(Mozilla.ai) raw README 404, amux.io 403, Codeman has no marketing site I could
reach.

---

## 2. Patterns

### What the strong pages share

1. **The section heading is a claim, not a category.** Herdr's "You never hunt
   for the stuck one." and Raycast's "Don't repeat yourself." both put the
   reader's problem in the heading. Warp and herdr both pair a **lowercase
   eyebrow that names the topic** with an **H2 that makes an assertion** — which
   is exactly the eyebrow/H2 machinery hexokit.com already has.
2. **The hero states the substrate, not the adjective.** Conductor: "Run
   parallel coding agents on your Mac." Ghostty defines itself in one sentence.
   Nobody strong opens with "powerful", "seamless", or "modern".
3. **The differentiator gets its own section with a negative in it.** Herdr's
   "Herdr doesn't wrap them or replace them, it just owns their terminals" is
   the same move HexoKit's "Nothing wraps your agent" makes. The negative is
   what makes the positive legible; both pages are right to spend a section on it.
4. **Install is a bare copyable line, not a button.** Herdr, Zellij, Warp,
   guppi. The command *is* the CTA. Herdr repeats it at the bottom under a
   different heading ("Give them somewhere to live.") — a pattern worth stealing.
5. **Second person, present tense, terminal periods.** Herdr's headings all end
   in a full stop. That is what makes them read as statements rather than labels.
6. **Counts appear as evidence, never as scope.** Herdr shows "21 agents
   detected out of the box" and "3 workspaces · 4 agents" as proof. It never
   says "five things we do".

### What the weak ones do

1. **"Everything you need" / "Features" / "Built for developers who live in the
   terminal."** guppi says all three. They are true of every tool ever shipped,
   so they carry no information and waste the highest-attention line on the
   section.
2. **Noun-label cards.** "Session Dashboard", "Multi-Host Support",
   "GPU-accelerated". The reader has to do the translation into a benefit
   themselves. cmux gets away with it because a terminal's features are
   self-evidently desirable; a console for a workflow the reader may not have
   yet does not get that discount.
3. **Compound enterprise heroes.** Tailscale's hero packs VPN, SASE, PAM,
   multi-cloud, CI/CD, Edge, IoT and AI into one sentence and lands nothing.
4. **Marketing adjectives standing in for mechanism.** "Polished Developer UX"
   tells you nothing; "Single Binary, Zero Config" — guppi's one good card —
   tells you everything.

### Where "Features" appears, and whether it hurts

Only **cmux** uses the bare word "Features" as an H2, and it is the one page in
the set whose section headings do no work at all. Warp, herdr, Raycast, Linear
and Coder all avoid it. Webmux and agentdock "use" it only in the sense that a
README has a `## Features` — a README is not a landing page and gets a different
contract.

**Verdict: "Features" does not actively hurt, it simply forfeits.** It is a
label where the strong pages put a sentence. On a page whose whole thesis is a
counter-positioning claim ("nothing wraps your agent"), forfeiting a heading is
a real cost. But it is strictly better than a heading that makes a *wrong*
claim, which is the problem with the current line.

---

## 3. HexoKit's current copy, judged

### Hero — **keep, almost entirely**

Current: eyebrow `hexokit · v3.19.37` / H1 "Your tmux, in the browser and on
your phone." / subline "Cockpit for the agent era." / lead paragraph / CTAs
Install · Read the docs · GitHub.

This is stronger than every hero in the competitive roster except herdr's, and
it beats herdr on one axis: it names the substrate the reader already has
(*your* tmux) instead of asking them to adopt a new noun ("the agent runtime",
"where your coding agents live"). Keep it.

Two things to fix:

- **The lead's em-dash sentence carries three clauses.** "HexoKit is a remote
  console for the machine you actually work on — every tmux session and pane as
  a live terminal, in a sidebar, from your desk or your couch." "in a sidebar"
  is mechanism detail competing with the emotional beat ("from your couch").
- **The CTA row buries install.** Herdr puts the copyable command *in the hero*.
  "Install" as a jump-link to `#install` is one click of friction on the only
  action that matters. See proposal 9.

### Install — **the H2 is good; the notes are muddled**

"One line, then you are in" is a genuinely good heading: it is a claim, it is
short, it has a terminal beat. Better than guppi's "Get started in seconds".

The two `landing-note` paragraphs underneath do three jobs at once (what gets
installed, upsell to the toolkit, tmux prerequisite) and read as errata. Also:
the section shows **two** install lines under a heading that promises **one**.
Minor, but a careful reader notices.

### Features — **the H2 is the real problem**

> eyebrow `[ what it does ]` + H2 **"Six things it is good at"**

The user's instinct is right, and the reason is sharper than "it implies a
ceiling". Three separate faults:

1. **It scopes the product downward.** Every competitor uses counts as
   *evidence* ("21 agents detected", "36,541 stars"). This uses a count as a
   *boundary*. It is the only line on the page that argues against the product.
2. **It is brittle.** Add a seventh card and the heading is a lie. Copy that
   must change when the grid changes is a maintenance trap in a file whose whole
   design goal (per its own header comment) is that copy edits are data edits.
3. **"is good at" is hedged.** It concedes a grading scale. Herdr never says it
   is good at anything; it says "Always running." and lets you decide.

The eyebrow `[ what it does ]` is fine — it does the categorising job so the H2
does not have to. That is the Warp/herdr pattern working correctly. **The
eyebrow is not the problem; only the H2 is.**

**On "Features" as the replacement.** It is a safe downgrade — it fixes the
ceiling and the brittleness, and costs the page one claim. But it also
*duplicates the eyebrow*: `[ what it does ]` + "Features" says the same thing
twice, one line apart. If the H2 becomes "Features", the eyebrow should change
too, and now two lines are being spent on a label. I would not ship it.

**Four alternatives, each as an eyebrow + H2 pair:**

| # | Eyebrow | H2 | Why |
|---|---|---|---|
| A | `[ what it does ]` | **Features** | The user's proposal. Safe, honest, forfeits the line, and doubles the eyebrow. |
| B | `[ what it does ]` | **A pane is a pane, wherever you are** | Restates the thesis as capability. Risk: it pre-empts the differentiator section two scrolls down. |
| C | `[ what it does ]` | **Everything is a live terminal** | Short, absolute, no count, no hedge. Names the one mechanical fact all six cards descend from. Ages with the grid. |
| D | `[ the console ]` | **Six ways it earns the tab** | Keeps the six (it is a real number and the hexagon reinforces it) but turns the count from a boundary into a boast. Still brittle if a seventh card lands. |
| E | `[ what it does ]` | **Open the tab, see the whole machine** | Second person, imperative, one image. Slightly loose against the cards, two of which are spawning rather than seeing. |

**Recommendation: C — `[ what it does ]` + "Everything is a live terminal".**

Reasons, in order. It removes the count entirely, so the heading survives a
seventh card. It makes a claim rather than a label, which is what every strong
page in the table does with this slot. It is *load-bearing for the cards*: card
1 is the terminal anywhere, card 2 is an agent in a terminal, card 3 spawns a
terminal, card 4 tiles terminals, card 5 schedules terminals, card 6 is the one
deliberate exception ("A window is not only a terminal"), which now reads as a
twist on the heading rather than a stray. And it does not collide with the
differentiator section, because "everything is a live terminal" is a capability
claim, whereas "nothing wraps your agent" is a positioning claim.

If C reads too abstract on the built page, **A ("Features") is the correct
fallback** — with the eyebrow changed to `[ the console ]` so the two lines stop
repeating each other.

### The six cards — **titles are inconsistent in kind**

| # | Current title | Kind | Verdict |
|---|---|---|---|
| 1 | Every pane, a live terminal — from any device | Claim | Strong. The one title doing benefit work. |
| 2 | Agents are just panes | Thesis | Strong, but it spends the differentiator's ammunition early. |
| 3 | `` `rk riff` `` — one agent per worktree | Command + gloss | Good, but leads with a command a first-time reader cannot yet parse. |
| 4 | Boards + status dots | **Noun label** | Weak. This is guppi's "Session Dashboard". |
| 5 | Cron clock + operator | **Noun label** | Weakest. "Cron clock" is internal vocabulary. |
| 6 | Code, web and GUI tiles | **Noun label** | Weak, and it is the most surprising capability on the page — the one that most deserves a claim. |

Half the grid is benefit-led and half is a feature list. Cards 4, 5 and 6 read
like a changelog. The bodies are mostly good — card 4's "hue = journey, shape =
liveness, overlays = flags" is excellent, dense, specific copy — but the reader
hits three noun labels in a row at the bottom of the grid, which is exactly
where attention is thinnest.

### "Nothing wraps your agent" — **the best section on the page, and too long**

The H2 is the sharpest line on the site. The paragraph is 87 words carrying
five separate moves: what runs in the panes → `rk riff` → the fleet → the
negative → the churn argument. The README earns that length because a README
reader has already opted in; a landing reader has not.

The It is / It isn't table underneath is doing the same job again in a better
format. The paragraph should shrink toward the table, not compete with it.

### Toolkit hexagon — **keep**

"HexoKit is the cockpit. Six companions sit on its six edges" is the best
sentence on the page after the differentiator H2. It earns the hexagon, it
earns the "cockpit" word from the subline, and the six here is a *fact about the
mark*, not a scope limit — which is precisely why the six in the features
heading grates and this one does not. Note the asymmetry: `shll` appears in the
toolkit doc's six companions but the hexagon's sixth edge is `desktop`. On the
landing that is right (the installer is not a companion you use) but the two
lists differ, and the install note already names `shll`.

### Desktop card — "The macOS app" is a label

Same fault as cards 4–6, in a section that has real news in it (the app has
never had a page). The body is good; the quarantine-free line is a genuine,
concrete, non-obvious benefit buried in a `landing-note`.

### Footer — **keep**

Docs · Toolkit · GitHub · Discord · versions.json · llms.txt. Six links, no
filler, two of them machine-readable endpoints that signal the product's
posture. Better than most footers in the table.

---

## 4. Concrete proposals

Numbered for reference. Every command named is in `help/hexokit.json`.

### Hero

**4.1 — Option A (recommended, ships as-is plus a lead trim).**

- H1: `Your tmux, in the browser and on your phone.`
- Subline: `Cockpit for the agent era.`
- Lead (tightened from 38 to 31 words, one clause dropped):

  > HexoKit is a remote console for the machine you actually work on — every
  > tmux session and pane as a live terminal, from your desk or your couch.
  > Nothing to configure, no database, state read straight from tmux.

  *Rationale:* "in a sidebar" is mechanism the screenshot already shows; cutting
  it lets "from your desk or your couch" land as the payoff. The three-noun
  closer is the strongest rhythm in the current copy and is untouched.

**4.2 — Option B (subline promoted, for a more assertive hero).**

- H1: `Cockpit for the agent era.`
- Subline: `Your tmux, in the browser and on your phone.`
- Same lead.

  *Rationale:* puts the category claim first, the substrate second — the
  Conductor/Coder shape. *Against it:* "cockpit" is a metaphor and "your tmux"
  is a fact, and facts convert better on a developer landing. Herdr's own hero
  makes the same trade in the other direction and wins. Documented for
  completeness; I do not recommend it.

**4.3 — Option C (one-line hero, herdr shape).**

- H1: `Your tmux, in the browser and on your phone.`
- Subline: `Cockpit for the agent era. Walk away; the panes keep running.`

  *Rationale:* herdr's whole hero rests on "Leave them running", and persistence
  is HexoKit's too (tmux sessions outlive every client — the substrate advantage
  the competitive doc calls out as the one thing no desktop app can follow). The
  current hero never says it. This adds it for six words. *Against it:* it makes
  the subline two sentences and dilutes a verbatim brand string. Worth testing.

### Section eyebrow + H2 pairs

**4.4 — Install.** Keep `[ install ]` + **"One line, then you are in"**. It is
already right. If the two install lines bother you, change the H2 to **"One
line, then you are in"** and *reorder* so the `curl` line is visibly primary and
`brew` reads as the alternative — a copy-adjacent layout fix, not a wording one.

**4.5 — Features.** `[ what it does ]` + **"Everything is a live terminal"**.
See § 3 for the full argument. Fallback: `[ the console ]` + **"Features"**.

**4.6 — Differentiator.** Keep `[ the difference ]` + **"Nothing wraps your
agent"** unchanged. It is the single best line on the site and the exact
counter-positioning the competitive doc says is defensible. Do not touch it.

**4.7 — Toolkit.** Keep `[ the toolkit ]` + **"The HexoKit toolkit"**. The lead
sentence carries this section, not the H2, and the H2 is a link to `/toolkit/`
where a label is the correct affordance.

**4.8 — Desktop.** Replace `[ desktop ]` + "The macOS app" with
`[ desktop ]` + **"A native window, and the ⌘ tier back"**.

*Rationale:* names the one thing the app gives you that the browser cannot, in
the heading rather than the third clause of the paragraph. Alternative if the
glyph is a problem in the H2: **"The Mac app that gets your keyboard back"**.

### The six card titles and copy

Benefit-led rewrites. Bodies stay close to current where current is good; I have
marked what changed.

**4.9 — Card 1.** Title unchanged: `Every pane, a live terminal — from any device`

> Every tmux session and pane shows up in a sidebar. Tap one on your phone,
> type, and it is the same shell you left at your desk. HTTPS over Tailscale for
> the couch.

*Rationale:* nothing wrong with it. Leave it.

**4.10 — Card 2.** Title: `Agents are just panes` → **`Your agent reports in; nothing reads its output`**

> Windows running an agent show active, waiting or idle — a hook stamps a tmux
> pane option, and Claude Code, Codex, Gemini CLI and Copilot CLI are wired out
> of the box. HexoKit never speaks an agent's protocol.

*Rationale:* the current title states the thesis the differentiator section
owns; this one states the *capability* and lets the thesis land later where it
has a whole section. The new title also contains the negative, which is the move
herdr makes in its card 04. Body trimmed from 42 to 36 words; "and more" dropped
in favour of naming four real harnesses, which reads as evidence.

*Softer alternative title if the semicolon is unwelcome:* **`Waiting, working, idle — at a glance`** (this is herdr's card 02 territory,
and HexoKit genuinely competes there).

**4.11 — Card 3.** Title: `` `rk riff` — one agent per worktree `` → **`One command per parallel agent`**

> `rk riff` creates a git worktree, opens a tmux window in it and launches your
> agent. `rk riff -N 3` spawns three at once. The sidebar becomes the fleet view.

*Rationale:* the benefit is in the title and the command is in the first three
characters of the body, so nothing is lost and the grid stops opening a card with
an unparsed token. The phrase is lifted from the README's own bullet ("One
command per parallel agent"), so it is already house voice. Both commands verified.

**4.12 — Card 4.** Title: `Boards + status dots` → **`Watch three agents and the dev server at once`**

> Pin panes from any server into a named board and they render side by side.
> Every window carries one status dot: hue = journey, shape = liveness, overlays
> = flags.

*Rationale:* the current title is a noun label; the new one is the actual scene
from the README ("perfect for watching three parallel agent sessions next to the
`just dev` server they're editing"). Body unchanged except "and watch them side
by side" → "and they render side by side", removing a second imperative. No
command named, because there is no `rk board` — pinning is a UI action, and the
copy correctly never claims otherwise.

**4.13 — Card 5.** Title: `Cron clock + operator` → **`Work that starts without you`**

> `rk cron` wakes an agent on a schedule. `rk operator` is the one agent that
> runs the server — it watches the fleet, unblocks changes and pings your phone.

*Rationale:* "Cron clock" is internal vocabulary that appears nowhere a reader
has been. The new title is the outcome both features share. Body split into two
sentences from one semicolon-joined clause; content identical. Both commands verified.

**4.14 — Card 6.** Title: `Code, web and GUI tiles` → **`A window is not only a terminal`**

> Split in an editor at the git root with `rk code`, a web tile your agent fills
> with `rk present`, or the host's GUI display.

*Rationale:* the current body's opening clause is already the best line in the
card — promote it to the title and the body loses seven words of run-up. This
title is also the deliberate counterpoint to the section H2 ("Everything is a
live terminal"), which makes the last card land as a reveal. Both commands verified.

### "Nothing wraps your agent" — where to cut

The constraint is verbatim-ish from the README, so this is a **cut list**, not a
rewrite. Current, with strikethrough marking the cuts:

> ~~What makes HexoKit so good right now is what tends to run in those panes:~~
> **AI coding agents, many at once.** `rk riff` spawns each one in its own git
> worktree, and the dashboard lets you watch the whole fleet. But HexoKit never
> wraps the agent — a pane is just a pane. It's equally a build, a REPL, an ssh
> session, `htop`. **The agent is one of the things you run, not the thing
> HexoKit is.** ~~When the agent tooling churns underneath you (and it does,
> monthly), the terminal layer stays put.~~

**4.15 — Recommended cut (two edits, 87 → 62 words).**

> **AI coding agents, many at once** — that is what tends to run in those panes.
> `rk riff` spawns each one in its own git worktree, and the dashboard lets you
> watch the whole fleet. But HexoKit never wraps the agent: a pane is just a
> pane. It's equally a build, a REPL, an ssh session, `htop`. **The agent is one
> of the things you run, not the thing HexoKit is.**

*What changed and why.* The opening 12-word run-up ("What makes HexoKit so good
right now is what tends to run in those panes") is a README's throat-clearing —
it defers the subject to word 13. Inverting puts the bolded phrase first, which
is where the eye already goes. The closing churn sentence is the strongest
*argument* in the paragraph but the weakest *landing*, because it ends on
machinery ("the terminal layer stays put") after the thesis has already landed
on "not the thing HexoKit is". The em-dash before "a pane is just a pane"
becomes a colon so the paragraph does not carry two em-dash asides.

**4.16 — If the churn argument must stay** (it is the strategically important
one — it is the answer to "why not just use cmux"), move it out of the paragraph
and into the **It isn't** row, which currently ends flat:

> **It isn't** — An agent wrapper: it doesn't speak any agent's protocol, parse
> any agent's output, or care what's in the pane. When the agent tooling churns
> underneath you, the terminal layer stays put.

*Rationale:* the contrast table is where a reader goes looking for the "so
what", and this gives the negative row a payoff instead of ending on a shrug.
"(and it does, monthly)" is cut — a parenthetical aside weakens a closing line,
and the claim survives without it.

### Install note wording

**4.17 — Replace the two `landing-note` paragraphs with one, plus a scoped second.**

Current:

> Installs `shll` and `hexokit`. Want the six companions too? See the toolkit.
>
> Requires tmux ≥ 3.4 — `rk doctor` checks.

Proposed:

> Installs `shll` and `hexokit` — nothing else. The [six companions](/toolkit/)
> are one more command away.
>
> Requires tmux ≥ 3.4. Run `rk doctor` if anything looks wrong.

*Rationale:* "nothing else" is the reassurance a `curl | sh` reader actually
wants, and it is the D10 decision stated as a benefit ("a product site whose
install line pulls seven binaries reads as a bundle, not a product"). "Want the
six companions too?" is a rhetorical question, the one construction that reads
as marketing on an otherwise plain page; the declarative carries the same link.
"`rk doctor` checks" has no object — "checks" what? The rewrite gives the reader
a trigger for when to run it. Command verified.

### Toolkit framing sentence

**4.18 — Keep, with one word cut.**

Current:

> HexoKit is the cockpit. Six companions sit on its six edges — each a small CLI
> (or app) that does one job and composes with the rest — and `shll` installs
> them all.

Proposed:

> HexoKit is the cockpit. Six companions sit on its six edges — each a small CLI
> that does one job and composes with the rest — and `shll` installs them all.

*Rationale:* "(or app)" is a parenthetical correction for one of six edges, and
the desktop edge's own blurb ("the native macOS shell around the HexoKit
dashboard") already tells the reader it is an app. Cutting it removes the only
stumble in the site's best paragraph. Everything else stays: the sentence does
four jobs (defines the metaphor, earns the mark, defines a companion, names the
installer) in 34 words.

### Footer labels

**4.19 — Keep all six as they are.** Docs · Toolkit · GitHub · Discord ·
versions.json · llms.txt. No competitor footer in the table is better. The two
raw endpoints are a deliberate signal (this product is machine-readable) and
renaming them to "Versions" and "For LLMs" would destroy that. The only change I
would consider is ordering GitHub before Toolkit, since GitHub is the higher-traffic
destination — but that is an analytics question, not a copy one.

---

## 5. Style sheet — do / don't for hexokit.com

### Voice

| Do | Don't |
|---|---|
| Second person, present tense: "Tap one on your phone" | Third person about the reader: "users can tap" |
| Declarative sentences with terminal periods, in headings too | Headings that are noun labels: "Boards + status dots" |
| One claim per heading | A heading that scopes the product downward: "Six things it is good at" |
| Concrete nouns from the reader's world: pane, session, worktree, phone, couch | Abstract product nouns: "solution", "platform", "experience" |
| Name the negative when it is the differentiator: "never wraps", "never speaks any agent's protocol" | Hedges: "is good at", "helps you", "makes it easy to" |
| Let a mechanism be the proof: "state read straight from tmux" | Adjectives as proof: "powerful", "seamless", "polished", "blazing" |
| Numbers as evidence: "tmux ≥ 3.4", "`-N 3` spawns three" | Numbers as scope: "six things", "five ways" |

### Terminology

- **HexoKit** is the product. Capital H, capital K, one word, always. Never
  "Hexokit", "hexo kit", or "HexoKit dashboard" where "HexoKit" alone will do.
  Lowercase `hexokit` only as the literal binary/formula/eyebrow token.
- **`rk`** is the binary in commands. Write `rk riff`, not "HexoKit's riff
  command". The long name `hexokit` appears only in install lines.
- **Only these verbs exist**, and prose may name no others: `agent code
  code-server cron daemon desktop doctor mux notify operator present remote riff
  role serve skill status tab tutorial update url`. When a capability has no
  command (pinning a board, the sidebar, the status dot), describe the action in
  words and never invent a token to carry it.
- **pane** — one tmux pane. The atomic unit. Use it freely; it is the reader's word.
- **window** — one tmux window, the thing a status dot belongs to. Do not use
  "window" for a browser window on this page.
- **tile** — a non-terminal thing inside a window: the `rk code` editor, a web
  tile, the GUI display. Never call a terminal pane a tile.
- **board** — a named, cross-server set of pinned panes. Always "a board", never
  "the board"; there are many.
- **companion** — one of the six around the hexagon. Never "plugin",
  "integration", "module", or "sub-tool". `shll` is the installer, not a
  companion, even though the toolkit doc lists it among six.
- **cockpit** — reserved for the subline and the toolkit lead. Using it a third
  time turns a positioning word into a tic.
- **agent** — lowercase, generic. Name real harnesses (Claude Code, Codex,
  Gemini CLI, Copilot CLI) as evidence, never as endorsement or a supported-list
  promise.

### Mechanics

- **Do** keep every heading under nine words, every card body under 40.
- **Do** put commands in backticks so they render as chips; the template's
  `inlineCode` transform is the only markup the data file may carry.
- **Do** cut the run-up clause. If a sentence's subject appears after word ten,
  invert it.
- **Don't** use two em-dash asides in one paragraph.
- **Don't** ask the reader a rhetorical question.
- **Don't** open a card title with a command token; put the benefit first and the
  command in the body's first clause.
- **Don't** write a heading whose truth depends on the number of items beneath it.
- **Don't** repeat the eyebrow's meaning in the H2. The eyebrow categorises so
  the H2 can assert.

---

## 6. Priority order, if only some of this ships

1. **4.5** — replace "Six things it is good at". The one line that argues
   against the product.
2. **4.12, 4.13, 4.14** — the three noun-label card titles. Half the grid.
3. **4.15** — trim the differentiator paragraph so the best section is also the
   tightest.
4. **4.10, 4.11** — the two card titles that are good but mis-ordered.
5. **4.17** — the install notes.
6. **4.1, 4.8, 4.18** — the lead trim, the desktop H2, the "(or app)" cut.
7. **Nothing** in the hero H1/subline, the differentiator H2, the toolkit H2, or
   the footer. Those four are already the best copy on the page.
