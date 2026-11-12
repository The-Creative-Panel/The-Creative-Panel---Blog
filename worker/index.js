// Runs before the static files (wrangler.jsonc: "run_worker_first": true). Two jobs:
//  1. Send www.joelgreen.studio and http:// to https://joelgreen.studio with a permanent (301)
//     redirect, so search engines see one address for every page.
//  2. RSS subscriber counts: feed reader services (Feedly, Inoreader, NewsBlur…) say how many of
//     their users follow the feed when they fetch /rss.xml, e.g.
//       "Feedly/1.0 (+http://www.feedly.com/fetcher.html; 12 subscribers; …)"
//     That count is passed to the API in the background (the feed is served without waiting) and
//     shows on the admin's Traffic page. Needs FEED_STATS_SECRET (wrangler secret), shared with the API.
// Everything else is served from ./dist exactly as before.

const CANONICAL_HOST = 'joelgreen.studio';
const FEED_PATHS = new Set(['/rss.xml']);
const STATS_URL = 'https://api.joelgreen.studio/feeds/fetch';

/** { reader, subscribers } from a feed reader's User-Agent, or null when it doesn't report a count */
export function readerFromUserAgent(ua) {
	const count = /(\d+)\s+(?:subscribers?|readers?)\b/i.exec(ua ?? '');
	if (!count) return null;
	// The service's name: the start of the User-Agent ("Feedly/1.0" → Feedly, "NewsBlur Feed Fetcher" → NewsBlur)
	const name = /^\s*([A-Za-z][\w.-]{1,40})/.exec(ua)?.[1];
	if (!name || /^mozilla$/i.test(name)) {
		// Browser-style User-Agents put the service in the (…) part: use the first known name there
		const known = /(Feedly|Inoreader|NewsBlur|Feedbin|the ?old ?reader|Feedspot|Bloglovin|Netvibes|Feeder|BazQux|Miniflux|FreshRSS|Tiny Tiny RSS|NetNewsWire)/i.exec(ua);
		if (!known) return null;
		const reader = /old ?reader/i.test(known[1]) ? 'The Old Reader' : known[1];
		return { reader, subscribers: Number(count[1]) };
	}
	return { reader: name, subscribers: Number(count[1]) };
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const isOurDomain = url.hostname === CANONICAL_HOST || url.hostname === `www.${CANONICAL_HOST}`;

		if (isOurDomain && (url.hostname !== CANONICAL_HOST || url.protocol !== 'https:')) {
			url.hostname = CANONICAL_HOST;
			url.protocol = 'https:';
			url.port = '';
			return Response.redirect(url.toString(), 301);
		}

		// The bio-link page moved from /links/ to /social/ (keeps ?utm_… tags, so tracking still works)
		if (url.pathname === '/links' || url.pathname === '/links/') {
			url.pathname = '/social/';
			return Response.redirect(url.toString(), 301);
		}

		if (FEED_PATHS.has(url.pathname) && env.FEED_STATS_SECRET) {
			const reader = readerFromUserAgent(request.headers.get('user-agent'));
			if (reader) {
				ctx.waitUntil(
					fetch(STATS_URL, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', 'X-Feed-Secret': env.FEED_STATS_SECRET },
						body: JSON.stringify(reader),
					}).catch(() => {}), // stats are best-effort; never affect the feed
				);
			}
		}

		// workers.dev preview link, localhost and the real site: serve the files
		return env.ASSETS.fetch(request);
	},
};
