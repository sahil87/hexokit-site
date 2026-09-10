# hexokit.com — copy study 2: minimal and natural

> A second pass over the same landing page. Study 1
> (`landing-copy-study.md`) fixed **structure and claims** — which heading makes
> an assertion, which card title is a noun label, which claim is true. This one
> fixes **volume and register**: how many words, and whether a person would say
> them out loud. Research done 2026-09-10 by live fetch; short quotes attributed.
> Repo read-only apart from this file.
>
> Study 1's style sheet (§5) and its command rule still bind. Every `rk <verb>`
> written here — `riff`, `cron`, `operator`, `code`, `present`, `doctor` — is in
> `help/hexokit.json`. No new arguments from study 1 are repeated.

**Headline number: 712 words → 517.** A 27% cut, with no claim from
`competitive-landscape.md` dropped. The biggest single saving is the card grid:
seven bodies at an average of 32 words become seven at an average of 20.

---

## 1. What "minimal" measures out to

Eight pages fetched live and measured with the same script the HexoKit copy was
measured with (words, sentence length, dash and colon frequency per sentence).

| Page | Hero words | Blurbs | Avg words/blurb | Avg sentence | % sentences with a dash | % with a colon or semicolon |
|---|---:|---:|---:|---:|---:|---:|
| herdr.dev | 43 | 5 | 35.8 | 13.8 | 8 | 8 |
| linear.app | 19 | 7 | 16.9 | 10.7 | 0 | 0 |
| raycast.com | 19 | 7 | 7.9 | 6.1 | 0 | 0 |
| cursor.com | 9 | 6 | 14.8 | 14.8 | 0 | 0 |
| warp.dev | 23 | 6 | 11.5 | 11.5 | 0 | 33 |
| tailscale.com | 38 | 3 | 11.0 | 8.2 | 0 | 0 |
| zed.dev | 19 | — | — | — | 0 | 0 |
| ghostty.org | 16 | — | — | — | 0 | 0 |
| **hexokit.com (current)** | **38** | **7** | **32.3** | **15.6** | **43** | **29** |

Across all 34 competitor blurbs: **mean 16 words, median 14.** HexoKit's card
bodies are **twice the median**. Heroes: competitor median 19 words, HexoKit 38.

