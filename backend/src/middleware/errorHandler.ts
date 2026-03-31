import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { AgentPayError } from "@agentpay/sdk";

export function errorHandler(err: Error, c: Context) {
	if (err instanceof HTTPException) {
		return c.json(
			{ error: { code: err.status, message: err.message } },
			err.status,
		);
	}

	if (err instanceof AgentPayError) {
		return c.json(
			{ error: { code: 400, message: err.message } },
			400,
		);
	}

	console.error("Unhandled error:", err);
	return c.json(
		{ error: { code: 500, message: "Internal server error" } },
		500,
	);
}
