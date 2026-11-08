// Photos in a post get a visible credit line: "Photo: {credit}".
// The credit is the image's title (the "Title" box in the admin editor's image dialog,
// or ![description](url "Jane Doe / Pexels") in Markdown); the alt text stays a description
// for screen readers and image search. An image on its own line becomes
//   <figure class="post-figure"><img …><figcaption>Photo: …</figcaption></figure>
// Images without a title, or sitting inside a sentence, are left as they are.

/** The caption text for a credit, or null when there's nothing to show */
export const photoCaption = (credit) => {
	const text = typeof credit === 'string' ? credit.trim() : '';
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
			const caption = img && photoCaption(img.properties?.title);
			if (!caption) return visit(child);
			node.children[i] = {
				type: 'element',
				tagName: 'figure',
				properties: { className: ['post-figure'] },
				children: [parts[0], { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: caption }] }],
			};
		});
	};
	return (tree) => visit(tree);
}
