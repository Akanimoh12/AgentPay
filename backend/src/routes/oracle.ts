import { Hono } from "hono";
import { z } from "zod";
import { oracleService } from "../services/OracleService.js";

const PriceRequestSchema = z.object({
	serviceType: z.string().min(1),
	params: z.record(z.unknown()).optional().default({}),
});

export const oracleRoutes = new Hono();

oracleRoutes.post("/price", async (c) => {
	const body = await c.req.json();
	const parsed = PriceRequestSchema.parse(body);
	const result = await oracleService.getPrice(parsed.serviceType, parsed.params);
	return c.json(result);
});

oracleRoutes.get("/history", async (c) => {
	const serviceType = c.req.query("serviceType") || undefined;
	const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : undefined;
	const result = await oracleService.getPriceHistory(serviceType, limit);
	return c.json(result);
});
