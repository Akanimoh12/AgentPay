import type { Context, Next } from "hono";
import { getCache, setCache } from "../lib/redis.js";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

export async function rateLimit(c: Context, next: Next) {
	const ip = c.req.header("x-forwarded-for") || "unknown";
	const key = `ratelimit:${ip}`;

	const current = await getCache(key);
	if (current === null) {
		await setCache(key, "1", Math.ceil(WINDOW_MS / 1000));
		await next();
		return;
	}

	const count = parseInt(current, 10);
	if (count >= MAX_REQUESTS) {
		return c.json(
			{ error: { code: 429, message: "Too many requests" } },
			429,
		);
	}

	await setCache(key, String(count + 1), Math.ceil(WINDOW_MS / 1000));
	await next();
}
