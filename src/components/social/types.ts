// Data every social-page design gets (src/pages/lab/social/[...variant].astro)
import type { CollectionEntry } from 'astro:content';
import type { POSTING_SCHEDULE } from '../../consts';
import type { profile } from '../../data/profile';

export interface SocialPageProps {
	/** Every post, newest first */
	all: CollectionEntry<'blog'>[];
	latest?: CollectionEntry<'blog'>;
	recent: CollectionEntry<'blog'>[];
	starter?: CollectionEntry<'blog'>;
	book?: CollectionEntry<'books'>;
	profile: typeof profile;
	schedule: typeof POSTING_SCHEDULE;
	apiUrl: string;
}
