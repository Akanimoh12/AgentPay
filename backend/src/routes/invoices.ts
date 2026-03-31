import { Hono } from "hono";
import { z } from "zod";
import { storageService } from "../services/StorageService.js";

const CreateInvoiceSchema = z.object({
	fromAgentId: z.string().min(1),
	toAgentId: z.string().min(1),
	amount: z.string().min(1),
	description: z.string().min(1),
	lineItems: z
		.array(
			z.object({
				description: z.string(),
				quantity: z.number(),
				unitPrice: z.string(),
				total: z.string(),
			}),
		)
		.optional(),
});

export const invoicesRoutes = new Hono();

invoicesRoutes.post("/", async (c) => {
	const body = await c.req.json();
	const parsed = CreateInvoiceSchema.parse(body);
	const result = await storageService.storeInvoice(parsed);
	return c.json(result, 201);
});

invoicesRoutes.get("/", async (c) => {
	const result = await storageService.getHistory({
		agentId: c.req.query("agentId"),
		status: c.req.query("status"),
		limit: c.req.query("limit") ? parseInt(c.req.query("limit")!) : undefined,
		offset: c.req.query("offset") ? parseInt(c.req.query("offset")!) : undefined,
	});
	return c.json(result);
});

invoicesRoutes.get("/:invoiceId", async (c) => {
	const invoiceId = c.req.param("invoiceId");
	const result = await storageService.getInvoice(invoiceId);
	if (!result) return c.json({ error: { code: 404, message: "Invoice not found" } }, 404);
	return c.json(result);
});

invoicesRoutes.post("/sync", async (c) => {
	const result = await storageService.syncEvents();
	return c.json(result);
});
