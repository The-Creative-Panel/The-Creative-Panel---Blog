// Structured data (JSON-LD) for search engines: schema.org objects that BaseHead
// prints in <script type="application/ld+json">. Google uses these for rich results
// (article dates/author, breadcrumbs, site name) and to connect the blog to Joel Green.
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { profile } from '../data/profile';

export const SITE_URL = 'https://joelgreen.studio';
export const abs = (path: string) => new URL(path, SITE_URL).href;

/** Joel Green, the author. `sameAs` links his other profiles so Google treats them as one person. */
export const person = {
	'@type': 'Person',
	'@id': abs('/about/#joel-green'),
	name: profile.name,
	url: abs('/about/'),
	jobTitle: 'Author',
	description: `Sci-fi and dark fantasy writer, working on The Halo (Book One of the Astroseed Trilogy) and Raven, a grimdark occult fantasy. ${profile.bio}`,
	knowsAbout: ['Science fiction', 'Worldbuilding', 'Mythology', 'Thriller fiction', 'Creative writing'],
	...(profile.avatar ? { image: abs(profile.avatar) } : {}),
	sameAs: ['https://joelgreenauthor.com', ...profile.socials.map((s) => s.url)],
};

/** The site itself (shown as the site name in Google results). */
export const website = {
	'@type': 'WebSite',
	'@id': abs('/#website'),
	url: abs('/'),
	name: SITE_TITLE,
	alternateName: `${SITE_TITLE} — ${SITE_DESCRIPTION}`,
	description: `${SITE_DESCRIPTION}: essays, chapters and writing notes by ${profile.name}.`,
	inLanguage: 'en',
	publisher: { '@id': person['@id'] },
};

export function breadcrumbs(items: { name: string; path: string }[]) {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: [{ name: 'Home', path: '/' }, ...items].map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: abs(item.path),
		})),
	};
}

/** One graph per page: the site + author + whatever the page is about. */
export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': [website, person, ...nodes] });
