// Data every newsletter lab design gets (built in src/pages/lab/newsletter/[...variant].astro)
import type { CollectionEntry } from 'astro:content';
import type { POSTING_SCHEDULE } from '../../../consts';
import type { Post } from '../../../lib/posts';

import type { Perk } from '../../../data/newsletter';

export interface NewsletterLabData {
	latest: Post;
	recent: Post[];
	book?: CollectionEntry<'books'>;
	schedule: typeof POSTING_SCHEDULE;
	pitch: string;
	perks: Perk[];
}
