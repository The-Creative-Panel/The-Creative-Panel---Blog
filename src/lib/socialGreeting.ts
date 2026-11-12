// /social: greet visitors by the platform their link came from ("Welcome, Twitter readers").
// Any element with data-from="…{p}…" gets that text with the platform name filled in, when the
// address carries ?utm_source=instagram (or x, threads, …). Without one, the default text stays.
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

export function greetByPlatform() {
	const src = new URLSearchParams(location.search).get('utm_source')?.toLowerCase() ?? '';
	const platform = NAMES[src];
	if (!platform) return;
	document.querySelectorAll<HTMLElement>('[data-from]').forEach((el) => {
		el.textContent = (el.dataset.from ?? 'Welcome, {p} readers').replace('{p}', platform);
	});
}
