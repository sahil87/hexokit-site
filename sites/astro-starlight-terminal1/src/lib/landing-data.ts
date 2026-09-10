/**
 * landing-data — every string, link and image reference the `/` landing page
 * renders (change lvnp). `src/pages/index.astro` and `ToolkitHexagon.astro` only
 * lay this data out; they author no copy of their own.
 *
 * WHY THE COPY LIVES HERE AND NOT IN THE TEMPLATE:
 *   1. A copy edit becomes a data edit — no markup surgery to change a sentence.
 *   2. It is TESTABLE. `scripts/landing-data.test.mjs` mechanizes the `vn39`
 *      hard rule for hand-written prose: every backticked `rk <verb>` token in
 *      this file must name a real command in the repo-root `help/hexokit.json`.
 *      Prose embedded in an `.astro` template could not be asserted on.
 *   3. The hexagon's tool links are derived from the shared roster
 *      (`mountFor`), never hardcoded — HexoKit's mount (`docs`) already differs
 *      from its slug, so hardcoded `/<slug>/` paths are a known bug class.
 *
 * HAND-COPY DRIFT SURFACE: `TOOLKIT_EDGES[].blurb` is copied VERBATIM from
 * `src/content/docs/toolkit/index.mdx` § The six companions. Those are the only
 * two copies of the companion one-liners on the site; edit both together.
 *
 * Image `width`/`height` are the REAL pixel dimensions of the committed webps
 * (see `scripts/build-landing-screenshots.mjs`). They are required, not
 * decorative: the browser reserves the right box before the image loads, so the
 * page does not reflow (CLS) as the lazy card images arrive.
 */
import { mountFor, repoFor } from './tool-slugs.ts';

/** A committed screenshot, with everything a non-shifting `<img>` needs. */
export interface LandingImage {
  /** Site-absolute path under `public/`. */
  src: string;
  /** Meaningful alt text (Constitution Accessibility) — never empty here. */
  alt: string;
  /** Real intrinsic pixel width of the committed webp. */
  width: number;
  /** Real intrinsic pixel height of the committed webp. */
  height: number;
}

/** One of the six feature cards under `#features`. */
export interface FeatureCard {
  /** Card heading. */
  title: string;
  /** One or two sentences. Backticked `rk <verb>` tokens are vn39-checked. */
  copy: string;
  image: LandingImage;
  /** Where the card's "→ docs" link goes — always under `/docs/`. */
  href: string;
}

/** One label around the toolkit hexagon. */
export interface ToolkitEdge {
  /** Roster slug, or `'desktop'` for the app (not a roster tool). */
  slug: string;
  /** Visible label text. */
  label: string;
  /** Site-absolute target — a roster mount, or `/desktop/`. */
  href: string;
  /** One-line "what it's for" — verbatim from `toolkit/index.mdx`. */
  blurb: string;
}

/**
 * Resolve a roster tool's site-absolute mount, failing the build loudly rather
 * than emitting `/null/` (the HeaderNav/GithubButton guard idiom).
 */
function mountHref(slug: string): string {
  const mount = mountFor(slug);
  if (!mount) {
    throw new Error(`landing-data: \`${slug}\` is not in the tool roster.`);
  }
  return `/${mount}/`;
}

/**
 * The product's GitHub URL, built from the roster the way `HeaderNav.astro`
 * does. The repo is still named `run-kit`; GitHub redirects after the
 * source-side rename, and nothing here has to change when it happens.
 */
const hexokitRepo = repoFor('hexokit');
if (!hexokitRepo) {
  throw new Error('landing-data: `hexokit` is not in the tool roster.');
}
export const GITHUB_URL = `https://github.com/sahil87/${hexokitRepo}`;

/** Hero copy. The tagline and sub-line are verbatim brand strings — do not edit. */
export const HERO = {
  tagline: 'Your tmux, in the browser and on your phone.',
  subline: 'Cockpit for the agent era.',
  lead:
    'HexoKit is a remote console for the machine you actually work on — every tmux session and pane as a live terminal, in a sidebar, from your desk or your couch. Nothing to configure, no database, state read straight from tmux.',
  desktopImage: {
    src: '/screenshots/hexokit-hero-desktop.webp',
    alt: 'The HexoKit desktop app: a sidebar of tmux sessions beside two live agent panes running a build and a review.',
    width: 2400,
    height: 1506,
  },
  phoneImage: {
    src: '/screenshots/hexokit-hero-phone.webp',
    alt: 'HexoKit on an iPhone: the same session sidebar, with boards, servers and per-pane status.',
    width: 800,
    height: 1739,
  },
} as const satisfies {
  tagline: string;
  subline: string;
  lead: string;
  desktopImage: LandingImage;
  phoneImage: LandingImage;
};

/**
 * The two install lines (D10 target state). The `hexokit.com/install`
 * product-first default and the `hexokit` formula land in later changes; the
 * site is unannounced until then, so printing the target state is deliberate.
 */
export const INSTALL_LINES = [
  'curl -fsSL hexokit.com/install | sh',
  'brew install sahil87/tap/hexokit',
] as const;

