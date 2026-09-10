/**
 * /llms.txt — the curated agent-discoverability index (change 354p; HexoKit
 * structure since change it5d), emitted as a build-time static `text/plain`
 * endpoint (Constitution I — no SSR, no runtime fetch; Constitution VI — zero
 * new deps). The agent-facing sibling of the kb1r SEO layer: where
 * og:image/JSON-LD make the site legible to crawlers and social scrapers, this
 * makes it legible to coding agents, via the llmstxt.org convention (H1 title,
 * a one-line blockquote summary, then bulleted link sections).
 *
 * Data sources, all single-sourced (no hand-copy — vn39 / Tool-Page-Depth
 * anti-drift):
 *   - tool one-liners ← `help/<slug>.json` `root.short` (prefix-stripped), with
 *     a fallback to the tool's overview.mdx frontmatter `description`, via the
 *     shared `src/lib/llms.ts` helper.
 *   - the `## Docs` docs/site bullets ← the committed `content/hexokit/site/**`
 *     tree via `collectDocsSitePages` (mechanical — no hand list).
 *   - the `## Toolkit` / `## Reference` links ← the live URL shapes the HTML
 *     pages use.
 *
 * Every URL is ABSOLUTE, built from the endpoint context `site` (`Astro.site` ===
 * `https://hexokit.com`) — never hardcoded — mirroring the og:image absolute-URL
 * discipline in docs/memory/conventions/seo-social-meta.md.
 *
 * Fail-soft per tool: a tool with neither a `root.short` nor an overview
 * `description` emits a noted-omission bullet rather than an empty/undefined one,
 * and never hard-fails the build (help-collection per-tool skip-degrade).
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { TOOLS, toolShort } from '../lib/llms.ts';
import { mountFor, slugForMount, labelFor } from '../lib/tool-slugs.ts';
import { collectDocsSitePages } from '../lib/docs-site-tree.ts';
import { repoRootFromModuleUrl } from '../lib/repo-root.ts';

/** One curated link bullet. */
interface LinkItem {
  label: string;
  /** Site-absolute path (e.g. `/wt/`). */
  pathname: string;
  /** One-line description (may be a noted omission). */
  desc: string;
}

const SUMMARY =
  'HexoKit is a remote console for your tmux — every session and pane as a live ' +
  'terminal, in the browser and on your phone. The HexoKit toolkit adds six ' +
  'companion CLIs for planning, worktrees, backlog, cost, and repo navigation.';

export const GET: APIRoute = async ({ site }) => {
  // `site` is guaranteed present — astro.config.mjs sets `site: 'https://hexokit.com'`.
  const origin = site!;
  const repoRoot = repoRootFromModuleUrl(import.meta.url);

  // Tool overview `description` frontmatter, keyed by tool slug — the fallback
  // when a tool's `root.short` is missing/empty. Sourced from the same `docs`
  // collection the HTML pages render (no hand-copy). The overview entry `id` is
  // the tool's MOUNT (`docs` for hexokit, the bare slug for companions) — the
  // `slug:` frontmatter override maps the entry id directly to the mount, so
  // `slugForMount` resolves the slug that keys the map.
  const docs = await getCollection('docs');
  const overviewDesc = new Map<string, string>();
  for (const entry of docs) {
    const slug = slugForMount(entry.id);
    if (slug) {
      const d = (entry.data.description ?? '').trim();
      if (d) overviewDesc.set(slug, d);
    }
  }

  // ── Docs section (the product, mounted at /docs/) ────────────────────────
  const docsSection: LinkItem[] = [
    {
      label: 'Overview',
      pathname: '/docs/',
      desc: toolShort(repoRoot, 'hexokit') ?? overviewDesc.get('hexokit') ?? 'HexoKit product docs',
    },
    { label: 'Readme', pathname: '/docs/readme/', desc: 'the canonical README, synced from the product repo' },
    { label: 'Commands', pathname: '/docs/commands/', desc: 'every subcommand and flag, generated from the binary’s --help' },
  ];
  // One bullet per committed HexoKit docs/site page — mechanical (the collector
  // the dynamic route and sidebar also use), never a hand-maintained list.
  for (const page of collectDocsSitePages(repoRoot)) {
    if (page.slug !== 'hexokit') continue;
    docsSection.push({
      label: page.title,
      pathname: `/docs/${page.path}/`,
      desc: 'HexoKit documentation',
    });
  }

  // ── Toolkit section (the family pages + one bullet per companion) ────────
  const toolkitSection: LinkItem[] = [
    { label: 'Overview', pathname: '/toolkit/', desc: 'HexoKit and the six tools around it' },
    { label: 'Install', pathname: '/toolkit/install/', desc: 'install the whole toolkit with one brew tap' },
    { label: 'Philosophy', pathname: '/toolkit/philosophy/', desc: 'the design principles behind the toolkit' },
    { label: 'Daily flow', pathname: '/toolkit/daily-flow/', desc: 'a typical day with the toolkit' },
    { label: 'Start a new change', pathname: '/toolkit/new-change/', desc: 'from backlog item to active worktree with an agent' },
    { label: 'Desktop app', pathname: '/desktop/', desc: 'the native macOS shell around the HexoKit dashboard' },
  ];
  for (const tool of TOOLS) {
    if (tool === 'hexokit') continue; // the product lives in the Docs section
    const short = toolShort(repoRoot, tool) ?? overviewDesc.get(tool) ?? null;
    toolkitSection.push({
      label: labelFor(tool) ?? tool,
      pathname: `/${mountFor(tool)}/`,
      desc: short ?? '(description unavailable — help/<slug>.json and overview frontmatter both missing)',
    });
  }

  // ── Reference section ────────────────────────────────────────────────────
  const reference: LinkItem[] = [
    { label: 'Command index', pathname: '/reference/command-index/', desc: 'every command and flag across the toolkit, generated from each binary’s --help' },
  ];

  const bullet = (item: LinkItem): string => {
    const url = new URL(item.pathname, origin).href;
    return `- [${item.label}](${url}): ${item.desc}`;
  };

  const body = [
    '# HexoKit — your tmux, in the browser and on your phone',
    '',
    `> ${SUMMARY}`,
    '',
    '## Docs',
    '',
    ...docsSection.map(bullet),
    '',
    '## Toolkit',
    '',
    ...toolkitSection.map(bullet),
    '',
    '## Reference',
    '',
    ...reference.map(bullet),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
