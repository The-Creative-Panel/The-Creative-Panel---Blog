// Sidebar profile: About, Press and Contact cards on the homepage.
// Anything left empty is simply not shown.
// (Later this can come from the admin / API like posts and books.)

export type SocialIcon = 'x' | 'instagram' | 'goodreads' | 'threads' | 'bluesky' | 'tiktok' | 'youtube';

export const profile = {
	name: 'Joel Green',
	role: 'Writer',
	bio: "Aspiring novelist who doesn't just dream worlds — I live in them.",
	/** Path to a photo in /public (e.g. '/joel.jpg'). Empty = "JG" initials box. */
	avatar: '',

	/** e.g. { label: 'Instagram', url: 'https://instagram.com/…', icon: 'instagram' } */
	socials: [] as { label: string; url: string; icon: SocialIcon }[],

	/** Real reviews/blurbs only, e.g. { quote: '…', source: 'Kirkus Reviews' } */
	press: [] as { quote: string; source: string }[],

	/** Public contact address, e.g. 'hello@joelgreen.studio' */
	email: 'help@joelgreen.studio',

	/** About page facts table. Empty = "—". */
	facts: {
		based: '', // e.g. 'Toronto, Canada'
		genre: 'Sci-Fi & Dark Fantasy',
		firstPublished: '', // e.g. '2027'
	},

	/** About page biography. First paragraph is shown larger, as the lead. */
	biography: [
		"Hi, I'm Joel Green. An aspiring novelist who doesn't just dream worlds — I live in them. Every story I read or write I ask: what does this world look and feel like? Not through the character's eyes alone, but through my own.",
		'The Halo is my first novel, currently in progress. A near-future sci-fi thriller about corporate power, survival, and a truth that costs everything. Book One of the Astroseed Trilogy.',
		"Imagination is the lens through which literature lets us see the worlds authors build. The most honest stories aren't ones that feel like fiction — they feel tangible. Familiar. Like home.",
	],
};
