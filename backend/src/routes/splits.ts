import { Hono } from "hono";
import { z } from "zod";
import { splitService } from "../services/SplitService.js";

const ConfigureSplitSchema = z.object({
	agentId: z.string().min(1),
	recipients: z
		.array(
			z.object({
				wallet: z.string().min(1),
				shareBps: z.number().int().min(1).max(10000),
			}),
		)
		.min(2)
		.max(10),
});

const DistributeSchema = z.object({
	token: z.string().min(1),
	amount: z.string().min(1),
});

export const splitsRoutes = new Hono();

splitsRoutes.post("/", async (c) => {
	const body = await c.req.json();
	const parsed = ConfigureSplitSchema.parse(body);
	const totalBps = parsed.recipients.reduce((sum, r) => sum + r.shareBps, 0);
	if (totalBps !== 10000) {
		return c.json(
			{ error: { code: 400, message: "Recipient shares must total 10000 bps (100%)" } },
			400,
		);
	}
	const result = await splitService.configure(parsed);
	return c.json(result, 201);
});

splitsRoutes.get("/", async (c) => {
	const result = await splitService.getAll();
	return c.json(result);
});

splitsRoutes.get("/:splitId", async (c) => {
	const splitId = c.req.param("splitId");
	const result = await splitService.getById(splitId);
	if (!result) return c.json({ error: { code: 404, message: "Split not found" } }, 404);
	return c.json(result);
});

splitsRoutes.post("/:splitId/distribute", async (c) => {
	const splitId = c.req.param("splitId");
	const body = await c.req.json();
	const parsed = DistributeSchema.parse(body);
	const result = await splitService.distribute(splitId, parsed);
	return c.json(result);
});
