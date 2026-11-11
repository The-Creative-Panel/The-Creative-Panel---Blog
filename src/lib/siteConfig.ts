// Navbar links, the ☰ sections menu and its sections: edited in the admin (Navigation page),
// read from the API once per build. If the API can't be reached (or doesn't have these yet),
// the blog falls back to the defaults below, which match the original navbar, so a build never
// fails because of navigation.
import { CATEGORY_BLURBS } from '../data/categories';
import { termLabel } from './taxonomy';
import { fetchApiJson } from './fetchApi';

export type NavItem = { label: string; href: string; description: string };
export type NavLink = { label: string; href: string } | { label: string; items: NavItem[] };
export const isDropdown = (l: NavLink): l is { label: string; items: NavItem[] } => 'items' in l;

export interface SiteConfig {
	navigation: { links: NavLink[] };
	sectionsMenu: { enabled: boolean; showSaved: boolean };
	sections: { name: string; slug: string; description: string | null; tags: string[] }[];
}

const DEFAULTS: SiteConfig = {
	navigation: {
		links: [
			{ label: 'Latest', href: '/latest' },
			{
				label: 'The Panel',
				items: [
					{ label: 'Archive', href: '/blog', description: 'Every post, newest first' },
					{ label: 'Trending', href: '/trending', description: 'Most read and most liked' },
					{ label: 'Categories', href: '/categories', description: 'Browse by section' },
					{ label: 'Tags', href: '/tags', description: 'Browse by topic' },
				],
			},
			{ label: 'Books', href: '/books' },
			{ label: 'Sites', href: '/sites' },
			{ label: 'About', href: '/about' },
		],
	},
	sectionsMenu: { enabled: false, showSaved: true },
	sections: [],
};

const API = (import.meta.env.PUBLIC_API_URL ?? process.env.PUBLIC_API_URL ?? '').replace(/\/$/, '');

async function get<T>(path: string): Promise<T | null> {
	if (!API) return null;
	try {
		// Retries a stalled request first, so a slow moment doesn't publish the default navbar
		return await fetchApiJson<T>(API + path, (msg) => console.warn(`[navigation] ${msg}`));
	} catch {
		return null;
	}
}

let cached: Promise<SiteConfig> | null = null;
/** Everything above, fetched once per build and shared by every page */
export function getSiteConfig(): Promise<SiteConfig> {
	return (cached ??= (async () => {
		const [settings, sections] = await Promise.all([
			get<Partial<Pick<SiteConfig, 'navigation' | 'sectionsMenu'>>>('/content/settings'),
			get<SiteConfig['sections']>('/content/sections'),
		]);
		if (!settings || !sections) console.warn('[navigation] Using the default navbar (the API has no navigation settings yet)');
		return {
			navigation: settings?.navigation?.links?.length ? settings.navigation : DEFAULTS.navigation,
			sectionsMenu: { ...DEFAULTS.sectionsMenu, ...settings?.sectionsMenu },
			sections: Array.isArray(sections) ? sections : [],
		};
	})());
}

/** Sections shaped for the ☰ menu: each links to its category page, its tags to their tag pages */
export function menuSections(config: SiteConfig) {
	return config.sections.map((s) => ({
		label: s.name,
		href: `/categories/${s.slug}/`,
		subs: s.tags.map((t) => ({ label: termLabel(t), href: `/tags/${t}/` })),
	}));
}

/** Every navbar destination as a flat list (the menu's bottom row, phone menu) */
export const flatLinks = (config: SiteConfig) =>
	config.navigation.links.flatMap((l) => (isDropdown(l) ? l.items.map(({ label, href }) => ({ label, href })) : [{ label: l.label, href: l.href }]));

/** A category's one-line description: from its section in the admin, else src/data/categories.ts */
export async function categoryBlurb(slug: string) {
	const section = (await getSiteConfig()).sections.find((s) => s.slug === slug);
	return section?.description || CATEGORY_BLURBS[slug];
}