Sources: [herdr.dev](https://herdr.dev/) · [linear.app](https://linear.app/) ·
[raycast.com](https://www.raycast.com/) · [cursor.com](https://www.cursor.com/) ·
[warp.dev](https://www.warp.dev/) · [tailscale.com](https://tailscale.com/) ·
[zed.dev](https://zed.dev/) · [ghostty.org](https://ghostty.org/docs).
Fly.io's homepage served an unrelated Sprites CLI page to the fetcher on both
attempts and is not quoted. Ghostty's homepage truncated; its definitional
sentence was taken from `ghostty.org/docs` instead.

### The three habits the short pages share

**1. They state an outcome and let the mechanism go.** Cursor: *"Agents use
their own computers to build, test, and demo features end to end for you to
review."* No word about how a computer is provisioned. Raycast's whole reliability
card is four words: *"99.8% crash-free rate."* HexoKit's card 2 spends its
middle clause on "a hook stamps a tmux pane option" — a sentence about
implementation inside a sentence about what you see.

**2. Punctuation is boring on purpose.** Six of the eight pages have **zero**
em-dashes across every blurb. Warp uses semicolons in a third of its sentences
and is the least readable of the set as a result. HexoKit currently puts a dash
in 43% of its sentences and a colon in 29%. That is the single loudest signal
that the page was written rather than spoken.

**3. Names of technical things are used bare, never introduced.** herdr writes
"pane" five times and never explains it. Nobody writes "the toolkit manager" or
"a tmux pane option". If the reader knows the word, use it; if they don't, don't
teach it on a landing page.

### The one page that goes long, and why it earns it

herdr's blurbs average 35.8 words — longer than HexoKit's. But its sentences
average **13.8 words** against HexoKit's 15.6, and it has almost no subordinate
clauses: *"Close the lid or drop the network and the agents keep working;
restart the machine and Herdr brings the layout back."* Length there comes from
**more short sentences**, not longer ones. That is the model: if a section needs
40 words, spend them on four sentences, not two.

---

## 2. Jargon audit

Every insider term on the page, with a verdict.

| Term | Where | Verdict |
|---|---|---|
| **tmux, pane, session, window** | throughout | **Keep.** The reader's own words, and the whole positioning rests on them. Never gloss them. |
| **worktree** | card 3, `wt` blurb | **Keep.** Anyone who would run three agents at once knows it. |
| **board** | card 4 | **Keep.** It is the product's noun for a real object, and the card defines it by showing it. |
| **agent** | throughout | **Keep.** Lowercase, generic, as study 1's style sheet has it. |
| **"the toolkit manager"** | install note 1 | **Cut.** A gloss on `shll` that the reader neither needs nor can act on. The word "installs" already says what it does. |
| **"pane option"** | card 2 | **Cut.** Pure implementation. A tmux pane option is a variable; naming it explains nothing to someone who has not read the source. |
| **"a hook stamps"** | card 2 | **Cut.** Same. The outcome ("every window running an agent says which") is the whole claim. |
| **"harness"** | `fab-kit` blurb | **Replace.** "The planning harness" is HexoKit-internal vocabulary. → "a plan before any agent writes code." |
| **"liveness"** | card 4 | **Replace.** Not a word said aloud. It is the second axis of a three-axis dot legend that a landing page cannot teach. |
| **"hue = journey, shape = liveness, overlays = flags"** | card 4 | **Cut the legend.** Study 1 praised it as dense and specific, and it is — for the docs. On a landing page it is a key to a diagram the reader is looking at for the first time, in a card that has already made its point. → "One dot per window tells you where it stands." |
| **"fleet"** | cards 3, 5, differentiator | **Cut two of three, keep zero.** It appears three times for three different things (a sidebar view, what the operator watches, what the dashboard shows). A word used three loose ways is not a term, it is a filler. |
| **"daemon"** | desktop body | **Cut from the body.** "One-click daemon start" is three nouns describing a button. The app connects to a Mac; that is what the sentence needs to say. |
| **"digest-verified", "quarantine-free"** | desktop note | **Replace with the consequence.** Nobody wants a digest verified; they want the app to open. → "A downloaded DMG trips Gatekeeper; this one does not." |
| **"Tailscale"** | card 1 | **Keep.** A real product name doing real work, and the audience overlap is near total. |
| **"console"** | hero lead, It is | **Keep once.** It is the category claim. Currently it appears in both places saying the same thing; the hero keeps it. |
| **"cockpit"** | subline, toolkit lead | **Keep both.** Study 1's rule (never a third time) holds; two is the metaphor landing, not a tic. |
| **"substrate", "tier"** | — | **Not on the page.** Both are in the internal docs only. Flagged in the brief; no action needed. Do not import them. |

---

## 3. Naturalness: the spoken-aloud test

Read each of these out to another person and note where they stop you.

**The desktop second sentence — four dashes in 33 words.**

> "The app — macOS today — connects three ways — **This Mac** (one-click daemon
> start), **over SSH** (`rk remote`), or **a URL** — and never starts, stops or
> updates anything on its own."

Spoken: unreadable. The subject ("the app") and its verb ("connects") are split
by an aside, and then the object list is itself split by two parentheticals
before a fourth dash resumes the main clause. This is the single worst sentence
on the page and the clearest evidence for the whole study.

**Card 2 — one sentence, 30 words, three subjects.**

> "Windows running an agent show active, waiting or idle — a hook stamps a tmux
> pane option, and Claude Code, Codex, Gemini CLI and Copilot CLI are wired by a
> one-time setup."

Spoken: the listener loses the thread at "a hook stamps". Note also **"are
wired by"** — passive, and by an unnamed actor. Who wires them? A person would
say "they report in once you run the setup".

**The differentiator opener — an inverted cleft.**

> "**AI coding agents, many at once** — that is what tends to run in those panes."

"— that is what…" is a written construction. Nobody says it. Study 1 created
this by inverting the README's sentence to front-load the bold phrase, which was
the right instinct for the eye and the wrong one for the ear. Said aloud you get:
"Mostly what runs in those panes is coding agents, several at once."

**The install note — a rhetorical dependent clause.**

> "Installs `shll` (the toolkit manager) and HexoKit — nothing else."

Three interruptions (a parenthetical, a dash, an appositive) inside 11 words.
"Nothing else" is the good part and it is buried behind punctuation. Give it its
own sentence and it lands harder and reads shorter.

**Nominalizations to convert to verbs.** "one-time setup" → "once you run the
setup". "one-click daemon start" → "start it here". "state derived from tmux +
the filesystem" → "nothing to keep in sync". Each nominalization is a verb
wearing a noun costume; converting it always shortens the sentence.

**Hedges found: one.** "tends to run in those panes". Keep this one — it is
honest (a pane really might be `htop`) and the differentiator depends on that
honesty. Study 1's rule bans hedges that concede a grading scale ("is good at");
this hedges a frequency claim, which is different.

---

## 4. Redundancy: four places the page says a thing twice

1. **Hero lead ↔ card 1 ↔ "It is".** All three say "every tmux session and pane,
   as a live terminal, from anywhere". The hero says it in 38 words, card 1 in
   33, the contrast row in 28 — 99 words for one idea. **Fix:** the hero states
   it; card 1 shows only the part the hero cannot (tap it on the phone, same
   shell); the contrast row compresses to the differentiators only.

2. **Card 5 ↔ card 7 — the operator is introduced twice.** Card 5: "`rk operator`
   is the one agent that runs the server". Card 7: "The operator is the agent
   that runs the server". The same 8-word definition, verbatim in substance, two
   cards apart. **Fix:** card 5 introduces it, card 7 assumes it.

3. **Install note ↔ toolkit lead — "the six companions" twice.** The install
   note links "six companions"; two sections later the toolkit lead says "Six
   companions sit on its six edges". **Fix:** keep both mentions (they are two
   scrolls apart and the second earns the hexagon) but drop the install note's
   apposition so it reads as a pointer, not a definition.

4. **"No database" ↔ "state derived from tmux + the filesystem".** Two ways of
   saying one thing, side by side in the "It is" row, and "no database" already
   appeared in the hero. **Fix:** hero keeps "no database"; the contrast row
   converts the second half into its consequence, "nothing to keep in sync".

---

## 5. The rewrite, string by string

Fixed strings (H1, subline, the five H2s, the desktop lead sentence, the two
install commands) are unchanged and not listed. Word counts strip backticks.

### Hero

| String | Before (w) | After (w) | Why |
|---|---|---|---|
| `HERO.lead` | "HexoKit is a remote console for the machine you actually work on — every tmux session and pane as a live terminal, from your desk or your couch. Nothing to configure, no database, state read straight from tmux." (38) | "A remote console for the machine you actually work on. Every tmux session and pane is a live terminal, at your desk or on the couch. Nothing to configure, no database." (31) | Three sentences instead of two, none over 17 words. Drops the em-dash. Drops "HexoKit is" (the H1 above it is the subject). Drops "state read straight from tmux" — a third restatement of "no database". |

### Install

| String | Before (w) | After (w) | Why |
|---|---|---|---|
| note 1 | "Installs `shll` (the toolkit manager) and HexoKit — nothing else. The [six companions](/toolkit/) are one more command away." (18) | "Installs `shll` and HexoKit. Nothing else. The [six companions](/toolkit/) are one more command away." (14) | Parenthetical gloss cut; "Nothing else." promoted to its own sentence, which is where its force is. |
| note 2 | "Requires tmux ≥ 3.4. Run `rk doctor` if anything looks wrong." (11) | "Needs tmux 3.4 or newer. Run `rk doctor` if anything looks wrong." (12) | One word longer, and worth it: "≥" is a symbol read aloud as three words, and a spec sheet's glyph in a spoken sentence. |

### The seven cards

| # | String | Before (w) | After (w) | Why |
|---|---|---|---|---|
| 1 | title | "Every pane, a live terminal — from any device" (9) | "Every pane, on every device" (5) | The dash goes; "a live terminal" is the section H2's job, already said one line above. |
| 1 | body | "Every tmux session and pane shows up in a sidebar. Tap one on your phone, type, and it is the same shell you left at your desk. HTTPS over Tailscale for the couch." (33) | "Tap a session on your phone and you are in the shell you left at your desk. Over Tailscale from anywhere." (21) | Sentence 1 repeated the hero and the screenshot. "HTTPS over" is protocol detail; Tailscale implies it. |
| 2 | title | "Waiting, working, idle — at a glance" (7) | unchanged (7) | The one dash worth keeping: it is a list-then-payoff, the only rhythm on the page that reads as speech. |
| 2 | body | "Windows running an agent show active, waiting or idle — a hook stamps a tmux pane option, and Claude Code, Codex, Gemini CLI and Copilot CLI are wired by a one-time setup. HexoKit never speaks an agent's protocol." (38) | "Every window running an agent says which. Claude Code, Codex, Gemini CLI and Copilot CLI report in after a one-time setup." (21) | Mechanism cut. Passive "are wired by" → active "report in". The protocol sentence moves to the differentiator, where it is the thesis rather than a footnote. |
| 3 | title | "One command per parallel agent" (5) | unchanged (5) | Already the shortest good title on the page. |
| 3 | body | "`rk riff` creates a git worktree, opens a tmux window in it and launches your agent. `rk riff -N 3` spawns three at once. The sidebar becomes the fleet view." (30) | "`rk riff` gives an agent its own git worktree and tmux window. `rk riff -N 3` starts three." (18) | Three verbs ("creates, opens, launches") become one ("gives"). "The sidebar becomes the fleet view" is card 1's subject and drops "fleet". |
| 4 | title | "Watch three agents and the dev server at once" (9) | unchanged (9) | Study 1 earned this one. It is the only title that paints a scene. |
| 4 | body | "Pin panes from any server into a named board and they render side by side. Every window carries one status dot: hue = journey, shape = liveness, overlays = flags." (30) | "Pin panes from any machine into a board and they sit side by side. One dot per window tells you where it stands." (23) | The legend is docs content (see §2). "render" → "sit"; "any server" → "any machine", since "server" collides with the dashboard's own server. |
| 5 | title | "Work that starts without you" (5) | unchanged (5) | Best title on the page. |
| 5 | body | "`rk cron` wakes an agent on a schedule. `rk operator` is the one agent that runs the server — it watches the fleet, unblocks changes and pings your phone." (29) | "`rk cron` wakes an agent on a schedule. `rk operator` keeps watch and pings your phone." (16) | "the one agent that runs the server" is repeated verbatim in card 7 (§4.2). Three verbs become two; "unblocks changes" needs the fab pipeline to parse. |
| 6 | title | "A window is not only a terminal" (7) | unchanged (7) | The deliberate counterpoint to the H2. Keep. |
| 6 | body | "Split in an editor at the git root with `rk code`, a web tile your agent fills with `rk present`, or the host's GUI display." (25) | "Open an editor with `rk code`, or a web page your agent writes with `rk present`." (16) | "at the git root" is a detail for whoever already opened it. "tile" is a HexoKit noun; "web page" is everyone's. The GUI display is the third item on a card that only needs two to make its point. |
| 7 | title | "The operator drops in from any tab" (7) | unchanged (7) | Fine as is. |
| 7 | body | "The operator is the agent that runs the server, and its console is a Quake-style drawer: one shortcut and it slides down over whatever you are looking at. Ask, answer, resize it, send it back up — your pane never moves." (41) | "One shortcut and the operator slides down over whatever you are looking at. Ask, get an answer, send it back up. Your pane never moves." (25) | Card 5 already introduced the operator. "Quake-style drawer" is a simile that needs a 1996 reference; the sentence describes the motion anyway. "resize it" is a feature, not a benefit. Three sentences, none over 14 words. |

### The differentiator

| String | Before (w) | After (w) | Why |
|---|---|---|---|
| paragraph | "**AI coding agents, many at once** — that is what tends to run in those panes. `rk riff` spawns each one in its own git worktree, and the dashboard lets you watch the whole fleet. But HexoKit never wraps the agent: a pane is just a pane. It's equally a build, a REPL, an ssh session, `htop`. **The agent is one of the things you run, not the thing HexoKit is.**" (71) | "Mostly what runs in those panes is **coding agents, several at once**. But HexoKit never wraps them. A pane is just as happily a build, a REPL, an ssh session, `htop`. **The agent is one of the things you run, not the thing HexoKit is.**" (45) | Un-inverts the cleft (§3). Drops sentence 2 entirely — `rk riff` and the worktree are card 3, verbatim. "a pane is just a pane" is a tautology standing in for the argument that the next sentence actually makes. |
| It is | "A remote, phone-first console for your tmux: agent-agnostic, no database, state derived from tmux + the filesystem. A spawner (`rk riff`) and a dashboard (`rk serve`) that compose." (28) | "A console for your tmux, built for the phone. Any agent, no database, nothing to keep in sync." (18) | "agent-agnostic" is a spec-sheet compound; "any agent" is what it means. The spawner/dashboard sentence is architecture — true, and the reader's third exposure to `rk riff`. |
| It isn't | "An agent wrapper: it doesn't speak any agent's protocol, parse any agent's output, or care what's in the pane. When the agent tooling churns underneath you, the terminal layer stays put." (31) | "An agent wrapper. It reads no agent's output and speaks no agent's protocol. When the agent tools change again, this layer stays put." (23) | Three negatives become two (the third, "or care what's in the pane", is the paragraph's own line). "tooling churns underneath you" → "tools change again": same claim, said the way a person says it. |

### The toolkit

| String | Before (w) | After (w) | Why |
|---|---|---|---|
| lead | "HexoKit is the cockpit. Six companions sit on its six edges — each a small CLI that does one job and composes with the rest — and `shll` installs them all." (31) | "HexoKit is the cockpit. Six small tools sit on its six edges, and `shll` installs them all." (17) | The 14-word aside between dashes is a definition of "companion" that the six blurbs beneath it demonstrate. Folding "small" into the noun keeps the only load-bearing word in it. |
| `fab-kit` blurb | "the planning harness: a constitution and a plan before any agent writes code." (13) | "a plan before any agent writes code." (7) | "harness" replaced (§2); "constitution" is fab-kit's internal noun and its own page's job. |
| `wt` blurb | "disposable git worktrees so each change works in isolation." (9) | "throwaway git worktrees, one per change." (6) | "so each change works in isolation" restates "one per change". "throwaway" is the spoken word for "disposable". |
| `idea` blurb | "capture ideas and feed a backlog without breaking flow." (9) | "catch an idea without breaking flow." (6) | "feed a backlog" is the mechanism; "without breaking flow" is the reason anyone would. |
| `tu` blurb | "track what your AI coding sessions cost." (7) | "what your AI coding sessions cost." (6) | Six fragments read better as a list than five fragments and one sentence. |
| `hop` blurb | "a personal directory of your git repos; jump anywhere, batch-update from anywhere." (12) | "jump to any of your repos." (6) | The only blurb with a semicolon and the only one naming two features. Batch-update belongs on hop's page. |
| `desktop` blurb | "the native macOS shell around the HexoKit dashboard." (8) | "the Mac app around the dashboard." (6) | "native macOS shell" is three technical words for "Mac app", and "shell" collides with the shell in every other sentence on this page. |

> **Note on the blurbs:** `landing-data.ts` documents these as a hand-copy of
> `src/content/docs/toolkit/index.mdx` § The six companions — five verbatim, one
> deliberately trimmed. Changing them here means editing both files together, or
> deciding the landing gets shorter blurbs than the toolkit page on purpose. The
> second is defensible (a landing blurb and a doc blurb have different jobs) but
> it should be a decision, not a drift. If the coupling is worth more than the
> 30 words, keep the blurbs and take the cut elsewhere.

### Desktop

| String | Before (w) | After (w) | Why |
|---|---|---|---|
| sentence 1 | fixed string (29) | unchanged (29) | |
| sentence 2 | "The app — macOS today — connects three ways — **This Mac** (one-click daemon start), **over SSH** (`rk remote`), or **a URL** — and never starts, stops or updates anything on its own." (33) | "It connects to this Mac, to another over SSH, or to any URL, and it starts and stops nothing on its own." (22) | Four dashes and two parentheticals to zero (§3). "macOS today" is on the download button. `rk remote` is the install guide's. "never starts, stops or updates anything on its own" → the two verbs that matter. |
| sentence 3 | "Your tmux sessions survive every daemon action." (7) | "Your tmux sessions outlive it." (5) | "every daemon action" is an abstraction over the two verbs just named. |
| note | "Install through the CLI: it produces a quarantine-free, digest-verified app, where a browser-downloaded DMG trips Gatekeeper." (16) | "Install from the CLI. A downloaded DMG trips Gatekeeper; this one does not." (13) | Benefit before mechanism, and the mechanism turns out not to be needed. The reader wants to know the app opens. |

### Footer

**Unchanged.** Docs · Toolkit · GitHub · Discord · versions.json · llms.txt.
Six one-word labels, already at the floor.

---

## 6. The whole page, top to bottom

> `hexokit · v3.19.37`
>
> # Your tmux, in the browser and on your phone.
>
> Cockpit for the agent era.
>
> A remote console for the machine you actually work on. Every tmux session and
> pane is a live terminal, at your desk or on the couch. Nothing to configure,
> no database.
>
> `Install` · `Read the docs` · `GitHub`
>
> ---
>
> `[ install ]`
> ## One line, then you are in
>
> ```
> curl -fsSL hexokit.com/install | sh
> brew install sahil87/tap/hexokit
> ```
>
> Installs `shll` and HexoKit. Nothing else. The [six companions](/toolkit/) are
> one more command away.
>
> Needs tmux 3.4 or newer. Run `rk doctor` if anything looks wrong.
>
> ---
>
> `[ what it does ]`
> ## Everything is a live terminal
>
> **Every pane, on every device**
> Tap a session on your phone and you are in the shell you left at your desk.
> Over Tailscale from anywhere.
>
> **Waiting, working, idle — at a glance**
> Every window running an agent says which. Claude Code, Codex, Gemini CLI and
> Copilot CLI report in after a one-time setup.
>
> **One command per parallel agent**
> `rk riff` gives an agent its own git worktree and tmux window. `rk riff -N 3`
> starts three.
>
> **Watch three agents and the dev server at once**
> Pin panes from any machine into a board and they sit side by side. One dot per
> window tells you where it stands.
>
> **Work that starts without you**
> `rk cron` wakes an agent on a schedule. `rk operator` keeps watch and pings
> your phone.
>
> **A window is not only a terminal**
> Open an editor with `rk code`, or a web page your agent writes with
> `rk present`.
>
> **The operator drops in from any tab**
> One shortcut and the operator slides down over whatever you are looking at.
> Ask, get an answer, send it back up. Your pane never moves.
>
> ---
>
> `[ the difference ]`
> ## Use any agent, untouched
>
> Mostly what runs in those panes is **coding agents, several at once**. But
> HexoKit never wraps them. A pane is just as happily a build, a REPL, an ssh
> session, `htop`. **The agent is one of the things you run, not the thing
> HexoKit is.**
>
> **It is** — A console for your tmux, built for the phone. Any agent, no
> database, nothing to keep in sync.
>
> **It isn't** — An agent wrapper. It reads no agent's output and speaks no
> agent's protocol. When the agent tools change again, this layer stays put.
>
> ---
>
> `[ the toolkit ]`
> ## The HexoKit toolkit
>
> HexoKit is the cockpit. Six small tools sit on its six edges, and `shll`
> installs them all.
>
> fab-kit — a plan before any agent writes code.
> wt — throwaway git worktrees, one per change.
> idea — catch an idea without breaking flow.
> tu — what your AI coding sessions cost.
> hop — jump to any of your repos.
> desktop — the Mac app around the dashboard.
>
> → See the whole toolkit
>
> ---
>
> `[ desktop ]`
> ## The desktop app
>
> The dashboard in a window of its own, with the same keyboard shortcuts you are
> used to in a terminal — none of them swallowed by a browser tab. It connects
> to this Mac, to another over SSH, or to any URL, and it starts and stops
> nothing on its own. Your tmux sessions outlive it.
>
> ```
> rk desktop install
> rk desktop update
> ```
>
> Install from the CLI. A downloaded DMG trips Gatekeeper; this one does not.
>
> → Install guide
>
> ---
>
> Docs · Toolkit · GitHub · Discord · versions.json · llms.txt

**Read aloud, that page takes about three minutes.** The current one takes four
and a quarter. Every claim `competitive-landscape.md` calls defensible survives:
agent-agnostic ("Any agent", "never wraps them"), no database (hero and It is),
tmux as the substrate (H1, hero, three cards), phone-first (H1, hero, card 1,
It is), parallel agents in worktrees (card 3), and persistence ("Your tmux
sessions outlive it").

---

## 7. Do not cut these

1. **The hero's third sentence, "Nothing to configure, no database."** It is the
   shortest sentence in the hero and the only one making a competitive claim.
   Webmux is the only rival with the same property and it does not lead with it.

2. **"— at a glance" in card 2's title.** The one em-dash worth keeping. It sets
   up a list and pays it off, which is a spoken rhythm, not a written one.

3. **The four agent names in card 2.** They are 6 of the card's 21 words and the
   only evidence on the page that the agnostic claim has been tested. Study 1
   was right that naming four beats "and more".

4. **`htop` in the differentiator.** One word, and it is the entire proof that a
   pane is not an agent slot. A reader who runs `htop` recognises themselves.

5. **"It is / It isn't" as a structure.** Two 20-word rows outperform a
   150-word section. This is already the most minimal thing on the page and the
   rewrite should make it shorter, never remove it.

6. **The desktop lead sentence, at 29 words the longest kept string.** It is
   fixed by the brief, and it earns the length: "none of them swallowed by a
   browser tab" is the only sentence on the page that names a felt annoyance.

7. **The footer's `versions.json` and `llms.txt`.** Study 1 said it; it holds
   under a minimalism pass too. Two machine-readable endpoints in a footer are
   a posture statement that costs three words.

---

## 8. If only some of this ships

1. **The desktop second sentence** (§5) — four dashes, two parentheticals,
   33 words. The worst sentence on the page by a distance.
2. **Card 2's body and card 7's body** — 79 words become 46, and card 7 stops
   re-introducing something card 5 introduced.
3. **The differentiator paragraph** — un-invert the cleft and drop the `rk riff`
   sentence card 3 already owns. 71 → 45.
4. **The dot legend in card 4** — the one place the page teaches a notation.
5. **The six blurbs** — 58 → 37 words, but only after deciding the drift
   question in §5.
6. **The hero lead and the two install notes** — smallest wins, safest edits.
