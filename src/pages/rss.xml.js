import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { sizedImageUrl } from '../lib/imageUrl';
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
			const image = heroImage ? abs(typeof heroImage === 'string' ? sizedImageUrl(heroImage, 1200) : heroImage.src) : abs('/og-default.png');
			const alt = heroImageAlt?.trim() || title;
			const url = abs(`/blog/${post.id}/`);
			// Links readers click carry ?utm_source=rss (counted as "Feed readers" in the admin's Traffic page,
			// even from apps that hide where visitors came from). The <guid> stays the plain address, so
			// readers that already have a post don't see it again as new.
			const tracked = `${url}?utm_source=rss&amp;utm_medium=feed`;
			// Full post for feed readers: the cover (with its credit), the body as rendered on the site,
			// and a link back. Links and images that point inside the site are made absolute.
			const body = (post.rendered?.html ?? '').replace(/(\s(?:href|src))="\/(?!\/)/g, `$1="${abs('/')}`);
			const content =
				`<figure><img src="${xml(image)}" alt="${xml(alt)}" />${heroImage && heroImageCredit?.trim() ? `<figcaption>Photo: ${xml(heroImageCredit.trim())}</figcaption>` : ''}</figure>` +
				body +
				`<hr /><p>Originally published on <a href="${tracked}">${xml(SITE_TITLE)}</a>. Comments and more writing at <a href="${abs('/')}?utm_source=rss&amp;utm_medium=feed">joelgreen.studio</a>.</p>`;
			return {
				title,
				description: post.data.description,
				content,
				pubDate: post.data.pubDate,
				link: `/blog/${post.id}/`,
				categories: [post.data.category, ...post.data.tags],
				// Replaces the plain <link> written from `link` above (the <guid> keeps the plain address)
				customData:
					`<link>${tracked}</link>` +
					`<media:content url="${xml(image)}" medium="image"><media:description type="plain">${xml(alt)}</media:description>${credit}</media:content>` +
					`<media:thumbnail url="${xml(image)}" />`,
			};
		}),
	});
}
