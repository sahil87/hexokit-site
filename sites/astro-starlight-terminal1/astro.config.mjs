// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import { docsSiteSidebarItems } from './src/lib/docs-site-sidebar.mjs';
import { siteRedirects } from './src/lib/site-redirects.mjs';
import { TOOL_ROSTER } from './src/lib/tool-roster.mjs';

// The single site-authored roster (slug/label/mount/repo/formula/binary —
// change it5d) lives in src/lib/tool-roster.mjs and is imported directly here:
// astro.config.mjs is evaluated at config-load time, which loads .mjs cleanly.
// No config-eval copy — the copy is exactly the drift the roster removes.
const COMPANIONS = TOOL_ROSTER.filter((t) => t.slug !== 'hexokit');

export default defineConfig({
  site: 'https://hexokit.com',
  // The short per-tool URLs (hexokit.com/wt) are CANONICAL real pages (via
  // `slug:` frontmatter overrides — see the tool content files), mounted at the
  // roster's `mount` segment (HexoKit's pages live under /docs/). The redirect
  // table — the change-3ke3 `/tools/<slug>/*` set, the it5d legacy mounts, the
  // docs/site reverse map, and the retired family pages — is single-sourced in
  // src/lib/site-redirects.mjs (extracted by 260912-1u4q so the cross-site
  // shll.ai redirect map composes the same object). Static <meta refresh>
  // pages emitted at build — works on Pages. (A redirect key that collides
  // with a real route fails the build, which is why retired routes — e.g.
  // tools/index.mdx — must be removed when the key is added.)
  redirects: siteRedirects(),
  server: { host: '0.0.0.0' },
  vite: {
    server: {
      // Allow run-kit's proxy + Tailscale hostnames. `true` skips the host check entirely;
      // safe here because the dev server is for an experiment under _playground.
      allowedHosts: true,
    },
  },
  integrations: [
    starlight({
      title: 'HexoKit',
      description: 'Your tmux, in the browser and on your phone.',
      // Explicit hexagon favicon. The .svg is emitted by default, but declaring
      // it documents intent; the by-convention root /favicon.ico fallback (used by
      // headless routes — robots.txt, sitemaps, the <meta refresh> redirect stubs)
      // is the real multi-resolution ICO at public/favicon.ico (see
      // scripts/generate-favicon-ico.mjs).
      favicon: '/favicon.svg',
      customCss: ['./src/styles/terminal.css'],
      expressiveCode: {
        // Match Starlight's theme toggle: dark = terminal-dark, light = paper.
        themes: ['github-dark', 'github-light'],
        styleOverrides: {
          // Borrow the terminal1 palette so code panels feel like part of the
          // page chrome, not a transplanted IDE.
          borderRadius: '4px',
          borderColor: 'var(--c-border)',
          codeFontFamily: 'var(--sl-font-mono)',
          codeFontSize: '0.9rem',
          codeLineHeight: '1.55',
          codeBackground: 'var(--c-surface-2)',
          frames: {
            frameBoxShadowCssValue: 'none',
            editorActiveTabBackground: 'var(--c-surface)',
            editorActiveTabForeground: 'var(--c-fg)',
            editorTabBarBackground: 'var(--c-surface)',
            editorTabBarBorderBottomColor: 'var(--c-border)',
            terminalBackground: 'var(--c-surface-2)',
            terminalTitlebarBackground: 'var(--c-surface)',
            terminalTitlebarForeground: 'var(--c-fg-dim)',
            terminalTitlebarBorderBottomColor: 'var(--c-border)',
            // Hide the Mac-style traffic light dots; tighter terminal feel.
            terminalTitlebarDotsOpacity: '0',
          },
        },
      },
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      pagination: true,
      lastUpdated: false,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      // Route-dispatching ToC overrides: the single right-rail (and mobile
      // dropdown) override slot fans out by route id — `<mount>/commands` pages
      // get the first-level command list (CommandsToc), `<mount>/readme` pages
      // get a nested H2/H3 list from the README slice (ReadmeToc), and every
      // other page falls through to Starlight's default ToC. See
      // src/components/TocDispatcher.astro / MobileTocDispatcher.astro.
      components: {
        TableOfContents: './src/components/TocDispatcher.astro',
        MobileTableOfContents: './src/components/MobileTocDispatcher.astro',
        // Override the built-in footer to append a site-wide copyright line.
        // The override renders Starlight's <Default /> footer first so prev/next
        // pagination is preserved — see src/components/Footer.astro.
        Footer: './src/components/Footer.astro',
        // Override the head to emit the Cloudflare Web Analytics beacon with its
        // `data-cf-beacon` JSON un-escaped. Starlight's `head:` config array spreads
        // attrs as Astro attributes, which HTML-escapes the JSON quotes to &quot;;
        // this override renders the literal <script> instead — see Head.astro.
        Head: './src/components/Head.astro',
        // Override the SocialIcons slot with the header nav (Docs · Toolkit ·
        // Desktop · GitHub) — Starlight has no nav-links config, and the slot is
        // its documented header-links seam (no Header.astro fork). The `social:`
        // array is deliberately absent — the override replaces it; Discord moved
        // to the footer row. See src/components/HeaderNav.astro.
        SocialIcons: './src/components/HeaderNav.astro',
        // Override the theme picker: a cycling bracket-tag button ([dark] →
        // [light] → [auto]) instead of the native <select>, whose open option
        // list is OS-rendered and unthemable. A hidden real <select> stays as
        // the seam for the terminal prompt's `theme` command and Starlight's
        // ThemeProvider sync — see src/components/ThemeSelect.astro.
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      sidebar: [
        {
          label: 'Docs',
          items: [
            { label: 'Overview', slug: 'docs' },
            { label: 'Readme', slug: 'docs/readme' },
            { label: 'Commands', slug: 'docs/commands' },
            // Build-time-generated entries for HexoKit's pulled docs/site tree
            // (content/hexokit/site/**) — install, boards, notifications, skill
            // pages, … Empty until the daily pull lands a tree.
            ...docsSiteSidebarItems('hexokit'),
          ],
        },
        {
          label: 'Toolkit',
          items: [
            { label: 'Overview', slug: 'toolkit' },
            { label: 'Install', slug: 'toolkit/install' },
            { label: 'Philosophy', slug: 'toolkit/philosophy' },
            { label: 'Daily flow', slug: 'toolkit/daily-flow' },
            { label: 'Start a new change', slug: 'toolkit/new-change' },
            { label: 'Desktop app', slug: 'desktop' },
          ],
        },
        {
          label: 'Tools',
          items: COMPANIONS.map((t) => ({
            label: t.label,
            collapsed: true,
            items: [
              { label: 'Overview', slug: t.mount },
              { label: 'Readme', slug: `${t.mount}/readme` },
              { label: 'Commands', slug: `${t.mount}/commands` },
              // Build-time-generated entries for the tool's pulled docs/site tree
              // (content/<slug>/site/**) — including any install/workflows pages the
              // tool repo publishes. Empty until the daily pull lands a tree.
              ...docsSiteSidebarItems(t.slug),
            ],
          })),
        },
        {
          label: 'Reference',
          items: [
            { label: 'Command index', slug: 'reference/command-index' },
          ],
        },
      ],
    }),
    mdx(),
  ],
});
