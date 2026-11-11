// Content-collection loader that reads from services/api at build time.
// If PUBLIC_API_URL isn't set, it falls back to the local loader (Markdown/JSON
// files in src/), so the blog still builds without the API.
import type { Loader, LoaderContext } from 'astro/loaders';
import { fetchApiJson } from './fetchApi';

const API = (import.meta.env.PUBLIC_API_URL ?? process.env.PUBLIC_API_URL ?? '').replace(/\/$/, '');

interface Options<T> {
	name: string;
	/** API path, e.g. "/content/posts" */
	path: string;
	/** Map one API record to a collection entry (body = Markdown to render) */
	map: (item: T) => { id: string; data: Record<string, unknown>; body?: string };
	/** Used when PUBLIC_API_URL isn't set */
	fallback: Loader;
}

export function apiLoader<T>({ name, path, map, fallback }: Options<T>): Loader {
	return {
		name,
		load: async (ctx: LoaderContext) => {
			if (!API) {
				ctx.logger.info(`PUBLIC_API_URL not set, using local files`);
				return fallback.load(ctx);
			}
			let items: T[];
			try {
				// Retries a stalled or failed request (src/lib/fetchApi.ts)
				items = await fetchApiJson<T[]>(API + path, (msg) => ctx.logger.warn(msg));
			} catch (e) {
				// Fail loudly: publishing a site with missing content is worse than a failed build
				throw new Error(`Couldn't load ${name} from ${API}${path} (${(e as Error).message}). Is the API running?`);
			}

			ctx.store.clear();
			for (const item of items) {
				const { id, data, body } = map(item);
				const parsed = await ctx.parseData({ id, data });
				ctx.store.set({
					id,
					data: parsed,
					digest: ctx.generateDigest(JSON.stringify(item)),
					...(body !== undefined ? { body, rendered: await ctx.renderMarkdown(body) } : {}),
				});
			}
			ctx.logger.info(`Loaded ${items.length} ${name} from the API`);
		},
	};
}
