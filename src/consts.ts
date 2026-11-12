// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'The Creative Panel';
export const SITE_DESCRIPTION = 'The Writings of Joel Green';
/** Footer: what the blog is, in one line (the header already shows the tagline, the About card the bio) */
export const SITE_BLURB = 'Essays on worldbuilding, characters and the making of a first novel.';
/** The newsletter pitch, used everywhere there's a signup */
export const NEWSLETTER_PITCH = 'New chapters, writing notes & behind-the-scenes. No noise.';

// Dates on the site (post dates, "Updated") are shown in Joel's time zone,
// so a post published at 8 PM shows that day, not the next UTC day.
export const SITE_TIMEZONE = 'America/Chicago';

// Where the admin runs. The draft preview page (/preview/) only accepts unsaved post text
// sent from these addresses. Add the admin's address here when it moves off this computer.
export const ADMIN_ORIGINS = ['http://localhost:4323', 'http://127.0.0.1:4323'];

/**
 * When new posts go out (shown on the homepage and in the footer: PostingSchedule.astro).
 * days: 0 = Sunday … 6 = Saturday. hour: 24-hour clock in SITE_TIMEZONE.
 */
export const POSTING_SCHEDULE = {
	days: [1, 3, 5],
	hour: 13,
	daysLabel: 'Mondays, Wednesdays & Fridays',
	timeLabel: '1 PM CT / 2 PM ET',
};