/** The `rk desktop` commands on the desktop card, rendered as one EC block. */
export const DESKTOP_COMMANDS = ['rk desktop install', 'rk desktop update'] as const;

/** The six feature cards, in render order. */
export const FEATURES: readonly FeatureCard[] = [
  {
    title: 'Every pane, a live terminal — from any device',
    copy: 'Every tmux session and pane shows up in a sidebar. Tap one on your phone, type, and it is the same shell you left at your desk. HTTPS over Tailscale for the couch.',
    image: {
      src: '/screenshots/hexokit-phone-terminal.webp',
      alt: 'A live tmux pane on a phone, with an on-screen key bar for tab, ctrl and arrow keys.',
      width: 800,
      height: 1739,
    },
    href: '/docs/install/',
  },
  {
    title: 'Agents are just panes',
    copy: 'Windows running an agent report active, waiting or idle through hooks that stamp a tmux pane option — Claude Code, Codex, Gemini CLI, Copilot CLI and more. Agent-agnostic: the dashboard never speaks an agent’s protocol.',
    image: {
      src: '/screenshots/hexokit-agent-state.webp',
      alt: 'The session sidebar with per-window status dots beside a running agent pane; the status bar reads agt idle.',
      width: 1400,
      height: 1476,
    },
    href: '/docs/agent-hooks/',
  },
  {
    title: '`rk riff` — one agent per worktree',
    copy: 'One command creates a git worktree, opens a tmux window in it and launches your agent; `-N 3` spawns three. The sidebar is the fleet view.',
    image: {
      src: '/screenshots/run-kit-agent-session.webp',
      alt: 'A HexoKit agent session: a worktree window with the agent working and its status reported in the sidebar.',
      width: 1800,
      height: 1395,
    },
    href: '/docs/workflows/',
  },
  {
    title: 'Boards + status dots',
    copy: 'Pin panes from any server into a named board and watch them side by side. Every window carries a status dot: hue = journey, shape = liveness, overlays = flags.',
    image: {
      src: '/screenshots/hexokit-board.webp',
      alt: 'A HexoKit board named bb showing three pinned agent panes from the same server side by side.',
      width: 1400,
      height: 445,
    },
    href: '/docs/boards/',
  },
  {
    title: 'Cron clock + operator',
    copy: '`rk cron` wakes an agent on a schedule; `rk operator` is the one agent that runs the server — it watches the fleet, unblocks changes and pings your phone.',
    image: {
      src: '/screenshots/hexokit-operator.webp',
      alt: 'The operator popover reporting on tracked changes and asking whether to start the next wave of work.',
      width: 1600,
      height: 668,
    },
    href: '/docs/cron-schedule-kinds/',
  },
  {
    title: 'Code, web and GUI tiles',
    copy: 'A window is not only a terminal: split in a `rk code` editor at the git root, a web tile your agent fills with `rk present`, or the host’s GUI display.',
    image: {
      src: '/screenshots/hexokit-web-tile.webp',
      alt: 'A HexoKit window split between a terminal pane and a web tile rendering a formatted change plan.',
      width: 1600,
      height: 1004,
    },
    href: '/docs/skill/display/',
  },
];

/**
 * The six hexagon edges, clockwise from the top edge. Five are roster tools
 * resolved through `mountFor`; `desktop` is S3's thin app page, not a tool.
 * Blurbs are verbatim from `src/content/docs/toolkit/index.mdx`.
 */
export const TOOLKIT_EDGES: readonly ToolkitEdge[] = [
  {
    slug: 'fab-kit',
    label: 'fab-kit',
    href: mountHref('fab-kit'),
    blurb: 'the planning harness: a constitution and a plan before any agent writes code.',
  },
  {
    slug: 'wt',
    label: 'wt',
    href: mountHref('wt'),
    blurb: 'disposable git worktrees so each change works in isolation.',
  },
  {
    slug: 'idea',
    label: 'idea',
    href: mountHref('idea'),
    blurb: 'capture ideas and feed a backlog without breaking flow.',
  },
  {
    slug: 'tu',
    label: 'tu',
    href: mountHref('tu'),
    blurb: 'track what your AI coding sessions cost.',
  },
  {
    slug: 'hop',
    label: 'hop',
    href: mountHref('hop'),
    blurb: 'a personal directory of your git repos; jump anywhere, batch-update from anywhere.',
  },
  {
    slug: 'desktop',
    label: 'desktop',
    href: '/desktop/',
    blurb: 'the native macOS shell around the HexoKit dashboard.',
  },
];

/** One row of the landing's own footer link list. */
export interface FooterLink {
  label: string;
  href: string;
}

/**
 * The landing footer's six links, in order. Starlight's own `Footer.astro`
 * (copyright + author) still renders below this row — it is not replaced.
 */
export const FOOTER_LINKS: readonly FooterLink[] = [
  { label: 'Docs', href: '/docs/' },
  { label: 'Toolkit', href: '/toolkit/' },
  { label: 'GitHub', href: GITHUB_URL },
  { label: 'Discord', href: 'https://discord.gg/32XHh5mJYn' },
  { label: 'versions.json', href: '/versions.json' },
  { label: 'llms.txt', href: '/llms.txt' },
];
