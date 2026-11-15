// What a newsletter subscriber gets ("Every issue" on /newsletter), from Joel's pitch:
// "New chapters, writing notes & behind-the-scenes." One email a month. Edit the wording here.

export type Perk = { title: string; text: string; icon: string };

const icon = (d: string) =>
	`<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

export const NEWSLETTER_PERKS: Perk[] = [
	{ title: 'New chapters & stories', text: "The month's fiction from my worlds, all in one place.", icon: icon('<path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2"/><path d="M8 7h6"/>') },
	{ title: 'Writing notes', text: 'Characters, worldbuilding and craft, from my desk to yours.', icon: icon('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>') },
	{ title: 'Behind the scenes', text: 'How The Halo is coming along, month by month.', icon: icon('<circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>') },
];
