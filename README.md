# The Creative Panel — the writings of Joel Green

**Live site:** [joelgreen.studio](https://joelgreen.studio)

The Creative Panel is Joel Green's writing blog: essays, chapters, worldbuilding and notes on the making of *The Halo*, book one of the Astroseed Trilogy. It's designed like an online magazine, with a dark editorial look, gold-and-teal branding and a layout inspired by modern tech/culture magazines.

Its companion site is the author homepage, [joelgreenauthor.com](https://joelgreenauthor.com) ([repo](https://github.com/The-Creative-Panel/Joel-Green.-Author-Website)).

## What's on the site

| Page | What it shows |
| --- | --- |
| **Latest** (`/`) | Featured book hero, newsletter sign-up, featured and latest posts with tag filters, most read / most liked, books carousel, about card |
| **Archive** (`/blog/`) | Every post, newest first, with live search |
| **Trending** (`/trending/`) | Most read and most liked posts |
| **Post pages** | Cover image, table of contents, reading progress, likes and saves, share buttons, comments, related posts |
| **Books**, **Sites**, **About** | The novels (with live writing progress), Joel's other corners of the web, and his bio |
| **RSS** (`/rss/`, `/rss.xml`) | A page about the feed, plus the feed itself |
| **Legal** | Privacy Policy, Cookie Policy, Terms of Use, Disclaimer |

### Features

- **Posts are written in an admin portal**, not in this repo. At build time the site pulls posts, books and sites from the project's API, so the repo doesn't grow with every post.
- **Live reader features** through the API: view and like counts, comments (with spam protection), and newsletter sign-ups that go straight to EcoSend.
- **Light and dark mode**, saved per reader. Likes and saved posts are kept in the reader's own browser.
- **SEO**: unique titles and descriptions, canonical URLs, Open Graph/Twitter cards, schema.org data (articles, books, author, breadcrumbs), sitemap and robots rules. Legal pages are kept out of search results.
- **Performance**: static pages, trimmed and preloaded fonts, prioritized cover images, link prefetching and long-term caching of build files.
- **Google AdSense**: sidebar ads plus in-article ads on posts, configured with environment variables (`ads.txt` is generated too).

## Tech

- [Astro](https://astro.build) 7 (static output), [Tailwind CSS](https://tailwindcss.com) v4, MDX
- Content from the project's API (Cloudflare Workers + Prisma Postgres), loaded by a custom content loader (`src/lib/apiLoader.ts`)
- Hosted on **Cloudflare Workers** (static assets); every push to `main` rebuilds and deploys

## Running it locally

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

Settings live in env files:

| File | Used by | Contents |
| --- | --- | --- |
| `.env.development` (not committed) | `pnpm dev` | `PUBLIC_API_URL=http://localhost:8787` for a local API |
| `.env.production` | builds and deploys | Live API URL and AdSense IDs (public values) |

Without `PUBLIC_API_URL`, the site falls back to the sample Markdown posts in `src/content/blog/`.

## Deploying

- **Automatically:** push to `main`. Cloudflare runs `npx wrangler deploy`, which builds the site first (see `wrangler.jsonc`).
- **By hand:** `pnpm run deploy`

New posts appear after a rebuild, which the admin portal triggers when you publish.

## Credits

Designed, written and directed by **Joel Green**: the concept, look and feel, content and product decisions are his.

Much of the code was written with **[Claude Code](https://claude.com/claude-code)**, Anthropic's AI coding assistant, working as a pair programmer under Joel's direction. Commits made with its help are marked with a `Co-Authored-By: Claude` line.

Claude Code's role was to help get this first build designed, built and launched. **From here on, all updates to the site go through Joel**, who owns and maintains it.

## License

The code is released under the [MIT License](LICENSE). The writing, book titles, characters, artwork and other creative content on the site are © Joel Green and are not covered by that license.
