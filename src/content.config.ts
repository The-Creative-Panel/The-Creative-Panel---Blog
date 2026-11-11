import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { apiLoader } from './lib/apiLoader';

/*
  Content collections = Astro's typed data sources.
  A *loader* decides where entries come from; the *schema* validates them.

  Posts, books and sites come from services/api (written in the admin) when
  PUBLIC_API_URL is set (apps/blog/.env). Without it, they fall back to the
  local files in src/content and src/data. Pages call getCollection(...) either way.
*/

type ApiPost = {
	slug: string;
	title: string;
	subtitle: string | null;
	excerpt: string | null;
	content: string;
	coverImage: string | null;
	coverImageAlt?: string | null;
	coverImageCredit?: string | null;
	category: string | null;
	tags: string[] | null;
	featured: boolean;
	publishedAt: string;
	updatedAt?: string;
};

/**
 * "Edited" time for a post: the API's updatedAt, but only when it's clearly after publishing
 * (saving to publish, or saving a scheduled post, isn't an edit). View/like counts are stored
 * separately, so they never change updatedAt.
 */
function editedAfterPublish(publishedAt: string, updatedAt?: string) {
	if (!updatedAt) return undefined;
	return new Date(updatedAt).getTime() - new Date(publishedAt).getTime() > 10 * 60_000 ? updatedAt : undefined;
}

const blog = defineCollection({
	loader: apiLoader<ApiPost>({
		name: 'posts',
		path: '/content/posts',
		map: (p) => ({
			id: p.slug,
			body: p.content,
			data: {
				title: p.title,
				description: p.excerpt ?? p.subtitle ?? '',
				pubDate: p.publishedAt,
				updatedDate: editedAfterPublish(p.publishedAt, p.updatedAt),
				heroImage: p.coverImage ?? undefined,
				heroImageAlt: p.coverImageAlt || undefined,
				heroImageCredit: p.coverImageCredit || undefined,
				category: p.category ?? undefined,
				tags: Array.isArray(p.tags) ? p.tags : [],
				featured: p.featured,
			},
		}),
		// Local Markdown/MDX files in src/content/blog/
		fallback: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	}),
	// Mirrors the Prisma `Post` model
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().default(''),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// A URL (posts from the admin) or a local image file (Markdown posts)
			heroImage: z.union([z.string().url(), image()]).optional(),
			// What the hero image shows (alt text). Empty: the title is used
			heroImageAlt: z.string().optional(),
			// Photo credit, shown under the hero as "Photo: …"
			heroImageCredit: z.string().optional(),
			category: z.string().default('Writing'), // magazine section
			tags: z.array(z.string()).default([]),
			featured: z.boolean().default(false), // shows in the "Featured" cards
		}),
});

const nullsToUndefined = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null));

const books = defineCollection({
	loader: apiLoader<Record<string, unknown> & { slug: string }>({
		name: 'books',
		path: '/content/books',
		map: (b) => ({ id: b.slug, data: nullsToUndefined(b) }),
		fallback: file('./src/data/books.json'),
	}),
	// Mirrors the Prisma `Book` model
	schema: z.object({
		title: z.string(),
		blurb: z.string().optional(),
		tagline: z.string().optional(),
		genre: z.string().optional(),
		series: z.string().optional(),
		seriesOrder: z.number().optional(),
		year: z.number().optional(),
		link: z.string().optional(),
		coverImage: z.string().optional(),
		featured: z.boolean().default(false), // shows in the homepage hero
		sortOrder: z.number().default(0),
		status: z.string().optional(),
		wordCount: z.number().default(0),
		/** When wordCount last changed (shown under the progress bar) */
		wordCountUpdatedAt: z.coerce.date().optional(),
		targetWordCount: z.number().optional(),
	}),
});

const sites = defineCollection({
	loader: apiLoader<Record<string, unknown> & { id: string }>({
		name: 'sites',
		path: '/content/sites',
		map: (s) => ({ id: s.id, data: nullsToUndefined(s) }),
		fallback: file('./src/data/sites.json'),
	}),
	// "Sites" page: other places on the web (projects, collaborations, socials)
	schema: z.object({
		title: z.string(),
		type: z.string().optional(), // e.g. "Project", "Collaboration"
		description: z.string().optional(),
		url: z.string().url(),
		image: z.string().optional(),
		/** Text logo shown on the card when there is no image (e.g. "Joel Green" for the author site) */
		logoText: z.string().optional(),
		sortOrder: z.number().default(0),
	}),
});

export const collections = { blog, books, sites };
