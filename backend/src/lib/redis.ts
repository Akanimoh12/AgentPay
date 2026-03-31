import { createClient, type RedisClientType } from "redis";
import { config } from "./config.js";

let redisClient: RedisClientType | null = null;
let connected = false;

async function getRedisClient(): Promise<RedisClientType | null> {
	if (connected && redisClient) return redisClient;

	try {
		redisClient = createClient({ url: config.redisUrl });
		redisClient.on("error", () => {
			connected = false;
		});
		await redisClient.connect();
		connected = true;
		return redisClient;
	} catch {
		console.warn("Redis unavailable — caching disabled");
		connected = false;
		return null;
	}
}

export async function getCache(key: string): Promise<string | null> {
	const client = await getRedisClient();
	if (!client) return null;
	try {
		return await client.get(key);
	} catch {
		return null;
	}
}

export async function setCache(
	key: string,
	value: string,
	ttlSeconds: number,
): Promise<void> {
	const client = await getRedisClient();
	if (!client) return;
	try {
		await client.set(key, value, { EX: ttlSeconds });
	} catch {
		// silently ignore cache write failures
	}
}
