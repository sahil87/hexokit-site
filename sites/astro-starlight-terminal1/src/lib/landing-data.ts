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
 * THE BLURBS ARE LANDING COPY, NOT A COPY: `TOOLKIT_EDGES[].blurb` is the
 * landing's own, deliberately short (6–7 word) line per companion (copy study 2,
 * change a9xx). `src/content/docs/toolkit/index.mdx` § The six companions keeps
 * the long form for the directory page. The two sets describe the same job per
 * tool but are NOT expected to match word for word — when a tool's job changes,
 * edit both on purpose.
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
  /**
   * Spans the whole grid row with the screenshot beside the copy (the operator
   * console card — its capture is a drawer across a whole tab, which no 16:10
   * thumbnail can show). At most one card should carry this.
   */
  wide?: true;
}

/** One label around the toolkit hexagon. */
export interface ToolkitEdge {
  /** Roster slug, or `'desktop'` for the app (not a roster tool). */
  slug: string;
  /** Visible label text. */
  label: string;
  /** Site-absolute target — a roster mount, or `/desktop/`. */
  href: string;
  /**
   * One short line — the landing's own "what it's for" (6–7 words), not a copy
   * of the longer `toolkit/index.mdx` blurb for the same tool.
   */
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
    'A remote console for the machine you actually work on. Every tmux session and pane is a live terminal, at your desk or on the couch. Nothing to configure, no database.',
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

/** The feature cards, in render order (the last one is the full-width card). */
export const FEATURES: readonly FeatureCard[] = [
  {
    title: 'Every pane, on every device',
    copy: 'Tap a session on your phone and you are in the shell you left at your desk. Over Tailscale from anywhere.',
    image: {
      src: '/screenshots/hexokit-phone-terminal.webp',
      alt: 'A live tmux pane on a phone, with an on-screen key bar for tab, ctrl and arrow keys.',
      width: 800,
      height: 1739,
    },
    href: '/docs/install/',
  },
  {
    title: 'Waiting, working, idle — at a glance',
    copy: 'Every window running an agent says which. Claude Code, Codex, Gemini CLI and Copilot CLI report in after a one-time setup.',
    image: {
      src: '/screenshots/hexokit-agent-state.webp',
      alt: 'The lower session sidebar with per-window status dots beside an agent pane; the status bar reads agt idle 43s.',
      width: 1000,
      height: 625,
    },
    href: '/docs/agent-hooks/',
  },
  {
    title: 'One command per parallel agent',
    copy: '`rk riff` gives an agent its own git worktree and tmux window. `rk riff -N 3` starts three.',
    image: {
      src: '/screenshots/hexokit-fleet.webp',
      alt: 'The fleet view: the server grid and a sidebar list of riff worktree windows, each with its status dot.',
      width: 760,
      height: 475,
    },
    href: '/docs/workflows/',
  },
  {
    title: 'Watch three agents and the dev server at once',
    copy: 'Pin panes from any machine into a board and they sit side by side. One dot per window tells you where it stands.',
    image: {
      src: '/screenshots/hexokit-board.webp',
      alt: 'A HexoKit board: two pinned agent panes from the same server rendered side by side.',
      width: 1400,
      height: 875,
    },
    href: '/docs/boards/',
  },
  {
    title: 'Work that starts without you',
    copy: '`rk cron` wakes an agent on a schedule. `rk operator` keeps watch and pings your phone.',
    image: {
      src: '/screenshots/hexokit-operator.webp',
      alt: 'The operator popover reporting on tracked changes and asking whether to start the next wave of work.',
      width: 1080,
      height: 675,
    },
    href: '/docs/cron-schedule-kinds/',
  },
  {
    title: 'A window is not only a terminal',
    copy: 'Open an editor with `rk code`, a web page your agent writes with `rk present`, or the machine’s own screen.',
    image: {
      src: '/screenshots/hexokit-web-tile.webp',
      alt: 'A HexoKit window split between a terminal pane and a web tile rendering a formatted change plan.',
      width: 1400,
      height: 875,
    },
    href: '/docs/skill/display/',
  },
  {
    title: 'The operator drops in from any tab',
    copy: 'One shortcut and the operator’s console slides down over whatever you are looking at, Quake-style. Ask, get an answer, send it back up. Your pane never moves.',
    image: {
      src: '/screenshots/hexokit-operator-console.webp',
      alt: 'The operator console slid down as a drawer over a dashboard tab, with the tab’s Ask box above it and the operator’s transcript inside.',
      width: 1600,
      height: 726,
    },
    href: '/docs/cron-schedule-kinds/',
    wide: true,
  },
];

/**
 * The six hexagon edges, clockwise from the top edge. Five are roster tools
 * resolved through `mountFor`; `desktop` is S3's thin app page, not a tool.
 * Blurbs are the landing's own short lines (see the header note).
 */
export const TOOLKIT_EDGES: readonly ToolkitEdge[] = [
  {
    slug: 'fab-kit',
    label: 'fab-kit',
    href: mountHref('fab-kit'),
    blurb: 'a plan before any agent writes code.',
  },
  {
    slug: 'wt',
    label: 'wt',
    href: mountHref('wt'),
    blurb: 'throwaway git worktrees, one per change.',
  },
  {
    slug: 'idea',
    label: 'idea',
    href: mountHref('idea'),
    blurb: 'catch an idea without breaking flow.',
  },
  {
    slug: 'tu',
    label: 'tu',
    href: mountHref('tu'),
    blurb: 'what your AI coding sessions cost.',
  },
  {
    slug: 'hop',
    label: 'hop',
    href: mountHref('hop'),
    blurb: 'jump to any of your repos.',
  },
  {
    slug: 'desktop',
    label: 'desktop',
    href: '/desktop/',
    blurb: 'the Mac app around the dashboard.',
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
