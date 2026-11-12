// Ask image hosts for a copy at the size it's shown, instead of the full original.
// Pexels and Unsplash resize on request through the address; a Pexels original can be 6,000px+
// wide and several MB, which made covers slow (and big pages failed to draw them at all).
// Other addresses (our own uploads at api.joelgreen.studio/media/, which the admin already shrinks
// to 2000px WebP, or anything else) are returned unchanged.

/** The image at `width` CSS pixels wide (or the original, for hosts that can't resize) */
export function sizedImageUrl(src: string, width: number): string {
	let url: URL;
	try {
		url = new URL(src);
	} catch {
		return src; // a relative path (local file): leave it
	}
	const w = String(Math.round(width));
	if (url.hostname === 'images.pexels.com') {
		url.searchParams.set('auto', 'compress');
		url.searchParams.set('cs', 'tinysrgb');
		url.searchParams.set('w', w);
		url.searchParams.delete('h'); // keep the original shape; CSS crops it
		url.searchParams.delete('dpr');
		url.searchParams.delete('fit');
		return url.href;
	}
	if (url.hostname === 'images.unsplash.com') {
		url.searchParams.set('w', w);
		url.searchParams.set('auto', 'format');
		url.searchParams.set('q', url.searchParams.get('q') ?? '80');
		url.searchParams.delete('h');
		return url.href;
	}
	return src;
}

/** True when the host above can resize (so a 2x copy for sharp screens is worth offering) */
export const canResize = (src: string) => /^https:\/\/images\.(pexels|unsplash)\.com\//.test(src);

/** srcset with a normal and a double-size copy, for sharp (high-DPI) screens; undefined if the host can't resize */
export function sizedSrcset(src: string, width: number): string | undefined {
	if (!canResize(src)) return undefined;
	return `${sizedImageUrl(src, width)} 1x, ${sizedImageUrl(src, Math.min(width * 2, 3200))} 2x`;
}
