// Photos in a post get a visible caption: "Photo: {alt text}".
// An image on its own line (Markdown wraps it in a <p>) becomes
//   <figure class="post-figure"><img …><figcaption>Photo: …</figcaption></figure>
// Images without alt text, or sitting inside a sentence, are left as they are.

/** The caption text for an alt text, or null when there's nothing to show */
export const photoCaption = (alt) => {
	const text = typeof alt === 'string' ? alt.trim() : '';
	return text ? `Photo: ${text}` : null;
};

const isBlank = (n) => n.type === 'text' && !n.value.trim();

/** rehype plugin (astro.config.mjs) */
export default function rehypeImageCaptions() {
	const visit = (node) => {
		node.children?.forEach((child, i) => {
			if (child.type !== 'element' || child.tagName !== 'p') return visit(child);
			const parts = child.children.filter((n) => !isBlank(n));
			// A lone image, or a lone linked image
			const img = parts.length === 1 && (parts[0].tagName === 'img' ? parts[0] : parts[0].tagName === 'a' && parts[0].children?.length === 1 && parts[0].children[0].tagName === 'img' ? parts[0].children[0] : null);
			const caption = img && photoCaption(img.properties?.alt);
			if (!caption) return visit(child);
			node.children[i] = {
				type: 'element',
				tagName: 'figure',
				properties: { className: ['post-figure'] },
				children: [
					parts[0],
					// The image's alt text already describes it to screen readers, so they skip the repeat
					{ type: 'element', tagName: 'figcaption', properties: { ariaHidden: 'true' }, children: [{ type: 'text', value: caption }] },
				],
			};
		});
	};
	return (tree) => visit(tree);
}
