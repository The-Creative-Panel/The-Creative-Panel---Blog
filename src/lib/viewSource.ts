// Where a post view came from, sent with the view count (src/lib/reactions.ts → POST /posts/:slug/view)
// and shown in the admin as "views by source".
//
//   1. UTM tags on the link (?utm_source=x&utm_medium=social), from:
//        - the admin's "Copy share link" (utm_medium=social)      → channel "post"  (your own social posts)
//        - the share buttons on posts   (utm_medium=share)        → channel "share" (readers sharing)
//   2. Otherwise the site the visitor came from (document.referrer)  → "search", "rss" or "link"
//   3. Otherwise "direct" (typed, bookmarked, or an app that hides where it came from)
// Nothing about the visitor is sent: only a source name like "x" and the channel.

export type Channel = 'post' | 'share' | 'search' | 'link' | 'rss' | 'direct';
export type ViewSource = { source: string; channel: Channel };

/** Tags on links this site hands out. utm_medium says who shared it. */
export const UTM_MEDIUM = { owner: 'social', reader: 'share' } as const;

/** Friendly names for UTM sources people type differently */
const ALIASES: Record<string, string> = { twitter: 'x', fb: 'facebook', ig: 'instagram', li: 'linkedin', bsky: 'bluesky', yt: 'youtube' };

/** Known sites, matched against the end of the referrer's hostname */
const SITES: [RegExp, string, Channel][] = [
	[/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'facebook', 'link'],
	[/(^|\.)(x\.com|twitter\.com|t\.co)$/, 'x', 'link'],
	[/(^|\.)instagram\.com$/, 'instagram', 'link'],
	[/(^|\.)(threads\.net|threads\.com)$/, 'threads', 'link'],
	[/(^|\.)(bsky\.app|bsky\.social)$/, 'bluesky', 'link'],
	[/(^|\.)reddit\.com$/, 'reddit', 'link'],
	[/(^|\.)(linkedin\.com|lnkd\.in)$/, 'linkedin', 'link'],
	[/(^|\.)pinterest\.[a-z.]+$/, 'pinterest', 'link'],
	[/(^|\.)(tiktok\.com)$/, 'tiktok', 'link'],
	[/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube', 'link'],
	[/(^|\.)(discord\.com|discordapp\.com)$/, 'discord', 'link'],
	[/(^|\.)news\.ycombinator\.com$/, 'hackernews', 'link'],
	[/(^|\.)(mastodon\.[a-z.]+|mstdn\.[a-z.]+)$/, 'mastodon', 'link'],
	[/(^|\.)google\.[a-z.]+$/, 'google', 'search'],
	[/(^|\.)bing\.com$/, 'bing', 'search'],
	[/(^|\.)duckduckgo\.com$/, 'duckduckgo', 'search'],
	[/(^|\.)(yahoo\.com|search\.yahoo\.[a-z.]+)$/, 'yahoo', 'search'],
	[/(^|\.)(ecosia\.org|brave\.com|kagi\.com|yandex\.[a-z.]+|baidu\.com)$/, 'search', 'search'],
	[/(^|\.)(inoreader\.com|feedly\.com|newsblur\.com|theoldreader\.com|feedbin\.com)$/, 'rss', 'rss'],
	[/(^|\.)(mail\.google\.com|outlook\.[a-z.]+|mail\.yahoo\.com)$/, 'email', 'link'],
];
const OWN_HOSTS = /(^|\.)joelgreen\.studio$/;

/** The source for a referrer hostname, or null for this site itself */
function fromReferrer(referrer: string): ViewSource | null {
	let host = '';
	try {
		host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
	} catch {
		return null;
	}
	if (!host || OWN_HOSTS.test(host)) return null;
	for (const [re, source, channel] of SITES) if (re.test(host)) return { source, channel };
	return { source: host.slice(0, 60), channel: 'link' }; // any other site, by name (e.g. joelgreenauthor.com)
}

/** Where this page load came from, or null when it came from another page of this site */
function sourceOfThisPage(url: URL, referrer: string): ViewSource | null {
	const fromSite = fromReferrer(referrer);
	const utmSource = url.searchParams.get('utm_source')?.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
	if (utmSource) {
		const source = ALIASES[utmSource] ?? utmSource;
		const channel: Channel = url.searchParams.get('utm_medium')?.toLowerCase() === UTM_MEDIUM.owner ? 'post' : 'share';
		// A plain "Copy link": the site it was pasted on is the useful part, when the browser says
		if (source === 'copied-link' && fromSite) return { source: fromSite.source, channel };
		return { source, channel };
	}
	if (fromSite) return fromSite;
	return OWN_HOSTS.test(hostOf(referrer)) || /^localhost$|^127\./.test(hostOf(referrer)) ? null : { source: 'direct', channel: 'direct' };
}
const hostOf = (u: string) => {
	try {
		return new URL(u).hostname.toLowerCase();
	} catch {
		return '';
	}
};

// A visit that starts on the homepage (from X, say) and then opens a post should still count as X:
// the first page of the visit remembers its source for this tab.
const ENTRY_KEY = 'visitSource';

/** Call on every page: remembers where this visit started */
export function rememberEntry() {
	const here = sourceOfThisPage(new URL(location.href), document.referrer);
	try {
		if (here) sessionStorage.setItem(ENTRY_KEY, JSON.stringify(here));
	} catch {
		// storage blocked: posts fall back to their own referrer
	}
}

/** The source to credit for a post view */
export function detectSource(url = new URL(location.href), referrer = document.referrer): ViewSource {
	const here = sourceOfThisPage(url, referrer);
	if (here) return here;
	try {
		const entry = JSON.parse(sessionStorage.getItem(ENTRY_KEY) ?? 'null') as ViewSource | null;
		if (entry?.source && entry.channel) return entry;
	} catch {
		// fall through
	}
	return { source: 'direct', channel: 'direct' };
}

/** A post link tagged for a share button or the admin ("x", "facebook", "copied-link", …) */
export function taggedUrl(url: string, source: string, medium: string = UTM_MEDIUM.reader) {
	const u = new URL(url);
	u.searchParams.set('utm_source', source);
	u.searchParams.set('utm_medium', medium);
	return u.href;
}
