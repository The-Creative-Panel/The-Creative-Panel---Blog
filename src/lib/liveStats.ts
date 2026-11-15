// Browser-side: refresh like/view numbers on the page from the API, so counts
// are current without waiting for the next site rebuild.
//
// Mark elements in your HTML:
//   <span data-live="likes" data-slug="first-post">83</span>
//   <span data-live="views" data-slug="first-post">523</span>
// Add data-hide-zero to a wrapper with data-live-wrap="<slug>:<likes|views>"
// to hide it while the count is 0 (like the prototype's hearts).

const API = import.meta.env.PUBLIC_API_URL ?? '';
type Stats = Record<string, { views: number; likes: number }>;

let loading: Promise<Stats | null> | undefined;

export function loadAllStats() {
	loading ??= API
		? fetch(`${API}/posts/stats`)
				.then((r) => (r.ok ? (r.json() as Promise<Stats>) : null))
				.catch(() => null)
		: Promise.resolve(null);
	return loading;
}

/** Write counts into every [data-live] element on the page. */
export function paintStats(stats: Stats) {
	document.querySelectorAll<HTMLElement>('[data-live][data-slug]').forEach((el) => {
		const slug = el.dataset.slug!;
		if (!(slug in stats)) return; // only touch posts we have numbers for
		const key = el.dataset.live as 'likes' | 'views';
		const n = stats[slug][key] ?? 0;
		el.textContent = n.toLocaleString();
	});
	document.querySelectorAll<HTMLElement>('[data-live-wrap]').forEach((el) => {
		const [slug, key] = el.dataset.liveWrap!.split(':') as [string, 'likes' | 'views'];
		if (!(slug in stats)) return;
		const n = stats[slug][key] ?? 0;
		if (el.hasAttribute('data-hide-zero')) el.hidden = n === 0;
	});
}

/**
 * Re-order ranked lists with live counts (the build-time order goes stale).
 * Markup: <ol data-rank-by="views|likes"> with <li data-slug data-newest> children,
 * each holding a [data-rank] badge. Highest count first, ties newest first;
 * only the first `top` stay visible and badges are renumbered 01, 02, …
 */
export function rerankLists(stats: Stats, top = 10) {
	document.querySelectorAll<HTMLOListElement>('ol[data-rank-by]').forEach((list) => {
		const key = list.dataset.rankBy as 'views' | 'likes';
		const count = (li: HTMLElement) => stats[li.dataset.slug!]?.[key] ?? 0;
		[...list.querySelectorAll<HTMLLIElement>(':scope > li')]
			.sort((a, b) => count(b) - count(a) || Number(a.dataset.newest) - Number(b.dataset.newest))
			.forEach((li, i) => {
				li.hidden = i >= top;
				const badge = li.querySelector('[data-rank]');
				if (badge) badge.textContent = String(i + 1).padStart(2, '0');
				list.append(li);
			});
	});
}

export async function refreshStats() {
	const stats = await loadAllStats();
	if (stats) paintStats(stats);
}
