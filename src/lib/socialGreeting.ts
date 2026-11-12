// /social: greet visitors by the platform they came from ("Welcome, Twitter readers").
// Any element with data-from="…{p}…" gets that text with the platform name filled in. The platform
// comes from the link's ?utm_source=… tag, or, without one, from the site the browser says they
// came from (a Twitter link arrives via t.co, for example: src/lib/viewSource.ts). Otherwise the
// element's own text stays as the default greeting ("Welcome, reader").
import { detectSource } from './viewSource';

const NAMES: Record<string, string> = {
	instagram: 'Instagram',
	x: 'Twitter',
	twitter: 'Twitter',
	threads: 'Threads',
	bluesky: 'Bluesky',
	tiktok: 'TikTok',
	facebook: 'Facebook',
	linkedin: 'LinkedIn',
	youtube: 'YouTube',
	reddit: 'Reddit',
	discord: 'Discord',
	pinterest: 'Pinterest',
	mastodon: 'Mastodon',
};

/** The platform's display name for this visit, or null */
export function visitPlatform(): string | null {
	const tag = new URLSearchParams(location.search).get('utm_source')?.toLowerCase() ?? '';
	if (NAMES[tag]) return NAMES[tag];
	return NAMES[detectSource().source] ?? null;
}

export function greetByPlatform() {
	const platform = visitPlatform();
	if (!platform) return; // the default greeting stays
	document.querySelectorAll<HTMLElement>('[data-from]').forEach((el) => {
		el.textContent = (el.dataset.from ?? 'Welcome, {p} readers').replace('{p}', platform);
	});
}
