// Build-time API requests with retries. Now and then one request to the API stalls (a database
// call that never answers); without retries that single request fails the whole Cloudflare build.
// Each attempt gets its own time limit, and failures wait a moment before trying again.

const ATTEMPTS = 3;
const TIMEOUT_MS = 15_000;
const WAIT_MS = [2_000, 5_000]; // pause before attempt 2 and 3

/** Fetch JSON from the API, retrying timeouts, network errors and 5xx answers. 4xx fails at once. */
export async function fetchApiJson<T>(url: string, log?: (msg: string) => void): Promise<T> {
	let lastError: Error = new Error('no attempt made');
	for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
		try {
			const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
			if (res.ok) return (await res.json()) as T;
			lastError = new Error(`HTTP ${res.status}`);
			if (res.status < 500) break; // a wrong address or similar: retrying won't help
		} catch (e) {
			lastError = e as Error; // timeout or network error
		}
		if (attempt < ATTEMPTS) {
			log?.(`${url} failed (${lastError.message}), trying again (${attempt + 1}/${ATTEMPTS})`);
			await new Promise((r) => setTimeout(r, WAIT_MS[attempt - 1]));
		}
	}
	throw lastError;
}
