import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

/** Escape text for use inside an XML attribute or element */
const xml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

export async function GET(context) {
	const site = context.site;
	const abs = (path) => new URL(path, site).href;
	const posts = (await getCollection('blog')).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site,
		// Media RSS: lets feed readers (Feedly, Inoreader, …) show each post's cover image
		xmlns: { media: 'http://search.yahoo.com/mrss/' },
		customData: [
			'<language>en</language>',
			// Feed logo shown next to the feed's name in readers
			`<image><url>${abs('/apple-touch-icon.png')}</url><title>${xml(SITE_TITLE)}</title><link>${abs('/')}</link></image>`,
		].join(''),
		items: posts.map((post) => {
			const { heroImage, heroImageAlt, heroImageCredit, title } = post.data;
			const credit = heroImage && heroImageCredit?.trim() ? `<media:credit>${xml(heroImageCredit.trim())}</media:credit>` : '';
			// Cover image (a URL from the admin, or a local file), else the branded share card
			const image = heroImage ? abs(typeof heroImage === 'string' ? heroImage : heroImage.src) : abs('/og-default.png');
			const alt = heroImageAlt?.trim() || title;
			return {
				title,
				description: post.data.description,
				pubDate: post.data.pubDate,
				link: `/blog/${post.id}/`,
				categories: [post.data.category, ...post.data.tags],
				customData:
					`<media:content url="${xml(image)}" medium="image"><media:description type="plain">${xml(alt)}</media:description>${credit}</media:content>` +
					`<media:thumbnail url="${xml(image)}" />`,
			};
		}),
	});
}
